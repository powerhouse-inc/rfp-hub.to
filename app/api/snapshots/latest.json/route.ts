import { NextResponse } from 'next/server'
import { serverGql } from '@/modules/shared/lib/server-fetch'

// Revalidate every 60s; upstream is switchboard which already caches documents.
export const revalidate = 60

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

const SYSTEM_FIELDS = `
  name description type grantPoolsURI code email contactName
  image coverImage socials { id platform url } sameAs
  verificationState verificationMethod verifiedAt verifiedBy publisherWallet
`

interface RawDoc {
  id: string
  state: { global: Record<string, unknown> }
}

/**
 * Full-dataset snapshot endpoint. Answers the EF ESP ask for an
 * unauthenticated HTTPS JSON fetchable without pagination. Tagged with
 * @context: DAOIP-5 so consuming aggregators can recognize the shape.
 */
export async function GET() {
  try {
    const data = await serverGql<{
      GrantPool: { findDocuments: { items: RawDoc[] } }
      GrantSystem: { findDocuments: { items: RawDoc[] } }
    }>(
      `query Snapshot {
        GrantPool { findDocuments { items { id state { global { ${POOL_FIELDS} } } } } }
        GrantSystem { findDocuments { items { id state { global { ${SYSTEM_FIELDS} } } } } }
      }`,
    )

    return NextResponse.json(
      {
        '@context': 'https://www.daostar.org/context/DAOIP-5.jsonld',
        '@type': 'RfpHubSnapshot',
        generatedAt: new Date().toISOString(),
        stats: {
          totalSystems: data.GrantSystem.findDocuments.items.length,
          totalPools: data.GrantPool.findDocuments.items.length,
        },
        grantSystems: data.GrantSystem.findDocuments.items.map((d) => ({
          id: d.id,
          ...d.state.global,
        })),
        grantPools: data.GrantPool.findDocuments.items.map((d) => ({
          id: d.id,
          ...d.state.global,
        })),
      },
      {
        headers: {
          'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
          'access-control-allow-origin': '*',
        },
      },
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'snapshot unavailable', detail: (err as Error).message },
      { status: 503 },
    )
  }
}
