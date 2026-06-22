/**
 * Herschrijft legacy WordPress upload-URL's naar de media-CDN.
 *
 * Na de cms/S3-migratie staan nieuwe uploads op media.materialdistrict.com,
 * maar localStorage (recently viewed) en oude DB/meta kunnen nog
 * materialdistrict.com of cms.materialdistrict.com bevatten. De CSP staat
 * alleen media.cms/gravatar toe — normaliseren voorkomt geblokkeerde thumbs.
 */

const MEDIA_UPLOADS_BASE = 'https://media.materialdistrict.com/wp-content/uploads'

const LEGACY_UPLOAD_PREFIXES = [
  'https://materialdistrict.com/wp-content/uploads',
  'https://www.materialdistrict.com/wp-content/uploads',
  'http://materialdistrict.com/wp-content/uploads',
  'http://www.materialdistrict.com/wp-content/uploads',
  'https://cms.materialdistrict.com/wp-content/uploads',
  'http://cms.materialdistrict.com/wp-content/uploads',
] as const

export function normalizeMediaUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null
  for (const prefix of LEGACY_UPLOAD_PREFIXES) {
    if (url.startsWith(prefix)) {
      return MEDIA_UPLOADS_BASE + url.slice(prefix.length)
    }
  }
  return url
}
