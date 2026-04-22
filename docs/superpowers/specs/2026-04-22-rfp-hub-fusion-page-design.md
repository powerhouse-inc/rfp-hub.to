# RFP Hub Fusion Page — Design

**Date:** 2026-04-22
**Status:** Approved, in-flight
**Deadline:** EF RFP Hub application, 2026-04-23 (tonight)

## Why

The Ethereum Foundation published an RFP for a "Standard RFP Object and Public Aggregation API" — an open, neutral index of web3 funding opportunities. We're applying. Liberuum is building the backend as a Powerhouse package (`rfp-hub-app`). Our piece is the reference frontend — a "fusion page" that queries the package's switchboard, analogous to how `vetra.to` queries the vetra-cloud switchboard.

## Scope

A polished reference implementation, submittable tonight, that demonstrates the EF asks:

- Standard RFP object (DAOIP-5-flavoured).
- Public, unauthenticated GraphQL API with search, filtering (funder, category, status, deadline, ecosystem), and pagination.
- Provenance metadata and duplicate detection.
- Community submission flow (Renown-gated).
- Minimal frontend demonstrating the API.

Out of scope tonight: verification UI, governance review queue, deployed cloud URL (local-only demo), REST adapter, sync mechanisms.

## Two-Repo Architecture

```
powerhouse-inc/rfp-hub-app  (liberuum's Powerhouse package)
├── document-models/        # Rfp, Publisher — liberuum delivers tonight
├── subgraphs/rfp-hub/      # Public subgraph — schema drafted by us, PR'd to liberuum
├── processors/             # Duplicate detection (keccak256(funder+title+deadline))
└── editors/                # N/A for tonight

rfp-hub.to  (ours, this repo)
├── app/                    # Next.js 16 App Router pages
├── modules/                # Feature modules
└── docs/                   # Spec, EF application draft
```

Clear boundary: liberuum's repo is the *reference package* (what EF teams would deploy). Our repo is the *reference frontend* (what they'd fork for their own UI).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — hero, explainer, live stats, CTAs |
| `/rfps` | Searchable + filterable list (URL-state via `nuqs`), pagination |
| `/rfps/[id]` | Detail view — full DAOIP-5 fields, provenance, raw JSON export |
| `/publishers` | Flat directory of funders/publishers |
| `/submit` | Renown-gated submission form (react-hook-form + zod) |

Navigation lives in `app/layout.tsx`. No tabs. Single sticky top bar.

## Module Structure

```
modules/
├── rfps/                       # list + detail
│   ├── types.ts                # Rfp, RfpFilter, RfpPage types
│   ├── graphql.ts              # fetchRfps, fetchRfp, submitRfp
│   ├── hooks.ts                # useRfps, useRfp
│   ├── components/             # RfpCard, RfpFilters, RfpDetail, RfpBadge
│   └── index.ts
├── publishers/                 # directory
├── submit/                     # form + validation + dispatch
├── home/                       # hero, stats, how-it-works
└── shared/                     # kept unchanged from vetra.to
    ├── providers/              # Renown, React Query, Theme
    ├── config/                 # env schema
    ├── hooks/
    ├── lib/                    # fetcher, utils
    └── components/             # ui primitives (Radix-based)
```

## Data Flow

**Read path** (public, unauthenticated):
1. Fusion page calls `rfp-hub` subgraph on liberuum's switchboard.
2. `NEXT_PUBLIC_SWITCHBOARD_URL` defaults to `http://localhost:4001/graphql` for local demo, overridable via `.env`.
3. `modules/rfps/graphql.ts` exposes typed async functions wrapping `fetch()` — same pattern as `vetra.to/modules/cloud/graphql.ts`.
4. React Query caches results.

**Write path** (Renown-signed):
1. Submit form dispatches an `addRfp` action via `@powerhousedao/reactor-browser` client (`modules/shared/client.ts` carries over unchanged).
2. Bearer token comes from `useRenown()` through the existing `CloudAuthBridge` pattern (rename to `RfpHubAuthBridge`).
3. Document lands in the configured drive; the subgraph picks it up; it appears in `/rfps` after the next fetch.

