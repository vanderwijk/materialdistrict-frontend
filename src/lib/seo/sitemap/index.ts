import { getProductionSiteUrl } from '@/lib/seo/host'

import {
  getArticlesSitemapEntries,
  getBooksSitemapEntries,
  getBrandsSitemapEntries,
  getEventsSitemapEntries,
  getMaterialsSitemapEntries,
  getStaticSitemapEntries,
  getTalksSitemapEntries,
} from './entries'
import { buildSitemapIndexXml, buildUrlSetXml } from './xml'

/** Child-sitemaps die in de index staan — één per content-type voor GSC-inzicht. */
export const SITEMAP_CHILDREN = [
  'sitemap-static.xml',
  'sitemap-materials.xml',
  'sitemap-articles.xml',
  'sitemap-brands.xml',
  'sitemap-events.xml',
  'sitemap-talks.xml',
  'sitemap-books.xml',
] as const

export const SITEMAP_REVALIDATE = 3600

const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': `public, s-maxage=${SITEMAP_REVALIDATE}, stale-while-revalidate=86400`,
} as const

function childSitemapUrl(filename: string): string {
  return `${getProductionSiteUrl()}/${filename}`
}

export function createSitemapIndexResponse(): Response {
  const xml = buildSitemapIndexXml(
    SITEMAP_CHILDREN.map((filename) => ({
      loc: childSitemapUrl(filename),
    })),
  )

  return new Response(xml, { headers: XML_HEADERS })
}

export function createSitemapResponse(
  getEntries: () => Promise<Parameters<typeof buildUrlSetXml>[0]>,
): () => Promise<Response> {
  return async function GET() {
    const entries = await getEntries()
    const xml = buildUrlSetXml(entries)
    return new Response(xml, { headers: XML_HEADERS })
  }
}

export const sitemapHandlers = {
  static: createSitemapResponse(getStaticSitemapEntries),
  materials: createSitemapResponse(getMaterialsSitemapEntries),
  articles: createSitemapResponse(getArticlesSitemapEntries),
  brands: createSitemapResponse(getBrandsSitemapEntries),
  events: createSitemapResponse(getEventsSitemapEntries),
  talks: createSitemapResponse(getTalksSitemapEntries),
  books: createSitemapResponse(getBooksSitemapEntries),
} as const
