/**
 * FeaturedPartners — homepage-blok "Featured brands".
 *
 * Build-order stap 10, S10.2/S10.3. Presentational server-component: krijgt een
 * reeds geselecteerde + geordende subset brands (Partner-tier eerst, daarna
 * aangevuld met brands die ≥3 materialen hebben).
 *
 * Bewust **logo-only**: een rustige grid van merk-logo's (geen plaats, geen
 * materiaal-telling, geen carrousel). Het logo is de herkenning; de rest is
 * ruis op een homepage-overzicht. Klik → de brand-detailpagina.
 *
 * Lege lijst → de hele sectie verdwijnt.
 */

import Image from 'next/image'
import Link from 'next/link'
import { pickCardImageUrl } from '@/lib/utils/pick-card-image-url'
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
        {partners.slice(0, 6).map((brand) => {
          const logoSrc = pickCardImageUrl(brand.logo, 'logo')
          return (
            <li key={brand.id}>
              <Link
                href={`/brand/${brand.slug}`}
                className="hp-brand-logo"
                aria-label={brand.name}
              >
                {logoSrc ? (
                  <span className="hp-brand-logo-media">
                    <Image
                      src={logoSrc}
                      alt=""
                      fill
                      sizes="(max-width: 520px) 45vw, (max-width: 900px) 30vw, 140px"
                      className="hp-brand-logo-img"
                    />
                  </span>
                ) : (
                  <span className="hp-brand-logo-fallback">{brand.name}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
