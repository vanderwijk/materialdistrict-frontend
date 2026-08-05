/**
 * Kiest een WP-renditie voor cards/thumbs/heroes i.p.v. het full-size
 * `sourceUrl`-origineel. Zelfde fallback-volgorde als MaterialCard.
 */

import type { MediaImage } from '@/types/media'
import { normalizeMediaUrl } from './normalize-media-url'

type ImageLike = Pick<MediaImage, 'sourceUrl' | 'sizes'> | null | undefined

export type CardImagePrefer = 'card' | 'thumb' | 'hero' | 'logo'

/**
 * @param prefer
 * - `card` — medium_large → large → medium (lijsttegels)
 * - `thumb` — medium → thumbnail (sidebar / strip)
 * - `hero` — large → 1536 → medium_large (brede bands)
 * - `logo` — medium → thumbnail (merklogo's)
 */
export function pickCardImageUrl(
  image: ImageLike,
  prefer: CardImagePrefer = 'card',
): string | undefined {
  if (!image) return undefined

  const sizes = image.sizes ?? {}
  let raw: string | undefined

  switch (prefer) {
    case 'thumb':
      raw =
        sizes.medium?.url ??
        sizes.thumbnail?.url ??
        sizes.medium_large?.url ??
        sizes.large?.url ??
        image.sourceUrl
      break
    case 'hero':
      raw =
        sizes.large?.url ??
        sizes['1536x1536']?.url ??
        sizes.medium_large?.url ??
        sizes.medium?.url ??
        image.sourceUrl
      break
    case 'logo':
      raw =
        sizes.medium?.url ??
        sizes.thumbnail?.url ??
        sizes.medium_large?.url ??
        image.sourceUrl
      break
    default:
      raw =
        sizes.medium_large?.url ??
        sizes.large?.url ??
        sizes.medium?.url ??
        image.sourceUrl
  }

  if (!raw) return undefined
  return normalizeMediaUrl(raw) ?? raw
}
