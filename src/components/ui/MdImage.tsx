/**
 * MdImage — enige render-pad voor content-media op de site.
 * Serveert WP-rendities direct van CDN (geen Vercel /_next/image).
 */

import { cn } from '@/lib/utils/cn'
import { resolveImageUrl, type ImageLike } from '@/lib/images'
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
  loading?: 'lazy' | 'eager'
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
  loading = 'lazy',
}: MdImageProps) {
  const resolved =
    image != null && image !== ''
      ? resolveImageUrl(image, role)
      : src
        ? resolveImageUrl(src, role)
        : null

  if (!resolved?.url) return null

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved.url}
        alt={alt}
        loading={loading}
        decoding="async"
        width={resolved.width}
        height={resolved.height}
        className={cn(className)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved.url}
      alt={alt}
      loading={loading}
      decoding="async"
      width={width ?? resolved.width}
      height={height ?? resolved.height}
      className={cn(className)}
    />
  )
}
