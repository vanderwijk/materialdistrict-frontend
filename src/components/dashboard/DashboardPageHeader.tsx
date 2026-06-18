import { Fragment } from 'react'
import Link from 'next/link'
import { IconArrowLeft } from '@/components/ui/icons'

export interface Crumb {
  label: string
  href?: string
}

/**
 * Panel header: optional breadcrumb trail + an h1 page title, with an optional
 * contextual "Back to …" link rendered under the title (above the panel).
 * Server-safe (no client hooks) so panels can render it directly. Reuses the
 * existing `.breadcrumbs` / `.bc-sep` / `.bc-last` / `.page-title` /
 * `.detail-header-back` classes.
 *
 * Crumbs render flat (no per-item wrapper) so the `.breadcrumbs` flex gap
 * stays even across links and separators.
 */
export function DashboardPageHeader({
  title,
  crumbs,
  backHref,
  backLabel,
}: {
  title: string
  crumbs?: Crumb[]
  /** Optional contextual back-link target, e.g. the parent list. */
  backHref?: string
  /** Label for the back-link, e.g. "Back to materials". */
  backLabel?: string
}) {
  return (
    <header className="dash-page-header">
      <h1 className="page-title">{title}</h1>
      {crumbs && crumbs.length > 0 && (
        <nav className="breadcrumbs breadcrumbs--under-title" aria-label="Breadcrumb">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <Fragment key={`${c.label}-${i}`}>
                {c.href && !isLast ? (
                  <Link href={c.href}>{c.label}</Link>
                ) : (
                  <span className={isLast ? 'bc-last' : undefined}>{c.label}</span>
                )}
                {!isLast && <span className="bc-sep">/</span>}
              </Fragment>
            )
          })}
        </nav>
      )}
      {backHref && backLabel && (
        <Link href={backHref} className="detail-header-back">
          <IconArrowLeft size={14} />
          {backLabel}
        </Link>
      )}
    </header>
  )
}
