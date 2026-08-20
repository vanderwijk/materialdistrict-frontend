/**
 * MdImage — enige render-pad voor content-media op de site.
 * Uniforme pipeline: WP-renditie als bron → next/image → Vercel WebP.
 */

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import {
  IMAGE_POLICY,
  resolveImageUrl,
  shouldSkipOptimization,
  type ImageLike,
} from '@/lib/images'
import type { ImageRole } from '@/lib/images/image-policy'

export type MdImageSource = ImageLike | string | null | undefined

export interface MdImageProps {
  /** MediaImage of URL-string (WooCommerce, dashboard, …). */
  image?: MdImageSource
  /** Pre-resolved URL; slaat WP size-picking over. */
  src?: string | null
  role?: ImageRole
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  /**
   * Alleen true voor het waarschijnlijke LCP-beeld op de pagina.
   * Maximaal één per pagina.
   */
  priority?: boolean
  /** Override policy sizes (zeldzaam — bv. listing-mini 44px vs 56px). */
  sizes?: string
}

/**
 * Fallback aspect when WP/WooCommerce geeft geen width/height mee
 * (bv. Store API product images). Nooit 1×1 — dat maakt beelden onzichtbaar.
 */
const ROLE_FALLBACK_SIZE: Record<ImageRole, { width: number; height: number }> = {
  'listing-card': { width: 768, height: 512 },
  'listing-wide': { width: 1200, height: 675 },
  'listing-wide-full': { width: 1600, height: 700 },
  'listing-mini': { width: 96, height: 96 },
  'detail-hero': { width: 800, height: 1100 },
  'gallery-main': { width: 1200, height: 800 },
  'gallery-thumb': { width: 160, height: 160 },
  logo: { width: 200, height: 120 },
  avatar: { width: 64, height: 64 },
  'nav-thumb': { width: 96, height: 96 },
  lightbox: { width: 1600, height: 1200 },
}

export function MdImage({
  image,
  src,
  role = 'listing-card',
  alt,
  fill = false,
  width,
  height,
  className,
  priority = false,
  sizes: sizesOverride,
}: MdImageProps) {
  const resolved =
    image != null && image !== ''
      ? resolveImageUrl(image, role)
      : src
        ? resolveImageUrl(src, role)
        : null

  if (!resolved?.url) return null

  const policy = IMAGE_POLICY[role]
  const sizes = sizesOverride ?? policy.sizes
  const quality = policy.quality ?? 75
  const unoptimized =
    policy.unoptimized === true || shouldSkipOptimization(resolved.url)

  if (fill) {
    return (
      <Image
        src={resolved.url}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        unoptimized={unoptimized}
        className={cn(className)}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  const fallback = ROLE_FALLBACK_SIZE[role]
  const w = width ?? resolved.width ?? fallback.width
  const h = height ?? resolved.height ?? fallback.height

  return (
    <Image
      src={resolved.url}
      alt={alt}
      width={w}
      height={h}
      sizes={sizes}
      quality={quality}
      priority={priority}
      unoptimized={unoptimized}
      className={cn(className)}
    />
  )
}