**Fallback when subgraph isn't live yet:**
- `fetchRfps` degrades to `Rfp.findDocuments(search)` on the document-model's auto-generated GraphQL — same pattern vetra.to uses for cloud envs. Filters that the subgraph would handle get done client-side. Switch to the subgraph the moment it lands.

## Subgraph Draft (proposed to liberuum)

```graphql
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
  fundingAmount: Amount
  fundingCurrency: String
  ecosystem: String
  sourceUrl: URL
  provenance: Provenance!
}

type Provenance {
  submitter: EthereumAddress
  submittedAt: DateTime!
  verificationStatus: VerificationStatus!
  sourceHash: String!
}

enum RfpStatus { OPEN, CLOSED, UPCOMING, CANCELLED }
enum VerificationStatus { UNVERIFIED, VERIFIED, DISPUTED }

type Publisher {
  id: OID!
  name: String!
  url: URL
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

input Pagination { limit: Int, cursor: String }

type RfpPage { items: [Rfp!]!, nextCursor: String, total: Int! }

type Query {
  rfps(filter: RfpFilter, pagination: Pagination): RfpPage!
  rfp(id: OID!): Rfp
  rfpBySlug(slug: String!): Rfp
  publishers: [Publisher!]!
  stats: HubStats!
}
```

Duplicate detection: processor computes `sourceHash = keccak256(normalize(funder + title + deadline))` on every `addRfp`/`updateRfp` action. Conflict on hash flips `verificationStatus` to `DISPUTED` and attaches the conflicting document ID.

## Visual Direction

EF-leaning minimalism.

- **Palette:** white bg (`#FFFFFF`), near-black text (`#0A0A0A`), subtle gray borders (`#E5E5E5`), single accent `#3C3C3D` (dark charcoal), one hover accent `#6366F1` (indigo).
- **Type:** Geist (inherited from vetra.to) for prose; JetBrains Mono for IDs, amounts, hashes, timestamps.
- **Density:** generous whitespace, thin 1px separators, no drop shadows, no gradients except a single subtle hero gradient.
- **No emoji icons.** Lucide-react only, stroke-width 1.5.

Implemented as Tailwind theme token overrides in `app/globals.css` + a handful of component-level class swaps. No wholesale rewrite of the shared UI primitives.

## Environment Config

```
NEXT_PUBLIC_SWITCHBOARD_URL=http://localhost:4001/graphql
NEXT_PUBLIC_RFP_HUB_DRIVE_ID=rfp-hub
NEXT_PUBLIC_RENOWN_URL=https://renown.id
```

`modules/shared/config/env-schema.ts` updated: drop `NEXT_PUBLIC_CLOUD_*`, add `NEXT_PUBLIC_RFP_HUB_DRIVE_ID`.

## Error Handling

- Subgraph unreachable → each page shows a friendly empty state with a retry button. No SSR crash.
- Fallback query path is exercised when the subgraph returns `errors[0].message.includes("Cannot query field")`.
- Submit validation (zod) runs client-side; server errors surface via toast (`sonner`, already in deps).

## Testing Strategy

Given tonight's deadline:
- **Manual walkthrough** on local `ph switchboard` + `next dev`. Document steps in the README.
- **Type-check + lint must pass** on every commit.
- **One Playwright smoke test** if time: load `/`, click through to `/rfps`, submit is visible.
- Unit tests deferred — we rewire them once liberuum's package settles.

## Execution Order

1. Scaffold from vetra.to fork (done).
2. Write this spec (done).
3. Delete legacy modules + pages in one commit.
4. Rename package, update env config, wipe codegen output.
5. Draft subgraph schema PR for liberuum's repo (separate branch on their clone).
6. Build `modules/rfps` + list/detail pages (with fallback).
7. Build `modules/publishers` + page.
8. Build `modules/submit` + page.
9. Restyle home + theme tokens.
10. Write README + EF application draft at `docs/ef-application.md`.
11. Final polish pass.

## Deliverable

- Repo: `rfp-hub.to` (this one), ready to push to `powerhouse-inc` org.
- Subgraph PR to `powerhouse-inc/rfp-hub-app`.
- `docs/ef-application.md` — draft answers for the EF application form.
- `README.md` — how to run locally, what's in the box, what's next.
- Local demo: `ph switchboard` in `rfp-hub-app` + `pnpm dev` in `rfp-hub.to`.
