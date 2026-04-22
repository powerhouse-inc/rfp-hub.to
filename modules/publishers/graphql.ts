import { gql } from '@/modules/shared/client'
import { SAMPLE_RFPS } from '../rfps/sample-data'
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
  const byFunder = new Map<string, Publisher>()
  for (const r of SAMPLE_RFPS) {
    const existing = byFunder.get(r.funder)
    if (existing) {
      existing.rfpCount += 1
    } else {
      byFunder.set(r.funder, {
        id: r.funder,
        name: r.funder,
        url: r.funderUrl,
        description: null,
        rfpCount: 1,
        verified: false,
      })
    }
  }
  return Array.from(byFunder.values())
}
