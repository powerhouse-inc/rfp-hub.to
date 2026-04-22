import { cn } from '@/modules/shared/lib/utils'
import { LIFECYCLE_LABEL, type GrantPoolLifecycle } from '../types'

const CLASSES: Record<GrantPoolLifecycle, string> = {
  OPEN: 'bg-[var(--accent)]/10 text-[var(--accent)] ring-[var(--accent)]/30',
  UPCOMING: 'bg-foreground/5 text-foreground/80 ring-border',
  REQUEST_FOR_COMMENTS: 'bg-foreground/5 text-foreground/80 ring-border',
  AWARDED: 'bg-foreground/5 text-foreground/80 ring-border',
  DRAFT: 'bg-muted text-muted-foreground ring-border',
  CLOSED: 'bg-muted text-muted-foreground ring-border',
  NOT_AWARDED: 'bg-muted text-muted-foreground ring-border',
  CANCELLED: 'bg-muted text-muted-foreground ring-border line-through',
}

export function RfpStatusBadge({
  lifecycle,
  className,
}: {
  lifecycle: GrantPoolLifecycle
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs uppercase tracking-wider ring-1 ring-inset',
        CLASSES[lifecycle],
        className,
      )}
    >
      {LIFECYCLE_LABEL[lifecycle]}
    </span>
  )
}
