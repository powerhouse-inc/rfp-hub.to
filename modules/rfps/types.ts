export type RfpStatus = 'OPEN' | 'CLOSED' | 'UPCOMING' | 'CANCELLED'

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'DISPUTED'

export interface Provenance {
  submitter: string | null
  submittedAt: string
  verificationStatus: VerificationStatus
  sourceHash: string
}

export interface Rfp {
  id: string
  slug: string
  title: string
  summary: string
  body: string | null
  funder: string
  funderUrl: string | null
  categories: string[]
  status: RfpStatus
  deadline: string | null
  fundingAmount: string | null
  fundingCurrency: string | null
  ecosystem: string | null
  sourceUrl: string | null
  provenance: Provenance
  createdAt: string
  updatedAt: string
}

export interface RfpFilter {
  funder?: string
  category?: string
  status?: RfpStatus
  ecosystem?: string
  deadlineBefore?: string
  deadlineAfter?: string
  search?: string
}

export interface RfpPage {
  items: Rfp[]
  nextCursor: string | null
  total: number
}

export interface HubStats {
  totalRfps: number
  openRfps: number
  totalFunders: number
  updatedAt: string
}

export const RFP_STATUS_OPTIONS: RfpStatus[] = ['OPEN', 'UPCOMING', 'CLOSED', 'CANCELLED']
