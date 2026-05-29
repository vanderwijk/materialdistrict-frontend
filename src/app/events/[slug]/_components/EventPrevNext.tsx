/**
 * EventPrevNext — "vorige / volgende event"-navigatie onderaan de
 * event-detailpagina. Parallel aan ArticlePrevNext: stateless, de page
 * berekent de buren uit de gesorteerde events-lijst en geeft ze als props.
 *
 * Sessie 8. Rendert niets als er geen enkele buur is.
 */

import Link from 'next/link'

export interface EventPrevNextNeighbour {
  slug: string
  title: string
}

export interface EventPrevNextProps {
  prev: EventPrevNextNeighbour | null
  next: EventPrevNextNeighbour | null
}

export function EventPrevNext({ prev, next }: EventPrevNextProps) {
  if (!prev && !next) return null

  return (
    <nav className="article-prevnext" aria-label="Event navigation">
      {prev ? (
        <Link href={`/events/${prev.slug}`} className="article-prevnext-link is-prev">
          <span className="article-prevnext-dir" aria-hidden="true">
            ← Previous event
          </span>
          <span className="article-prevnext-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="article-prevnext-link is-disabled" aria-hidden="true" />
      )}

      {next ? (
        <Link href={`/events/${next.slug}`} className="article-prevnext-link is-next">
          <span className="article-prevnext-dir" aria-hidden="true">
            Next event →
          </span>
          <span className="article-prevnext-title">{next.title}</span>
        </Link>
      ) : (
        <span className="article-prevnext-link is-disabled" aria-hidden="true" />
      )}
    </nav>
  )
}
