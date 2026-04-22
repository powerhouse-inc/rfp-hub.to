# RFP Object Schema — CC0 1.0 Universal

The **RFP object schema** — that is, the GraphQL type definitions, JSON
Schema, and JSON-LD contexts that describe the shape of an `Rfp`,
`Publisher`, `Provenance`, and related records — is dedicated to the public
domain under [Creative Commons CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).

This is deliberately split from the application code (AGPL-3.0) so that
downstream tools, aggregators, competing registries, and traditional funders
can adopt the object format without any licensing friction.

## What this covers

- `docs/subgraph-proposal/rfp-hub/schema.ts` (SDL)
- `modules/rfps/types.ts` (TypeScript mirror of the schema)
- Any JSON-LD context documents, JSON Schema files, or validation artifacts
  derived from the schema.

## What this does not cover

The reference implementation (everything else in this repository — Next.js
pages, React components, GraphQL resolvers, Powerhouse Document Model
reducers, processors, subgraph runtime code) is licensed under AGPL-3.0.
See [`LICENSE`](./LICENSE).

## Attribution (not required, appreciated)

If you build on the schema and want to credit the source, link to
https://github.com/powerhouse-inc/rfp-hub-app and the DAOstar DAOIP-5
standard we build on top of.
