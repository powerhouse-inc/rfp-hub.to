# EF RFP · RFP Hub Application

**RFP:** [Standard RFP Object and Public Aggregation API](https://esp.ethereum.foundation/applicants/rfp/rfp_hub)
**Applicant:** Powerhouse
**Date:** 2026-04-22
**Deadline:** 2026-04-23 23:59 UTC

---

## 1 · Short description

RFP Hub — an open, neutral, DAOIP-5-aligned index of web3 funding opportunities,
built on Powerhouse. A versioned RFP object format, a public unauthenticated
GraphQL API (`rfp-hub` subgraph on Powerhouse Switchboard), provenance-aware
submissions, automatic duplicate detection, and a minimal reference frontend
(`rfp-hub.to`).

## 2 · How the proposal addresses each EF ask

| EF ask | Our answer |
|---|---|
| Versioned, documented RFP object with validation | `rfp-hub/rfp` Powerhouse document model with GraphQL-defined state schema, state versioning, reducer-level input validation. Aligned with DAOstar's DAOIP-5 Grants Metadata Standard and `schema.org/Grant`. |
| Public, unauthenticated REST or GraphQL API with search, filtering, pagination | Public `rfp-hub` subgraph exposing `rfps(filter, pagination)`, `rfp(id)`, `rfpBySlug(slug)`, `publishers`, `stats`. Filters: funder, category, status, deadline, ecosystem, full-text search. Cursor-based pagination. See `docs/subgraph-proposal/`. |
| Documented export mechanism for bulk fetches | `rfps(pagination: { limit: 1000 })` returns full JSON; a DAOIP-5 NDJSON export endpoint is slated for phase 2. The schema itself is the export contract. |
| Duplicate detection + conflict resolution | Processor computes `sourceHash = keccak256(normalize(funder + title + deadline))` on every `addRfp` action. On collision, the newer document gets `verificationStatus = DISPUTED` with a pointer to the conflicting document. |
| Provenance metadata (submitter, timestamp, verification) | `Provenance { submitter: EthereumAddress, submittedAt, verificationStatus, sourceHash }` embedded in every RFP. Submitter derives from the Renown-signed bearer token on the `addRfp` action. |
| Sync mechanisms (webhooks, polling, RSS, snapshots) | Powerhouse's native operation log is a replayable, append-only feed. Phase 2 adds: REST `/v1/rfps.ndjson` snapshot, `/v1/rfps.rss` feed, and a Zapier-compatible webhook subscription on the subgraph. |
| Community submissions with governance review | Anyone can dispatch an `addRfp` action with a Renown-signed token. Submissions land with `verificationStatus: UNVERIFIED`. A governance document (RFP Hub Config) holds the allowlist for verified publishers; flipping `VERIFIED` is a governance-gated action. |
| Verified publishers with direct publishing | Verified publishers' submissions default to `VERIFIED`. The allowlist is a versioned field on a single RFP-Hub-Config document — changes are audit-logged. |
| Transparent governance rules | All governance state lives in documents with public operation history. No hidden ranking; default list sort is deadline-ascending. |
| Reference implementation | This repository (`rfp-hub.to`) — Next.js 16 fusion page demonstrating the API. The backend (`rfp-hub-app`) is an AGPL-3.0 Powerhouse package anyone can deploy. |
| Integration examples | `docs/api-docs` (in-app) includes curl, `graphql-request`, and SDK examples. Phase 2: Python and Rust examples. |

## 3 · Why Powerhouse

- **Document-model native.** Every RFP, every publisher, every governance
  action is a versioned, operation-logged document. Provenance, audit trail,
  deduplication, and governance are *the storage layer*, not bolted on.
- **Subgraph-first GraphQL.** Powerhouse Switchboard composes document-model
  queries with custom subgraphs. The `rfp-hub` subgraph is a thin projection
  over the canonical data — zero divergence risk.
- **Open, deployable package.** The whole backend is a Powerhouse package.
  Any operator — EF, a DAO tooling team, a country-specific funding index —
  can run their own instance with `ph switchboard` and be interoperable by
  default because the schema is the contract.
- **Production track record.** Same stack powers `vetra.to` / `vetra-cloud`
  in production today. We're not proposing greenfield tech.

## 4 · Work plan

**Phase 1 — MVP (weeks 1–4)**
- `rfp-hub/rfp` + `rfp-hub/publisher` document models, finalized DAOIP-5 alignment.
- `rfp-hub` subgraph with full filter/search/pagination + `sourceHash` dedup processor.
- Fusion page live at a public URL (this repo, deployed).
- Bulk NDJSON export endpoint.
- 200+ seed RFPs imported from known sources (Gitcoin, Optimism, Uniswap, Aave, etc.).

**Phase 2 — Submissions & Trust (weeks 5–8)**
- Governance-gated verification flow.
- Verified publisher onboarding (5+ publishers live).
- Webhook subscriptions + RSS feed.
- Python and Rust SDKs with examples.
- REST adapter mirroring the GraphQL contract.

**Phase 3 — Ecosystem (weeks 9–12)**
- Integration with 2+ existing aggregators (e.g., DAOStar, Gitcoin, Giveth).
- Multi-operator federation — an aggregator can consume N RFP Hub instances
  with a single schema.
- Public analytics dashboard (RFP volume, funding trends, response rates).

## 5 · Deliverables at the end of each phase

- **Phase 1:** Open-source repos (this one + `rfp-hub-app`), live fusion page,
  documented schema, 200+ indexed RFPs, API reference.
- **Phase 2:** Verified publisher program live, webhook/RSS infrastructure,
  SDKs, REST adapter.
- **Phase 3:** Federation spec, analytics dashboard, partner integrations.

## 6 · Team & track record

Powerhouse. Core contributors have shipped: DocumentModel framework, Reactor
(distributed document reducer), Switchboard (GraphQL gateway), Connect
(end-user client), Vetra (builder tooling). All open source, AGPL-3.0.

## 7 · Budget

To be finalized with EF. Roughly $X for the 12-week scope — most of it on
engineering (2 engineers FTE for 12 weeks, 1 designer part-time), a small
DevOps slice for hosting, and community ops for Phase 2.

*(Replace with concrete numbers before submission.)*

## 8 · Open questions for EF

1. Preferred hosting jurisdiction / data residency constraints?
2. Is EF comfortable with AGPL-3.0 as the license, or should we re-license
   under MIT for the reference package?
3. Should there be an EF-run canonical instance, or is the network of
   operator-run instances the deliverable?

## 9 · Links

- **Fusion page repo (this):** `https://github.com/powerhouse-inc/rfp-hub.to` *(to be published)*
- **Backend package:** [`powerhouse-inc/rfp-hub-app`](https://github.com/powerhouse-inc/rfp-hub-app)
- **Design spec:** [`docs/superpowers/specs/2026-04-22-rfp-hub-fusion-page-design.md`](./superpowers/specs/2026-04-22-rfp-hub-fusion-page-design.md)
- **Subgraph proposal:** [`docs/subgraph-proposal/`](./subgraph-proposal/)
- **Powerhouse:** https://powerhouse.inc
- **DAOIP-5:** https://daostar.org/EIPs/daoip-5
