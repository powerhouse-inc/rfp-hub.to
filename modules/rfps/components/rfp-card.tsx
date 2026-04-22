import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/modules/shared/lib/utils'
import type { Rfp } from '../types'
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

function formatAmount(amount: string | null, currency: string | null): string | null {
  if (!amount) return null
  const n = Number(amount)
  if (Number.isNaN(n)) return `${amount}${currency ? ` ${currency}` : ''}`
  const formatted = new Intl.NumberFormat('en-US', {
    notation: n >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(n)
  return `${formatted}${currency ? ` ${currency}` : ''}`
}

export function RfpCard({ rfp, className }: { rfp: Rfp; className?: string }) {
  const amount = formatAmount(rfp.fundingAmount, rfp.fundingCurrency)
  return (
    <Link
      href={`/rfps/${rfp.slug || rfp.id}`}
      className={cn(
        'group relative block border border-border bg-background p-5 transition-colors hover:border-foreground/40',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <RfpStatusBadge status={rfp.status} />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {formatDeadline(rfp.deadline)}
        </span>
      </div>
      <h3 className="mb-1 text-lg font-medium leading-tight tracking-tight">
        {rfp.title || 'Untitled'}
      </h3>
      <div className="mb-3 font-mono text-xs text-muted-foreground">
        {rfp.funder}
        {rfp.ecosystem ? <span className="mx-1.5 text-foreground/20">/</span> : null}
        {rfp.ecosystem}
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-foreground/70">{rfp.summary}</p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {rfp.categories.slice(0, 3).map((c) => (
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
