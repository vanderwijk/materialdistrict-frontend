/**
 * FeaturedPartners — homepage-blok "Featured brands".
 *
 * Build-order stap 10, S10.2/S10.3. Presentational server-component: krijgt een
 * reeds geselecteerde + geordende subset brands van de homepage-server-component
 * (Partner-tier eerst, daarna aangevuld met brands die ≥3 materialen hebben).
 *
 * Bewust een *lichter* tegel-uiterlijk dan de `BrandTile` van het /brand-
 * overzicht (dat de 4-thumbnail-montage + meer chrome heeft): hier alleen
 * logo/hero + naam + locatie + materiaal-telling, via de gedeelde `ContentCard`.
 * Horizontale rij (carrousel) zodat 6 merken naast elkaar passen.
 *
 * Lege lijst → de hele sectie verdwijnt (geen lege-state-rommel).
 */

import Link from 'next/link'
import { ContentCard } from '@/components/ui'
import type { BrandListItem } from '@/types/brand'

export interface FeaturedPartnersProps {
  /** Reeds geselecteerde/geordende subset brands. */
  partners: BrandListItem[]
}

export function FeaturedPartners({ partners }: FeaturedPartnersProps) {
  if (partners.length === 0) return null

  return (
    <section className="hp-section">
      <div className="section-hd">
        <h2 className="section-title">Featured brands</h2>
        <Link href="/brand" className="section-link">
          All brands →
        </Link>
      </div>
      <div className="hp-partner-row">
        {partners.map((brand) => (
          <ContentCard
            key={brand.id}
            className="hp-partner-tile"
            href={`/brand/${brand.slug}`}
            contentType="brand"
            showTypeBadge={false}
            thumbSrc={brand.logo?.sourceUrl}
            thumbAlt={brand.logo?.alt ?? brand.name}
            title={brand.name}
            eyebrow={
              [brand.city, brand.country].filter(Boolean).join(', ') || undefined
            }
            meta={
              brand.materialCount > 0
                ? `${brand.materialCount.toLocaleString('en-US')} ${
                    brand.materialCount === 1 ? 'material' : 'materials'
                  }`
                : undefined
            }
          />
        ))}
      </div>
    </section>
  )
}
