'use client'

import Link from 'next/link'
import { ExternalLink, Shield } from 'lucide-react'
import { usePublishers } from '../hooks'

export function PublishersGrid() {
  const { data, isLoading, isError } = usePublishers()

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-medium tracking-tight md:text-4xl">Publishers</h1>
        <p className="max-w-2xl text-foreground/70">
          Funders and grant programs currently indexed on the hub. Anyone can submit new RFPs.
          Verified publishers get a mark.
        </p>
      </header>

      {isLoading ? (
        <div className="font-mono text-sm text-muted-foreground">Loading…</div>
      ) : isError ? (
        <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
          Couldn&apos;t reach the switchboard.
        </div>
      ) : !data || data.length === 0 ? (
        <div className="border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground">
          No publishers yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const card = (
              <div
                key={p.id}
                className="group flex h-full flex-col border border-border bg-background p-5 transition-colors hover:border-foreground/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {p.rfpCount} RFP{p.rfpCount === 1 ? '' : 's'}
                  </span>
                  {p.verified ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
                      <Shield className="size-3" strokeWidth={2} /> Verified
                    </span>
                  ) : null}
                </div>
                <h3 className="mb-2 text-lg font-medium tracking-tight">{p.name}</h3>
                {p.description ? (
                  <p className="mb-4 line-clamp-3 text-sm text-foreground/70">{p.description}</p>
                ) : null}
                {p.url ? (
                  <span className="mt-auto inline-flex items-center gap-1 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                    {new URL(p.url).host}
                    <ExternalLink className="size-3" strokeWidth={1.5} />
                  </span>
                ) : null}
              </div>
            )
            return p.url ? (
              <Link
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                {card}
              </Link>
            ) : (
              <div key={p.id} className="h-full">
                {card}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
