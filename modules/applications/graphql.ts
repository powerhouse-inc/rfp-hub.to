// Applications live in the upstream DAOIP-5 JSON at each pool's
// `applicationsURI` — not as reactor documents. We fetch and project them
// client-side so the fusion page can show them without duplicating state
// into liberuum's package.

import type { GrantApplication } from './types'

interface UpstreamApplication {
  type?: string
  id: string | number
  grantPoolId?: string
  grantPoolName?: string
  projectId?: string
  projectName?: string
  projectsURI?: string
  contentURI?: string
  createdAt?: string
  fundsAsked?: { amount: number | string; denomination?: string }[]
  fundsApproved?: { amount: number | string; denomination?: string }[]
}

interface UpstreamEnvelope {
  '@context'?: string
  name?: string
  type?: string
  // DAOIP-5 applications_uri documents wrap applications under grant_pools[].applications
  grant_pools?: Array<{
    type?: string
    name?: string
    applications?: UpstreamApplication[]
  }>
  // Some older/variant envelopes use `grantApplications` at top level.
  grantApplications?: UpstreamApplication[]
}

function project(u: UpstreamApplication, idx: number): GrantApplication {
  const askedUSD = u.fundsAsked?.find((f) => (f.denomination ?? '').toUpperCase() === 'USD')
  const hasApproval = Boolean(u.fundsApproved?.[0]?.amount)
  return {
    id: `upstream-${u.id}-${idx}`,
    grantPoolsURI: null,
    grantPoolId: u.grantPoolId ?? null,
    grantPoolName: u.grantPoolName ?? null,
    projectsURI: u.projectsURI ?? null,
    projectId: u.projectId ?? null,
    projectName: u.projectName ?? null,
    createdAt: u.createdAt ?? null,
    contentURI: u.contentURI ?? null,
    discussionsTo: null,
    licenseURI: null,
    isInactive: false,
    applicationCompletionRate: hasApproval ? 1 : 0.5,
    socials: [],
    fundsAsked:
      u.fundsAsked?.map((f, i) => ({ id: `asked-${i}`, amount: String(f.amount) })) ?? [],
    fundsAskedInUSD: askedUSD ? String(askedUSD.amount) : null,
    fundsApproved:
      u.fundsApproved?.map((f, i) => ({ id: `approved-${i}`, amount: String(f.amount) })) ?? [],
    fundsApprovedInUSD: null,
    status: hasApproval ? 'funded' : 'pending',
    reviewStage: hasApproval ? 'FUNDED' : 'SUBMITTED',
    feedbackNotes: null,
    revisionCount: 0,
    submittedAt: u.createdAt ?? null,
    reviewedBy: null,
    reviewedAt: null,
  }
}

/**
 * Fetches the DAOIP-5 applications JSON at `uri` and projects it into the
 * fusion page's GrantApplication shape. Returns an empty array if the URI
 * is unreachable, non-DAOIP-5, or has no applications — callers should
 * treat "no applications" as a valid state.
 */
export async function fetchApplicationsFromURI(uri: string): Promise<GrantApplication[]> {
  try {
    const res = await fetch(uri)
    if (!res.ok) return []
    const body = (await res.json()) as UpstreamEnvelope
    const items =
      body.grant_pools?.[0]?.applications ??
      body.grantApplications ??
      []
    return items.map((u, i) => project(u, i))
  } catch {
    return []
  }
}
