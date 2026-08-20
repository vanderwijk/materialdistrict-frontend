/**
 * Centrale image-policy — enige plek voor WP-bron, sizes en quality per context.
 * Alle UI rendert via <MdImage>, die deze policy leest.
 *
 * Delivery is uniform: next/image → Vercel Image Optimization (WebP).
 * Differentiatie alleen in bron-renditie, sizes en laadprioriteit.
 */

import type { ImageSizeKey } from '@/types/media'

export type ImageRole =
  | 'listing-card'
  | 'listing-wide'
  | 'listing-wide-full'
  | 'listing-mini'
  | 'detail-hero'
  | 'gallery-main'
  | 'gallery-thumb'
  | 'logo'
  | 'avatar'
  | 'nav-thumb'
  | 'lightbox'

export interface ImageRolePolicy {
  /** WP-renditie-volgorde (input voor Vercel) */
  wpSizes: ImageSizeKey[]
  /** Verplicht bij fill — voorkomt impliciet 100vw */
  sizes: string
  /** Next.js quality (default 75) */
  quality?: number
  /**
   * Skip Vercel optimizer. Alleen voor asset-types die dat nodig hebben;
   * nooit route-gebaseerd.
   */
  unoptimized?: boolean
}

export const IMAGE_POLICY: Record<ImageRole, ImageRolePolicy> = {
  'listing-card': {
    // De generieke card is 16:9; `listing-article` is een al gecropte 11:5-
    // rendition en is daarom ongeschikt voor materials, talks en events.
    wpSizes: ['large', 'medium_large', 'medium', 'thumbnail'],
    sizes:
      '(max-width: 480px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 22px), (max-width: 1280px) 25vw, 308px',
    quality: 75,
  },
  'listing-wide': {
    wpSizes: ['1536x1536', 'large', 'medium_large', 'medium'],
    sizes: '(max-width: 900px) 100vw, 70vw',
    quality: 75,
  },
  'listing-wide-full': {
    wpSizes: ['1536x1536', 'large', 'medium_large', 'medium'],
    sizes: '100vw',
    quality: 75,
  },
  'listing-mini': {
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
    sizes: '56px',
    quality: 75,
  },
  'detail-hero': {
    wpSizes: ['1536x1536', 'large', 'medium_large', 'medium'],
    sizes: '(max-width: 768px) 100vw, 960px',
    quality: 75,
  },
  'gallery-main': {
    wpSizes: ['1536x1536', 'large', 'medium_large', 'medium'],
    sizes: '(max-width: 768px) 100vw, 800px',
    quality: 75,
  },
  'gallery-thumb': {
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
    sizes: '80px',
    quality: 75,
  },
  logo: {
    wpSizes: ['medium', 'thumbnail', 'medium_large'],
    sizes: '(max-width: 520px) 45vw, (max-width: 900px) 30vw, 140px',
    quality: 75,
  },
  avatar: {
    wpSizes: ['thumbnail', 'medium'],
    sizes: '32px',
    quality: 75,
  },
  'nav-thumb': {
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
    sizes: '72px',
    quality: 75,
  },
  lightbox: {
    wpSizes: ['full', '1536x1536', 'large', 'medium_large'],
    sizes: '100vw',
    quality: 75,
  },
}

/**
 * Asset-based: alleen formats/hosts overslaan die de optimizer niet zinvol
 * kan verwerken. WebP/AVIF en lokale rasterbeelden blijven geoptimaliseerd:
 * ook daarbij zijn responsive resizing en srcsets nodig.
 */
export function shouldSkipOptimization(url: string): boolean {
  const path = url.split('?')[0]?.toLowerCase() ?? ''
  if (path.endsWith('.svg')) return true
  if (path.endsWith('.gif')) return true
  // External video thumbs (YouTube) — not on our remotePatterns for transforms
  if (path.includes('img.youtube.com') || path.includes('i.ytimg.com')) return true
  return false
}
