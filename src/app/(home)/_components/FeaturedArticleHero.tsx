'use client'

/**
 * FeaturedArticleHero — het grote featured-article-blok bovenaan de contentkolom.
 */

import { ContentCard } from '@/components/ui'
import type { MediaImage } from '@/types/media'
import { useHomeHero } from './HomeHeroProvider'

export interface FeaturedArticleVM {
  href: string
  title: string
  hero?: MediaImage | null
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
      className="hp-featured-article"
      href={article.href}
      contentType="article"
      thumbImage={article.hero}
      thumbRole="listing-wide"
      thumbAlt={article.title}
      thumbRatio="landscape"
      featured
      eyebrow={article.meta}
      title={article.title}
      titleAs="h2"
    />
  )
}
