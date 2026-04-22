'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Code2, Database, Download, GitBranch, Scale, Shield } from 'lucide-react'
import { useHubStats, useRfps } from '@/modules/rfps'
import { RfpCard } from '@/modules/rfps'

export function HomePage() {
  const stats = useHubStats()
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
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-[1fr_20rem] md:py-36">
        <div>
          <span className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Open data · DAOIP-5 schema · CC0
          </span>
          <h1 className="mb-6 text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl">
            Not in one place.
            <br />
            On one layer.
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-foreground/70">
            Web3 funding doesn&apos;t need another portal. It needs a shared substrate — one
            signed schema that every aggregator, dashboard, and agent can read from. This
            site is a reference view. The layer is the product.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/rfps"
              className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Browse RFPs <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            {/* <Link
              href="/submit"
              className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium hover:border-foreground/60"
            >
              Submit an RFP
            </Link> */}
            <Link
              href="/exports"
              className="inline-flex items-center gap-1 px-2 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Snapshots / RSS / IPFS <ArrowRight className="size-3" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
        <div className="relative hidden aspect-square w-full md:block">
          <Image
            src="/rfp-illustration.jpg"
            alt="Hands holding an RFP document"
            fill
            sizes="(min-width: 768px) 320px, 0px"
            priority
            className="object-contain"
          />
        </div>
      </div>
    </section>
  )
}

function StatsBar({
  data,
}: {
  data?: {
    totalPools: number
    openPools: number
    totalGrantSystems: number
    updatedAt: string
  }
}) {
  const items = [
    { label: 'Grants indexed', value: data?.totalPools ?? '—' },
    { label: 'Currently open', value: data?.openPools ?? '—' },
    { label: 'Funders', value: data?.totalGrantSystems ?? '—' },
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
            <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">What&apos;s open right now</h2>
            <p className="max-w-xl text-foreground/70">
              Click a card for the full brief, deadline and contact.
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
            No grant pools in Switchboard yet — start the RFP Hub service and set{' '}
            <code className="font-mono text-foreground/90">NEXT_PUBLIC_SWITCHBOARD_URL</code>.
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((rfp) => (
              <RfpCard key={rfp.id} rfp={rfp} className="min-w-0" />
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
      title: 'One vocabulary',
      body:
        "A DAOIP-5 superset with the process fields the spec doesn't cover — submitter identity, verification state, dispute history. Same fields whether the grant comes from Gitcoin, Optimism, or Stellar. CC0, so it's not ours to keep.",
    },
    {
      icon: GitBranch,
      title: 'One source, many surfaces',
      body:
        'The same signed data is projected to DAOIP-5 JSON-LD, schema.org/MonetaryGrant, GraphQL, RSS, webhooks, nightly JSON, and IPFS mirrors. When upstream specs drift, the projection updates — not the source.',
    },
    {
      icon: Shield,
      title: 'Signed by construction',
      body:
        'Every mutation is a signed, ordered, append-only operation. You can audit who added what and replay the log from zero. Three layers of dedupe mean one round does not arrive three times from three sources.',
    },
    {
      icon: Scale,
      title: 'No ranking, no gatekeeper',
      body:
        'Results come back deterministically — by deadline, then timestamp. No featured slots, no recommendation engine, no hidden weights. If that ever changes, it takes a public RFC.',
    },
    {
      icon: Download,
      title: 'Forkable by design',
      body:
        'Schema is CC0. Code is AGPL. Run your own hub, ship a different frontend, sit on top as an aggregator — the layer is meant to be built on, not owned.',
    },
    {
      icon: Code2,
      title: 'Multiple hubs, one query',
      body:
        'Every hub speaks the same schema, so an aggregator can hit ten of them and stitch the results. Ethereum first, but Solana and Cosmos funders fit without a schema change.',
    },
  ]
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">Why a layer</h2>
        <p className="mb-12 max-w-xl text-foreground/70">
          A sixth portal does not fix five portals. The fix is underneath — a shared schema, a
          signed log, and public projections anyone can read. Six properties that make this a
          substrate, not a site.
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
          <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">One source, many projections</h2>
          <p className="mb-6 max-w-lg text-foreground/70">
            These are not separate endpoints — they are projections of the same signed operation
            log. GraphQL for queries, JSON-LD for linked-data consumers, RSS for feeds, nightly
            JSON for archival. Pick the surface that fits.
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
