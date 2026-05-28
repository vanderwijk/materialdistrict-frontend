/**
 * ArticlePrevNext
 * ----------------------------------------------------------------------
 * "Vorige / volgende article"-navigatie onderaan de article-detail-page.
 * Parallel aan BrandPrevNext: server-vriendelijk en stateless — de page
 * berekent de buren uit de (datum-gesorteerde) article-lijst en geeft ze
 * als props mee. Geen client-fetch, geen context.
 *
 * Sessie 6. Rendert niets als er geen enkele buur is.
 */

import Link from 'next/link'

export interface ArticlePrevNextNeighbour {
  slug: string
  title: string
}

export interface ArticlePrevNextProps {
  prev: ArticlePrevNextNeighbour | null
  next: ArticlePrevNextNeighbour | null
}

export function ArticlePrevNext({ prev, next }: ArticlePrevNextProps) {
  if (!prev && !next) return null

  return (
    <nav className="article-prevnext" aria-label="Article navigation">
      {prev ? (
        <Link
          href={`/articles/${prev.slug}`}
          className="article-prevnext-link is-prev"
        >
          <span className="article-prevnext-dir" aria-hidden="true">
            ← Previous article
          </span>
          <span className="article-prevnext-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="article-prevnext-link is-disabled" aria-hidden="true" />
      )}

      {next ? (
        <Link
          href={`/articles/${next.slug}`}
          className="article-prevnext-link is-next"
        >
          <span className="article-prevnext-dir" aria-hidden="true">
            Next article →
          </span>
          <span className="article-prevnext-title">{next.title}</span>
        </Link>
      ) : (
        <span className="article-prevnext-link is-disabled" aria-hidden="true" />
      )}
    </nav>
  )
}
