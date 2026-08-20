/**
 * Kiest de juiste WP-renditie-URL voor een image + context (role).
 * Plain URL-strings (WooCommerce, dashboard) worden genormaliseerd en
 * ongewijzigd teruggegeven.
 */

import { normalizeMediaUrl } from '@/lib/utils/normalize-media-url'
import type { MediaImage } from '@/types/media'
import { IMAGE_POLICY, type ImageRole } from './image-policy'

export type ImageLike = Pick<MediaImage, 'sourceUrl' | 'sizes'> | null | undefined

export interface ResolvedImage {
  url: string
  width?: number
  height?: number
}

function pickWpSize(image: ImageLike, role: ImageRole): ResolvedImage | null {
  if (!image) return null

  const sizes = image.sizes ?? {}
  for (const key of IMAGE_POLICY[role].wpSizes) {
    const size = sizes[key]
    if (size?.url) {
      const url = normalizeMediaUrl(size.url) ?? size.url
      return { url, width: size.width, height: size.height }
    }
  }

  if (image.sourceUrl) {
    const url = normalizeMediaUrl(image.sourceUrl) ?? image.sourceUrl
    return { url }
  }

  return null
}

/**
 * Resolveert een MediaImage of URL-string naar een serveerbare URL.
 * - MediaImage → WP-renditie volgens role
 * - string → genormaliseerde URL (geen size-picking)
 */
export function resolveImageUrl(
  image: ImageLike | string | null | undefined,
  role: ImageRole = 'listing-card',
): ResolvedImage | null {
  if (!image) return null

  if (typeof image === 'string') {
    const url = normalizeMediaUrl(image) ?? image
    return url ? { url } : null
  }

  return pickWpSize(image, role)
}
