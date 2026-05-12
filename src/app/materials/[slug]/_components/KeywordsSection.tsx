/**
 * KeywordsSection
 * ----------------------------------------------------------------------
 * Renders de tags van een material als klikbare pills. Klik op een pill
 * navigeert naar /materials met die tag als search-query, zodat de
 * gebruiker gerelateerde materials kan vinden.
 *
 * Data is server-side opgehaald via `getTerms('tags', { include })` —
 * verwacht hier dus al de gehumaniseerde objecten met name/slug.
 *
 * Render-strategie: bij een lege keywords-array rendert de component
 * helemaal niets (geen kopje, geen lege state).
 */

import Link from 'next/link'

export interface KeywordEntry {
  /** Display-naam, bv. "wood fiber" */
  name: string
  /** Slug voor de filter-URL, bv. "wood-fiber" */
  slug: string
}

export interface KeywordsSectionProps {
  keywords: KeywordEntry[]
}

export function KeywordsSection({ keywords }: KeywordsSectionProps) {
  if (keywords.length === 0) return null

  return (
    <section className="mat-keywords" aria-labelledby="keywords-title">
      <h2 id="keywords-title" className="mat-section-eyebrow">
        Keywords
      </h2>
      <ul className="mat-keywords-list" role="list">
        {keywords.map((kw) => (
          <li key={kw.slug}>
            {/* Voor v1 linken we naar een vrije search met de naam; zodra
                FacetWP een `tag`-facet aanbiedt, switchen naar tag=<slug>. */}
            <Link
              href={`/materials?q=${encodeURIComponent(kw.name)}`}
              className="mat-keywords-pill"
            >
              {kw.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
