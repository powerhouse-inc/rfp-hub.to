// Mirror of rfp-hub-app's GrantSystemState. Every GrantPool's grantSystemRef
// PHID points at a document of this shape.
export type GrantSystemType =
  | 'DAO'
  | 'FOUNDATION'
  | 'PROTOCOL'
  | 'COMPANY'
  | 'PROGRAM'
  | 'PERSON'
  | 'OTHER'

export type VerificationState =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'SUSPENDED'
  | 'REVOKED'

export type VerificationMethod =
  | 'MANUAL_REVIEW'
  | 'DOMAIN_VERIFICATION'
  | 'WALLET_SIGNATURE'
  | 'THIRD_PARTY_ATTESTATION'

export interface Social {
  id: string
  platform: string
  url: string
}

export interface GrantSystem {
  id: string
  name: string | null
  description: string | null
  type: GrantSystemType | null
  grantPoolsURI: string | null
  code: string | null
  email: string | null
  contactName: string | null
  image: string | null
  coverImage: string | null
  socials: Social[]
  sameAs: string[]
  verificationState: VerificationState
  verificationMethod: VerificationMethod | null
  verifiedAt: string | null
  verifiedBy: string | null
  publisherWallet: string | null
  /** Pool count — computed client-side by joining with GrantPool.findDocuments. */
  poolCount?: number
}
