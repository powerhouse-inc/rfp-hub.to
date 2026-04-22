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

  # ---- Governance ------------------------------------------------------
  # Expressed as a first-class Document Model (rfp-hub-governance).
  # The subgraph exposes read-only projections; governance changes happen
  # via signed operations on the governance document.

  enum DisputeStatus {
    FILED
    UNDER_REVIEW
    RESOLVED
    APPEALED
  }

  type Dispute {
    id: OID!
    subjectRfpId: OID!
    filer: EthereumAddress
    filedAt: DateTime!
    reason: String!
    status: DisputeStatus!
    resolution: String
    resolvedAt: DateTime
  }

  type Rfc {
    id: OID!
    title: String!
    summary: String!
    status: String!           # DRAFT | OPEN | ACCEPTED | REJECTED | MERGED
    version: String!          # semver target
    proposer: EthereumAddress
    openedAt: DateTime!
    closedAt: DateTime
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

    # Governance — read projections. Mutations go through signed
    # operations on the rfp-hub-governance Document Model.
    disputes(status: DisputeStatus): [Dispute!]!
    rfcs(openOnly: Boolean): [Rfc!]!
  }

  # ---- JSON-LD projections ---------------------------------------------
  # Each Rfp is additionally exposed via two JSON-LD projections so
  # consumers can fetch canonical DAOIP-5 or schema.org shapes without
  # needing to reshape the GraphQL response.
  #
  #   GET /rfps/<id>/daoip-5.jsonld
  #   GET /rfps/<id>/schema-org.jsonld
  #
  # These are served by the subgraph HTTP layer, not GraphQL itself.
`
