import Link from 'next/link'
import { Banknote, Clock, ExternalLink, User } from 'lucide-react'
import { cn } from '@/modules/shared/lib/utils'
import type { ApplicationStatus, GrantApplication } from '../types'
import { STATUS_LABEL } from '../types'

const STATUS_CLASSES: Record<ApplicationStatus, string> = {
  pending: 'bg-muted text-muted-foreground ring-border',
  in_review: 'bg-foreground/5 text-foreground/80 ring-border',
  approved: 'bg-[var(--accent)]/10 text-[var(--accent)] ring-[var(--accent)]/30',
  funded: 'bg-[var(--accent)]/20 text-[var(--accent)] ring-[var(--accent)]/40',
  rejected: 'bg-muted text-muted-foreground ring-border line-through',
  completed: 'bg-foreground/5 text-foreground/80 ring-border',
}

function formatAmount(amount: string | null): string | null {
  if (!amount) return null
  const n = Number(amount)
  if (Number.isNaN(n)) return amount
  return new Intl.NumberFormat('en-US', {
    notation: n >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(n)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ApplicationCard({ application: a }: { application: GrantApplication }) {
  const askedUSD = formatAmount(a.fundsAskedInUSD)
  const approvedUSD = formatAmount(a.fundsApprovedInUSD)

  return (
    <article className="border border-border bg-background p-5 transition-colors hover:border-foreground/40">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs uppercase tracking-wider ring-1 ring-inset',
            STATUS_CLASSES[a.status],
          )}
        >
          {STATUS_LABEL[a.status]}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {a.reviewStage}
        </span>
      </div>

      <h3 className="mb-1 text-lg font-medium leading-tight tracking-tight">
        {a.projectName ?? 'Untitled project'}
      </h3>

      {a.grantPoolName ? (
        <div className="mb-3 font-mono text-xs text-muted-foreground">
          applied to <span className="text-foreground/70">{a.grantPoolName}</span>
        </div>
      ) : null}

      <div className="mt-4 space-y-2 text-sm">
        <Row icon={<Banknote className="size-3.5" strokeWidth={1.5} />} label="Asked">
          {askedUSD ? (
            <span className="font-mono">${askedUSD}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          {approvedUSD ? (
            <>
              <span className="mx-1 text-foreground/30">/</span>
              <span className="font-mono text-[var(--accent)]">${approvedUSD} approved</span>
            </>
          ) : null}
        </Row>
        <Row icon={<Clock className="size-3.5" strokeWidth={1.5} />} label="Submitted">
          {formatDate(a.submittedAt ?? a.createdAt)}
        </Row>
        {a.reviewedBy ? (
          <Row icon={<User className="size-3.5" strokeWidth={1.5} />} label="Reviewed by">
            <span className="font-mono text-xs">{a.reviewedBy}</span>
          </Row>
        ) : null}
      </div>

      {a.contentURI ? (
        <Link
          href={a.contentURI}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          Application content <ExternalLink className="size-3" strokeWidth={1.5} />
        </Link>
      ) : null}
    </article>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-foreground/80">
      <span className="flex size-4 items-center justify-center text-muted-foreground">{icon}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span>{children}</span>
    </div>
  )
}
