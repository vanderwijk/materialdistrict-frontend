import Link from 'next/link'
import { listMaterialsWithFacets } from '@/lib/api'
import { MaterialCard } from '@/components/ui/MaterialCard'

/**
 * MoreFromBrand
 * ----------------------------------------------------------------------
 * Render een "More from [Brand]"-sectie onderaan de detail-page met max
 * 3 andere materials van dezelfde brand.
 *
 * Server-component: doet z'n eigen FacetWP-query met `brand=<id>` als
 * filter. Sluit het huidige material uit zodat het niet als "More" voor
 * zichzelf verschijnt.
 *
 * Faalbestendig:
 *  - brand_id null → component rendert niets
 *  - FacetWP-fout → component rendert niets (geen kapotte page)
 *  - Resultaat ≤ 1 item (alleen het huidige) → niets renderen
 *
 * "View all →" linkt naar `/materials?brand=<id>` zodat de gebruiker de
 * volledige brand-collectie kan zien.
 */

export interface MoreFromBrandProps {
  brandId: number | null
  brandName: string | null
  currentMaterialId: number
}

export async function MoreFromBrand({
  brandId,
  brandName,
  currentMaterialId,
}: MoreFromBrandProps) {
  if (!brandId || !brandName) return null

  let items
  try {
    // FacetWP brand-facet heet doorgaans 'brand'. We sturen brand_id mee
    // omdat de backend mogelijk meerdere conventies kent.
    const result = await listMaterialsWithFacets({
      selection: {
        // @ts-expect-error — `brand` is geen onderdeel van de strikte
        // FacetSelection-type, maar FacetWP accepteert hem wel. Wanneer
        // de filter-structuur officieel wordt uitgebreid (Punt 1b)
        // kunnen we deze cast weghalen.
        brand: [String(brandId)],
      },
      page: 1,
      perPage: 4, // 1 extra om het huidige material te filteren
    })
    items = result.items
  } catch {
    return null
  }

  const filtered = items
    .filter((m) => m.id !== currentMaterialId)
    .slice(0, 3)

  if (filtered.length === 0) return null

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
        <Link
          href={`/materials?brand=${encodeURIComponent(String(brandId))}`}
          className="mat-morefrombrand-viewall"
        >
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
