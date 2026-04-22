import { NextResponse } from 'next/server'
import { serverGql } from '@/modules/shared/lib/server-fetch'
import { toSchemaOrgGrant } from '@/modules/rfps/jsonld'
import type { GrantPool } from '@/modules/rfps'

export const revalidate = 300

interface RawDoc {
  id: string
  createdAtUtcIso: string
  lastModifiedAtUtcIso: string
  state: { global: Omit<GrantPool, 'id' | 'createdAt' | 'updatedAt'> }
}

const POOL_FIELDS = `
  grantSystemRef name description grantFundingMechanism
  isOpen openDate closeDate applicationsURI governanceURI attestationIssuersURI
  requiredCredentials
  totalGrantPoolSize { id amount }
  totalGrantPoolSizeInUSD
  minGrant { id amount }
  maxGrant { id amount }
  email image coverImage extensions sameAs code briefingURI
  eligibilityCriteria evaluationCriteria
  contextDocuments { id name url }
  reviewers { id did scope reviewerType name }
  categories ecosystems tags lifecycle
  submitter { type identifier submittedAt }
  publisher { identifier publishedAt }
  lastVerifiedAt verificationMethod verifiedBy governanceState
  supersedes claimedFromEntry duplicateOf
`

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await serverGql<{
      GrantPool: { document: { document: RawDoc } | null }
    }>(
      `query ($id: String!) {
        GrantPool {
          document(identifier: $id) {
            document {
              id createdAtUtcIso lastModifiedAtUtcIso
              state { global { ${POOL_FIELDS} } }
            }
          }
        }
      }`,
      { id },
    )
    const raw = data.GrantPool.document?.document
    if (!raw) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    const pool: GrantPool = {
      id: raw.id,
      createdAt: raw.createdAtUtcIso,
      updatedAt: raw.lastModifiedAtUtcIso,
      ...raw.state.global,
    }
    return NextResponse.json(toSchemaOrgGrant(pool), {
      headers: {
        'content-type': 'application/ld+json',
        'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        'access-control-allow-origin': '*',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'unavailable', detail: (err as Error).message },
      { status: 503 },
    )
  }
}
