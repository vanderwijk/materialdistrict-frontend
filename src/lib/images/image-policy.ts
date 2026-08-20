/**
 * Centrale image-policy — enige plek om delivery en WP-renditie per context
 * te wijzigen. Alle UI rendert via <MdImage>, die deze policy leest.
 */

import type { ImageSizeKey } from '@/types/media'

export type ImageRole =
  | 'listing-card'
  | 'listing-wide'
  | 'listing-mini'
  | 'detail-hero'
  | 'gallery-main'
  | 'gallery-thumb'
  | 'logo'
  | 'avatar'
  | 'nav-thumb'
  | 'lightbox'

/** Site-breed: WP-rendities direct van CDN, zonder Vercel image optimizer. */
export type ImageDeliveryMode = 'direct'

export interface ImageRolePolicy {
  wpSizes: ImageSizeKey[]
  mode: ImageDeliveryMode
}

export const IMAGE_POLICY: Record<ImageRole, ImageRolePolicy> = {
  'listing-card': {
    mode: 'direct',
    wpSizes: ['medium_large', 'large', 'medium', 'thumbnail'],
  },
  'listing-wide': {
    mode: 'direct',
    wpSizes: ['large', '1536x1536', 'medium_large', 'medium'],
  },
  'listing-mini': {
    mode: 'direct',
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
  },
  'detail-hero': {
    mode: 'direct',
    wpSizes: ['1536x1536', 'large', 'medium_large', 'medium'],
  },
  'gallery-main': {
    mode: 'direct',
    wpSizes: ['large', '1536x1536', 'medium_large', 'medium'],
  },
  'gallery-thumb': {
    mode: 'direct',
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
  },
  logo: {
    mode: 'direct',
    wpSizes: ['medium', 'thumbnail', 'medium_large'],
  },
  avatar: {
    mode: 'direct',
    wpSizes: ['thumbnail', 'medium'],
  },
  'nav-thumb': {
    mode: 'direct',
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
  },
  lightbox: {
    mode: 'direct',
    wpSizes: ['full', '1536x1536', 'large', 'medium_large'],
  },
}
