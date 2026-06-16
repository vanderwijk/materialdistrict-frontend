'use client'

/**
 * PrevNextNavigation
 * ----------------------------------------------------------------------
 * Toont "← Previous material" en "Next material →" knoppen op de
 * detail-page. Gedrag valt in drie stappen uiteen:
 *
 *  1. Lees filter-context (uit sessionStorage via useMaterialsContext).
 *     Aanwezig → bron-query is die context. Niet aanwezig → globaal
 *     (fallback B: alle materials, datum-aflopend).
 *
 *  2. Fetch een lichtgewicht lijst (`/api/materials/list-light`) met
 *     dezelfde query. Limiet: PREV_NEXT_MAX_ITEMS (100). Boven die
 *     limiet schakelt de client over op fallback B om performance te
 *     bewaken.
 *
 *  3. Vind het huidige material in de lijst aan de hand van slug.
 *     Bepaal buurman links en rechts, render knoppen.
 *
 * Edge cases:
 *  - Lijst is leeg of huidige slug niet gevonden → component rendert niets
 *  - Eerste in lijst → "Previous" disabled
 *  - Laatste in lijst → "Next" disabled
 *  - Fetch faalt → component rendert niets (we hebben liever geen knoppen
 *    dan misleidende knoppen)
 *
 * Hydration:
 *  - Eerste server-render: component rendert een placeholder met
 *    onzichtbare knoppen (om layout-shift te voorkomen). Client-side
 *    vervangt deze met daadwerkelijke prev/next zodra de fetch klaar is.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  useMaterialsContext,
  PREV_NEXT_MAX_ITEMS,
} from '@/lib/hooks/useMaterialsContext'

export interface PrevNextNavigationProps {
  /** Slug van het material dat momenteel getoond wordt. */
  currentSlug: string
}

interface LightMaterial {
  id: number
  slug: string
  title: string
  thumbnailUrl: string | null
}

interface ListLightResponse {
  items: LightMaterial[]
  totalRows: number
}

export function PrevNextNavigation({ currentSlug }: PrevNextNavigationProps) {
  const { context, ready } = useMaterialsContext()
  const [list, setList] = useState<LightMaterial[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return

    let cancelled = false
    setLoading(true)

    // Bepaal de fetch-URL: met of zonder filter-context.
    // - Mét context: doorgeef de queryString (filter+search+sort), pas
    //   `page` aan zodat we vanaf de eerste pagina lezen met grote perPage.
    // - Zonder context (fallback B): leeg querystring → globale lijst,
    //   default-sort (newest).
    let url = '/api/materials/list-light'
    if (context && context.queryString) {
      // Strip de `page`-param — wij willen de héle lijst, niet één pagina.
      const params = new URLSearchParams(context.queryString)
      params.delete('page')
      const qs = params.toString()
      if (qs) url += `?${qs}`
    }

    fetch(url, { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ListLightResponse>
      })
      .then((data) => {
        if (cancelled) return
        // Fallback B-trigger: als de totale lijst > PREV_NEXT_MAX_ITEMS is
        // én onze huidige slug niet in de eerste batch zit, doe niets —
        // geen knoppen is duidelijker dan misleidende.
        if (data.totalRows > PREV_NEXT_MAX_ITEMS) {
          const inBatch = data.items.some((m) => m.slug === currentSlug)
          if (!inBatch) {
            setList([])
            return
          }
        }
        setList(data.items)
      })
      .catch(() => {
        if (cancelled) return
        setList([])
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [context, ready, currentSlug])

  // Tijdens loading rendert de component niets — voorkomt UI-flicker waarbij
  // knoppen eerst leeg en daarna gevuld zijn. Mocht het nodig blijken, kunnen
  // we hier een skeleton-placeholder zetten.
  if (loading || !list) return null

  const currentIndex = list.findIndex((m) => m.slug === currentSlug)
  if (currentIndex === -1) return null

  const prev = currentIndex > 0 ? list[currentIndex - 1] : null
  const next = currentIndex < list.length - 1 ? list[currentIndex + 1] : null

  // Beide buren afwezig → component rendert niets (1-item-lijst).
  if (!prev && !next) return null

  return (
    <nav className="mat-prevnext" aria-label="Material navigation">
      {prev ? (
        <Link href={`/material/${prev.slug}`} className="mat-prevnext-link">
          <span className="mat-prevnext-arrow" aria-hidden="true">
            ←
          </span>
          {/* Sessie 7 fix Punt 10: altijd een thumb-tile renderen, ook
              wanneer WP geen hero levert. Met de vorige conditional
              `{prev.thumbnailUrl && (...)}` verdween de hele tile bij
              materials zonder hero — wat in productie het meest opvalt.
              Een placeholder-vierkant in surface2 houdt het ritme van
              de prev/next-rij intact. */}
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {prev.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prev.thumbnailUrl} alt="" />
            ) : (
              <span className="mat-prevnext-thumb-placeholder" />
            )}
          </span>
          <span className="mat-prevnext-label">
            <span className="mat-prevnext-eyebrow">Previous</span>
            <span className="mat-prevnext-title">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span className="mat-prevnext-spacer" aria-hidden="true" />
      )}

      {next ? (
        <Link
          href={`/material/${next.slug}`}
          className="mat-prevnext-link mat-prevnext-link--right"
        >
          <span className="mat-prevnext-label">
            <span className="mat-prevnext-eyebrow">Next</span>
            <span className="mat-prevnext-title">{next.title}</span>
          </span>
          {/* Sessie 7 fix Punt 10: zie commentaar op de prev-link
              hierboven. */}
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {next.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={next.thumbnailUrl} alt="" />
            ) : (
              <span className="mat-prevnext-thumb-placeholder" />
            )}
          </span>
          <span className="mat-prevnext-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ) : (
        <span className="mat-prevnext-spacer" aria-hidden="true" />
      )}
    </nav>
  )
}
