'use client'

/**
 * RecentlyViewedSection
 * ----------------------------------------------------------------------
 * Toont een "RECENTLY VIEWED"-strook onderaan /materials met de laatst
 * bezochte materials uit localStorage.
 *
 * - Rendert niets zolang de hook nog niet gehydrateerd is (voorkomt
 *   flash-of-empty op SSR).
 * - Rendert niets als de lijst leeg is.
 * - Layout: horizontaal grid van mini-tiles met thumbnail + titel.
 *   Op smal scherm scrollt de strip horizontaal.
 */

import Link from 'next/link'
import { useRecentlyViewedMaterials } from '@/lib/hooks/useRecentlyViewedMaterials'

export function RecentlyViewedSection() {
  const { items, ready } = useRecentlyViewedMaterials()

  if (!ready || items.length === 0) return null

  return (
    <section
      className="recently-viewed"
      aria-labelledby="recently-viewed-title"
    >
      <h2 id="recently-viewed-title" className="recently-viewed-title">
        Recently viewed
      </h2>
      <div className="recently-viewed-strip">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/materials/${item.slug}`}
            className="recently-viewed-tile"
          >
            <span className="recently-viewed-thumb">
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumbnailUrl} alt="" />
              ) : (
                <span className="recently-viewed-thumb-placeholder" aria-hidden="true" />
              )}
            </span>
            <span className="recently-viewed-text">
              <span className="recently-viewed-name">{item.title}</span>
              {item.brandName && (
                <span className="recently-viewed-brand">{item.brandName}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
