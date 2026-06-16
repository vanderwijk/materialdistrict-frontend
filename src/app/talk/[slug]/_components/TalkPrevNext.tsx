/**
 * TalkPrevNext
 * ----------------------------------------------------------------------
 * "Vorige / volgende talk"-navigatie onderaan de talk-detail-page. Mirror
 * van ArticlePrevNext: server-vriendelijk en stateless — de page berekent
 * de buren uit de (datum-gesorteerde) talk-lijst en geeft ze als props mee.
 * Hergebruikt de gedeelde `article-prevnext`-CSS.
 *
 * Sessie 7. Rendert niets als er geen enkele buur is.
 */

import Link from 'next/link'

export interface TalkPrevNextNeighbour {
  slug: string
  title: string
}

export interface TalkPrevNextProps {
  prev: TalkPrevNextNeighbour | null
  next: TalkPrevNextNeighbour | null
}

export function TalkPrevNext({ prev, next }: TalkPrevNextProps) {
  if (!prev && !next) return null

  return (
    <nav className="article-prevnext" aria-label="Talk navigation">
      {prev ? (
        <Link
          href={`/talk/${prev.slug}`}
          className="article-prevnext-link is-prev"
        >
          <span className="article-prevnext-dir" aria-hidden="true">
            ← Previous talk
          </span>
          <span className="article-prevnext-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="article-prevnext-link is-disabled" aria-hidden="true" />
      )}

      {next ? (
        <Link
          href={`/talk/${next.slug}`}
          className="article-prevnext-link is-next"
        >
          <span className="article-prevnext-dir" aria-hidden="true">
            Next talk →
          </span>
          <span className="article-prevnext-title">{next.title}</span>
        </Link>
      ) : (
        <span className="article-prevnext-link is-disabled" aria-hidden="true" />
      )}
    </nav>
  )
}
