/**
 * BrandPrevNext
 * ----------------------------------------------------------------------
 * Eenvoudige "vorige / volgende brand"-navigatie onderaan de
 * brand-detail-page. De mockup cyclet door de brand-lijst; wij doen
 * hetzelfde, maar op basis van slug i.p.v. numerieke id.
 *
 * Anders dan PrevNextNavigation voor materials (die de FacetWP-filter-
 * context uit sessionStorage leest en een list-light-endpoint bevraagt),
 * is dit een server-vriendelijke, stateless variant: de page berekent de
 * buren uit de alfabetische brandenlijst en geeft ze als props mee. Geen
 * client-fetch, geen context — bewust simpel gehouden voor v1.
 *
 * Rendert niets als er geen enkele buur is.
 */

import Link from 'next/link'

export interface BrandPrevNextNeighbour {
  slug: string
  name: string
}

export interface BrandPrevNextProps {
  prev: BrandPrevNextNeighbour | null
  next: BrandPrevNextNeighbour | null
}

export function BrandPrevNext({ prev, next }: BrandPrevNextProps) {
  if (!prev && !next) return null

  return (
    <nav className="brand-prevnext" aria-label="Brand navigation">
      {prev ? (
        <Link href={`/brands/${prev.slug}`} className="brand-prevnext-link is-prev">
          <span className="brand-prevnext-dir" aria-hidden="true">
            ← Previous
          </span>
          <span className="brand-prevnext-name">{prev.name}</span>
        </Link>
      ) : (
        <span className="brand-prevnext-link is-disabled" aria-hidden="true" />
      )}

      {next ? (
        <Link href={`/brands/${next.slug}`} className="brand-prevnext-link is-next">
          <span className="brand-prevnext-dir" aria-hidden="true">
            Next →
          </span>
          <span className="brand-prevnext-name">{next.name}</span>
        </Link>
      ) : (
        <span className="brand-prevnext-link is-disabled" aria-hidden="true" />
      )}
    </nav>
  )
}
