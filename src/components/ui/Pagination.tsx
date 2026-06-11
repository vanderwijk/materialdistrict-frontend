'use client'

import { useState } from 'react'
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
  /** Callback bij klik op een pagina-knop, prev/next of first/last. */
  onPageChange: (page: number) => void
  /**
   * Hoeveel page-numbers er rond de huidige pagina worden getoond.
   * Default: 2 (toont bv. 1 … 4 5 [6] 7 8 … 271).
   */
  siblingCount?: number
  /**
   * Toon het "Go to page"-invoerveld. Default: true. Voor lange ranges
   * (veel pagina's) is dit dé manier om snel ver te springen. §F2.10 P10.
   */
  showGoto?: boolean
  className?: string
  ariaLabel?: string
}

// ============================================================
// Helper
// ============================================================

/**
 * Geeft de zichtbare pagina-nummers terug, met `null` voor "…"-ellipsis.
 *
 * Voorbeeld output bij currentPage=5, totalPages=10, siblingCount=2:
 *   [1, null, 3, 4, 5, 6, 7, null, 10]
 */
function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): Array<number | null> {
  const totalPageNumbers = siblingCount * 2 + 5
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  const result: Array<number | null> = []

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

  result.push(totalPages)

  return result
}

// ============================================================
// Component
// ============================================================

/**
 * Pagination — universele pagina-navigatie voor overzichtspagina's.
 *
 * §F2.10 P10 (redesign): venster rond de huidige pagina (siblings) met
 * eerste/laatste verankerd + ellipsis, first/last-sprongen (« »), prev/next
 * (‹ ›), en een "Go to page"-invoerveld om direct naar een paginanummer te
 * springen (geen pulldown — er zijn te veel pagina's). De actieve pagina is
 * ink (zie globals §F2.10 P4). 1-based.
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
  siblingCount = 2,
  showGoto = true,
  className,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  const [gotoValue, setGotoValue] = useState('')

  if (totalPages <= 1) return null

  const pages = getPageRange(currentPage, totalPages, siblingCount)
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  function go(raw: string) {
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n)) return
    const clamped = Math.min(Math.max(n, 1), totalPages)
    if (clamped !== currentPage) onPageChange(clamped)
    setGotoValue('')
  }

  return (
    <nav className={cn('pagination', className)} aria-label={ariaLabel}>
      <button
        type="button"
        className="pagination-btn pagination-btn-edge"
        onClick={() => onPageChange(1)}
        disabled={!canPrev}
        aria-label="First page"
      >
        <IconChevronLeft size={13} strokeWidth={2.5} />
        <IconChevronLeft size={13} strokeWidth={2.5} />
      </button>

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

      <button
        type="button"
        className="pagination-btn pagination-btn-edge"
        onClick={() => onPageChange(totalPages)}
        disabled={!canNext}
        aria-label="Last page"
      >
        <IconChevronRight size={13} strokeWidth={2.5} />
        <IconChevronRight size={13} strokeWidth={2.5} />
      </button>

      {showGoto && (
        <span className="pagination-goto">
          <label className="pagination-goto-label" htmlFor="pagination-goto-input">
            Go to
          </label>
          <input
            id="pagination-goto-input"
            type="number"
            inputMode="numeric"
            min={1}
            max={totalPages}
            className="pagination-goto-input"
            placeholder={`1–${totalPages}`}
            value={gotoValue}
            onChange={(e) => setGotoValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                go(gotoValue)
              }
            }}
            aria-label={`Go to page (1 to ${totalPages})`}
          />
          <button
            type="button"
            className="pagination-goto-btn"
            onClick={() => go(gotoValue)}
            disabled={gotoValue.trim() === ''}
          >
            Go
          </button>
        </span>
      )}
    </nav>
  )
}
