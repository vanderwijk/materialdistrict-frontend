'use client'

import { Fragment, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { IconArrowLeft } from '@/components/ui/icons'

export interface Crumb {
  label: string
  href?: string
}

/**
 * Panel header: an h1 page title, an optional breadcrumb trail under it, and an
 * optional contextual "Back to …" link.
 *
 * Rendered into the full-width header band (#dash-header-band) that DashboardShell
 * places above the sidebar+content grid, via a portal. This keeps the menu and
 * the content as two proper columns in every state (loading skeleton, empty,
 * multi-card) — the header lives in its own band and never participates in the
 * content grid. The band reserves a min-height (globals.css §DASH-REVIEW-3G) so
 * there is no layout shift before the portal mounts on the client.
 *
 * Crumbs render flat (no per-item wrapper) so the `.breadcrumbs` flex gap stays
 * even across links and separators.
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
  const [band, setBand] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setBand(document.getElementById('dash-header-band'))
  }, [])

  const header = (
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

  // SSR + pre-hydration: render nothing (the band reserves height). Once mounted
  // on the client, portal the header into the band above the layout grid.
  if (!band) return null
  return createPortal(header, band)
}
