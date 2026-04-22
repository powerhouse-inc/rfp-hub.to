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

## Three-layer deduplication

The proposal document (submitted to EF) commits to three independent dedup
layers; the subgraph is the passive consumer of all three.

1. **Operation id determinism** — operation ids derive from
   `(documentId, scope, branch, action.id)`. Redelivery via sync, retries, or
   crash recovery produces the same operation on every replica.
2. **Write-executor idempotency** — the executor drops incoming `action.id`
   collisions before they are applied.
3. **Application-layer dedup** — the parent `rfp-hub` registry drive's reducer
   rejects semantic duplicates on domain keys (canonical URL, and
   `funder + title` fingerprint computed as
   `keccak256(normalize(funder + title + deadline))`).

On semantic collision the newer document's `verificationStatus` flips to
`DISPUTED` with a pointer to the conflicting document.

## Community → publisher reconciliation

When a community member submits an RFP and the verified publisher later claims
it, the `claim-community-entry` operation links the community record to the
publisher's verified record without losing attribution. Both operations stay
in the log; downstream consumers see one merged RFP with full provenance
history.

## Governance

The `rfp-hub-governance` Document Model holds the publisher allowlist,
dispute lifecycle, and schema-evolution RFC process. The subgraph exposes
read-only projections via `disputes` and `rfcs` queries. All changes to
governance state are signed operations on the governance document.

## JSON-LD projections

Every `Rfp` is additionally exposed as parallel JSON-LD at:

- `GET /rfps/<id>/daoip-5.jsonld` — DAOstar DAOIP-5 GrantPool
- `GET /rfps/<id>/schema-org.jsonld` — schema.org/MonetaryGrant

Projections are emitted by a read-model so upstream schema drift doesn't
require changes to the canonical Document Model. Reference projection code
lives in `rfp-hub.to/modules/rfps/jsonld.ts` and is dedicated to the public
domain under CC0 so any operator can reuse it.

## Local dev

```bash
cd rfp-hub-app
ph switchboard   # starts the package-aware switchboard
```

Fusion page (`rfp-hub.to`) points at the same endpoint via
`NEXT_PUBLIC_SWITCHBOARD_URL`.
