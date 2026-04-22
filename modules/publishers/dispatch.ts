import { getEndpoint } from '@/modules/shared/client'

/**
 * Directly posts to the GrantSystem subgraph's createDocument mutation.
 * The switchboard does the actual write — this layer doesn't sign with
 * Renown yet (trusted-publisher flow will land alongside the verification
 * subgraph), but every document still gets a server-side signature via
 * the reactor's identity keypair.
 */
export interface CreatePublisherInput {
  name: string
  description?: string
  type?:
    | 'DAO'
    | 'FOUNDATION'
    | 'PROTOCOL'
    | 'COMPANY'
    | 'PROGRAM'
    | 'PERSON'
    | 'OTHER'
  grantPoolsURI?: string
  email?: string
  contactName?: string
  code?: string
}

export interface CreatePublisherResult {
  ok: boolean
  id?: string
  preview: Record<string, unknown>
  error?: string
}

function nullIfEmpty(v?: string): string | null {
  if (!v) return null
  const s = v.trim()
  return s === '' ? null : s
}

function toValidUrl(v?: string): string | null {
  const s = nullIfEmpty(v)
  if (!s) return null
  try {
    new URL(s)
    return s
  } catch {
    return null
  }
}

function buildState(input: CreatePublisherInput): Record<string, unknown> {
  return {
    name: input.name,
    description: nullIfEmpty(input.description),
    type: input.type ?? 'OTHER',
    grantPoolsURI: toValidUrl(input.grantPoolsURI),
    code: nullIfEmpty(input.code) ?? input.name.slice(0, 8).toUpperCase().replace(/\s+/g, '-'),
    socials: [],
    sameAs: [],
    email: nullIfEmpty(input.email),
    contactName: nullIfEmpty(input.contactName),
    verificationState: 'UNVERIFIED',
  }
}

export async function createPublisher(input: CreatePublisherInput): Promise<CreatePublisherResult> {
  const state = buildState(input)
  const preview = { type: 'rfp-hub/grant-system', state: { global: state } }

  // The GrantSystem namespaced mutation is on its own subgraph (/graphql/grant-system)
  // — querying the supergraph `/graphql` also works but the subgraph is cheaper.
  const endpoint = getEndpoint().replace(/\/graphql$/, '/graphql/grant-system')

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation Create($name: String!, $initialState: GrantSystem_InitialStateInput) {
          GrantSystem { createDocument(name: $name, initialState: $initialState) { id } }
        }`,
        variables: { name: input.name, initialState: { global: state } },
      }),
    })
    if (!res.ok) {
      return { ok: false, preview, error: `HTTP ${res.status}` }
    }
    const body = (await res.json()) as {
      data?: { GrantSystem?: { createDocument?: { id: string } } }
      errors?: Array<{ message?: string }>
    }
    if (body.errors?.length) {
      return { ok: false, preview, error: body.errors[0].message ?? 'GraphQL error' }
    }
    const id = body.data?.GrantSystem?.createDocument?.id
    return id ? { ok: true, id, preview } : { ok: false, preview, error: 'No ID returned' }
  } catch (err) {
    return { ok: false, preview, error: (err as Error).message ?? 'Unknown error' }
  }
}
