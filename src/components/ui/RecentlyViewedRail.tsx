'use client'

/**
 * RecentlyViewedRail — generieke "Recently viewed"-strook voor de
 * stories/brands/events/talks-overzichten (§F2.7, D1).
 *
 * Spiegelt de materials-`RecentlyViewedSection`: zelfde `.recently-viewed*`
 * classes (incl. de verwijder-knop uit §F2.7 batch A), maar entity-generiek
 * via `useRecentlyViewed(entity)`. Rendert niets tot gehydrateerd of bij een
 * lege lijst.
 */

import Link from 'next/link'
import { IconDelete } from './icons'
import {
  useRecentlyViewed,
  type RecentlyViewedEntity,
} from '@/lib/hooks/useRecentlyViewed'

export interface RecentlyViewedRailProps {
  entity: RecentlyViewedEntity
  /** `'inline'` binnen een grid-cell; `'default'` full-bleed. */
  variant?: 'default' | 'inline'
}

export function RecentlyViewedRail({
  entity,
  variant = 'default',
}: RecentlyViewedRailProps) {
  const { items, ready, remove } = useRecentlyViewed(entity)

  if (!ready || items.length === 0) return null

  const className =
    variant === 'inline' ? 'recently-viewed is-inline' : 'recently-viewed'

  return (
    <section className={className} aria-labelledby={`recently-viewed-${entity}`}>
      <h2 id={`recently-viewed-${entity}`} className="recently-viewed-title">
        Recently viewed
      </h2>
      <div className="recently-viewed-strip">
        {items.map((item) => (
          <div key={item.slug} className="recently-viewed-item">
            <Link href={item.href} className="recently-viewed-tile">
              <span className="recently-viewed-thumb">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl} alt="" />
                ) : (
                  <span
                    className="recently-viewed-thumb-placeholder"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="recently-viewed-text">
                <span className="recently-viewed-name">{item.title}</span>
                {item.subtitle && (
                  <span className="recently-viewed-brand">{item.subtitle}</span>
                )}
              </span>
            </Link>
            <button
              type="button"
              className="recently-viewed-remove"
              aria-label={`Remove ${item.title} from recently viewed`}
              title="Remove from recently viewed"
              onClick={() => remove(item.slug)}
            >
              <IconDelete size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
