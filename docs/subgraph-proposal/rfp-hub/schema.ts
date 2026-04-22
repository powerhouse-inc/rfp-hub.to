import gql from 'graphql-tag'

export const schema = gql`
  # ---- RFP Hub public read API ------------------------------------------
  # Unauthenticated, cacheable, shaped for aggregation clients.
  # Aligned with DAOstar DAOIP-5 where possible.

  enum RfpStatus {
    OPEN
    CLOSED
    UPCOMING
    CANCELLED
  }

  enum VerificationStatus {
    UNVERIFIED
    VERIFIED
    DISPUTED
  }

  scalar DateTime
  scalar URL
  scalar OID
  scalar EthereumAddress

  type Provenance {
    submitter: EthereumAddress
    submittedAt: DateTime!
    verificationStatus: VerificationStatus!
    sourceHash: String!
  }

  type Rfp {
    id: OID!
    slug: String!
    title: String!
    summary: String!
    body: String
    funder: String!
    funderUrl: URL
    categories: [String!]!
    status: RfpStatus!
    deadline: DateTime
    fundingAmount: String
    fundingCurrency: String
    ecosystem: String
    sourceUrl: URL
    provenance: Provenance!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Publisher {
    id: OID!
    name: String!
    url: URL
    description: String
    rfpCount: Int!
    verified: Boolean!
  }

  type HubStats {
    totalRfps: Int!
    openRfps: Int!
    totalFunders: Int!
    updatedAt: DateTime!
  }

  input RfpFilter {
    funder: String
    category: String
    status: RfpStatus
    ecosystem: String
    deadlineBefore: DateTime
    deadlineAfter: DateTime
    search: String
  }

  input Pagination {
    limit: Int
    cursor: String
  }

  type RfpPage {
    items: [Rfp!]!
    nextCursor: String
    total: Int!
  }

  type Query {
    rfps(filter: RfpFilter, pagination: Pagination): RfpPage!
    rfp(id: OID!): Rfp
    rfpBySlug(slug: String!): Rfp
    publishers: [Publisher!]!
    stats: HubStats!
  }
`
