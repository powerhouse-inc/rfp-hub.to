import { gql } from '@/modules/shared/client'
import type { GrantApplication } from './types'

const FIELDS = `
  grantPoolsURI grantPoolId grantPoolName
  projectsURI projectId projectName
  createdAt contentURI discussionsTo licenseURI
  isInactive applicationCompletionRate
  fundsAsked { id amount }
  fundsAskedInUSD
  fundsApproved { id amount }
  fundsApprovedInUSD
  status reviewStage
  feedbackNotes revisionCount
  submittedAt reviewedBy reviewedAt
`

interface RawListItem {
  id: string
  state: { global: Omit<GrantApplication, 'id' | 'socials'> & { socials?: unknown[] } }
}

function mapListItem(raw: RawListItem): GrantApplication {
  const g = raw.state.global
  return {
    id: raw.id,
    grantPoolsURI: g.grantPoolsURI ?? null,
    grantPoolId: g.grantPoolId ?? null,
    grantPoolName: g.grantPoolName ?? null,
    projectsURI: g.projectsURI ?? null,
    projectId: g.projectId ?? null,
    projectName: g.projectName ?? null,
    createdAt: g.createdAt ?? null,
    contentURI: g.contentURI ?? null,
    discussionsTo: g.discussionsTo ?? null,
    licenseURI: g.licenseURI ?? null,
    isInactive: g.isInactive,
    applicationCompletionRate: g.applicationCompletionRate ?? null,
    socials: g.socials ?? [],
    fundsAsked: g.fundsAsked ?? [],
    fundsAskedInUSD: g.fundsAskedInUSD ?? null,
    fundsApproved: g.fundsApproved ?? [],
    fundsApprovedInUSD: g.fundsApprovedInUSD ?? null,
    status: g.status,
    reviewStage: g.reviewStage,
    feedbackNotes: g.feedbackNotes ?? null,
    revisionCount: g.revisionCount,
    submittedAt: g.submittedAt ?? null,
    reviewedBy: g.reviewedBy ?? null,
    reviewedAt: g.reviewedAt ?? null,
  }
}

export async function fetchApplications(): Promise<GrantApplication[]> {
  try {
    const data = await gql<{
      GrantApplication: { findDocuments: { items: RawListItem[] } }
    }>(
      `query { GrantApplication { findDocuments { items { id state { global { ${FIELDS} } } } } } }`,
    )
    return data.GrantApplication.findDocuments.items.map(mapListItem)
  } catch {
    return []
  }
}

export async function fetchApplicationsForPool(poolId: string): Promise<GrantApplication[]> {
  const all = await fetchApplications()
  return all.filter((a) => a.grantPoolId === poolId)
}
