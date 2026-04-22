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
            Every web3 grant,
            <br />
            in one place.
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-foreground/70">
            Grant programs are scattered across a dozen portals, Notion pages and PDFs. We pulled
            them into one queryable index so builders can find what&apos;s open and aggregators
            can plug into a single API. Open schema, open code, no lock-in — fork it, host your
            own, compete with us.
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
              Live from the reactor. Nothing mocked. Click a card for the full brief, deadline
              and contact.
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
      title: 'One schema for every grant',
      body:
        'Grants look the same whether they come from Gitcoin, Optimism, or Stellar — same fields, same shape. We follow DAOstar&apos;s DAOIP-5 spec and also emit schema.org/Grant so Google indexes them properly.',
    },
    {
      icon: GitBranch,
      title: 'Pull the data however you like',
      body:
        'GraphQL for queries. RSS for your feed reader. Webhooks when you want to get pinged. A nightly JSON dump if you want the whole thing. IPFS mirrors so it still works if we go down.',
    },
    {
      icon: Shield,
      title: 'Every edit is signed',
      body:
        'Every change is cryptographically signed and appended to a replayable log. You can audit who added what, and duplicates get caught before they land — no more three copies of the same round from three sources.',
    },
    {
      icon: Scale,
      title: 'Rules out in the open',
      body:
        'Who counts as a verified publisher, how disputes get resolved, what gets indexed — all of it lives in a document anyone can read. When we make a call, it&apos;s in Git, not a Slack thread.',
    },
    {
      icon: Download,
      title: 'CC0 schema, AGPL code',
      body:
        'The data format is public domain. Fork it. Compete with us. Build your own registry on top. The code is AGPL so nobody can close it off later.',
    },
    {
      icon: Code2,
      title: 'Multiple hubs, one query',
      body:
        'Every hub speaks the same schema, so an aggregator can hit ten of them and stitch the results together. Starting with Ethereum, but Solana and Cosmos funders fit just as well.',
    },
  ]
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">Why we built it</h2>
        <p className="mb-12 max-w-xl text-foreground/70">
          Finding an open grant round in web3 today means hunting across Twitter, a dozen blog
          posts, and a couple of Notion pages. That&apos;s silly. Here&apos;s what we did about it.
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
          <h2 className="mb-2 text-2xl font-medium tracking-tight md:text-3xl">Query it your way</h2>
          <p className="mb-6 max-w-lg text-foreground/70">
            Same data behind every endpoint — so whether you prefer GraphQL, a JSON blob, or an
            RSS feed, you get the same answer. Pick your poison:
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
