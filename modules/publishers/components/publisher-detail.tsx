'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  Hash,
  Mail,
  Shield,
} from 'lucide-react'
import { RfpStatusBadge, useRfps } from '@/modules/rfps'
import type { GrantPool } from '@/modules/rfps'
import { usePublisher } from '../hooks'
import type { GrantSystem } from '../types'

const LIFECYCLE_ORDER: Record<GrantPool['lifecycle'], number> = {
  OPEN: 0,
  UPCOMING: 1,
  REQUEST_FOR_COMMENTS: 2,
  AWARDED: 3,
  DRAFT: 4,
  CLOSED: 5,
  NOT_AWARDED: 6,
  CANCELLED: 7,
}

function resolveHomepage(p: GrantSystem): string | null {
  if (p.grantPoolsURI) return p.grantPoolsURI
  const sameAs = p.sameAs.find((u) => !u.includes('oss-funding')) ?? p.sameAs[0]
  return sameAs ?? null
}

function formatCloseDate(iso: string | null): string {
  if (!iso) return 'no deadline'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function PublisherDetail({ id }: { id: string }) {
  const publisher = usePublisher(id)
  // Same one-shot fetch pattern as elsewhere — React Query caches.
  const pools = useRfps({ grantSystemRef: id }, 200)

  const sortedPools = useMemo(() => {
    const items = pools.data?.items ?? []
    return [...items].sort((a, b) => {
      const lo = LIFECYCLE_ORDER[a.lifecycle] - LIFECYCLE_ORDER[b.lifecycle]
      if (lo !== 0) return lo
      const ad = a.closeDate ?? '￿'
      const bd = b.closeDate ?? '￿'
      return ad.localeCompare(bd)
    })
  }, [pools.data])

  if (publisher.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 font-mono text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (publisher.isError || !publisher.data) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/publishers"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} /> Back to publishers
        </Link>
        <h1 className="mb-3 text-2xl font-medium tracking-tight">Publisher not found</h1>
        <p className="text-muted-foreground">
          This publisher may have been removed, or the switchboard isn&apos;t reachable.
        </p>
      </div>
    )
  }

  const p = publisher.data
  const homepage = resolveHomepage(p)
  const verified = p.verificationState === 'VERIFIED'

  const byLifecycle = sortedPools.reduce<Record<string, GrantPool[]>>((acc, pool) => {
    const bucket = pool.lifecycle === 'OPEN' || pool.lifecycle === 'UPCOMING' ? 'active' : 'past'
    ;(acc[bucket] ??= []).push(pool)
    return acc
  }, {})

  const active = byLifecycle.active ?? []
  const past = byLifecycle.past ?? []

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/publishers"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} /> Back to publishers
      </Link>

      <header className="mb-10 border-b border-border pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {p.type ? (
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {p.type}
            </span>
          ) : null}
          {verified ? (
            <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
              <Shield className="size-3" strokeWidth={2} /> Verified
            </span>
          ) : null}
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {sortedPools.length} pool{sortedPools.length === 1 ? '' : 's'}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
          {p.name ?? 'Unnamed publisher'}
        </h1>
        {p.description ? (
          <p className="mb-4 max-w-2xl text-lg text-foreground/70">{p.description}</p>
        ) : null}

        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          {homepage ? (
            <MetaItem icon={<ExternalLink className="size-3.5" strokeWidth={1.5} />} label="Homepage">
              <Link
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-foreground/90 hover:text-foreground"
              >
                {homepage}
              </Link>
            </MetaItem>
          ) : null}
          {p.email ? (
            <MetaItem icon={<Mail className="size-3.5" strokeWidth={1.5} />} label="Contact">
              <Link href={`mailto:${p.email}`} className="text-foreground/90 hover:text-foreground">
                {p.email}
              </Link>
              {p.contactName ? (
                <span className="ml-2 text-muted-foreground">({p.contactName})</span>
              ) : null}
            </MetaItem>
          ) : null}
          {p.publisherWallet ? (
            <MetaItem icon={<Hash className="size-3.5" strokeWidth={1.5} />} label="Wallet">
              <span className="break-all font-mono text-xs">{p.publisherWallet}</span>
            </MetaItem>
          ) : null}
          {p.verifiedAt ? (
            <MetaItem icon={<Calendar className="size-3.5" strokeWidth={1.5} />} label="Verified">
              {formatCloseDate(p.verifiedAt)}
              {p.verifiedBy ? (
                <span className="ml-2 text-muted-foreground">by {p.verifiedBy}</span>
              ) : null}
            </MetaItem>
          ) : null}
        </dl>
      </header>

      {pools.isLoading && sortedPools.length === 0 ? (
        <div className="font-mono text-sm text-muted-foreground">Loading pools…</div>
      ) : sortedPools.length === 0 ? (
        <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
          No pools indexed for this publisher yet.
        </div>
      ) : (
        <div className="space-y-10">
          {active.length > 0 ? (
            <PoolSection title="Active & upcoming" pools={active} highlight />
          ) : null}
          {past.length > 0 ? <PoolSection title="Closed / past" pools={past} /> : null}
        </div>
      )}
    </article>
  )
}

function PoolSection({
  title,
  pools,
  highlight,
}: {
  title: string
  pools: GrantPool[]
  highlight?: boolean
}) {
  return (
    <section>
      <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
        <span className="ml-2 rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] text-foreground">
          {pools.length}
        </span>
      </h2>
      <ul className="divide-y divide-border border border-border">
        {pools.map((p) => (
          <li key={p.id}>
            <Link
              href={`/rfps/${p.id}`}
              className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.02]"
            >
              <RfpStatusBadge lifecycle={p.lifecycle} className="flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-foreground/90">{p.name ?? 'Untitled'}</div>
                {p.description && highlight ? (
                  <div className="truncate text-xs text-muted-foreground">{p.description}</div>
                ) : null}
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:inline">
                {formatCloseDate(p.closeDate)}
              </span>
              <ArrowRight
                className="size-3 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                strokeWidth={1.5}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-foreground/90">{children}</dd>
    </div>
  )
}
