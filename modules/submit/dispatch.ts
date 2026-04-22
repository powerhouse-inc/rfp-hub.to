import { getEndpoint } from '@/modules/shared/client'
import type { SubmitRfpInput } from './schema'

export interface SubmitResult {
  ok: boolean
  documentId?: string
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

function toIsoDateTime(v?: string): string | null {
  const s = nullIfEmpty(v)
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function buildState(input: SubmitRfpInput): Record<string, unknown> {
  return {
    grantSystemRef: nullIfEmpty(input.grantSystemRef),
    name: input.name,
    description: input.description,
    grantFundingMechanism: input.grantFundingMechanism,
    isOpen: input.lifecycle === 'OPEN',
    openDate: toIsoDateTime(input.openDate),
    closeDate: toIsoDateTime(input.closeDate),
    applicationsURI: toValidUrl(input.applicationsURI),
    governanceURI: null,
    attestationIssuersURI: null,
    requiredCredentials: [],
    totalGrantPoolSize: [],
    totalGrantPoolSizeInUSD: nullIfEmpty(input.totalGrantPoolSizeInUSD),
    minGrant: [],
    maxGrant: [],
    email: null,
    image: null,
    coverImage: null,
    extensions: null,
    sameAs: toValidUrl(input.applicationsURI) ? [toValidUrl(input.applicationsURI) as string] : [],
    code: null,
    briefingURI: toValidUrl(input.briefingURI),
    eligibilityCriteria: nullIfEmpty(input.eligibilityCriteria),
    evaluationCriteria: nullIfEmpty(input.evaluationCriteria),
    contextDocuments: [],
    reviewers: [],
    categories: input.categories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    ecosystems: input.ecosystem ? [input.ecosystem] : [],
    tags: [],
    lifecycle: input.lifecycle,
    submitter: {
      type: 'COMMUNITY',
      identifier: 'did:anon:frontend-submitter',
      submittedAt: new Date().toISOString(),
    },
    publisher: null,
    lastVerifiedAt: null,
    verificationMethod: null,
    verifiedBy: null,
    governanceState: 'PENDING',
    supersedes: null,
    claimedFromEntry: null,
    duplicateOf: null,
  }
}

/**
 * Posts the grant-pool document to the GrantSystem subgraph's createDocument
 * mutation. The switchboard produces a reactor-signed operation log entry;
 * Renown-based submitter signing is a follow-up once the verification
 * subgraph lands.
 */
export async function submitRfp(input: SubmitRfpInput): Promise<SubmitResult> {
  const state = buildState(input)
  const preview = { type: 'rfp-hub/grant-pool', state: { global: state } }

  const endpoint = getEndpoint().replace(/\/graphql$/, '/graphql/grant-pool')

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation Create($name: String!, $initialState: GrantPool_InitialStateInput) {
          GrantPool { createDocument(name: $name, initialState: $initialState) { id } }
        }`,
        variables: { name: input.name, initialState: { global: state } },
      }),
    })
    if (!res.ok) {
      return { ok: false, preview, error: `HTTP ${res.status}` }
    }
    const body = (await res.json()) as {
      data?: { GrantPool?: { createDocument?: { id: string } } }
      errors?: Array<{ message?: string }>
    }
    if (body.errors?.length) {
      return { ok: false, preview, error: body.errors[0].message ?? 'GraphQL error' }
    }
    const id = body.data?.GrantPool?.createDocument?.id
    return id ? { ok: true, documentId: id, preview } : { ok: false, preview, error: 'No ID returned' }
  } catch (err) {
    return { ok: false, preview, error: (err as Error).message ?? 'Unknown error' }
  }
}
