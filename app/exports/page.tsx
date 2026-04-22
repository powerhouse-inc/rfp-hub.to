import type { Metadata } from 'next'
import Link from 'next/link'
import { Copy, Database, Hash, Radio, Rss, Send, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Exports · RFP Hub',
  description:
    'Full-dataset snapshots, RSS/Atom feeds, webhooks, IPFS/Swarm mirrors, JSON-LD projections.',
}

const SURFACES = [
  {
    icon: Database,
    label: 'Nightly JSON snapshots',
    status: 'HTTPS · unauthenticated · checksummed',
    body:
      'The full indexed dataset, published nightly as a single JSON file with a companion SHA-256 checksum. Fetch without authentication, archive anywhere, replay into your own system.',
    endpoint: 'GET /snapshots/latest.json',
    checksumEndpoint: 'GET /snapshots/latest.sha256',
  },
  {
    icon: Rss,
    label: 'RSS + Atom feeds',
    status: 'Ordered by updatedAt',
    body:
      'Two feed flavours, same contract: one entry per new or updated RFP, ordered by timestamp. Subscribe from any aggregator.',
    endpoint: 'GET /feeds/rfps.rss',
    checksumEndpoint: 'GET /feeds/rfps.atom',
  },
  {
    icon: Send,
    label: 'Webhooks',
    status: 'Push · retry · dead-letter',
    body:
      'Register a URL; receive a signed POST on every addRfp / approve / update / retract / claim-community-entry operation. Exponential-backoff retry with dead-letter queue after five failures.',
    endpoint: 'POST /webhooks/register { url, events[] }',
    checksumEndpoint: 'GET /webhooks/<id>/deliveries',
  },
  {
    icon: Hash,
    label: 'IPFS + Swarm mirrors',
    status: 'Content-addressed · decentralized',
    body:
      'A read-model projection publishes signed operation payloads to Swarm via the bee-reactor-adaptor and IPFS via a co-pinning service. Third parties can archive and replicate without touching our API.',
    endpoint: 'GET /mirrors/ipfs.json',
    checksumEndpoint: 'GET /mirrors/swarm.json',
  },
  {
    icon: Shield,
    label: 'JSON-LD projections',
    status: 'DAOIP-5 · schema.org/MonetaryGrant',
    body:
      'Every RFP is emitted as parallel JSON-LD documents — one DAOstar DAOIP-5 GrantPool, one schema.org MonetaryGrant. Projections absorb upstream schema drift; the canonical model is insulated.',
    endpoint: 'GET /rfps/<id>/daoip-5.jsonld',
    checksumEndpoint: 'GET /rfps/<id>/schema-org.jsonld',
  },
  {
    icon: Radio,
    label: 'Operation log replay',
    status: 'Power users',
    body:
      'Subscribe to the raw, append-only operation log for deterministic replay into your own reactor. Every operation is signed; ordering is preserved. This is the lowest-level integration surface.',
    endpoint: 'ws /operations/stream',
    checksumEndpoint: 'GET /operations?sinceSeq=<n>',
  },
]

export default function ExportsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-14 border-b border-border pb-10">
        <span className="mb-3 inline-block font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Export surfaces
        </span>
        <h1 className="mb-4 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
          Six ways to consume the hub.
        </h1>
        <p className="max-w-2xl text-lg text-foreground/70">
          GraphQL is the primary surface, but not the only one. Integrators can pull snapshots,
          subscribe to feeds, receive webhooks, mirror from IPFS, or consume the raw operation
          log. All surfaces share the same schema and the same CC0 object format.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium hover:border-foreground/60"
          >
            GraphQL reference
          </Link>
          <Link
            href="https://daostar.org/EIPs/daoip-5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-2 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            DAOIP-5 spec ↗
          </Link>
        </div>
      </header>

      <div className="space-y-8">
        {SURFACES.map((s) => (
          <article
            key={s.label}
            className="grid grid-cols-1 gap-6 border border-border p-5 md:grid-cols-[3rem_1fr_22rem] md:p-6"
          >
            <div className="flex size-10 items-center justify-center border border-border">
              <s.icon className="size-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h3 className="text-lg font-medium tracking-tight">{s.label}</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.status}
                </span>
              </div>
              <p className="text-foreground/70">{s.body}</p>
            </div>
            <div className="space-y-2">
              <EndpointLine value={s.endpoint} />
              <EndpointLine value={s.checksumEndpoint} />
            </div>
          </article>
        ))}
      </div>

      <section className="mt-14 border border-border p-6 md:p-8">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Conformance + versioning
        </h2>
        <p className="mb-3 text-foreground/80">
          All export surfaces are versioned alongside the RFP object format. A JSON Schema
          validator and a conformance test corpus are published as an installable npm package so
          integrators can assert drift-free consumption.
        </p>
        <p className="text-foreground/80">
          The canonical model lives in this repository&apos;s{' '}
          <code className="font-mono">modules/rfps/types.ts</code> and the subgraph proposal in{' '}
          <code className="font-mono">docs/subgraph-proposal/</code>. Both are dedicated to the
          public domain under CC0 — adopt them without licensing friction.
        </p>
      </section>
    </div>
  )
}

function EndpointLine({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2 border border-border bg-foreground/[0.02] px-3 py-2 font-mono text-xs text-foreground/80">
      <Copy
        className="flex-shrink-0 size-3 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden
      />
      <code className="truncate">{value}</code>
    </div>
  )
}
