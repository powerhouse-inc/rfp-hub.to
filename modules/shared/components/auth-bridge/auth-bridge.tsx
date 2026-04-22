'use client'

import { useEffect } from 'react'
import { setAuthTokenProvider } from '../../client'

type RenownInstance = {
  getBearerToken: (opts: { expiresIn: number }) => Promise<string | null>
}

/**
 * Registers a bearer-token provider with the reactor client so every
 * GraphQL request carries the current user's Renown identity.
 *
 * Uses the SDK's underlying DOM event (`ph:renownUpdated`) directly rather
 * than `useRenown()` — subscribing via the React hook races with `<Renown />`
 * firing its `setRenown` calls during its own render, which surfaces as a
 * "Cannot update AuthBridge while rendering Renown" warning. The event
 * listener runs outside React's reconciler, so it never schedules a
 * setState during another component's render.
 */
export function AuthBridge() {
  useEffect(() => {
    const refresh = () => {
      const r = (window as unknown as { ph?: { renown?: RenownInstance | null } }).ph?.renown
      if (!r) {
        setAuthTokenProvider(null)
        return
      }
      // NOTE: we intentionally do NOT pass `aud` here. The server's
      // `verifyAuthBearerToken` doesn't configure an expected audience, and
      // did-jwt rejects tokens that carry an `aud` claim without matching
      // audience config. Omitting `aud` keeps the token valid.
      setAuthTokenProvider(async () => {
        try {
          const token = await r.getBearerToken({ expiresIn: 600 })
          return token ?? null
        } catch {
          return null
        }
      })
    }

    refresh()
    window.addEventListener('ph:renownUpdated', refresh)
    return () => {
      window.removeEventListener('ph:renownUpdated', refresh)
      setAuthTokenProvider(null)
    }
  }, [])

  return null
}
