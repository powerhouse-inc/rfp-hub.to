import { gql } from '@/modules/shared/client'
import type {
  GrantPool,
  GrantPoolFilter,
  GrantPoolPage,
  HubStats,
} from './types'

// All fields the UI needs to render a GrantPool card + detail. Keep this in
// sync with the GrantPoolState type defined in liberuum's document model
// (rfp-hub-app/document-models/grant-pool).
const POOL_STATE_FIELDS = `
  grantSystemRef name description grantFundingMechanism
  isOpen openDate closeDate
  applicationsURI governanceURI attestationIssuersURI
  requiredCredentials
  totalGrantPoolSize { id amount }
  totalGrantPoolSizeInUSD
  minGrant { id amount }
  maxGrant { id amount }
  email image coverImage extensions
  sameAs
  code briefingURI eligibilityCriteria evaluationCriteria
  contextDocuments { id name url }
  reviewers { id did scope reviewerType name }
  categories ecosystems tags
  lifecycle
  submitter { type identifier submittedAt }
  publisher { identifier publishedAt }
  lastVerifiedAt verificationMethod verifiedBy
  governanceState
  supersedes claimedFromEntry duplicateOf
`

type Namespaced<T> = { GrantPool: T }

interface RawListItem {
  id: string
  state: { global: Omit<GrantPool, 'id' | 'createdAt' | 'updatedAt'> }
}

interface RawDocument {
  id: string
  createdAtUtcIso: string
  lastModifiedAtUtcIso: string
  state: { global: Omit<GrantPool, 'id' | 'createdAt' | 'updatedAt'> }
}

function mapListItem(raw: RawListItem): GrantPool {
  return {
    id: raw.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...raw.state.global,
  }
}

function mapDocument(raw: RawDocument): GrantPool {
  return {
    id: raw.id,
    createdAt: raw.createdAtUtcIso,
    updatedAt: raw.lastModifiedAtUtcIso,
    ...raw.state.global,
  }
}

/**
 * Fetch the full list of GrantPool documents from the document-model's
 * auto-generated GraphQL namespace. The public `rfp-hub` aggregation subgraph
 * is planned but not yet live in liberuum's package; once it lands, this
 * module gets a server-side filter/pagination path.
 */
async function fetchAllPools(): Promise<GrantPool[]> {
  try {
    const data = await gql<
      Namespaced<{ findDocuments: { items: RawListItem[] } }>
    >(
      `query {
        GrantPool {
          findDocuments {
            items { id state { global { ${POOL_STATE_FIELDS} } } }
          }
        }
      }`,
    )
    return data.GrantPool.findDocuments.items.map(mapListItem)
  } catch {
    // Only list grant pools that exist in the connected Switchboard reactor.
    // No mock/sample data — avoids showing documents that are not in your drive.
    return []
  }
}

export async function fetchRfps(
  filter: GrantPoolFilter = {},
  limit = 20,
  cursor: string | null = null,
): Promise<GrantPoolPage> {
  const all = await fetchAllPools()
  const filtered = all.filter((p) => matchesFilter(p, filter))
  filtered.sort((a, b) => {
    // Deterministic order: deadline asc (null last), then updatedAt desc.
    const ax = a.closeDate ?? '￿'
    const bx = b.closeDate ?? '￿'
    if (ax !== bx) return ax.localeCompare(bx)
    return b.updatedAt.localeCompare(a.updatedAt)
  })
  const startIdx = cursor
    ? Math.max(0, filtered.findIndex((p) => p.id === cursor) + 1)
    : 0
  const items = filtered.slice(startIdx, startIdx + limit)
  const nextCursor = items.length === limit ? items[items.length - 1].id : null
  return { items, nextCursor, total: filtered.length }
}

export async function fetchRfp(id: string): Promise<GrantPool | null> {
  try {
    const data = await gql<
      Namespaced<{ document: { document: RawDocument } | null }>
    >(
      `query ($id: String!) {
        GrantPool {
          document(identifier: $id) {
            document {
              id createdAtUtcIso lastModifiedAtUtcIso
              state { global { ${POOL_STATE_FIELDS} } }
            }
          }
        }
      }`,
      { id },
    )
    const raw = data.GrantPool.document?.document
    return raw ? mapDocument(raw) : null
  } catch {
    return null
  }
}

export async function fetchHubStats(): Promise<HubStats> {
  const all = await fetchAllPools()
  const systems = new Set(all.map((p) => p.grantSystemRef).filter(Boolean) as string[])
  return {
    totalPools: all.length,
    openPools: all.filter((p) => p.lifecycle === 'OPEN' || p.lifecycle === 'UPCOMING').length,
    totalGrantSystems: systems.size,
    updatedAt: new Date().toISOString(),
  }
}

function matchesFilter(p: GrantPool, f: GrantPoolFilter): boolean {
  if (f.grantSystemRef && p.grantSystemRef !== f.grantSystemRef) return false
  if (f.grantFundingMechanism && p.grantFundingMechanism !== f.grantFundingMechanism) return false
  if (f.lifecycle && p.lifecycle !== f.lifecycle) return false
  if (f.governanceState && p.governanceState !== f.governanceState) return false
  if (f.ecosystem && !p.ecosystems.includes(f.ecosystem)) return false
  if (f.category && !p.categories.map((c) => c.toLowerCase()).includes(f.category.toLowerCase()))
    return false
  if (f.closeDateBefore && p.closeDate && p.closeDate > f.closeDateBefore) return false
  if (f.closeDateAfter && p.closeDate && p.closeDate < f.closeDateAfter) return false
  if (f.search) {
    const q = f.search.toLowerCase()
    const hay = `${p.name ?? ''} ${p.description ?? ''} ${p.categories.join(' ')} ${p.ecosystems.join(' ')} ${p.tags.join(' ')}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}
