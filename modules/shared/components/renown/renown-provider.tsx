'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { AuthBridge } from '../auth-bridge'

const Renown = dynamic(() => import('@powerhousedao/reactor-browser').then((mod) => mod.Renown), {
  ssr: false,
})

/**
 * Captures the `?user` DID from the URL at module load time, before the
 * Renown SDK can consume and remove it. This allows us to retry the login
 * if the SDK's initial attempt fails or the React UI doesn't reflect it.
 */
function captureUserDid(): string | undefined {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const user = params.get('user')
  return user ? decodeURIComponent(user) : undefined
}

const capturedUserDid = captureUserDid()

/**
 * After the Renown SDK initializes, checks if the session was established.
 * If not (e.g. due to a race condition between credential indexing and the
 * SDK's login attempt), retries the login using the captured DID.
 *
 * This is what prevents the "had to log in twice" UX: the first post-redirect
 * login attempt by the SDK can race with the Renown portal's credential
 * indexing; if it silently fails, the guard picks up where the SDK left off.
 */
function RenownLoginGuard() {
  const didRef = useRef(capturedUserDid)

  useEffect(() => {
    const userDid = didRef.current
    if (!userDid) return

    didRef.current = undefined
    let cancelled = false

    const attempt = async () => {
      const maxWaitMs = 15_000
      const pollMs = 500
      const start = Date.now()

      while (Date.now() - start < maxWaitMs) {
        if (cancelled) return

        const renown = (window as Window).ph?.renown
        if (renown && renown.status === 'authorized') return

        if (renown && typeof renown.login === 'function') {
          try {
            await renown.login(userDid)
            return
          } catch {
            // credential may not be indexed yet — retry
          }
        }

        await new Promise((r) => setTimeout(r, pollMs))
      }
    }

    // Give the SDK a moment to handle it first. 1500ms is usually enough
    // for the SDK's own `await login(void 0, renown)` inside `initRenown`
    // to settle, so the guard only fires if that attempt is truly stuck.
    const timeout = setTimeout(attempt, 1500)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  return null
}

/**
 * Wraps the Renown SDK's `<Renown />` component and the app's auth-bridging
 * plumbing. AuthBridge is mounted inside this provider (not as a sibling
 * elsewhere in the tree) so it sits below `<Renown />` in commit order —
 * avoiding the "setState during another component's render" warning that
 * happens when a sibling subscribes to the Renown store at the same moment
 * the SDK is firing its initial `setRenown(null)` side effect.
 */
/**
 * Three-phase mount:
 *   phase 0 — SSR / first client commit, render nothing
 *   phase 1 — mount `<Renown />` alone; it does its internal `setRenown(null)`
 *             then `setRenown(renown)` without any subscribers in flight
 *   phase 2 — mount `<AuthBridge />`, which safely subscribes to the now-stable
 *             Renown store
 *
 * Without the phased mount, AuthBridge's `useRenown()` hook subscribes in the
 * same commit that triggers Renown's initial `setRenown(null)` — React logs
 * "setState during another component's render" and the post-redirect login
 * attempt sometimes drops, producing the double-login UX.
 */
export function RenownProvider({ appName, url }: { appName: string; url?: string }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    setPhase(1)
    const handle = setTimeout(() => setPhase(2), 0)
    return () => clearTimeout(handle)
  }, [])

  if (phase === 0) return null

  return (
    <>
      <Renown appName={appName} url={url} />
      {phase === 2 ? <AuthBridge /> : null}
      <RenownLoginGuard />
    </>
  )
}
