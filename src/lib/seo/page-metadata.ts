import type { Metadata } from 'next'
import type { Page } from '@/types/page'
import { canonicalPath } from './urls'

/**
 * Bouw een Next `Metadata`-object voor een statische contentpagina.
 *
 * - title / description / Open Graph komen uit de genormaliseerde
 *   Yoast-velden (`page.seo`), met fallback op de paginatitel.
 * - canonical = de FRONTEND-route (`canonicalPath`), NIET de Yoast-canonical:
 *   die wijst naar het oude WP-domein. De frontend-URL is de echte canonical.
 * - robots uit Yoast (index/follow). Een op `noindex` gezette pagina in WP
 *   blijft zo ook in de frontend noindex.
 *
 * Sessie 11 (29-05-2026).
 */
export function buildPageMetadata(page: Page, path: string): Metadata {
  const { seo } = page
  const title = seo.title || page.title
  const description = seo.description || undefined
  const canonical = canonicalPath(path)

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: seo.index, follow: seo.follow },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      type: 'website',
      url: canonical,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  }
}
