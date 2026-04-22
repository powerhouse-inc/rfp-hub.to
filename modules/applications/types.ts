// Mirror of rfp-hub-app's GrantApplicationState — applications *to* a grant pool.

export type ApplicationStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'funded'
  | 'rejected'
  | 'completed'

export type ReviewStage =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'OPENED'
  | 'UNDER_REVIEW'
  | 'NEEDS_REVISION'
  | 'REVISED'
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'FUNDED'
  | 'COMPLETED'

export interface AppFundingAmount {
  id: string
  amount: string
}

export interface GrantApplication {
  id: string
  grantPoolsURI: string | null
  grantPoolId: string | null
  grantPoolName: string | null
  projectsURI: string | null
  projectId: string | null
  projectName: string | null
  createdAt: string | null
  contentURI: string | null
  discussionsTo: string | null
  licenseURI: string | null
  isInactive: boolean
  applicationCompletionRate: number | null
  socials: unknown[]
  fundsAsked: AppFundingAmount[]
  fundsAskedInUSD: string | null
  fundsApproved: AppFundingAmount[]
  fundsApprovedInUSD: string | null
  status: ApplicationStatus
  reviewStage: ReviewStage
  feedbackNotes: string | null
  revisionCount: number
  submittedAt: string | null
  reviewedBy: string | null
  reviewedAt: string | null
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  in_review: 'In review',
  approved: 'Approved',
  funded: 'Funded',
  rejected: 'Rejected',
  completed: 'Completed',
}
