import { Fragment } from 'react'
import Link from 'next/link'

export interface Crumb {
  label: string
  href?: string
}

/**
 * Panel header: optional breadcrumb trail + an h1 page title. Server-safe
 * (no client hooks) so panels can render it directly. Reuses the existing
 * `.breadcrumbs` / `.bc-sep` / `.bc-last` / `.page-title` classes.
 *
 * Crumbs render flat (no per-item wrapper) so the `.breadcrumbs` flex gap
 * stays even across links and separators.
 */
export function DashboardPageHeader({
  title,
  crumbs,
}: {
  title: string
  crumbs?: Crumb[]
}) {
  return (
    <header>
      {crumbs && crumbs.length > 0 && (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
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
      <h1 className="page-title">{title}</h1>
    </header>
  )
}
