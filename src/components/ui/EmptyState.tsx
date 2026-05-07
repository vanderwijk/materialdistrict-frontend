import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  /** Hoofdboodschap. Bv. "No materials found". */
  title: string
  /** Toelichting onder de titel. */
  description?: string
  /** Custom icoon. Default: vergrootglas. */
  icon?: ReactNode
  /** Action-knoppen, bv. <Button>Clear filters</Button><Button>Browse all</Button>. */
  actions?: ReactNode
  className?: string
}

/**
 * Empty state — uit globals.css §22.
 * Voor lege filterresultaten, lege bookmarks-lijsten, etc.
 *
 * @example
 *   <EmptyState
 *     title="No materials found"
 *     description="Try removing some filters."
 *     actions={<>
 *       <Button variant="outline" size="sm">Clear filters</Button>
 *       <Button size="sm">Browse all</Button>
 *     </>}
 *   />
 */
export function EmptyState({
  title,
  description,
  icon,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="empty-state-icon" aria-hidden="true">
        {icon ?? <Search size={22} strokeWidth={2} />}
      </div>
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {actions && <div className="empty-state-actions">{actions}</div>}
    </div>
  )
}
