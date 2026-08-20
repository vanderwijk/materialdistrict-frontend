/**
 * ArticlePrevNext
 * ----------------------------------------------------------------------
 * "Vorige / volgende article"-navigatie op de article-detail-page.
 */

import Link from 'next/link'
import { MdImage } from '@/components/ui/MdImage'

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
              <MdImage src={prev.thumbnailUrl} role="nav-thumb" alt="" />
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
              <MdImage src={next.thumbnailUrl} role="nav-thumb" alt="" />
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
