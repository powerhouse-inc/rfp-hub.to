#!/usr/bin/env bun
/**
 * Import the canonical DAOIP-5 dataset from
 * https://github.com/opensource-observer/oss-funding/tree/main/daoip-5/json
 * into a running RFP Hub switchboard.
 *
 * Lives in the fusion-page repo (not liberuum's package) because it's a
 * frontend-side seeding tool — not part of the reactor image. Points at the
 * switchboard whose URL the fusion page is configured to query.
 *
 * Two docs per upstream funder:
 *   1. `rfp-hub/grant-system`  — one per funder envelope (name, type, links)
 *   2. `rfp-hub/grant-pool`    — one per pool in the envelope, linked back to
 *                                 its GrantSystem via `grantSystemRef` PHID.
 *
 * Applications stay in the upstream JSON (liberuum's package is source of
 * truth for the reactor; the fusion page fetches `applicationsURI` live).
 *
 * Usage:
 *   SWITCHBOARD_URL=https://switchboard.light-fawn-92.vetra.io bun run scripts/import-daoip5.ts
 *   FUNDERS=optimism,gitcoin bun run scripts/import-daoip5.ts      # only these
 *   EXCLUDE_FUNDERS=stellar bun run scripts/import-daoip5.ts        # all but these
 */

const SWITCHBOARD_URL = process.env.SWITCHBOARD_URL ?? 'http://localhost:4001'
const DATASET_BASE =
  'https://raw.githubusercontent.com/opensource-observer/oss-funding/refs/heads/main/daoip-5/json'
const DATASET_API =
  'https://api.github.com/repos/opensource-observer/oss-funding/contents/daoip-5/json'

interface UpstreamPool {
  type: string
  id: string | number
  name: string
  description?: string
  isOpen?: boolean | string
  closeDate?: string
  applicationsURI?: string
  governanceURI?: string
  requiredCredentials?: string[]
  grantFundingMechanism?: string
  totalGrantPoolSize?: { amount: string; denomination?: string }[]
  email?: string
  image?: string
}

interface UpstreamEnvelope {
  '@context'?: string
  name: string
  type: string
  grantPoolsURI?: string
  grantPools: UpstreamPool[]
}

// Upstream "type" values are mixed case — map to liberuum's GrantSystem enum.
const SYSTEM_TYPE_MAP: Record<string, string> = {
  DAO: 'DAO',
  Foundation: 'FOUNDATION',
  FOUNDATION: 'FOUNDATION',
  Protocol: 'PROTOCOL',
  Company: 'COMPANY',
  Program: 'PROGRAM',
  Person: 'PERSON',
}

// Explicit upstream → schema enum map for grantFundingMechanism.
const MECHANISM_MAP: Record<string, string> = {
  'Direct Grants': 'DIRECT_GRANTS',
  'Direct Grant': 'DIRECT_GRANTS',
  'Quadratic Funding': 'QUADRATIC_FUNDING',
  'Retroactive Public Goods Funding': 'RETRO_FUNDING',
  'Retro Funding': 'RETRO_FUNDING',
  Bounties: 'BOUNTIES',
  RFP: 'REQUEST_FOR_PROPOSAL',
  'Request for Proposal': 'REQUEST_FOR_PROPOSAL',
  'Conviction Voting': 'CONVICTION_VOTING',
  'Impact Attestations': 'IMPACT_ATTESTATIONS',
}

const MECHANISM_HINTS: Array<[RegExp, string]> = [
  [/retro|retroactive/i, 'RETRO_FUNDING'],
  [/quadratic|qf/i, 'QUADRATIC_FUNDING'],
  [/bount(y|ies)/i, 'BOUNTIES'],
  [/conviction/i, 'CONVICTION_VOTING'],
  [/direct/i, 'DIRECT_GRANTS'],
  [/rfp|request/i, 'REQUEST_FOR_PROPOSAL'],
  [/attestation/i, 'IMPACT_ATTESTATIONS'],
]

function inferMechanism(name: string, description?: string): string {
  const hay = `${name} ${description ?? ''}`
  for (const [rx, mech] of MECHANISM_HINTS) if (rx.test(hay)) return mech
  return 'DIRECT_GRANTS'
}

function inferLifecycle(isOpen: boolean, closeDate: string | null): string {
  if (closeDate) {
    const d = new Date(closeDate)
    if (!Number.isNaN(d.getTime())) {
      if (d.getTime() < Date.now()) return 'CLOSED'
      if (isOpen) return 'OPEN'
      return 'UPCOMING'
    }
  }
  return isOpen ? 'OPEN' : 'CLOSED'
}

