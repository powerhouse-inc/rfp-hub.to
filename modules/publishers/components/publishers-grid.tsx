'use client'

import Link from 'next/link'
import { ExternalLink, Shield } from 'lucide-react'
import { usePublishers } from '../hooks'
import type { GrantSystem } from '../types'

function resolveHomepage(p: GrantSystem): string | null {
  if (p.grantPoolsURI) return p.grantPoolsURI
  // Prefer the first sameAs entry that isn't the DAOIP-5 dataset import itself.
  const sameAs = p.sameAs.find((u) => !u.includes('oss-funding')) ?? p.sameAs[0]
  return sameAs ?? null
}

function hostname(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export function PublishersGrid() {
  const { data, isLoading, isError } = usePublishers()

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-medium tracking-tight md:text-4xl">Publishers</h1>
          <p className="max-w-2xl text-foreground/70">
            Funders and grant programs currently indexed on the hub. Anyone can submit new RFPs.
            Verified publishers get a mark.
          </p>
        </div>
        <Link
          href="/publishers/new"
          className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 text-sm font-medium hover:border-foreground/60"
        >
          Add publisher
        </Link>
      </header>

      {isLoading ? (
        <div className="font-mono text-sm text-muted-foreground">Loading…</div>
      ) : isError ? (
        <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
          Couldn&apos;t reach the switchboard.
        </div>
      ) : !data || data.length === 0 ? (
        <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
          No publishers yet. <Link href="/publishers/new" className="underline">Add the first one.</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const homepage = resolveHomepage(p)
            const verified = p.verificationState === 'VERIFIED'
            return (
              <Link
                key={p.id}
                href={`/publishers/${p.id}`}
                className="group flex h-full flex-col border border-border bg-background p-5 transition-colors hover:border-foreground/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {p.poolCount ?? 0} pool{p.poolCount === 1 ? '' : 's'}
                  </span>
                  {verified ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
                      <Shield className="size-3" strokeWidth={2} /> Verified
                    </span>
                  ) : p.type ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {p.type}
                    </span>
                  ) : null}
                </div>
                <h3 className="mb-2 text-lg font-medium tracking-tight">{p.name ?? 'Unnamed'}</h3>
                {p.description ? (
                  <p className="mb-4 line-clamp-3 text-sm text-foreground/70">{p.description}</p>
                ) : null}
                {homepage ? (
                  <span className="mt-auto inline-flex items-center gap-1 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                    {hostname(homepage)}
                    <ExternalLink className="size-3" strokeWidth={1.5} />
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
