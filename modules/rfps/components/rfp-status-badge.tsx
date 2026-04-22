import { cn } from '@/modules/shared/lib/utils'
import type { RfpStatus } from '../types'

const STATUS_LABEL: Record<RfpStatus, string> = {
  OPEN: 'Open',
  UPCOMING: 'Upcoming',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
}

const STATUS_CLASSES: Record<RfpStatus, string> = {
  OPEN: 'bg-[var(--accent)]/10 text-[var(--accent)] ring-[var(--accent)]/30',
  UPCOMING: 'bg-foreground/5 text-foreground/80 ring-border',
  CLOSED: 'bg-muted text-muted-foreground ring-border',
  CANCELLED: 'bg-muted text-muted-foreground ring-border line-through',
}

export function RfpStatusBadge({
  status,
  className,
}: {
  status: RfpStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs uppercase tracking-wider ring-1 ring-inset',
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