function nullIfEmpty(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}
function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  return false
}
function toValidUrl(v: unknown): string | null {
  const s = nullIfEmpty(v)
  if (!s) return null
  try {
    new URL(s)
    return s
  } catch {
    return null
  }
}
function toIsoDateTime(v: unknown): string | null {
  const s = nullIfEmpty(v)
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/**
 * Lenient timestamp parser for DAOIP-5 applications. The canonical format is
 * ISO 8601, but some funders (e.g. clrfund) emit `MM/DD/YYYYTHH:MM:SSZ`
 * which Node's `new Date()` rejects as NaN. Normalize that to ISO first.
 */
function parseFlexibleTimestamp(raw: unknown): number {
  if (typeof raw !== 'string') return NaN
  const s = raw.trim()
  if (!s) return NaN
  // Match MM/DD/YYYY(...) and reshape to YYYY-MM-DD(...)
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/)
  if (slash) {
    const [, mm, dd, yyyy, rest] = slash
    const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}${rest || ''}`
    return new Date(iso).getTime()
  }
  return new Date(s).getTime()
}

/**
 * DAOIP-5 sources rarely fill `closeDate` on the GrantPool itself — but the
 * pool's applications_uri.json usually has per-application `createdAt`
 * timestamps. The latest of those is a reasonable proxy for when the pool
 * closed (applications stop arriving after close). Returns null if the URI
 * isn't reachable or has no dated applications.
 */
async function deriveCloseDateFromApplications(uri: string): Promise<string | null> {
  try {
    const res = await fetch(uri)
    if (!res.ok) return null
    const body = (await res.json()) as {
      grant_pools?: Array<{ applications?: Array<{ createdAt?: string }> }>
      grantApplications?: Array<{ createdAt?: string }>
    }
    const apps =
      body.grant_pools?.[0]?.applications ??
      body.grantApplications ??
      []
    const stamps = apps
      .map((a) => parseFlexibleTimestamp(a.createdAt))
      .filter((n) => !Number.isNaN(n))
    if (stamps.length === 0) return null
    return new Date(Math.max(...stamps)).toISOString()
  } catch {
    return null
  }
}

function inferEcosystem(slug: string): string {
  const map: Record<string, string> = {
    optimism: 'Optimism',
    arbitrumfoundation: 'Arbitrum',
    gitcoin: 'Ethereum',
    celo: 'Celo',
    stellar: 'Stellar',
    clrfund: 'Ethereum',
    'dao-drops-dorgtech': 'Ethereum',
    'octant-golemfoundation': 'Ethereum',
    questbook: 'Ethereum',
  }
  return map[slug] ?? 'Ethereum'
}

async function gql(path: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch(`${SWITCHBOARD_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GraphQL ${path}: HTTP ${res.status}`)
  const body = (await res.json()) as { data?: unknown; errors?: { message: string }[] }
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '))
  return body.data as Record<string, unknown>
}

async function createGrantSystem(envelope: UpstreamEnvelope, slug: string): Promise<string> {
  const type = SYSTEM_TYPE_MAP[envelope.type] ?? 'OTHER'
  const data = (await gql(
    '/graphql/grant-system',
    `mutation Create($name: String!, $initialState: GrantSystem_InitialStateInput) {
      GrantSystem { createDocument(name: $name, initialState: $initialState) { id } }
    }`,
    {
      name: envelope.name,
      initialState: {
        global: {
          name: envelope.name,
          description: `${envelope.name} — imported from DAOIP-5 (${slug})`,
          type,
          grantPoolsURI: envelope.grantPoolsURI ?? null,
          code: slug.toUpperCase(),
          socials: [],
          sameAs: [`${DATASET_BASE}/${slug}/grants_pool.json`],
          verificationState: 'UNVERIFIED',
        },
      },
    },
  )) as { GrantSystem: { createDocument: { id: string } } }
  return data.GrantSystem.createDocument.id
}

async function createGrantPool(
  pool: UpstreamPool,
  grantSystemRef: string,
  slug: string,
): Promise<string> {
  // Prefer the pool's declared closeDate. Fall back to the max application
  // createdAt when we have an applications_uri — DAOIP-5 rarely fills
  // closeDate but the applications almost always carry timestamps.
  let closeDate = toIsoDateTime(pool.closeDate)
  if (!closeDate && pool.applicationsURI) {
    const url = toValidUrl(pool.applicationsURI)
    if (url) closeDate = await deriveCloseDateFromApplications(url)
  }

  const data = (await gql(
    '/graphql/grant-pool',
    `mutation Create($name: String!, $initialState: GrantPool_InitialStateInput) {
      GrantPool { createDocument(name: $name, initialState: $initialState) { id } }
    }`,
    {
      name: String(pool.name || pool.id),
      initialState: {
        global: {
          grantSystemRef,
          name: String(pool.name || pool.id),
          description: nullIfEmpty(pool.description),
          grantFundingMechanism:
            MECHANISM_MAP[(pool.grantFundingMechanism ?? '').trim()] ??
            inferMechanism(String(pool.name ?? ''), pool.description),
          isOpen: toBool(pool.isOpen),
          openDate: null,
          closeDate,
          applicationsURI: toValidUrl(pool.applicationsURI),
          governanceURI: toValidUrl(pool.governanceURI),
          attestationIssuersURI: null,
          requiredCredentials: pool.requiredCredentials ?? [],
          totalGrantPoolSize: [],
          totalGrantPoolSizeInUSD: null,
          minGrant: [],
          maxGrant: [],
          email: nullIfEmpty(pool.email),
          image: toValidUrl(pool.image),
          coverImage: null,
          extensions: null,
          sameAs: toValidUrl(pool.applicationsURI)
            ? [toValidUrl(pool.applicationsURI) as string]
            : [],
          code: String(pool.id),
          briefingURI: null,
          eligibilityCriteria: null,
          evaluationCriteria: null,
          contextDocuments: [],
          reviewers: [],
          categories: [],
          ecosystems: [inferEcosystem(slug)],
          tags: ['daoip-5', slug],
          lifecycle: inferLifecycle(toBool(pool.isOpen), closeDate),
          submitter: {
            type: 'AUTOMATION',
            identifier: 'daoip5-importer',
            submittedAt: new Date().toISOString(),
          },
          publisher: null,
          lastVerifiedAt: null,
          verificationMethod: null,
          verifiedBy: null,
          // Imported from a trusted DAOIP-5 source — APPROVED so the pool
          // shows on the default list without governance review.
          governanceState: 'APPROVED',
          supersedes: null,
          claimedFromEntry: null,
          duplicateOf: null,
        },
      },
    },
  )) as { GrantPool: { createDocument: { id: string } } }
  return data.GrantPool.createDocument.id
}

async function listFunders(): Promise<string[]> {
  const include = process.env.FUNDERS
  if (include) return include.split(',').map((s) => s.trim()).filter(Boolean)
  const res = await fetch(DATASET_API)
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`)
  const items = (await res.json()) as Array<{ name: string; type: string }>
  const exclude = new Set(
    (process.env.EXCLUDE_FUNDERS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  )
  return items
    .filter((i) => i.type === 'dir')
    .map((i) => i.name)
    .filter((name) => !exclude.has(name))
}

async function main() {
  console.log(`[import] Switchboard: ${SWITCHBOARD_URL}`)
  const funders = await listFunders()
  console.log(`[import] Funders: ${funders.join(', ')}`)

  let systems = 0
  let pools = 0
  let failed = 0

  for (const slug of funders) {
    try {
      const res = await fetch(`${DATASET_BASE}/${slug}/grants_pool.json`)
      if (!res.ok) {
        console.warn(`  [${slug}] skip — grants_pool.json not found (${res.status})`)
        continue
      }
      const envelope = (await res.json()) as UpstreamEnvelope
      const systemId = await createGrantSystem(envelope, slug)
      systems += 1
      console.log(
        `  [${slug}] ✓ GrantSystem "${envelope.name}" → ${systemId} (${envelope.grantPools?.length ?? 0} pools)`,
      )
      for (const pool of envelope.grantPools ?? []) {
        try {
          const poolId = await createGrantPool(pool, systemId, slug)
          pools += 1
          console.log(`    └─ GrantPool "${pool.name || pool.id}" → ${poolId}`)
        } catch (err) {
          failed += 1
          console.warn(`    └─ FAILED pool "${pool.name || pool.id}": ${(err as Error).message}`)
        }
      }
    } catch (err) {
      failed += 1
      console.warn(`  [${slug}] FAILED: ${(err as Error).message}`)
    }
  }

  console.log(`\n[import] Done. ${systems} systems, ${pools} pools, ${failed} failures.`)
  console.log(
    `[import] Applications stay in upstream JSON — the fusion page reads each pool's applicationsURI live.`,
  )
}

main().catch((err) => {
  console.error('[import] fatal:', err)
  process.exit(1)
})
