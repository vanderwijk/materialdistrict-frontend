'use client'

import { useCallback, useEffect, useState } from 'react'

/** Rough chrome width: label, pagers, padding (homepage / nav variant). */
const NAV_CHROME_PX = 168
/** Rough chrome width: label, pagers, search, view toggle (overview pages). */
const FILTER_CHROME_PX = 400
const TAB_ESTIMATE_PX = 92
const TAB_GAP_PX = 4

/**
 * Derive how many channel tabs fit in the bar at the current width.
 * Keeps pagers visible and avoids clipping pills on mid-size viewports.
 */
export function useChannelBarPageSize(
  totalItems: number,
  maxPageSize: number,
  mode: 'nav' | 'filter' = 'nav',
) {
  const [pageSize, setPageSize] = useState(maxPageSize)
  const [innerEl, setInnerEl] = useState<HTMLElement | null>(null)

  const innerRef = useCallback((node: HTMLDivElement | null) => {
    setInnerEl(node)
  }, [])

  useEffect(() => {
    if (!innerEl) return

    const chrome = mode === 'filter' ? FILTER_CHROME_PX : NAV_CHROME_PX

    const update = () => {
      const width = innerEl.getBoundingClientRect().width
      const available = Math.max(0, width - chrome)
      const fit = Math.floor(available / (TAB_ESTIMATE_PX + TAB_GAP_PX))
      const next = Math.max(2, Math.min(maxPageSize, fit || 2, totalItems))
      setPageSize((prev) => (prev === next ? prev : next))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(innerEl)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [innerEl, maxPageSize, mode, totalItems])

  return { pageSize, innerRef }
}
