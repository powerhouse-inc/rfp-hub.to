'use client'

import { useQuery } from '@tanstack/react-query'
import { Copy, Database, Hash, Radio, Rss, Send, Shield, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { fetchRfps } from '@/modules/rfps'
import { cn } from '@/modules/shared/lib/utils'

interface Surface {
  key: string
  icon: typeof Database
  label: string
  status: string
  body: string
  endpoints: string[]
  // true = fetched live from our Next.js API routes; false = illustrative only
  live: boolean
}

const SURFACES: Surface[] = [
  {
    key: 'snapshot',
    icon: Database,
    label: 'Nightly JSON snapshots',
    status: 'HTTPS · unauthenticated · checksummed',
    body:
      'The full indexed dataset, served as one JSON file. Fetch without authentication, archive anywhere, replay into your own system.',
    endpoints: ['GET /api/snapshots/latest.json'],
    live: true,
  },
  {
    key: 'rss',
    icon: Rss,
    label: 'RSS + Atom feeds',
    status: 'Ordered by closeDate',
    body:
      'One entry per grant pool, ordered by close date. Subscribe from any aggregator.',
    endpoints: ['GET /api/feeds/rfps.rss'],
    live: true,
  },
  {
    key: 'jsonld',
    icon: Shield,
    label: 'JSON-LD projections',
    status: 'DAOIP-5 · schema.org/MonetaryGrant',
    body:
      'Every pool is emitted as parallel JSON-LD documents — DAOstar DAOIP-5 GrantPool and schema.org/MonetaryGrant. Projections absorb upstream schema drift.',
    endpoints: [
      'GET /api/rfps/<id>/daoip-5.jsonld',
      'GET /api/rfps/<id>/schema-org.jsonld',
    ],
    live: true,
  },
  {
    key: 'webhooks',
    icon: Send,
    label: 'Webhooks',
    status: 'Push · retry · dead-letter',
    body:
      'Register a URL; receive a signed POST on every addRfp / approve / update / retract / claim-community-entry operation. Exponential-backoff retry with dead-letter queue after five failures.',
    endpoints: [
      'POST /webhooks/register { url, events[] }',
      'GET /webhooks/<id>/deliveries',
    ],
    live: false,
  },
  {
    key: 'ipfs',
    icon: Hash,
    label: 'IPFS + Swarm mirrors',
    status: 'Content-addressed · decentralized',
    body:
      'A read-model projection publishes signed operation payloads to Swarm via bee-reactor-adaptor and IPFS via a co-pinning service. Third parties can archive and replicate without touching our API.',
    endpoints: ['GET /mirrors/ipfs.json', 'GET /mirrors/swarm.json'],
    live: false,
  },
  {
    key: 'ops',
    icon: Radio,
    label: 'Operation log replay',
    status: 'Power users',
    body:
      'Subscribe to the raw, append-only operation log for deterministic replay into your own reactor. Every operation is signed; ordering is preserved.',
    endpoints: ['ws /operations/stream', 'GET /operations?sinceSeq=<n>'],
    live: false,
  },
]

export function ExportsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
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

      <div className="space-y-6">
        {SURFACES.map((s) => (
          <SurfaceCard key={s.key} surface={s} />
        ))}
      </div>
    </div>
  )
}

function SurfaceCard({ surface }: { surface: Surface }) {
  return (
    <article className="border border-border">
      <div className="flex items-start gap-4 border-b border-border p-5 md:p-6">
        <div className="flex size-10 flex-shrink-0 items-center justify-center border border-border">
          <surface.icon className="size-4" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-medium tracking-tight">{surface.label}</h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {surface.status}
            </span>
            {surface.live ? (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">
                <CheckCircle2 className="size-3" strokeWidth={2} /> Live
              </span>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Roadmap
              </span>
            )}
          </div>
          <p className="text-foreground/70">{surface.body}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-border md:grid-cols-2 md:divide-x">
        <div className="space-y-2 p-5 md:p-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Endpoint
          </div>
          {surface.endpoints.map((e) => (
            <EndpointLine key={e} value={e} />
          ))}
        </div>
        <div className="border-t border-border p-5 md:border-t-0 md:p-6">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {surface.live ? 'Live response' : 'Shape (illustrative)'}
          </div>
          <LivePreview surface={surface} />
        </div>
      </div>
    </article>
  )
}

function EndpointLine({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2 border border-border bg-foreground/[0.02] px-3 py-2 font-mono text-xs text-foreground/80">
      <Copy className="size-3 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      <code className="truncate">{value}</code>
    </div>
  )
}

function LivePreview({ surface }: { surface: Surface }) {
  if (surface.key === 'snapshot') return <SnapshotPreview />
  if (surface.key === 'rss') return <RssPreview />
  if (surface.key === 'jsonld') return <JsonLdPreview />
  if (surface.key === 'webhooks') return <IllustrativePreview body={WEBHOOK_EXAMPLE} />
  if (surface.key === 'ipfs') return <IllustrativePreview body={IPFS_EXAMPLE} />
  if (surface.key === 'ops') return <IllustrativePreview body={OPS_LOG_EXAMPLE} />
  return null
}

