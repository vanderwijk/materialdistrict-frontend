import type { Metadata } from 'next'
import type { Page } from '@/types/page'
import { openGraphSite } from './site'
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
 *
 * Description fallback (19-08-2026): when the Yoast field is empty the page
 * used to ship with no description and no `og:description` at all — Our
 * Mission was the case that surfaced it. Rather than fill one field in WP and
 * leave the same hole open for every other page, we fall back to the opening
 * of the page body. An editor-written description still wins whenever there
 * is one.
 */

/** Roughly the length Google renders before truncating. */
const DESCRIPTION_MAX = 155

/**
 * First readable sentence(s) of a page body, as a meta description.
 * Strips tags and entities, collapses whitespace, and cuts on a word
 * boundary so the text never ends mid-word.
 */
function descriptionFromContent(contentHtml: string): string | undefined {
  const text = contentHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '\u2019')
    .replace(/&quot;/g, '"')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return undefined
  if (text.length <= DESCRIPTION_MAX) return text

  const cut = text.slice(0, DESCRIPTION_MAX)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd()}\u2026`
}
export function buildPageMetadata(page: Page, path: string): Metadata {
  const { seo } = page
  const title = seo.title || page.title
  const description =
    seo.description || descriptionFromContent(page.contentHtml)
  const canonical = canonicalPath(path)

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: seo.index, follow: seo.follow },
    openGraph: {
      ...openGraphSite,
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      type: 'website',
      url: canonical,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  }
}
