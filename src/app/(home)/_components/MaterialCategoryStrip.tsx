/**
 * MaterialCategoryStrip — homepage categorie-snelmenu.
 *
 * Build-order stap 10. Een horizontale rij `material_category`-pillen die
 * doorlinken naar het gefilterde materialen-overzicht. Géén actieve staat:
 * dit is een snelmenu naar het filter, geen statusindicator (de channelbar
 * heeft die actieve staat wél, hier bewust niet).
 *
 * Server-component; krijgt de reeds opgehaalde + op aantal gesorteerde
 * categorieën van de homepage-server-component. Elke pill toont het label
 * met het aantal materialen erachter.
 *
 * Elke pill deeplinkt naar `/material?material_category=<slug>` — exact het
 * URL-contract dat `/material` al parseert (FacetWP-facet, comma-separated
 * slugs). De eerste link ("All materials") gaat naar het ongefilterde
 * overzicht.
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
  /** Aantal (online) materialen in deze categorie — door WP geteld. */
  count: number
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
            <span className="hp-cat-count">{cat.count}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
