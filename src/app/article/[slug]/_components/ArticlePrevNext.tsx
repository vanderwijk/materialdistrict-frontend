/**
 * ArticlePrevNext
 * ----------------------------------------------------------------------
 * "Vorige / volgende article"-navigatie op de article-detail-page.
 * Server-vriendelijk en stateless — de page berekent de buren uit de
 * (datum-gesorteerde) article-lijst en geeft ze (incl. thumbnail) als
 * props mee. Geen client-fetch, geen context.
 *
 * §F2.12 P2: zelfde thumbnail-kaartstijl als material-detail
 * (PrevNextNavigation) — hergebruikt de gedeelde `.mat-prevnext-*`-CSS,
 * zodat article/material identiek ogen. Toont een placeholder-tile als
 * een buur geen hero heeft.
 *
 * Rendert niets als er geen enkele buur is.
 */

import Link from 'next/link'

export interface ArticlePrevNextNeighbour {
  slug: string
  title: string
  thumbnailUrl: string | null
}

export interface ArticlePrevNextProps {
  prev: ArticlePrevNextNeighbour | null
  next: ArticlePrevNextNeighbour | null
}

export function ArticlePrevNext({ prev, next }: ArticlePrevNextProps) {
  if (!prev && !next) return null

  return (
    <nav className="mat-prevnext" aria-label="Article navigation">
      {prev ? (
        <Link href={`/article/${prev.slug}`} className="mat-prevnext-link">
          <span className="mat-prevnext-arrow" aria-hidden="true">
            ←
          </span>
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {prev.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prev.thumbnailUrl} alt="" />
            ) : (
              <span className="mat-prevnext-thumb-placeholder" />
            )}
          </span>
          <span className="mat-prevnext-label">
            <span className="mat-prevnext-eyebrow">Previous</span>
            <span className="mat-prevnext-title">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span className="mat-prevnext-spacer" aria-hidden="true" />
      )}

      {next ? (
        <Link
          href={`/article/${next.slug}`}
          className="mat-prevnext-link mat-prevnext-link--right"
        >
          <span className="mat-prevnext-label">
            <span className="mat-prevnext-eyebrow">Next</span>
            <span className="mat-prevnext-title">{next.title}</span>
          </span>
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {next.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={next.thumbnailUrl} alt="" />
            ) : (
              <span className="mat-prevnext-thumb-placeholder" />
            )}
          </span>
          <span className="mat-prevnext-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ) : (
        <span className="mat-prevnext-spacer" aria-hidden="true" />
      )}
    </nav>
  )
}
