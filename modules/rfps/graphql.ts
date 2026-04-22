import { gql } from '@/modules/shared/client'
import { SAMPLE_RFPS } from './sample-data'
import type { HubStats, Rfp, RfpFilter, RfpPage } from './types'

const RFP_FIELDS = `
  id slug title summary body funder funderUrl categories status deadline
  fundingAmount fundingCurrency ecosystem sourceUrl
  provenance { submitter submittedAt verificationStatus sourceHash }
  createdAt updatedAt
`

/** Fetch a paginated, filterable list of RFPs from the public subgraph. */
export async function fetchRfps(
  filter: RfpFilter = {},
  limit = 20,
  cursor: string | null = null,
): Promise<RfpPage> {
  try {
    const data = await gql<{ rfps: RfpPage }>(
      `query ($filter: RfpFilter, $pagination: Pagination) {
        rfps(filter: $filter, pagination: $pagination) {
          items { ${RFP_FIELDS} }
          nextCursor
          total
        }
      }`,
      { filter, pagination: { limit, cursor } },
    )
    return data.rfps
  } catch (err) {
    if (isSchemaMissing(err)) return fallbackFetchRfps(filter, limit, cursor)
    throw err
  }
}

/** Fetch a single RFP by its OID. */
export async function fetchRfp(id: string): Promise<Rfp | null> {
  try {
    const data = await gql<{ rfp: Rfp | null }>(
      `query ($id: OID!) { rfp(id: $id) { ${RFP_FIELDS} } }`,
      { id },
    )
    return data.rfp
  } catch (err) {
    if (isSchemaMissing(err)) return fallbackFetchRfp(id)
    throw err
  }
}

export async function fetchRfpBySlug(slug: string): Promise<Rfp | null> {
  try {
    const data = await gql<{ rfpBySlug: Rfp | null }>(
      `query ($slug: String!) { rfpBySlug(slug: $slug) { ${RFP_FIELDS} } }`,
      { slug },
    )
    return data.rfpBySlug
  } catch (err) {
    if (isSchemaMissing(err)) return null
    throw err
  }
}

export async function fetchHubStats(): Promise<HubStats> {
  try {
    const data = await gql<{ stats: HubStats }>(
      `query { stats { totalRfps openRfps totalFunders updatedAt } }`,
    )
    return data.stats
  } catch (err) {
    if (isSchemaMissing(err)) return fallbackStats()
    throw err
  }
}

// ---------------------------------------------------------------------------
// Fallback: use the document-model's built-in queries when the public subgraph
// isn't live yet. Loses server-side filter/pagination; applies them in-memory.
// ---------------------------------------------------------------------------

function isSchemaMissing(err: unknown): boolean {
  const msg = (err as Error)?.message ?? ''
  return /Cannot query field|Unknown type|does not exist on type Query/i.test(msg)
}

async function fallbackFetchRfps(
  filter: RfpFilter,
  limit: number,
  cursor: string | null,
): Promise<RfpPage> {
  const all = await fallbackListAll()
  const filtered = all.filter((r) => matches(r, filter))
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const startIdx = cursor ? Math.max(0, filtered.findIndex((r) => r.id === cursor) + 1) : 0
  const items = filtered.slice(startIdx, startIdx + limit)
  const nextCursor = items.length === limit ? items[items.length - 1].id : null
  return { items, nextCursor, total: filtered.length }
}

async function fallbackFetchRfp(id: string): Promise<Rfp | null> {
  const all = await fallbackListAll()
  return all.find((r) => r.id === id) ?? null
}

async function fallbackListAll(): Promise<Rfp[]> {
  try {
    const data = await gql<{
      Rfp: {
        findDocuments: { items: Array<{ id: string; state: { global: unknown } }> }
      }
    }>(
      `query {
        Rfp {
          findDocuments {
            items { id state { global } }
          }
        }
      }`,
    )
    return data.Rfp.findDocuments.items.map((doc) =>
      projectFromDocument(doc.id, doc.state.global as Record<string, unknown>),
    )
  } catch {
    // Neither subgraph nor document model is reachable — return seed data
    // so reviewers can see the experience without running the backend.
    return SAMPLE_RFPS
  }
}

async function fallbackStats(): Promise<HubStats> {
  const all = await fallbackListAll()
  const funders = new Set(all.map((r) => r.funder.toLowerCase()).filter(Boolean))
  return {
    totalRfps: all.length,
    openRfps: all.filter((r) => r.status === 'OPEN').length,
    totalFunders: funders.size,
    updatedAt: new Date().toISOString(),
  }
}

function projectFromDocument(id: string, raw: Record<string, unknown>): Rfp {
  const s = raw ?? {}
  const prov = (s.provenance as Record<string, unknown> | undefined) ?? {}
  return {
    id,
    slug: (s.slug as string) ?? id,
    title: (s.title as string) ?? '',
    summary: (s.summary as string) ?? '',
    body: (s.body as string) ?? null,
    funder: (s.funder as string) ?? '',
    funderUrl: (s.funderUrl as string) ?? null,
    categories: (s.categories as string[]) ?? [],
    status: ((s.status as string) ?? 'UPCOMING') as Rfp['status'],
    deadline: (s.deadline as string) ?? null,
    fundingAmount: (s.fundingAmount as string) ?? null,
    fundingCurrency: (s.fundingCurrency as string) ?? null,
    ecosystem: (s.ecosystem as string) ?? null,
    sourceUrl: (s.sourceUrl as string) ?? null,
    provenance: {
      submitter: (prov.submitter as string) ?? null,
      submittedAt: (prov.submittedAt as string) ?? new Date().toISOString(),
      verificationStatus:
        ((prov.verificationStatus as string) ?? 'UNVERIFIED') as Rfp['provenance']['verificationStatus'],
      sourceHash: (prov.sourceHash as string) ?? '',
    },
    createdAt: (s.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (s.updatedAt as string) ?? new Date().toISOString(),
  }
}

function matches(rfp: Rfp, f: RfpFilter): boolean {
  if (f.funder && rfp.funder.toLowerCase() !== f.funder.toLowerCase()) return false
  if (
    f.category &&
    !rfp.categories.map((c) => c.toLowerCase()).includes(f.category.toLowerCase())
  )
    return false
  if (f.status && rfp.status !== f.status) return false
  if (f.ecosystem && rfp.ecosystem !== f.ecosystem) return false
  if (f.deadlineBefore && rfp.deadline && rfp.deadline > f.deadlineBefore) return false
  if (f.deadlineAfter && rfp.deadline && rfp.deadline < f.deadlineAfter) return false
  if (f.search) {
    const q = f.search.toLowerCase()
    const hay = `${rfp.title} ${rfp.summary} ${rfp.funder} ${rfp.categories.join(' ')}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}
