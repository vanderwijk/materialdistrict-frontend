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
 * (Johan-handoff).
 *
 * "View all →" linkt alleen naar `/brand/[slug]` wanneer `brandSlug` gezet
 * is (brand is publish). Draft/niet-publieke brands mogen wél als naam +
 * "More from"-grid tonen, maar zonder link (Claude 07-08-2026: geen
 * `/material?brand=`-fallback — die filter bestaat niet).
 *
 * Faalbestendig:
 *  - brand_id null → component rendert niets
 *  - REST-fout → component rendert niets (geen kapotte page)
 *  - Resultaat 0 items → niets renderen
 */

export interface MoreFromBrandProps {
  brandId: number | null
  brandName: string | null
  /** Alleen gezet als de brand publish is — dan "View all" → /brand/[slug]. */
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

  const viewAllHref = brandSlug ? `/brand/${brandSlug}` : null

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
        {viewAllHref ? (
          <Link href={viewAllHref} className="mat-morefrombrand-viewall">
            View all <span aria-hidden="true">→</span>
          </Link>
        ) : null}
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

