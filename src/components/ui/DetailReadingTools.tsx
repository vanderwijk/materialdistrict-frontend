'use client'

/**
 * DetailReadingTools — §F2.8 punt 10
 * ----------------------------------------------------------------------
 * Generieke leeshulpmiddelen voor álle detailpagina's, één keer gemount
 * via <DetailHeader>:
 *  - tekstgrootte-regelaar (A- / A+) die de leestekst schaalt; de keuze
 *    wordt onthouden (localStorage) en gezet als
 *    `document.documentElement.dataset.readingSize` ('sm' | 'md' | 'lg').
 *    De CSS in globals.css (§F2.8) schaalt op basis daarvan de prose-
 *    containers (.mat-body, .article-detail-lead, .event-detail-body).
 *  - printknop -> window.print(); de @media print-regels strippen de
 *    chrome zodat er een nette printout overblijft.
 *  - back-to-top-knop (fixed) die na ~600px scrollen verschijnt.
 *
 * Bewust géén server-state: puur client-UI. Bij geblokkeerde localStorage
 * valt alles stil terug op de standaardgrootte.
 */

import { useEffect, useState } from 'react'

const SIZES = ['sm', 'md', 'lg'] as const
type ReadingSize = (typeof SIZES)[number]
const STORAGE_KEY = 'md-reading-size'

function isReadingSize(v: string | null): v is ReadingSize {
  return v === 'sm' || v === 'md' || v === 'lg'
}

export function DetailReadingTools() {
  const [size, setSize] = useState<ReadingSize>('md')
  const [showTop, setShowTop] = useState(false)

  // Opgeslagen voorkeur ophalen.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (isReadingSize(saved)) setSize(saved)
    } catch {
      /* localStorage geblokkeerd — standaard houden */
    }
  }, [])

  // Voorkeur toepassen + persisteren.
  useEffect(() => {
    document.documentElement.dataset.readingSize = size
    try {
      window.localStorage.setItem(STORAGE_KEY, size)
    } catch {
      /* negeren */
    }
  }, [size])

  // Back-to-top zichtbaarheid.
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const step = (dir: -1 | 1) => {
    const i = SIZES.indexOf(size)
    setSize(SIZES[Math.min(SIZES.length - 1, Math.max(0, i + dir))])
  }

  return (
    <>
      <div className="detail-tools" role="group" aria-label="Reading tools">
        <button
          type="button"
          className="detail-tools-btn"
          onClick={() => step(-1)}
          disabled={size === 'sm'}
          aria-label="Decrease text size"
        >
          A<span className="detail-tools-sub">&minus;</span>
        </button>
        <button
          type="button"
          className="detail-tools-btn"
          onClick={() => step(1)}
          disabled={size === 'lg'}
          aria-label="Increase text size"
        >
          A<span className="detail-tools-sub">+</span>
        </button>
        <button
          type="button"
          className="detail-tools-btn"
          onClick={() => window.print()}
          aria-label="Print this page"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className={`detail-backtotop${showTop ? ' is-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  )
}
