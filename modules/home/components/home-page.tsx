'use client'

import Link from 'next/link'
import { ArrowRight, Code2, Database, Download, GitBranch, Scale, Shield } from 'lucide-react'
import { useHubStats, useRfps } from '@/modules/rfps'
import { RfpCard } from '@/modules/rfps'

export function HomePage() {
  const stats = useHubStats()
  const latest = useRfps({}, 3)
  return (
    <div>
      <Hero />
      <StatsBar data={stats.data} />
      <LatestRfps />
      <HowItWorks />
      <ApiPreview />
    </div>
  )
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-36">
        <span className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Canonical superset of DAOIP-5 · schema.org/Grant · CC0
        </span>
        <h1 className="mb-6 max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl">
          The open index of web3
          <br />
          funding opportunities.
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-foreground/70">
          A canonical RFP object format, a public GraphQL API, signed operation-log provenance, and
          governance-as-document review. Built on Powerhouse. CC0 schema. AGPL-3.0 code. Shipped as
          public-goods infrastructure.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/rfps"
            className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Browse RFPs <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium hover:border-foreground/60"
          >
            Submit an RFP
          </Link>
          <Link
            href="/exports"
            className="inline-flex items-center gap-1 px-2 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Snapshots / RSS / IPFS <ArrowRight className="size-3" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatsBar({
  data,
}: {
  data?: { totalRfps: number; openRfps: number; totalFunders: number; updatedAt: string }
}) {
  const items = [
    { label: 'RFPs indexed', value: data?.totalRfps ?? '—' },
    { label: 'Currently open', value: data?.openRfps ?? '—' },
    { label: 'Funders', value: data?.totalFunders ?? '—' },
    {
      label: 'Last updated',
      value: data?.updatedAt
        ? new Date(data.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : '—',
    },
  ]
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="px-6 py-8">
            <div className="mb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div className="text-3xl font-medium tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function LatestRfps() {
  const { data, isLoading } = useRfps({}, 6)
  const items = data?.items ?? []
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">Latest RFPs</h2>
            <p className="max-w-xl text-foreground/70">
              A live sample of what&apos;s currently indexed.
            </p>
          </div>
          <Link
            href="/rfps"
            className="hidden items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground md:inline-flex"
          >
            View all <ArrowRight className="size-3" strokeWidth={1.5} />
          </Link>
        </div>
        {isLoading ? (
          <div className="font-mono text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
            No RFPs indexed yet — start the switchboard to populate this list.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((rfp) => (
              <RfpCard key={rfp.id} rfp={rfp} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: Database,
      title: 'Standard RFP object',
      body:
        'A canonical superset of DAOstar DAOIP-5 GrantPool and schema.org/MonetaryGrant, with the process fields RFPs actually need — submitter, verification state, dispute handling. JSON-LD projections are emitted in parallel.',
    },
    {
      icon: GitBranch,
      title: 'Five export surfaces',
      body:
        'Public GraphQL API with search/filter/pagination. Nightly checksummed JSON snapshots. RSS + Atom feeds. Webhooks with retry and dead-letter. Content-addressed mirrors on IPFS + Swarm.',
    },
    {
      icon: Shield,
      title: 'Signed, three-layer dedup',
      body:
        'Every operation is Renown-signed and appended to a replayable log. Duplicates are rejected at three layers: deterministic operation IDs, executor idempotency, and domain-key (funder + title, canonical URL) fingerprints.',
    },
    {
      icon: Scale,
      title: 'Governance as document',
      body:
        'The publisher allowlist, dispute queue, and schema-evolution RFC process live inside their own Document Model. Policy changes leave the same audit trail as data changes.',
    },
    {
      icon: Download,
      title: 'CC0 schema, AGPL code',
      body:
        'The object format is dedicated to the public domain so any aggregator, competing registry, or traditional funder can adopt it without licensing friction. The reference implementation is strong-copyleft AGPL-3.0.',
    },
    {
      icon: Code2,
      title: 'Federation-ready',
      body:
        'Every operator runs the same schema. A single aggregator can consume N RFP Hub instances. Non-Ethereum funders ingest without schema change. Pilot scope is Ethereum; architectural scope is broader.',
    },
  ]
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">How it works</h2>
        <p className="mb-12 max-w-xl text-foreground/70">
          Six pieces, one hub. Every hard requirement in the Ethereum Foundation&apos;s RFP Hub
          brief maps directly to Powerhouse infrastructure already running in production.
        </p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="flex size-10 items-center justify-center border border-border">
                  <s.icon className="size-4" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium tracking-tight">{s.title}</h3>
                <p className="text-foreground/70">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ApiPreview() {
  const sample = `# GraphQL — live, filtered, paginated
query OpenRFPs {
  rfps(filter: { status: OPEN }, pagination: { limit: 10 }) {
    items {
      id slug title funder
      categories deadline fundingAmount
      provenance { verificationStatus sourceHash }
    }
    nextCursor
    total
  }
}

# OR pull the full dataset
curl https://rfp-hub.example/snapshots/latest.json
curl https://rfp-hub.example/rss.xml
curl https://rfp-hub.example/rfps/<id>/daoip-5.jsonld
curl https://rfp-hub.example/rfps/<id>/schema-org.jsonld`
  return (
    <section>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">One contract, five surfaces</h2>
          <p className="mb-6 max-w-lg text-foreground/70">
            Every RFP Hub operator exposes the same schema across GraphQL, snapshot downloads,
            feeds, webhooks, and content-addressed mirrors. Pick whichever shape your aggregator
            wants.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/api-docs"
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium hover:border-foreground/60"
            >
              GraphQL reference <ArrowRight className="size-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/exports"
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium hover:border-foreground/60"
            >
              Export surfaces <ArrowRight className="size-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="https://github.com/powerhouse-inc/rfp-hub-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-2 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              rfp-hub-app on GitHub <ArrowRight className="size-3" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
        <pre className="overflow-x-auto border border-border bg-foreground/[0.02] p-5 font-mono text-xs leading-relaxed text-foreground/80">
          {sample}
        </pre>
      </div>
    </section>
  )
}
