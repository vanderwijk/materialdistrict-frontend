/**
 * Canonical site identity for metadata + JSON-LD.
 *
 * Next.js replaces a page-level `openGraph` object wholesale instead of
 * merging field-by-field with the root layout. Any page that sets
 * `openGraph` must therefore repeat `openGraphSite` or `og:site_name`
 * disappears from the HTML — including the homepage Google uses for the
 * displayed site name.
 */

export const SITE_NAME = 'MaterialDistrict'

/** Spaced / short forms Google may fall back to; preference stays SITE_NAME. */
export const SITE_NAME_ALTERNATES = [
  'Material District',
  'MD',
  'materialdistrict.com',
] as const

export const openGraphSite = {
  siteName: SITE_NAME,
  locale: 'en_US',
} as const
