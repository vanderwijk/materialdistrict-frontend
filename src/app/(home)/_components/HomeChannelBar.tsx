'use client'

/**
 * HomeChannelBar — channel-navigatie op de homepage (Homepage-1).
 * --------------------------------------------------------------------
 * Vervangt de oude `material_category`-pillen door dezelfde channel-bar als op
 * de overzichtspagina's, maar als NAVIGATIE: elke tab is een link naar
 * `/channel/<slug>` (en "All" naar de `/channel`-index), zonder het zoekveld en
 * de view-toggle die alleen op de overzichtspagina's zin hebben.
 *
 * Hergebruikt de `.channel-bar` / `.channel-tab`-styling uit globals.css
 * (DRY). Client-component voor de pager (chevrons); de tabs zelf zijn gewone
 * server-navigatie-links. De `is-nav`-modifier zet de bar op de homepage
 * statisch i.p.v. sticky.
 */

import Link from 'next/link'
import { useState } from 'react'
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons'
import { cn } from '@/lib/utils/cn'

export interface HomeChannelBarItem {
  slug: string
  label: string
}

export interface HomeChannelBarProps {
  channels: HomeChannelBarItem[]
  /** Aantal tabs per pagina in de pager. Default 8. */
  pageSize?: number
  className?: string
}

const ALL_TAB: HomeChannelBarItem = { slug: '', label: 'All' }

export function HomeChannelBar({
  channels,
  pageSize = 8,
  className,
}: HomeChannelBarProps) {
  const tabs = [ALL_TAB, ...channels]
  const totalPages = Math.ceil(tabs.length / pageSize)
  const [page, setPage] = useState(0)

  const visible = tabs.slice(page * pageSize, (page + 1) * pageSize)
  const canPrev = page > 0
  const canNext = page < totalPages - 1

  return (
    <div className={cn('channel-bar', 'is-nav', className)}>
      <div className="channel-bar-inner">
        <div className="channel-label-wrap">
          <span className="channel-label">Channel</span>
        </div>

        <div className="channel-pager">
          <button
            type="button"
            className="channel-page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            aria-label="Previous channels"
          >
            <IconChevronLeft size={10} strokeWidth={2} />
          </button>
        </div>

        <div className="channel-tabs-viewport" key={page}>
          {visible.map((c) => (
            <Link
              key={c.slug || 'all'}
              href={c.slug ? `/channel/${c.slug}` : '/channel'}
              className={cn('channel-tab', c.slug === '' && 'is-all')}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="channel-pager">
          <button
            type="button"
            className="channel-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!canNext}
            aria-label="Next channels"
          >
            <IconChevronRight size={10} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
