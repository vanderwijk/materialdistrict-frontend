/**
 * MaterialCategoryStrip — homepage material-type-carrousel (S10.2).
 *
 * Build-order stap 10, Batch 2.
 *
 * Vervangt de minimale "All materials"-strip door een echte rij material-
 * types uit de `material_category`-taxonomie. Server-component; krijgt de
 * reeds opgehaalde + gesorteerde categorieën van de homepage-server-component.
 *
 * Hergebruik (DRY): exact dezelfde `.hp-cats` / `.hp-cat-link`-klassen als de
 * bestaande strip — een horizontale, scrollbare rij. Geen nieuwe CSS-familie
 * en geen eigen carousel-mechaniek; de strip schuift horizontaal op smalle
 * viewports.
 *
 * Elke tegel deeplinkt naar het gefilterde overzicht
 * `/material?material_category=<slug>` — exact het URL-contract dat
 * `/material` al parseert (FacetWP-facet, comma-separated slugs). De eerste
 * link ("All materials") gaat naar het ongefilterde overzicht.
 *
 * Lege lijst (bijv. taxonomie nog niet REST-bereikbaar): de strip degradeert
 * netjes tot alleen "All materials" — geen lege rij, geen crash.
 */

import Link from 'next/link'

export interface MaterialCategoryLink {
  /** Weergavelabel (HTML-entities al gedecodeerd). */
  label: string
  /** WP term-slug — matcht de FacetWP `material_category`-facetwaarde. */
  slug: string
}

export interface MaterialCategoryStripProps {
  categories: MaterialCategoryLink[]
}

export function MaterialCategoryStrip({
  categories,
}: MaterialCategoryStripProps) {
  return (
    <nav className="hp-cats" aria-label="Material categories">
      <div className="hp-cats-inner">
        <Link href="/material" className="hp-cat-link">
          All materials
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/material?material_category=${encodeURIComponent(cat.slug)}`}
            className="hp-cat-link"
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
