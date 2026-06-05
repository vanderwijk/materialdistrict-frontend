/**
 * FeaturedPartners — homepage-blok "Featured partners".
 *
 * Build-order stap 10, S10.3.
 *
 * Presentational server-component. Krijgt een reeds geselecteerde (en
 * geroteerde) subset Partner-tier brands van de homepage-server-component en
 * rendert ze als `BrandTile` in dezelfde `.ov-grid-brands`-container die
 * `/brands` gebruikt. Geen eigen CSS-familie (DRY): hergebruik van het
 * bestaande brand-tile-patroon.
 *
 * - Bron + rotatie zitten in `page.tsx` (`pickRotatingPartners`); deze
 *   component bepaalt geen data, alleen weergave.
 * - Lege lijst → de hele sectie verdwijnt (geen lege-state-rommel op de
 *   homepage). Een homepage zonder partners toont simpelweg geen blok.
 */

import Link from 'next/link'
import { BrandTile } from '@/components/ui'
import type { BrandListItem } from '@/types/brand'

export interface FeaturedPartnersProps {
  /** Reeds geselecteerde/geroteerde subset Partner-tier brands. */
  partners: BrandListItem[]
}

export function FeaturedPartners({ partners }: FeaturedPartnersProps) {
  if (partners.length === 0) return null

  return (
    <section className="hp-section">
      <div className="section-hd">
        <h2 className="section-title">Featured partners</h2>
        <Link href="/brands" className="section-link">
          All brands →
        </Link>
      </div>
      <div className="ov-grid-brands">
        {partners.map((brand) => (
          <BrandTile key={brand.id} brand={brand} />
        ))}
      </div>
    </section>
  )
}
