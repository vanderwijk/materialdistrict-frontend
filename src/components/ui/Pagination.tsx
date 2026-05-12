'use client'

import { IconChevronLeft, IconChevronRight } from './icons'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Types
// ============================================================

interface PaginationProps {
  /** Huidig pagina-nummer (1-based). */
  currentPage: number
  /** Totaal aantal pagina's. */
  totalPages: number
  /** Callback bij klik op een pagina-knop of prev/next. */
  onPageChange: (page: number) => void
  /**
   * Hoeveel page-numbers er rond de huidige pagina worden getoond.
   * Default: 1 (toont bv. 1 ... 4 [5] 6 ... 10).
   */
  siblingCount?: number
  className?: string
  ariaLabel?: string
}

// ============================================================
// Helper
// ============================================================

/**
 * Geeft de zichtbare pagina-nummers terug, met `null` voor "..."-ellipsis.
 *
 * Voorbeeld output bij currentPage=5, totalPages=10, siblingCount=1:
 *   [1, null, 4, 5, 6, null, 10]
 */
function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): Array<number | null> {
  const totalPageNumbers = siblingCount * 2 + 5
  // Eerste, laatste, current, en siblings — plus 2 voor ellipsis-slots
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  const result: Array<number | null> = []

  // Eerste pagina
  result.push(1)

  if (showLeftEllipsis) {
    result.push(null)
  } else if (leftSibling === 2) {
    result.push(2)
  }

  for (let p = leftSibling; p <= rightSibling; p++) {
    if (p !== 1 && p !== totalPages) result.push(p)
  }

  if (showRightEllipsis) {
    result.push(null)
  } else if (rightSibling === totalPages - 1) {
    result.push(totalPages - 1)
  }

  // Laatste pagina
  result.push(totalPages)

  return result
}

// ============================================================
// Component
// ============================================================

/**
 * Pagination — universele pagina-navigatie voor overzichtspagina's.
 *
 * Toont prev / page-numbers (met ellipsis voor lange ranges) / next.
 * Werkt met 1-based page numbering.
 *
 * @example
 *   <Pagination
 *     currentPage={page}
 *     totalPages={Math.ceil(total / pageSize)}
 *     onPageChange={setPage}
 *   />
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageRange(currentPage, totalPages, siblingCount)
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <nav className={cn('pagination', className)} aria-label={ariaLabel}>
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrev}
        aria-label="Previous page"
      >
        <IconChevronLeft size={14} strokeWidth={2.5} />
      </button>

      {pages.map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={cn('pagination-btn', p === currentPage && 'is-active')}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
            disabled={p === currentPage}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        aria-label="Next page"
      >
        <IconChevronRight size={14} strokeWidth={2.5} />
      </button>
    </nav>
  )
}
