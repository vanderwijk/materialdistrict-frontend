import type { Board, BoardItem, BookmarkType } from '@/types/dashboard'

const SUMMARY_TYPES: { type: BookmarkType; singular: string; plural: string }[] = [
  { type: 'materials', singular: 'material', plural: 'materials' },
  { type: 'articles', singular: 'article', plural: 'articles' },
  { type: 'books', singular: 'book', plural: 'books' },
  { type: 'events', singular: 'event', plural: 'events' },
  { type: 'talks', singular: 'talk', plural: 'talks' },
  { type: 'brands', singular: 'brand', plural: 'brands' },
]

function countByType(items: BoardItem[]): Partial<Record<BookmarkType, number>> {
  const counts: Partial<Record<BookmarkType, number>> = {}
  for (const item of items) {
    counts[item.type] = (counts[item.type] ?? 0) + 1
  }
  return counts
}

function formatCountParts(counts: Partial<Record<BookmarkType, number>>): string {
  const parts = SUMMARY_TYPES.flatMap(({ type, singular, plural }) => {
    const n = counts[type] ?? 0
    if (n <= 0) return []
    return [`${n} ${n === 1 ? singular : plural}`]
  })
  return parts.length > 0 ? parts.join(' · ') : '0 items'
}

/** Summary from board detail items (most accurate on the detail page). */
export function formatBoardSummaryFromItems(items: BoardItem[]): string {
  return formatCountParts(countByType(items))
}

/** Summary from board list API counts (boards overview / picker). */
export function formatBoardSummaryFromBoard(board: Board): string {
  return formatCountParts({
    materials: board.materialCount,
    articles: board.articleCount,
    books: board.bookCount ?? 0,
    events: board.eventCount ?? 0,
    talks: board.talkCount ?? 0,
    brands: board.brandCount ?? 0,
  })
}
