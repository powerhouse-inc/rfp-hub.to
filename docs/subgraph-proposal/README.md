# `rfp-hub` Public Subgraph — Proposal

This directory contains a proposed **public, unauthenticated** subgraph for
`powerhouse-inc/rfp-hub-app`. It satisfies the EF RFP's ask for:

> A public, unauthenticated REST or GraphQL API with search, filtering (by
> funder, category, status, deadline, ecosystem), and pagination.

Copy the `rfp-hub/` directory into `rfp-hub-app/subgraphs/rfp-hub/` and export
it from `subgraphs/index.ts`:

```ts
// subgraphs/index.ts
export * as RfpHubSubgraph from './rfp-hub/index.js'
```

Then register the subgraph in `powerhouse.manifest.json`:

```json
{
  "subgraphs": [
    { "id": "rfp-hub", "name": "RFP Hub Public API" }
  ]
}
```

## What it exposes

- `rfps(filter, pagination)` — list + search + filter + pagination
- `rfp(id)` / `rfpBySlug(slug)` — detail lookup
- `publishers` — flat publisher directory
- `stats` — hub-wide counters used by the landing page

## What it needs from the document model

The resolvers assume a `rfp-hub/rfp` document type with a state schema shaped
like:

```graphql
type RfpState {
  slug: String!
  title: String!
  summary: String!
  body: String
  funder: String!
  funderUrl: URL
  categories: [String!]!
  status: RfpStatus!
  deadline: DateTime
  fundingAmount: Amount
  fundingCurrency: String
  ecosystem: String
  sourceUrl: URL
  provenance: Provenance!
}
```

And a `rfp-hub/publisher` document type for verified publishers (or collapse
`funder` into a dynamic derivation from the RFP documents, which is what the
resolvers default to).

## Duplicate detection

A processor is recommended that computes
`sourceHash = keccak256(normalize(funder + title + deadline))` on every
`addRfp` / `updateRfp` action and flips `verificationStatus` to `DISPUTED`
on collision. Not included in this proposal — drop-in once the document model
settles.

## Local dev

```bash
cd rfp-hub-app
ph switchboard   # starts the package-aware switchboard
```

Fusion page (`rfp-hub.to`) points at the same endpoint via
`NEXT_PUBLIC_SWITCHBOARD_URL`.
