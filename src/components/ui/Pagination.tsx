'use client'

import { useEffect, useState } from 'react'
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
 *
 * §BETA-FIX-24-08 (P1) — herschreven; gaf dubbele paginanummers.
 *
 * De oude opzet plakte de lijst in stukken aan elkaar: eerst een 1, dan
 * eventueel een handmatige "2" om de breedte constant te houden, dan de
 * schuifvensterlus, dan hetzelfde kunstje aan de rechterkant. Zodra het
 * schuifvenster zélf bij 2 begon (currentPage 4 met twee buren), voegden die
 * twee takken hetzelfde nummer toe: `1 2 2 3 4 5 6 … 271`. Spiegelbeeldig
 * gebeurde het aan het einde bij pagina 268 (`… 270 270 271`). Op smalle
 * schermen, waar het venster één buur telt, schoof het probleem naar pagina 3
 * en 269. Omdat de React-key het paginanummer zélf was, kregen twee knoppen
 * bovendien dezelfde sleutel — wat de weergave bij een herrender verder kon
 * verstoren.
 *
 * Nu wordt de verzameling eerst opgebouwd (eerste, laatste, en het venster
 * rond de huidige pagina), daarna gesorteerd, en pas dan wordt er een ellipsis
 * gezet waar een echt gat zit. Een nummer kan zo per definitie maar één keer
 * voorkomen, ongeacht waar het venster valt. De handmatige breedte-correcties
 * zijn overbodig geworden: waar het venster tegen de rand aan ligt, is het gat
 * nul en verschijnt er vanzelf geen "…".
 */
function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): Array<number | null> {
  if (totalPages < 1) return []

  const totalPageNumbers = siblingCount * 2 + 5
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  // Huidige pagina binnen bereik houden, zodat een rare `?page=` in de URL
  // geen scheve lijst oplevert.
  const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages)

  const visible = new Set<number>([1, totalPages])
  const left = Math.max(safeCurrent - siblingCount, 1)
  const right = Math.min(safeCurrent + siblingCount, totalPages)
  for (let p = left; p <= right; p += 1) visible.add(p)

  const sorted = Array.from(visible).sort((a, b) => a - b)

  // Ellipsis alleen waar er daadwerkelijk pagina's tussen wegvallen.
  const result: Array<number | null> = []
  let previous: number | null = null
  for (const page of sorted) {
    if (previous !== null && page - previous > 1) result.push(null)
    result.push(page)
    previous = page
  }

  return result
}

// ============================================================
// Component
// ============================================================

function useIsNarrow(query = '(max-width: 560px)') {
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setNarrow(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return narrow
}

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
  const isNarrow = useIsNarrow()

  if (totalPages <= 1) return null

  // Op smalle schermen minder siblings zodat « ‹ 1 2 … N › » op één rij blijft.
  const effectiveSiblings = isNarrow ? Math.min(siblingCount, 1) : siblingCount
  const pages = getPageRange(currentPage, totalPages, effectiveSiblings)
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
      <div className="pagination-controls">
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
              key={`page-${p}`}
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
      </div>

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
