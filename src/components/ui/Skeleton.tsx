import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils/cn'

export type SkeletonVariant = 'text' | 'title' | 'thumb' | 'circle' | 'plain'

interface SkeletonProps {
  /** 'text' | 'title' | 'thumb' (16:9) | 'circle' | 'plain' (geen size-class). */
  variant?: SkeletonVariant
  /** Override de breedte. Bv. "60%" of "120px". */
  width?: string | number
  /** Override de hoogte. */
  height?: string | number
  className?: string
  /** A11y-label voor screen-readers. Default: "Loading…". */
  label?: string
}

/**
 * Loading skeleton — uit globals.css §21.
 * Shimmer animatie wordt automatisch uitgeschakeld bij prefers-reduced-motion.
 *
 * @example
 *   <Skeleton variant="title" width="70%" />
 *   <Skeleton variant="thumb" />
 *   <Skeleton variant="circle" width={48} height={48} />
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  label = 'Loading…',
}: SkeletonProps) {
  const style: CSSProperties = {}
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        'skeleton',
        variant !== 'plain' && `skeleton-${variant}`,
        className,
      )}
      style={style}
      role="status"
      aria-label={label}
      aria-live="polite"
    />
  )
}
