'use client'

/**
 * RecentlyViewedSection
 * ----------------------------------------------------------------------
 * Toont een "RECENTLY VIEWED"-strook met de laatst bezochte materials
 * uit localStorage.
 *
 * - Rendert niets zolang de hook nog niet gehydrateerd is (voorkomt
 *   flash-of-empty op SSR).
 * - Rendert niets als de lijst leeg is.
 * - Layout: horizontaal grid van mini-tiles met thumbnail + titel.
 *   Op smal scherm scrollt de strip horizontaal.
 *
 * Sessie 7 (Punt 3) — twee varianten:
 *  - `default`: full-bleed sectie met eigen padding/max-width. Geschikt
 *    voor onderaan een detail-page (één-koloms layout).
 *  - `inline`: zonder eigen padding/max-width. Geschikt voor binnen
 *    een grid-cell (bv. /materials kolom 2 onder de pagination), zodat
 *    de sectie de breedte van die kolom volgt i.p.v. onder de filter-
 *    sidebar door te lopen.
 *
 * §F2.7 (Punt 3.2) — elke tile heeft nu een verwijder-knop (prullenbak,
 * rechtsboven). De knop staat als sibling náást de tile-Link (niet erin
 * genest), zodat er geen interactive-in-interactive ontstaat; hij
 * verschijnt op hover/focus van de tile.
 */

import Link from 'next/link'
import { useRecentlyViewedMaterials } from '@/lib/hooks/useRecentlyViewedMaterials'
import { IconDelete } from '@/components/ui/icons'

export interface RecentlyViewedSectionProps {
  /**
   * Layout-variant. Default `'default'` voor de oude full-bleed look.
   * Gebruik `'inline'` wanneer de sectie binnen een grid-cell zit.
   */
  variant?: 'default' | 'inline'
}

export function RecentlyViewedSection({
  variant = 'default',
}: RecentlyViewedSectionProps = {}) {
  const { items, ready, remove } = useRecentlyViewedMaterials()

  if (!ready || items.length === 0) return null

  const className =
    variant === 'inline' ? 'recently-viewed is-inline' : 'recently-viewed'

  return (
    <section className={className} aria-labelledby="recently-viewed-title">
      <h2 id="recently-viewed-title" className="recently-viewed-title">
        Recently viewed
      </h2>
      <div className="recently-viewed-strip">
        {items.map((item) => (
          <div key={item.slug} className="recently-viewed-item">
            <Link
              href={`/materials/${item.slug}`}
              className="recently-viewed-tile"
            >
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
                {item.brandName && (
                  <span className="recently-viewed-brand">{item.brandName}</span>
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
              <IconDelete size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
