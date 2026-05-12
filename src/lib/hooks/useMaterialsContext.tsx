'use client'

/**
 * useMaterialsContext + helpers
 * ----------------------------------------------------------------------
 * Houdt de filter/search/page-context van het materials-overzicht
 * vast tussen overzicht en detail-page. Twee doelen:
 *
 *  1. "Back to materials" → linken naar `/materials?<oorspronkelijke
 *     query>` zodat de gebruiker terugkomt op de pagina die hij verliet,
 *     mét dezelfde filters/zoekterm actief.
 *  2. "Prev / Next material" op de detail-page → laat de buurman binnen
 *     dezelfde selectie zien.
 *
 * Opslag-strategie:
 *  - sessionStorage onder de key `md:materials-context`
 *  - Per-tab. Bij `target="_blank"` of share/bookmark: nieuwe tab heeft
 *    geen context en valt terug op de globale lijst (fallback B).
 *  - Wordt geschreven door /materials VOORDAT de gebruiker een card
 *    aanklikt. Gelezen door /materials/[slug] om back-link + prev/next
 *    te bepalen.
 *
 * Data-vorm:
 *  - `queryString`: de raw search-params van het overzicht
 *    (bv. "material_category=biobased&q=acoustic&page=3"). Hierop bouwen
 *    we de back-URL en — bij prev/next — refetchen we de lijst.
 *
 * Performance:
 *  - Detail-page haalt voor prev/next de selectie opnieuw op via
 *    `listMaterialsWithFacets`, met een max van 100 items (zie
 *    PREV_NEXT_MAX_ITEMS). Daarboven schakelt prev/next over op de
 *    globale fallback.
 */

import { useEffect, useState } from 'react'

// --------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------

const STORAGE_KEY = 'md:materials-context'

/**
 * Limiet op het aantal items dat we voor prev/next inladen. Boven deze
 * grens schakelt de detail-page over op fallback B (globale datum-sort).
 *
 * 100 dekt 95%+ van de praktische selecties. Mocht de gebruiker een
 * brede filter hebben (bv. "Renewable=yes" met 800 matches) en pagina
 * 1 aanklikken, dan werkt prev/next prima binnen die eerste 100;
 * tussen item #100 en #101 schakelt het over naar de globale lijst.
 * Acceptabele degradatie voor sessie 4.
 */
export const PREV_NEXT_MAX_ITEMS = 100

// --------------------------------------------------------------------
// Types
// --------------------------------------------------------------------

export interface MaterialsContext {
  /**
   * Raw query-string zoals die op het overzicht stond. Inclusief filter-
   * facets, search, sort en page-parameter.
   *
   * Voorbeeld: "material_category=wood,biobased&renewable=yes&q=acoustic&sort=newest&page=3"
   * Lege string betekent: ongefilterde lijst.
   */
  queryString: string
  /**
   * Timestamp (Unix ms) van wanneer deze context is opgeslagen. Wordt
   * gebruikt om stale context te ignoren (>30 min oud) zodat oude
   * tab-state niet voor verwarring zorgt.
   */
  savedAt: number
}

const MAX_CONTEXT_AGE_MS = 30 * 60 * 1000 // 30 min

// --------------------------------------------------------------------
// Read / write helpers (safe in SSR)
// --------------------------------------------------------------------

/**
 * Schrijft de huidige overzichts-context weg. Aanroepen vanuit de
 * /materials-page zodra de query bekend is.
 */
export function saveMaterialsContext(queryString: string): void {
  if (typeof window === 'undefined') return
  try {
    const ctx: MaterialsContext = { queryString, savedAt: Date.now() }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx))
  } catch {
    // SessionStorage kan disabled zijn (private mode, etc.) — fail silent
  }
}

/**
 * Leest de opgeslagen context. Returnt `null` bij:
 *  - Geen storage beschikbaar
 *  - Geen entry
 *  - Stale entry (>30 min oud)
 *  - Corrupte JSON
 */
export function readMaterialsContext(): MaterialsContext | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<MaterialsContext>
    if (
      typeof parsed.queryString !== 'string' ||
      typeof parsed.savedAt !== 'number'
    ) {
      return null
    }
    if (Date.now() - parsed.savedAt > MAX_CONTEXT_AGE_MS) {
      return null
    }
    return { queryString: parsed.queryString, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

/**
 * Wist de opgeslagen context. Niet strikt nodig — context vervalt
 * automatisch na 30 min — maar handig na een handmatige "clear filters".
 */
export function clearMaterialsContext(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// --------------------------------------------------------------------
// React hook
// --------------------------------------------------------------------

/**
 * Hook voor het lezen van de context binnen een client-component.
 *
 * Geeft `null` op de eerste render (SSR-veilig) en daarna de werkelijke
 * waarde uit sessionStorage. Componenten die deze hook gebruiken
 * renderen typisch een fallback (back-knop "Back to all materials"
 * i.p.v. "Back to your filtered list") op de eerste pass en
 * verfijnen na hydratie.
 */
export function useMaterialsContext(): {
  context: MaterialsContext | null
  /** True zodra de hook gehydrateerd is (na useEffect). */
  ready: boolean
} {
  const [context, setContext] = useState<MaterialsContext | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setContext(readMaterialsContext())
    setReady(true)
  }, [])

  return { context, ready }
}

// --------------------------------------------------------------------
// Auto-saver component
// --------------------------------------------------------------------

/**
 * Drop-in component voor /materials. Schrijft de huidige search-params
 * naar sessionStorage zodra de page-component rendert.
 *
 * Gebruik in /materials/page.tsx:
 *
 *   <MaterialsContextWriter queryString={qs} />
 *
 * Waar `qs` de raw search-params-string is (zonder leading "?").
 */
export function MaterialsContextWriter({
  queryString,
}: {
  queryString: string
}) {
  useEffect(() => {
    saveMaterialsContext(queryString)
  }, [queryString])

  return null
}
