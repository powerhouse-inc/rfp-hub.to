import { createClient } from '@powerhousedao/reactor-browser'

// Read env vars from window.__ENV (injected at runtime by the server layout)
// with fallback to process.env (inlined at build time by Next.js).
function readEnv(key: string): string {
  if (typeof window !== 'undefined') {
    const windowEnv = (window as unknown as { __ENV?: Record<string, string> }).__ENV
    if (windowEnv?.[key]) return windowEnv[key]
  }
  return process.env[key] ?? ''
}

export function getEndpoint(): string {
  return readEnv('NEXT_PUBLIC_SWITCHBOARD_URL') || 'http://localhost:4001/graphql'
}

export function getDriveId(): string {
  return readEnv('NEXT_PUBLIC_RFP_HUB_DRIVE_ID') || 'rfp-hub'
}

/**
 * A function that resolves the current user's Renown bearer token, or null
 * if the user is not logged in. Set at runtime via `setAuthTokenProvider`
 * (typically from a React component that has access to `useRenown()`).
 */
export type AuthTokenProvider = () => Promise<string | null>

let authTokenProvider: AuthTokenProvider | null = null

export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  authTokenProvider = provider
}

async function resolveToken(): Promise<string | null> {
  if (authTokenProvider) {
    try {
      return await authTokenProvider()
    } catch {
      /* fall through to global fallback */
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const renown = (
        window as unknown as {
          ph?: {
            renown?: { getBearerToken: (opts: { expiresIn: number }) => Promise<string | null> }
          }
        }
      ).ph?.renown
      if (renown) return await renown.getBearerToken({ expiresIn: 600 })
    } catch {
      /* no token available */
    }
  }
  return null
}

/**
 * SDK middleware that attaches an `Authorization: Bearer <renown-token>`
 * header to every reactor GraphQL request when a token is available.
 */
async function withAuth<T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
): Promise<T> {
  const token = await resolveToken()
  if (!token) return action()
  return action({ authorization: `Bearer ${token}` })
}

/** Reactor GraphQL client for signed action push/pull. */
export const client = createClient(getEndpoint(), withAuth)

/** Public, unauthenticated GraphQL fetcher for the read path. */
type GqlResponse<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return gqlAt<T>(getEndpoint(), query, variables)
}

/**
 * GraphQL POST to a full URL (e.g. a namespaced switchboard path like `/graphql/apply-to`).
 * Uses the same Renown bearer pattern as `gql`.
 */
export async function gqlAt<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = await resolveToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as GqlResponse<T>
  if (json.errors?.length) {
    throw new Error(json.errors[0].message ?? 'GraphQL error')
  }
  return json.data as T
}

export const DRIVE_ID = getDriveId()
