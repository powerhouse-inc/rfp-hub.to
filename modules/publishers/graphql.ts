import { gql } from '@/modules/shared/client'
import { SAMPLE_POOLS } from '../rfps/sample-data'
import type { GrantSystem } from './types'

const GRANT_SYSTEM_FIELDS = `
  name description type grantPoolsURI code email contactName image coverImage
  socials { id platform url }
  sameAs
  verificationState verificationMethod verifiedAt verifiedBy publisherWallet
`

interface RawListItem {
  id: string
  state: { global: Omit<GrantSystem, 'id' | 'poolCount'> }
}

function mapListItem(raw: RawListItem): GrantSystem {
  return {
    id: raw.id,
    ...raw.state.global,
  }
}

export async function fetchPublishers(): Promise<GrantSystem[]> {
  try {
    const [systemsData, poolsData] = await Promise.all([
      gql<{ GrantSystem: { findDocuments: { items: RawListItem[] } } }>(
        `query {
          GrantSystem { findDocuments { items { id state { global { ${GRANT_SYSTEM_FIELDS} } } } } }
        }`,
      ),
      gql<{ GrantPool: { findDocuments: { items: Array<{ state: { global: { grantSystemRef: string | null } } }> } } }>(
        `query { GrantPool { findDocuments { items { state { global { grantSystemRef } } } } } }`,
      ),
    ])

    const poolCounts = new Map<string, number>()
    for (const pool of poolsData.GrantPool.findDocuments.items) {
      const ref = pool.state.global.grantSystemRef
      if (ref) poolCounts.set(ref, (poolCounts.get(ref) ?? 0) + 1)
    }

    return systemsData.GrantSystem.findDocuments.items.map((raw) => {
      const system = mapListItem(raw)
      return { ...system, poolCount: poolCounts.get(system.id) ?? 0 }
    })
  } catch {
    // No switchboard — derive from SAMPLE_POOLS.
    const bySystem = new Map<string, GrantSystem>()
    for (const pool of SAMPLE_POOLS) {
      const key = pool.grantSystemRef ?? pool.publisher?.identifier ?? 'unknown'
      const displayName = key.startsWith('sample-system-')
        ? key.replace('sample-system-', '').replace(/^\w/, (c) => c.toUpperCase())
        : key
      const existing = bySystem.get(key)
      if (existing) {
        existing.poolCount = (existing.poolCount ?? 0) + 1
      } else {
        bySystem.set(key, {
          id: key,
          name: displayName,
          description: null,
          type: null,
          grantPoolsURI: null,
          code: null,
          email: null,
          contactName: null,
          image: null,
          coverImage: null,
          socials: [],
          sameAs: [],
          verificationState:
            pool.governanceState === 'APPROVED' ? 'VERIFIED' : 'UNVERIFIED',
          verificationMethod: null,
          verifiedAt: null,
          verifiedBy: null,
          publisherWallet: null,
          poolCount: 1,
        })
      }
    }
    return Array.from(bySystem.values())
  }
}

export async function fetchPublisher(id: string): Promise<GrantSystem | null> {
  try {
    const data = await gql<{
      GrantSystem: { document: { document: { id: string; state: { global: Omit<GrantSystem, 'id' | 'poolCount'> } } } | null }
    }>(
      `query ($id: String!) {
        GrantSystem {
          document(identifier: $id) {
            document { id state { global { ${GRANT_SYSTEM_FIELDS} } } }
          }
        }
      }`,
      { id },
    )
    const doc = data.GrantSystem.document?.document
    return doc ? mapListItem(doc) : null
  } catch {
    const list = await fetchPublishers()
    return list.find((p) => p.id === id) ?? null
  }
}
