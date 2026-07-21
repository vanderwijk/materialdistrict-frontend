import type { BookmarkType } from '@/types/dashboard'

/** Plural labels for bookmark tabs and filters. */
export const BOOKMARK_TYPE_TAB_LABEL: Record<BookmarkType, string> = {
  materials: 'Materials',
  articles: 'Stories',
  brands: 'Brands',
  talks: 'Talks',
  events: 'Events',
  books: 'Books',
}

/** Singular visitor-facing type name (e.g. board picker hint, summary counts). */
export const BOOKMARK_TYPE_SINGULAR: Record<BookmarkType, string> = {
  materials: 'material',
  articles: 'story',
  brands: 'brand',
  talks: 'talk',
  events: 'event',
  books: 'book',
}

/** Plural visitor-facing type name (e.g. board summary counts). */
export const BOOKMARK_TYPE_PLURAL: Record<BookmarkType, string> = {
  materials: 'materials',
  articles: 'stories',
  brands: 'brands',
  talks: 'talks',
  events: 'events',
  books: 'books',
}

/** Map CMS/API labels to visitor-facing copy. Internal type key stays `articles`. */
export function bookmarkItemLabel(type: BookmarkType, label?: string): string {
  if (type === 'articles') return 'Story'
  const trimmed = label?.trim()
  if (trimmed) return trimmed
  const singular = BOOKMARK_TYPE_SINGULAR[type]
  return singular.charAt(0).toUpperCase() + singular.slice(1)
}
