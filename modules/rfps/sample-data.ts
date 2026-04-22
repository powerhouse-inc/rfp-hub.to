import type { Rfp } from './types'

/**
 * Seed data used when no switchboard is reachable at all — lets the fusion
 * page render something coherent for reviewers without requiring the full
 * Powerhouse stack. Not used when any GraphQL endpoint responds.
 */
export const SAMPLE_RFPS: Rfp[] = [
  {
    id: 'sample-ef-rfp-hub',
    slug: 'ef-rfp-hub-standard',
    title: 'Standard RFP Object and Public Aggregation API',
    summary:
      'Build an open, neutral aggregation platform consolidating fragmented web3 funding opportunities into one accessible resource.',
    body:
      'Define a versioned RFP object format (building on DAOIP-5), expose a public GraphQL/REST API with search, filtering, pagination, and provenance. Include community submission with governance review and verified publishers.',
    funder: 'Ethereum Foundation',
    funderUrl: 'https://ethereum.foundation',
    categories: ['Infrastructure', 'Funding', 'Open Standards'],
    status: 'OPEN',
    deadline: '2026-04-23T23:59:59Z',
    fundingAmount: null,
    fundingCurrency: null,
    ecosystem: 'Ethereum',
    sourceUrl: 'https://esp.ethereum.foundation/applicants/rfp/rfp_hub',
    provenance: {
      submitter: null,
      submittedAt: '2026-02-23T00:00:00Z',
      verificationStatus: 'VERIFIED',
      sourceHash: 'seed',
    },
    createdAt: '2026-02-23T00:00:00Z',
    updatedAt: '2026-04-22T00:00:00Z',
  },
  {
    id: 'sample-optimism-retro',
    slug: 'optimism-retro-round-5',
    title: 'Optimism Retro Funding · Round 5',
    summary:
      'Retroactive funding for public goods that have measurably improved the Optimism / Superchain ecosystem over the last year.',
    body: null,
    funder: 'Optimism Foundation',
    funderUrl: 'https://optimism.io',
    categories: ['Retroactive Funding', 'Public Goods'],
    status: 'UPCOMING',
    deadline: '2026-05-15T23:59:59Z',
    fundingAmount: '10000000',
    fundingCurrency: 'OP',
    ecosystem: 'Optimism',
    sourceUrl: null,
    provenance: {
      submitter: null,
      submittedAt: '2026-03-01T00:00:00Z',
      verificationStatus: 'UNVERIFIED',
      sourceHash: 'seed',
    },
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'sample-gitcoin-grants',
    slug: 'gitcoin-grants-round-25',
    title: 'Gitcoin Grants · Round 25',
    summary:
      'Quadratic-funded grants round supporting open source and public-goods projects across web3.',
    body: null,
    funder: 'Gitcoin',
    funderUrl: 'https://gitcoin.co',
    categories: ['Quadratic Funding', 'Open Source'],
    status: 'OPEN',
    deadline: '2026-05-01T23:59:59Z',
    fundingAmount: '1500000',
    fundingCurrency: 'USDC',
    ecosystem: 'Ethereum',
    sourceUrl: null,
    provenance: {
      submitter: null,
      submittedAt: '2026-04-01T00:00:00Z',
      verificationStatus: 'VERIFIED',
      sourceHash: 'seed',
    },
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
]
