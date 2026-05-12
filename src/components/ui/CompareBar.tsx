'use client'

/**
 * CompareBar — sticky bottom-bar voor de compare-flow.
 *
 * Sessie 4 batch 2.
 *
 * Toont:
 *  - Drie slots (MAX_COMPARE) met hero-thumbs van materials in de
 *    compare-list. Lege slots krijgen een placeholder.
 *  - Per gevulde slot: titel + brand + een × om te verwijderen.
 *  - Een "Compare"-knop die naar `/compare?ids=...` linkt (page wordt
 *    later gebouwd; voor batch 2 is dit een placeholder-href).
 *  - Een "Clear"-knop om alles te legen.
 *
 * Zichtbaarheid:
 *  - Hidden bij lege compare-list (`count === 0`)
 *  - Zichtbaar zodra ≥ 1 material geselecteerd is
 *
 * Responsive:
 *  - Desktop (≥ 768px): volledige slot-weergave met thumbs en titels
 *  - Mobile (< 768px): compacte modus met pill "N materials · Compare"
 *  - Onder 360px: identiek aan mobile (CSS handelt af, geen aparte JS)
 *
 * Data:
 *  - Bestaande state komt uit `useCompare()` — id-array
 *  - Material-details (titel + brand + hero) moeten door de aanroeper
 *    worden meegegeven via `materialsById`. Een page houdt typisch een
 *    Map<id, MaterialListItem> bij van alles wat op de huidige grid staat,
 *    en geeft die door. Items die na een page-wissel uit de map verdwijnen
 *    (user heeft pagina 1 verlaten naar pagina 2) worden in de bar getoond
 *    met een fallback "Material #id" en lege thumb — minimal degradation.
 *
 * Architectuur-overweging:
 *  - Geen eigen state-store. Bron-van-waarheid is de CompareContext;
 *    deze component is een pure read+dispatch-laag.
 */

import { useMemo } from 'react'
import Link from 'next/link'
import type { MaterialListItem } from '@/types/material'
import { useCompare, MAX_COMPARE } from '@/lib/hooks/useCompare'
import { Button } from './Button'
import { IconClose, IconCompare } from './icons'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface CompareBarProps {
  /**
   * Map van material-id → MaterialListItem voor de items die nu in de
   * compare-list staan. Mag onvolledig zijn — ontbrekende items krijgen
   * een fallback-label.
   *
   * Praktisch: de aanroeper maakt deze van de items op de huidige
   * page (de FacetWP-grid). Voor compare-items die niet op de huidige
   * page staan toont de bar de fallback. Page-wissel terug naar grid
   * met die items herstelt de volledige weergave.
   */
  materialsById?: Map<number, MaterialListItem>
  /**
   * Optionele href voor de Compare-knop. Default: `/compare?ids=<ids>`.
   * Aanroeper kan een eigen URL-structuur kiezen.
   */
  compareHref?: (ids: readonly number[]) => string
  /** Extra className op de wrapper. */
  className?: string
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function CompareBar({
  materialsById,
  compareHref,
  className,
}: CompareBarProps) {
  const { compareIds, count, removeFromCompare, clearCompare } = useCompare()

  // Bouw de slots: gevulde slots eerst, dan lege placeholders tot MAX_COMPARE
  const slots = useMemo(() => {
    const filled = compareIds.map((id) => ({
      id,
      material: materialsById?.get(id) ?? null,
    }))
    const empty = Array.from({ length: MAX_COMPARE - filled.length }, () => null)
    return [...filled, ...empty]
  }, [compareIds, materialsById])

  // Hidden bij lege list
  if (count === 0) {
    return null
  }

  const href =
    compareHref?.(compareIds) ??
    `/compare?ids=${compareIds.join(',')}`

  const compareLabel = `Compare (${count})`

  return (
    <div
      className={['compare-bar', className].filter(Boolean).join(' ')}
      role="region"
      aria-label="Materials to compare"
    >
      <div className="compare-bar-inner">
        {/* Slots — verborgen op mobile via CSS */}
        <div className="compare-bar-slots" aria-hidden="false">
          {slots.map((slot, i) => {
            if (slot === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="compare-bar-slot is-empty"
                  aria-hidden="true"
                >
                  <span className="compare-bar-slot-placeholder">
                    Slot {i + 1}
                  </span>
                </div>
              )
            }

            const { id, material } = slot
            const title = material?.title ?? `Material #${id}`
            const brand = material?.brandName ?? null
            const thumbSrc =
              material?.hero?.sizes?.thumbnail?.url ??
              material?.hero?.sizes?.medium?.url ??
              material?.hero?.sourceUrl

            return (
              <div key={id} className="compare-bar-slot">
                <div className="compare-bar-slot-thumb">
                  {thumbSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbSrc}
                      alt={material?.hero?.alt?.trim() || title}
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="compare-bar-slot-info">
                  <div className="compare-bar-slot-title" title={title}>
                    {title}
                  </div>
                  {brand && (
                    <div className="compare-bar-slot-brand">{brand}</div>
                  )}
                </div>
                <button
                  type="button"
                  className="compare-bar-slot-remove"
                  onClick={() => removeFromCompare(id)}
                  aria-label={`Remove ${title} from compare`}
                >
                  <IconClose size={14} strokeWidth={2} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Mobile-compact pill — verborgen op desktop via CSS */}
        <div className="compare-bar-pill" aria-hidden="false">
          <span className="compare-bar-pill-count">
            {count} {count === 1 ? 'material' : 'materials'}
          </span>
        </div>

        {/* Actions — zichtbaar op alle viewports */}
        <div className="compare-bar-actions">
          <button
            type="button"
            className="compare-bar-clear"
            onClick={clearCompare}
          >
            Clear
          </button>
          <Button
            as="link"
            href={href}
            variant="primary"
            size="md"
            className="compare-bar-cta"
          >
            <IconCompare size={14} strokeWidth={2.5} />
            <span className="compare-bar-cta-label">{compareLabel}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
