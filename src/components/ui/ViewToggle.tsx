'use client'

/**
 * ViewToggle — kolomkeuze (2 / 3 / 4) voor de catalogus-overzichten.
 *
 * Zet een `data-cols`-attribuut op de document-root; de grid-CSS
 * (`[data-cols="2"] .ov-grid-3`, `.ov-grid-brands`, … in §F2.3) vertaalt dat
 * naar het aantal kolommen op desktop. Zo werkt de keuze op álle overzichten
 * (materials, stories, brands, events, talks) zonder per-pagina-bedrading —
 * de bar zit in de gedeelde ChannelBar. De keuze wordt onthouden in
 * localStorage. Op smalle schermen verborgen via CSS (daar staat de
 * kolom-telling responsief vast).
 */

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'md:overview-cols'
const OPTIONS = [2, 3, 4] as const
type Cols = (typeof OPTIONS)[number]

function applyCols(cols: Cols) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.cols = String(cols)
  }
}

export function ViewToggle() {
  const [cols, setCols] = useState<Cols>(3)

  // Bij mount: opgeslagen keuze inlezen en toepassen.
  useEffect(() => {
    let stored: Cols = 3
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const n = raw ? Number.parseInt(raw, 10) : NaN
      if (n === 2 || n === 3 || n === 4) stored = n
    } catch {
      // localStorage niet beschikbaar — val terug op default
    }
    setCols(stored)
    applyCols(stored)
  }, [])

  function choose(next: Cols) {
    setCols(next)
    applyCols(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // negeer — keuze geldt dan alleen voor deze sessie
    }
  }

  return (
    <div className="view-toggle" role="group" aria-label="Columns">
      {OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          className={`view-toggle-btn${cols === n ? ' is-active' : ''}`}
          aria-pressed={cols === n}
          aria-label={`${n} columns`}
          title={`${n} columns`}
          onClick={() => choose(n)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            {Array.from({ length: n }).map((_, i) => {
              const gap = 2
              const totalGap = gap * (n - 1)
              const w = (24 - totalGap) / n
              const x = i * (w + gap)
              return <rect key={i} x={x} y={3} width={w} height={18} rx={1} />
            })}
          </svg>
        </button>
      ))}
    </div>
  )
}
