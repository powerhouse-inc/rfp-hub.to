// Types mirror liberuum's rfp-hub-app GrantPoolState schema exactly, so the
// fusion page compiles against the real document model. Keeping the file name
// `rfps` for continuity — the user-facing product is "RFP Hub" but the canonical
// document type is `rfp-hub/grant-pool` (DAOIP-5 aligned).

export type FundingMechanism =
  | 'DIRECT_GRANTS'
  | 'QUADRATIC_FUNDING'
  | 'STREAMING_QUADRATIC_FUNDING'
  | 'RETRO_FUNDING'
  | 'CONVICTION_VOTING'
  | 'SELF_CURATED_REGISTRIES'
  | 'GIFT_CIRCLES'
  | 'SOCIAL_MEDIA_CAPITAL_ALLOCATION'
  | 'FUTARCHY'
  | 'ASSURANCE_CONTRACTS'
  | 'COOKIE_JAR'
  | 'IMPACT_ATTESTATIONS'
  | 'STOKVEL'
  | 'REQUEST_FOR_PROPOSAL'
  | 'DELEGATED_DOMAIN_ALLOCATION'
  | 'EVOLUTIONARY_GRANTS_GAMES'
  | 'DIRECT_TO_CONTRACT_INCENTIVES'
  | 'ANGEL_INVESTMENT'
  | 'DOMINANT_ASSURANCE_CONTRACTS'
  | 'COMMUNITY_CURRENCIES'
  | 'UNIVERSAL_BASIC_INCOME'
  | 'BOUNTIES'
  | 'GNOSIS_SAFE'
  | 'WAQF'
  | 'RANKED_CHOICE_VOTING'
  | 'HONOUR'
  | 'MUTUAL_AID_NETWORKS'
  | 'BONDING_CURVES'
  | 'ZAKAT'
  | 'DECENTRALIZED_VALIDATORS'
  | 'REVNETS'
  | 'OTHER'

export type GrantPoolLifecycle =
  | 'DRAFT'
  | 'REQUEST_FOR_COMMENTS'
  | 'UPCOMING'
  | 'OPEN'
  | 'CLOSED'
  | 'AWARDED'
  | 'NOT_AWARDED'
  | 'CANCELLED'

export type PoolGovernanceState =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISPUTED'
  | 'SUPERSEDED'

export type SubmitterType = 'COMMUNITY' | 'VERIFIED_PUBLISHER' | 'AUTOMATION'

export type VerificationMethod =
  | 'MANUAL_REVIEW'
  | 'DOMAIN_VERIFICATION'
  | 'HTTP_PROBE'
  | 'REVIEWER_CONFIRMATION'

export interface Submitter {
  type: SubmitterType
  identifier: string
  submittedAt: string
}

export interface Publisher {
  identifier: string
  publishedAt: string
}

export interface FundingAmount {
  id: string
  amount: string
}

export interface ContextDocument {
  id: string
  name: string
  url: string
}

export interface Reviewer {
  id: string
  did: string
  scope: 'INTERNAL' | 'EXTERNAL'
  reviewerType: 'HUMAN' | 'GROUP' | 'AI'
  name: string
}

export interface GrantPool {
  /** Reactor document id (the PHID of this GrantPool). Not in the state itself. */
  id: string
  /** Reactor last-modified timestamp. Not in the state itself. */
  createdAt: string
  updatedAt: string

  // DAOIP-5 canonical fields (and the hub-added grantSystemRef FK)
  grantSystemRef: string | null
  name: string | null
  description: string | null
  grantFundingMechanism: FundingMechanism | null
  isOpen: boolean
  openDate: string | null
  closeDate: string | null
  applicationsURI: string | null
  governanceURI: string | null
  attestationIssuersURI: string | null
  requiredCredentials: string[]
  totalGrantPoolSize: FundingAmount[]
  totalGrantPoolSizeInUSD: string | null
  minGrant: FundingAmount[]
  maxGrant: FundingAmount[]
  email: string | null
  image: string | null
  coverImage: string | null
  extensions: string | null

  // schema.org additions
  sameAs: string[]

  // Network-admin-inspired
  code: string | null
  briefingURI: string | null
  eligibilityCriteria: string | null
  evaluationCriteria: string | null
  contextDocuments: ContextDocument[]
  reviewers: Reviewer[]

  // Hub filter dimensions
  categories: string[]
  ecosystems: string[]
  tags: string[]

  // Richer lifecycle (projects losslessly to DAOIP-5 isOpen)
  lifecycle: GrantPoolLifecycle

  // Hub provenance
  submitter: Submitter | null
  publisher: Publisher | null
  lastVerifiedAt: string | null
  verificationMethod: VerificationMethod | null
  verifiedBy: string | null

  // Hub governance state
  governanceState: PoolGovernanceState

  // Lineage
  supersedes: string | null
  claimedFromEntry: string | null
  duplicateOf: string | null
}

export interface GrantPoolFilter {
  grantFundingMechanism?: FundingMechanism
  lifecycle?: GrantPoolLifecycle
  governanceState?: PoolGovernanceState
  ecosystem?: string
  category?: string
  grantSystemRef?: string
  closeDateBefore?: string
  closeDateAfter?: string
  search?: string
}

export interface GrantPoolPage {
  items: GrantPool[]
  nextCursor: string | null
  total: number
}

export interface HubStats {
  totalPools: number
  openPools: number
  totalGrantSystems: number
  updatedAt: string
}

export const LIFECYCLE_OPTIONS: GrantPoolLifecycle[] = [
  'DRAFT',
  'REQUEST_FOR_COMMENTS',
  'UPCOMING',
  'OPEN',
  'CLOSED',
  'AWARDED',
  'NOT_AWARDED',
  'CANCELLED',
]

export const FUNDING_MECHANISM_OPTIONS: FundingMechanism[] = [
  'DIRECT_GRANTS',
  'QUADRATIC_FUNDING',
  'RETRO_FUNDING',
  'REQUEST_FOR_PROPOSAL',
  'BOUNTIES',
  'CONVICTION_VOTING',
  'IMPACT_ATTESTATIONS',
  'STREAMING_QUADRATIC_FUNDING',
  'ANGEL_INVESTMENT',
  'OTHER',
]

/**
 * Human-readable short label for a lifecycle state, used in badges and filters.
 * The 8-state enum keeps the full DAOIP-5 lossless, but users see short labels.
 */
export const LIFECYCLE_LABEL: Record<GrantPoolLifecycle, string> = {
  DRAFT: 'Draft',
  REQUEST_FOR_COMMENTS: 'RFC',
  UPCOMING: 'Upcoming',
  OPEN: 'Open',
  CLOSED: 'Closed',
  AWARDED: 'Awarded',
  NOT_AWARDED: 'Not awarded',
  CANCELLED: 'Cancelled',
}

/** Checks against DAOIP-5 isOpen semantics: OPEN or UPCOMING counts as open. */
export function poolIsActive(p: GrantPool): boolean {
  return p.lifecycle === 'OPEN' || p.lifecycle === 'UPCOMING'
}
