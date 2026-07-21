'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { IconChevronLeft, IconChevronRight } from './icons'

interface ChannelTabsRowProps {
  children: ReactNode
  viewportRole?: string
}

/**
 * Horizontaal scrollbare channel-pills met chevrons.
 * Geen paging — alle tabs blijven in de DOM; chevrons scrollen de rij.
 */
export function ChannelTabsRow({ children, viewportRole }: ChannelTabsRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanPrev(scrollLeft > 1)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState, children])

  function scrollByDir(dir: -1 | 1) {
    viewportRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  return (
    <>
      <div className="channel-pager">
        <button
          type="button"
          className="channel-page-btn"
          onClick={() => scrollByDir(-1)}
          disabled={!canPrev}
          aria-label="Scroll channels left"
        >
          <IconChevronLeft size={10} strokeWidth={2} />
        </button>
      </div>

      <div
        className="channel-tabs-viewport"
        ref={viewportRef}
        {...(viewportRole ? { role: viewportRole } : {})}
      >
        {children}
      </div>

      <div className="channel-pager">
        <button
          type="button"
          className="channel-page-btn"
          onClick={() => scrollByDir(1)}
          disabled={!canNext}
          aria-label="Scroll channels right"
        >
          <IconChevronRight size={10} strokeWidth={2} />
        </button>
      </div>
    </>
  )
}
