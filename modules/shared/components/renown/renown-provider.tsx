'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
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
    const timeout = setTimeout(() => {
      void attempt()
    }, 1500)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  return null
}

/**
 * `AuthBridge` uses `useRenown()`, which subscribes to the same store `Renown`
 * updates. If they mount in the same commit, the SDK can still trigger
 * "Cannot update AuthBridge while rendering Renown" because `useRenown` runs
 * in the same render pass as `Renown`'s init. We only mount `AuthBridge` one
 * frame after the provider decides phase 2 (separate effect commit).
 */
function AuthBridgeDeferred() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 0)
    return () => clearTimeout(id)
  }, [])
  if (!ready) return null
  return <AuthBridge />
}

/**
 * Wraps the Renown SDK's `<Renown />` and auth-bridging. AuthBridge is delayed
 * until after `Renown` has committed so the SDK can finish store work first.
 *
 * Three-phase client mount: phase 0 — shell (or null when no `children`); phase 1
 * — `<Renown />` only; phase 2 — same + `AuthBridgeDeferred` + guard + children.
 */
export function RenownProvider({
  appName,
  url,
  children,
}: {
  appName: string
  url?: string
  /** When set, renders after `<Renown />` in the same provider so the SDK initializes before the shell (navbar, etc.). Avoids "setState during render" on `RenownButtonInner` vs `Renown`. */
  children?: ReactNode
}) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    // Nested timeouts so React never batches phase 1 + 2: Renown must commit alone first.
    let toPhase2: ReturnType<typeof setTimeout> | undefined
    const toPhase1 = setTimeout(() => {
      setPhase(1)
      toPhase2 = setTimeout(() => setPhase(2), 0)
    }, 0)
    return () => {
      clearTimeout(toPhase1)
      if (toPhase2) clearTimeout(toPhase2)
    }
  }, [])

  // No children: keep original behavior (empty first paint for the provider only).
  if (children === undefined) {
    if (phase === 0) return null
    return (
      <>
        <Renown appName={appName} url={url} />
        {phase === 2 ? <AuthBridgeDeferred /> : null}
        <RenownLoginGuard />
      </>
    )
  }

  // With children: show shell on phase 0; then Renown + Auth + guard before/around children
  if (phase === 0) {
    return <>{children}</>
  }

  return (
    <>
      <Renown appName={appName} url={url} />
      {phase === 2 ? <AuthBridgeDeferred /> : null}
      <RenownLoginGuard />
      {children}
    </>
  )
}
