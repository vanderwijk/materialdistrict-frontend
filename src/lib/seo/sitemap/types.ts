export interface SitemapEntry {
  loc: string
  lastmod?: string
}

export interface SitemapIndexEntry {
  loc: string
  lastmod?: string
}

export interface WPSitemapPost {
  slug: string
  modified: string
}
