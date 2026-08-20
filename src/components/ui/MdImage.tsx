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

  const w = width ?? resolved.width ?? 1
  const h = height ?? resolved.height ?? 1

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
