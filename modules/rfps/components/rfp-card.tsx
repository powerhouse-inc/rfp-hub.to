import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/modules/shared/lib/utils'
import type { GrantPool } from '../types'
import { RfpStatusBadge } from './rfp-status-badge'

function formatDeadline(iso: string | null): string {
  if (!iso) return 'No deadline'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const formatted = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
  if (diffDays < 0) return `Closed ${formatted}`
  if (diffDays === 0) return `Closes today`
  if (diffDays <= 30) return `${diffDays}d · ${formatted}`
  return formatted
}

/**
 * Primary amount shown on the card. Prefers the USD-normalized total so
 * different currencies across pools still collapse to one comparable number.
 */
function formatPoolSize(pool: GrantPool): string | null {
  if (pool.totalGrantPoolSizeInUSD) {
    const n = Number(pool.totalGrantPoolSizeInUSD)
    if (!Number.isNaN(n)) {
      return `$${new Intl.NumberFormat('en-US', {
        notation: n >= 10_000 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
      }).format(n)}`
    }
  }
  const first = pool.totalGrantPoolSize[0]
  if (first) {
    const n = Number(first.amount)
    if (!Number.isNaN(n)) {
      return new Intl.NumberFormat('en-US', {
        notation: n >= 10_000 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
      }).format(n)
    }
  }
  return null
}

/**
 * Identifier of the funder. Until we resolve `grantSystemRef` into a
 * GrantSystem document (fetched separately in a follow-up pass), we fall back
 * to the publisher or submitter DID — both of which are available on the pool
 * itself.
 */
function resolveFunderLabel(pool: GrantPool): string {
  if (pool.publisher?.identifier) {
    const id = pool.publisher.identifier
    if (id.startsWith('did:ethr:')) return id.slice('did:ethr:'.length)
    return id
  }
  if (pool.grantSystemRef) return pool.grantSystemRef
  if (pool.submitter?.identifier) return pool.submitter.identifier
  return 'Unknown funder'
}

export function RfpCard({ rfp, className }: { rfp: GrantPool; className?: string }) {
  const amount = formatPoolSize(rfp)
  const funder = resolveFunderLabel(rfp)
  const ecosystem = rfp.ecosystems[0] ?? null
  return (
    <Link
      href={`/rfps/${rfp.id}`}
      className={cn(
        'group relative block border border-border bg-background p-5 transition-colors hover:border-foreground/40',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <RfpStatusBadge lifecycle={rfp.lifecycle} />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {formatDeadline(rfp.closeDate)}
        </span>
      </div>
      <h3 className="mb-1 text-lg font-medium leading-tight tracking-tight">
        {rfp.name || 'Untitled'}
      </h3>
      <div className="mb-3 font-mono text-xs text-muted-foreground">
        {funder}
        {ecosystem ? <span className="mx-1.5 text-foreground/20">/</span> : null}
        {ecosystem}
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-foreground/70">
        {rfp.description ?? ''}
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {rfp.categories.slice(0, 3).map((c: string) => (
            <span
              key={c}
              className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
        {amount ? (
          <span className="font-mono text-sm font-medium text-foreground">{amount}</span>
        ) : null}
      </div>
      <ArrowUpRight
        className="absolute right-4 top-4 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        strokeWidth={1.5}
      />
    </Link>
  )
}
