'use client'

/**
 * FeaturedArticleHero — het grote featured-article-blok bovenaan de
 * contentkolom. Toont wanneer de promo-hero NIET zichtbaar is
 * (uitgelogd-en-weggeklikt, of ingelogd) — de tegenpool van PromoHero, via
 * HomeHeroProvider.
 *
 * Herbouwd als een grote standaard-tegel (`<ContentCard>`, landscape-ratio,
 * "Featured"-pill) i.p.v. de bespoke `.hp-hero-article`-opzet. Daardoor staat
 * de featured article in dezelfde kaart-stijl en met dezelfde hover als de
 * overige tegels — geen eenmalige titel-naar-blauw-hover meer.
 */

import { ContentCard } from '@/components/ui'
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
    <ContentCard
      href={article.href}
      contentType="article"
      thumbSrc={article.thumbUrl}
      thumbAlt={article.title}
      thumbRatio="landscape"
      featured
      eyebrow={article.meta}
      title={article.title}
      titleAs="h2"
    />
  )
}
