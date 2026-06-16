import Link from 'next/link'
import { listMaterialsByBrand } from '@/lib/api'
import { MaterialCard } from '@/components/ui/MaterialCard'

/**
 * MoreFromBrand
 * ----------------------------------------------------------------------
 * Render een "More from [Brand]"-sectie onderaan de detail-page met max
 * 3 andere materials van dezelfde brand.
 *
 * Server-component. Sessie 5 (27-05-2026): de oude FacetWP-query is
 * vervangen door de genormaliseerde REST-relatie-query `?brand_id=<id>`
 * (Johan-handoff). FacetWP herkende geen `brand`-facet — daardoor toonde
 * deze sectie eerder willekeurige materials (zie S7.1). De nieuwe query
 * is production-verified en levert betrouwbaar brand-specifieke materials.
 *
 * Dit raakt ALLEEN MoreFromBrand. FacetWP blijft de filter-mechaniek voor
 * het hoofdoverzicht /materials.
 *
 * Faalbestendig:
 *  - brand_id null → component rendert niets
 *  - REST-fout → component rendert niets (geen kapotte page)
 *  - Resultaat 0 items → niets renderen
 *
 * "View all →" linkt naar het brand-overzicht. We gebruiken de brand-slug
 * wanneer beschikbaar (directe brand-page); anders fallback op de
 * materials-overview gefilterd op brand-id.
 */

export interface MoreFromBrandProps {
  brandId: number | null
  brandName: string | null
  /** Brand-slug voor de "View all"-link naar /brands/[slug]. Optioneel. */
  brandSlug?: string | null
  currentMaterialId: number
}

export async function MoreFromBrand({
  brandId,
  brandName,
  brandSlug,
  currentMaterialId,
}: MoreFromBrandProps) {
  if (!brandId || !brandName) return null

  let items
  try {
    // Genormaliseerde relatie-query (Johan-handoff). per_page 4 → tot 3
    // tonen na het uitsluiten van het huidige material (exclude doet dat
    // al server-side, de slice is een veiligheidsnet).
    const result = await listMaterialsByBrand(brandId, {
      perPage: 4,
      exclude: currentMaterialId,
    })
    items = result.items
  } catch {
    return null
  }

  const filtered = items
    .filter((m) => m.id !== currentMaterialId)
    .slice(0, 3)

  if (filtered.length === 0) return null

  const viewAllHref = brandSlug
    ? `/brand/${brandSlug}`
    : `/material?brand=${encodeURIComponent(String(brandId))}`

  return (
    <section
      className="mat-morefrombrand"
      aria-labelledby="morefrombrand-title"
    >
      <header className="mat-morefrombrand-header">
        <h2
          id="morefrombrand-title"
          className="mat-section-title mat-morefrombrand-heading"
        >
          More from {brandName}
        </h2>
        <Link href={viewAllHref} className="mat-morefrombrand-viewall">
          View all <span aria-hidden="true">→</span>
        </Link>
      </header>

      <div className="mat-morefrombrand-grid">
        {filtered.map((m) => (
          <MaterialCard
            key={m.id}
            material={m}
            isLoggedIn={false}
            isMember={false}
          />
        ))}
      </div>
    </section>
  )
}
