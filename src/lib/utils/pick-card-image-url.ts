/**
 * Kiest een WP-renditie voor cards/thumbs/heroes i.p.v. het full-size
 * `sourceUrl`-origineel.
 *
 * @deprecated Prefer `<MdImage image={…} role="…" />` or `resolveImageUrl()`.
 */

import { resolveImageUrl, type ImageLike } from '@/lib/images'
import type { ImageRole } from '@/lib/images/image-policy'

export type CardImagePrefer = 'card' | 'thumb' | 'hero' | 'logo'

const PREFER_TO_ROLE: Record<CardImagePrefer, ImageRole> = {
  card: 'listing-card',
  thumb: 'listing-mini',
  hero: 'listing-wide',
  logo: 'logo',
}

/**
 * @param prefer
 * - `card` — listing-card rendities
 * - `thumb` — listing-mini
 * - `hero` — listing-wide
 * - `logo` — logo
 */
export function pickCardImageUrl(
  image: ImageLike,
  prefer: CardImagePrefer = 'card',
): string | undefined {
  return resolveImageUrl(image, PREFER_TO_ROLE[prefer])?.url
}
