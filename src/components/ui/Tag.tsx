import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export type ContentType = 'material' | 'article' | 'event' | 'book' | 'brand' | 'member'

interface TagProps {
  contentType: ContentType
  children?: ReactNode
  className?: string
}

/**
 * Default labels per content-type. Worden gebruikt als er geen children zijn.
 */
const DEFAULT_LABELS: Record<ContentType, string> = {
  material: 'Material',
  article: 'Article',
  event: 'Event',
  book: 'Book',
  brand: 'Brand',
  member: 'Insider',
}

/**
 * Content-type tag — uit globals.css §10.
 * Pale background + dark text per content-type.
 *
 * @example
 *   <Tag contentType="material" />              // toont "Material"
 *   <Tag contentType="event">Featured event</Tag>
 */
export function Tag({ contentType, children, className }: TagProps) {
  return (
    <span className={cn('ct-tag', `ct-${contentType}`, className)}>
      {children ?? DEFAULT_LABELS[contentType]}
    </span>
  )
}
