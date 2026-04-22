/**
 * Server-side GraphQL fetcher. Next.js API routes run in Node, so they
 * can't use the browser client (which reads window.__ENV). Read the same
 * env var at request time.
 */
export function getServerEndpoint(): string {
  return (
    process.env.NEXT_PUBLIC_SWITCHBOARD_URL ||
    process.env.SWITCHBOARD_URL ||
    process.env.GRAPHQL_ENDPOINT ||
    'http://localhost:4001/graphql'
  )
}

interface GqlResponse<T> {
  data?: T
  errors?: Array<{ message?: string }>
}

export async function serverGql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(getServerEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    // API routes are shared-cache; let each caller decide revalidate windows.
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GraphQL ${res.status}`)
  const json = (await res.json()) as GqlResponse<T>
  if (json.errors?.length) {
    throw new Error(json.errors[0].message ?? 'GraphQL error')
  }
  return json.data as T
}
