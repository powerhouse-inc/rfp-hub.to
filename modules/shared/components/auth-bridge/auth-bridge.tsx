'use client'

import { useEffect } from 'react'
import { useRenown } from '@powerhousedao/reactor-browser'
import { setAuthTokenProvider } from '../../client'

/**
 * Registers a bearer-token provider with the reactor client so every
 * GraphQL request carries the current user's Renown identity.
 *
 * Mounted inside `RenownProvider` (not as a top-level sibling of
 * `<Renown />`) so it sits below Renown in commit order. Mounting it as a
 * sibling races with Renown's internal `setRenown(null)` side effect,
 * which triggers a React "setState during render" warning and, in the
 * post-redirect login flow, can cause the first `?user=` DID attempt to
 * be dropped — producing the user-visible "had to log in twice" UX.
 */
export function AuthBridge() {
  const renown = useRenown()

  useEffect(() => {
    if (!renown) {
      setAuthTokenProvider(null)
      return
    }

    // NOTE: we intentionally do NOT pass `aud` here. The server's
    // `verifyAuthBearerToken` doesn't configure an expected audience, and
    // did-jwt rejects tokens that carry an `aud` claim without matching
    // audience config. Omitting `aud` keeps the token valid.
    setAuthTokenProvider(async () => {
      try {
        const token = await renown.getBearerToken({ expiresIn: 600 })
        return token ?? null
      } catch {
        return null
      }
    })

    return () => {
      setAuthTokenProvider(null)
    }
  }, [renown])

  return null
}
