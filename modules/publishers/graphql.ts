import { gql } from '@/modules/shared/client'
import { SAMPLE_POOLS } from '../rfps/sample-data'
import type { Publisher } from './types'

const FIELDS = `id name url description rfpCount verified`

export async function fetchPublishers(): Promise<Publisher[]> {
  try {
    const data = await gql<{ publishers: Publisher[] }>(
      `query { publishers { ${FIELDS} } }`,
    )
    return data.publishers
  } catch (err) {
    if (isSchemaMissing(err)) return derivePublishersFromSamples()
    throw err
  }
}

function isSchemaMissing(err: unknown): boolean {
  const msg = (err as Error)?.message ?? ''
  return /Cannot query field|Unknown type|does not exist on type Query/i.test(msg)
}

function derivePublishersFromSamples(): Publisher[] {
  // Group pools by grantSystemRef as a proxy for "funder" until we fetch
  // GrantSystem documents directly.
  const bySystem = new Map<string, Publisher>()
  for (const pool of SAMPLE_POOLS) {
    const key = pool.grantSystemRef ?? pool.publisher?.identifier ?? 'unknown'
    const displayName = key.startsWith('sample-system-')
      ? key.replace('sample-system-', '').replace(/^\w/, (c) => c.toUpperCase())
      : key
    const existing = bySystem.get(key)
    if (existing) {
      existing.rfpCount += 1
    } else {
      bySystem.set(key, {
        id: key,
        name: displayName,
        url: null,
        description: null,
        rfpCount: 1,
        verified: pool.governanceState === 'APPROVED',
      })
    }
  }
  return Array.from(bySystem.values())
}
