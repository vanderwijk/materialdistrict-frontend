import type { SitemapEntry, SitemapIndexEntry } from './types'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** WP ISO-datum → W3C datetime voor `<lastmod>`. */
export function formatLastmod(modified: string | undefined | null): string | undefined {
  if (!modified?.trim()) return undefined

  const parsed = Date.parse(modified)
  if (Number.isNaN(parsed)) return undefined

  return new Date(parsed).toISOString()
}

export function buildUrlSetXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const lastmod = formatLastmod(entry.lastmod)
      const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''

      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmodTag}\n  </url>`
    })
    .join('\n')

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls}\n` +
    '</urlset>\n'
  )
}

export function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const sitemaps = entries
    .map((entry) => {
      const lastmod = formatLastmod(entry.lastmod)
      const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''

      return `  <sitemap>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmodTag}\n  </sitemap>`
    })
    .join('\n')

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${sitemaps}\n` +
    '</sitemapindex>\n'
  )
}
