# RFP Hub · Fusion Page

> The open, neutral index of web3 funding opportunities.

Reference frontend for the **Ethereum Foundation RFP Hub** — our response to
[`rfp_hub`](https://esp.ethereum.foundation/applicants/rfp/rfp_hub). This
repository is one half of the application; the backend lives in
[`powerhouse-inc/rfp-hub-app`](https://github.com/powerhouse-inc/rfp-hub-app)
as a Powerhouse package.

Live pages:

| Route | Purpose |
|-------|---------|
| `/` | Landing — hero, live stats, latest RFPs, how-it-works, API preview |
| `/rfps` | Searchable + filterable list (URL-state via `nuqs`) |
| `/rfps/[id]` | Detail view — DAOIP-5 fields, provenance, raw JSON export |
| `/publishers` | Funder / publisher directory |
| `/submit` | Renown-gated submission form |
| `/api-docs` | Public GraphQL API reference |

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind 4 · Radix UI
- `@powerhousedao/reactor-browser` — signed action dispatch
- `@renown/sdk` — bearer-token identity
- `@tanstack/react-query` · `zod` · `react-hook-form` · `nuqs`

## Run locally

```bash
# Terminal 1 — backend (Powerhouse package)
git clone https://github.com/powerhouse-inc/rfp-hub-app
cd rfp-hub-app
bun install
ph switchboard         # starts the reactor + GraphQL at :4001

# Terminal 2 — this app
pnpm install
pnpm dev               # http://localhost:3000
```

Without a running switchboard the app still renders — it falls back to a
bundled sample dataset so reviewers can explore the UX without the full stack.

## Environment

```
NEXT_PUBLIC_SWITCHBOARD_URL=http://localhost:4001/graphql  # default
NEXT_PUBLIC_RFP_HUB_DRIVE_ID=rfp-hub                       # default
NEXT_PUBLIC_RENOWN_URL=https://renown.id
```

## Project layout

```
app/                       Next.js App Router pages
  (home)/                  landing
  rfps/ · rfps/[id]/       list + detail
  publishers/              directory
  submit/                  Renown-gated form
  api-docs/                public API reference
modules/
  rfps/                    types, graphql.ts (+ fallback), hooks, components
  publishers/
  submit/
  home/
  shared/                  client, auth-bridge, Renown provider, UI primitives
docs/
  superpowers/specs/       design spec
  subgraph-proposal/       rfp-hub subgraph we're proposing to liberuum
  ef-application.md        draft EF application answers
```

## How the data layer works

**Read path** (public, unauthenticated):
1. Queries hit the `rfp-hub` public subgraph on the switchboard:
   `rfps(filter, pagination)`, `rfp(id)`, `publishers`, `stats`.
2. If the subgraph isn't live yet, `modules/rfps/graphql.ts` degrades to
   the document-model's built-in `Rfp.findDocuments` query and applies
   filters in-memory.
3. If nothing is reachable at all, bundled sample data renders so the UX
   stays explorable.

**Write path** (Renown-signed):
1. The submit form dispatches an `addRfp` action via
   `@powerhousedao/reactor-browser` through `modules/shared/client.ts`.
2. The bearer token comes from `useRenown()` through `AuthBridge` mounted
   in `app/layout.tsx`.
3. A processor (proposed in the subgraph draft) computes
   `sourceHash = keccak256(funder+title+deadline)` for duplicate detection.

## Related

- **Design spec:** [`docs/superpowers/specs/2026-04-22-rfp-hub-fusion-page-design.md`](./docs/superpowers/specs/2026-04-22-rfp-hub-fusion-page-design.md)
- **EF application:** canonical proposal lives in the Powerhouse Google Doc (shared with reviewers). This repo is the reference frontend that the proposal commits to.
- **Subgraph proposal:** [`docs/subgraph-proposal/`](./docs/subgraph-proposal/)
- **Backend package:** [`powerhouse-inc/rfp-hub-app`](https://github.com/powerhouse-inc/rfp-hub-app)

## License

- **Code** — AGPL-3.0-only ([`LICENSE`](./LICENSE))
- **Schema** — CC0 1.0 Universal ([`SCHEMA-LICENSE.md`](./SCHEMA-LICENSE.md)); split intentionally so any downstream tool can adopt the object format without licensing friction.

Built by [Powerhouse](https://powerhouse.inc).