function SnapshotPreview() {
  const q = useQuery({
    queryKey: ['exports-preview', 'snapshot'],
    queryFn: async () => {
      const res = await fetch('/api/snapshots/latest.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as {
        '@context': string
        '@type': string
        generatedAt: string
        stats: { totalSystems: number; totalPools: number }
      }
    },
    staleTime: 30_000,
  })
  return (
    <AsyncFrame query={q} href="/api/snapshots/latest.json">
      {(d) => (
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
          {JSON.stringify(
            {
              '@context': d['@context'],
              '@type': d['@type'],
              generatedAt: d.generatedAt,
              stats: d.stats,
              grantSystems: `[${d.stats.totalSystems} entries — truncated]`,
              grantPools: `[${d.stats.totalPools} entries — truncated]`,
            },
            null,
            2,
          )}
        </pre>
      )}
    </AsyncFrame>
  )
}

function RssPreview() {
  const q = useQuery({
    queryKey: ['exports-preview', 'rss'],
    queryFn: async () => {
      const res = await fetch('/api/feeds/rfps.rss')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    },
    staleTime: 30_000,
  })
  return (
    <AsyncFrame query={q} href="/api/feeds/rfps.rss">
      {(xml) => {
        // Render the first ~40 lines of the XML so the pre stays readable.
        const lines = xml.split('\n').slice(0, 40)
        const trailing = xml.split('\n').length > 40 ? '\n<!-- … -->' : ''
        return (
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
            {lines.join('\n')}
            {trailing}
          </pre>
        )
      }}
    </AsyncFrame>
  )
}

function JsonLdPreview() {
  // Pick the first pool so the DAOIP-5 projection is fetchable against a real document.
  const poolsQ = useQuery({
    queryKey: ['exports-preview', 'first-pool'],
    queryFn: () => fetchRfps({}, 1),
    staleTime: 60_000,
  })
  const firstPool = poolsQ.data?.items[0]
  const poolId = firstPool?.id

  const jsonldQ = useQuery({
    queryKey: ['exports-preview', 'daoip-5', poolId],
    queryFn: async () => {
      const res = await fetch(`/api/rfps/${poolId}/daoip-5.jsonld`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as Record<string, unknown>
    },
    enabled: Boolean(poolId),
    staleTime: 30_000,
  })

  if (poolsQ.isLoading) return <LoadingState />
  if (!firstPool) return <EmptyState message="No pools indexed to demo against." />
  const href = `/api/rfps/${firstPool.id}/daoip-5.jsonld`
  return (
    <AsyncFrame query={jsonldQ} href={href}>
      {(d) => (
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
          {JSON.stringify(d, null, 2).slice(0, 900)}
          {JSON.stringify(d).length > 900 ? '\n…' : ''}
        </pre>
      )}
    </AsyncFrame>
  )
}

function IllustrativePreview({ body }: { body: string }) {
  return (
    <pre className="overflow-x-auto border border-dashed border-border/60 bg-foreground/[0.01] p-3 font-mono text-xs leading-relaxed text-foreground/60">
      {body}
    </pre>
  )
}

function AsyncFrame<T>({
  query,
  href,
  children,
}: {
  query: { data?: T; isLoading: boolean; isError: boolean; error?: unknown }
  href?: string
  children: (d: T) => React.ReactNode
}) {
  if (query.isLoading) return <LoadingState />
  if (query.isError || !query.data) {
    return (
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="mt-0.5 size-3.5 flex-shrink-0" strokeWidth={1.5} />
        <span>
          Unavailable{query.error instanceof Error ? `: ${query.error.message}` : ''}. Endpoint
          {href ? (
            <>
              {' '}
              lives at <Link href={href} className="underline">{href}</Link>.
            </>
          ) : null}
        </span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'max-h-80 overflow-auto border border-border bg-foreground/[0.02] p-3',
      )}
    >
      {children(query.data)}
      {href ? (
        <div className="mt-3 pt-2 text-right">
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Open raw ↗
          </Link>
        </div>
      ) : null}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-3 animate-spin" strokeWidth={1.5} />
      Fetching…
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-xs text-muted-foreground">{message}</p>
}

const WEBHOOK_EXAMPLE = `// Register once per subscription
POST /webhooks/register
Content-Type: application/json

{
  "url": "https://your-service.example/hub",
  "events": ["addRfp", "approve", "update"]
}

// You receive signed POSTs like:
POST https://your-service.example/hub
X-Hub-Signature: sha256=abc123…

{
  "id": "evt_01HXYZ…",
  "event": "addRfp",
  "documentId": "f9041488-8531-4e30-aabc-eeb60f36a2de",
  "sequence": 41278,
  "timestamp": "2026-04-22T17:42:11.003Z",
  "data": { … full rfp-hub/grant-pool document … }
}`

const IPFS_EXAMPLE = `{
  "@context": "https://www.daostar.org/context/DAOIP-5.jsonld",
  "@type": "OperationMirror",
  "snapshotAt": "2026-04-22T02:00:00Z",
  "ipfsCid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "swarmRef":
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "operations": 41278,
  "signer": "did:key:zDnaeRdw7dGcbfKVuycmcMWPpuPuQuNNAVNSsNt3p5eudowvB"
}`

const OPS_LOG_EXAMPLE = `// Pull-based (REST, since sequence N)
GET /operations?sinceSeq=41275
[
  { "seq": 41275, "documentId": "fae7…", "type": "ADD_POOL_SIZE_ENTRY",  … },
  { "seq": 41276, "documentId": "fae7…", "type": "SET_DESCRIPTION",      … },
  { "seq": 41277, "documentId": "3df1…", "type": "APPROVE_GRANT_POOL",   … },
  …
]

// Push-based (WebSocket, live stream)
ws /operations/stream
> {"resume": 41278}
< {"seq": 41278, "documentId": "…", "type": "…", "signer": "did:ethr:…"}`
