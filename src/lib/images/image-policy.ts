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
    wpSizes: ['listing-article', 'medium_large', 'medium', 'thumbnail'],
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    quality: 75,
  },
  'listing-wide': {
    wpSizes: ['large', 'medium_large', '1536x1536', 'medium'],
    sizes: '(max-width: 900px) 100vw, 70vw',
    quality: 75,
  },
  'listing-wide-full': {
    wpSizes: ['large', 'medium_large', '1536x1536', 'medium'],
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
    quality: 80,
  },
  'gallery-main': {
    wpSizes: ['large', '1536x1536', 'medium_large', 'medium'],
    sizes: '(max-width: 768px) 100vw, 800px',
    quality: 80,
  },
  'gallery-thumb': {
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
    sizes: '80px',
    quality: 70,
  },
  logo: {
    wpSizes: ['medium', 'thumbnail', 'medium_large'],
    sizes: '(max-width: 520px) 45vw, (max-width: 900px) 30vw, 140px',
    quality: 80,
  },
  avatar: {
    wpSizes: ['thumbnail', 'medium'],
    sizes: '32px',
    quality: 70,
  },
  'nav-thumb': {
    wpSizes: ['thumbnail', 'medium', 'medium_large'],
    sizes: '72px',
    quality: 70,
  },
  lightbox: {
    wpSizes: ['full', '1536x1536', 'large', 'medium_large'],
    sizes: '100vw',
    quality: 85,
  },
}

/**
 * Asset-based: skip Vercel optimizer for formats that don't benefit
 * (or already are next-gen / tiny / static).
 */
export function shouldSkipOptimization(url: string): boolean {
  const path = url.split('?')[0]?.toLowerCase() ?? ''
  if (path.endsWith('.svg')) return true
  if (path.endsWith('.gif')) return true
  if (path.endsWith('.webp')) return true
  if (path.endsWith('.avif')) return true
  // Local static assets under /images/ (mission page, etc.)
  if (path.startsWith('/images/')) return true
  // External video thumbs (YouTube) — not on our remotePatterns for transforms
  if (path.includes('img.youtube.com') || path.includes('i.ytimg.com')) return true
  return false
}
