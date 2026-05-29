'use client'

/**
 * FeaturedArticleHero — het grote "FEATURED ARTICLE"-blok bovenaan de
 * contentkolom (sessie 10). Toont wanneer de promo-hero NIET zichtbaar is
 * (uitgelogd-en-weggeklikt, of ingelogd) — de tegenpool van PromoHero, via
 * HomeHeroProvider.
 *
 * Krijgt één al-gemapt, serializeerbaar artikel van de server-page. De titel
 * hergebruikt de bestaande `.ed-featured-title`-typografie.
 */

import Link from 'next/link'
import { useHomeHero } from './HomeHeroProvider'

export interface FeaturedArticleVM {
  href: string
  title: string
  thumbUrl?: string
  /** Bv. "12 Apr 2026 · Article". */
  meta: string
}

interface FeaturedArticleHeroProps {
  article: FeaturedArticleVM | null
}

export function FeaturedArticleHero({ article }: FeaturedArticleHeroProps) {
  const { showPromo } = useHomeHero()
  if (showPromo || !article) return null

  return (
    <Link href={article.href} className="hp-hero-article">
      <div className="hp-hero-article-thumb">
        {article.thumbUrl && (
          <img
            src={article.thumbUrl}
            alt=""
            className="hp-hero-article-img"
            loading="eager"
          />
        )}
        <span className="hp-hero-article-badge">Featured article</span>
      </div>
      <div className="hp-hero-article-meta">{article.meta}</div>
      <h2 className="ed-featured-title">{article.title}</h2>
    </Link>
  )
}
