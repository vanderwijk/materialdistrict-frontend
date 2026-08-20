/**
 * FeaturedPartners — homepage-blok "Featured brands".
 */

import Link from 'next/link'
import { MdImage } from '@/components/ui'
import type { BrandListItem } from '@/types/brand'

export interface FeaturedPartnersProps {
  /** Reeds geselecteerde/geordende subset brands (max 6). */
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
      <ul className="hp-brand-logos">
        {partners.slice(0, 6).map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/brand/${brand.slug}`}
              className="hp-brand-logo"
              aria-label={brand.name}
            >
              {brand.logo ? (
                <span className="hp-brand-logo-media">
                  <MdImage
                    image={brand.logo}
                    role="logo"
                    alt=""
                    fill
                    className="hp-brand-logo-img"
                  />
                </span>
              ) : (
                <span className="hp-brand-logo-fallback">{brand.name}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
