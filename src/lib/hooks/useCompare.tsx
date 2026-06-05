'use client'

/**
 * useCompare — shared compare-state voor de materials-overzichts- en
 * detailpagina.
 *
 * Sessie 4 batch 2.
 *
 * Doel:
 *  - MaterialCard (op /materials) en de Compare-knop op /materials/[slug]
 *    schrijven naar dezelfde state
 *  - CompareBar (sticky bottom) leest die state en toont thumbnails
 *  - Maximaal 3 materials tegelijk in vergelijking (mockup-conventie)
 *  - Insider-gating gebeurt door de aanroeper — deze hook bepaalt alleen
 *    of een toggle technisch is uitgevoerd
 *
 * Geen persistence in v1: state wordt gereset bij page-refresh. Persistence
 * (localStorage of WP-board) hoort bij Fase 2 (Boards). Reden om geen
 * localStorage te gebruiken nu: zou inconsistent gedrag opleveren met
 * Boards straks; beter één migratiemoment dan twee.
 *
 * Provider/consumer-patroon: de provider zit hoog in de tree (in de
 * materials-layout, batch 3), zodat client-componenten via `useCompare()`
 * de state delen.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { MaterialListItem } from '@/types/material'

/** Minimale material-metadata voor CompareBar-slots. */
export type CompareMaterialSnapshot = Pick<
  MaterialListItem,
  'id' | 'title' | 'brandName' | 'hero' | 'slug' | 'link'
>

// --------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------

/**
 * Maximaal aantal materials in de compare-list. Mockup-conventie: 3 slots.
 * Boven dit aantal: de toggle wordt genegeerd (caller kan een toast tonen
 * "You can compare up to 3 materials" — zie return-value van `toggleCompare`).
 */
export const MAX_COMPARE = 3

// --------------------------------------------------------------------
// Context
// --------------------------------------------------------------------

interface CompareContextValue {
  /** Lijst van material-IDs in insertion-volgorde. */
  compareIds: readonly number[]
  /** True wanneer dit material in de compare-list staat. */
  isInCompare: (id: number) => boolean
  /**
   * Toggle een material in/uit de compare-list.
   *
   * Returnt een resultaat-object zodat de aanroeper de juiste UI-feedback
   * kan kiezen (toast of niets):
   *  - `'added'` — succesvol toegevoegd
   *  - `'removed'` — was aanwezig, nu verwijderd
   *  - `'limit-reached'` — list was vol (>= MAX_COMPARE), geen wijziging
   */
  toggleCompare: (
    id: number,
    material?: CompareMaterialSnapshot,
  ) => CompareToggleResult
  /**
   * Sla material-metadata op zonder de compare-list te wijzigen. Handig
   * om slots te verrijken wanneer een page meer context heeft dan bij de
   * oorspronkelijke toggle (bv. detail-page hero).
   */
  registerCompareMaterial: (material: CompareMaterialSnapshot) => void
  /** Metadata voor een material in de compare-list, indien bekend. */
  getCompareMaterial: (id: number) => CompareMaterialSnapshot | undefined
  /** Verwijder een material uit de compare-list. No-op als hij er niet in zit. */
  removeFromCompare: (id: number) => void
  /** Leeg de hele compare-list. */
  clearCompare: () => void
  /** Aantal materials in de compare-list. */
  count: number
  /** True wanneer `count >= MAX_COMPARE`. */
  isFull: boolean
}

export type CompareToggleResult = 'added' | 'removed' | 'limit-reached'

const CompareContext = createContext<CompareContextValue | null>(null)

// --------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------

interface CompareProviderProps {
  children: ReactNode
  /**
   * Optionele initial state. Default: lege lijst. Bedoeld voor toekomstige
   * persistence-uitbreiding (bv. hydraten vanaf localStorage in een client
   * boundary). Voor v1 niet gebruikt.
   */
  initialIds?: number[]
}

/**
 * CompareProvider — wrap dit om de materials-pages (overzicht én detail).
 *
 * In batch 3 wordt deze provider rendered in `src/app/materials/layout.tsx`
 * zodat zowel `/materials` als `/materials/[slug]` dezelfde state delen.
 *
 * Buiten een Provider werken `useCompare()`-consumers in "loose mode":
 * geen errors, maar `toggleCompare` is een no-op en `compareIds` is leeg.
 * Dat houdt componenten in de style-guide / tests bruikbaar zonder Provider.
 */
interface CompareState {
  ids: number[]
  materials: Map<number, CompareMaterialSnapshot>
}

function createInitialCompareState(initialIds: number[]): CompareState {
  return {
    ids: Array.from(new Set(initialIds)).slice(0, MAX_COMPARE),
    materials: new Map(),
  }
}

export function CompareProvider({ children, initialIds = [] }: CompareProviderProps) {
  const [state, setState] = useState<CompareState>(() =>
    createInitialCompareState(initialIds),
  )
  const { ids: compareIds, materials: compareMaterials } = state

  const isInCompare = useCallback(
    (id: number) => compareIds.includes(id),
    [compareIds],
  )

  const getCompareMaterial = useCallback(
    (id: number) => compareMaterials.get(id),
    [compareMaterials],
  )

  const registerCompareMaterial = useCallback((material: CompareMaterialSnapshot) => {
    setState((prev) => {
      const existing = prev.materials.get(material.id)
      if (
        existing &&
        existing.title === material.title &&
        existing.brandName === material.brandName &&
        existing.hero === material.hero
      ) {
        return prev
      }
      const materials = new Map(prev.materials)
      materials.set(material.id, material)
      return { ...prev, materials }
    })
  }, [])

  const toggleCompare = useCallback<CompareContextValue['toggleCompare']>(
    (id, material) => {
      let result: CompareToggleResult = 'added'
      setState((prev) => {
        if (prev.ids.includes(id)) {
          result = 'removed'
          const materials = new Map(prev.materials)
          materials.delete(id)
          return {
            ids: prev.ids.filter((x) => x !== id),
            materials,
          }
        }
        if (prev.ids.length >= MAX_COMPARE) {
          result = 'limit-reached'
          return prev
        }
        const materials = new Map(prev.materials)
        if (material) {
          materials.set(id, material)
        }
        return {
          ids: [...prev.ids, id],
          materials,
        }
      })
      return result
    },
    [],
  )

  const removeFromCompare = useCallback((id: number) => {
    setState((prev) => {
      if (!prev.ids.includes(id)) return prev
      const materials = new Map(prev.materials)
      materials.delete(id)
      return {
        ids: prev.ids.filter((x) => x !== id),
        materials,
      }
    })
  }, [])

  const clearCompare = useCallback(() => {
    setState(createInitialCompareState([]))
  }, [])

  const value = useMemo<CompareContextValue>(
    () => ({
      compareIds,
      isInCompare,
      toggleCompare,
      registerCompareMaterial,
      getCompareMaterial,
      removeFromCompare,
      clearCompare,
      count: compareIds.length,
      isFull: compareIds.length >= MAX_COMPARE,
    }),
    [
      compareIds,
      isInCompare,
      toggleCompare,
      registerCompareMaterial,
      getCompareMaterial,
      removeFromCompare,
      clearCompare,
    ],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

// --------------------------------------------------------------------
// Consumer hook
// --------------------------------------------------------------------

/**
 * Lege fallback-value voor "loose mode" — wanneer een component
 * `useCompare()` aanroept zonder Provider in de tree. Wordt vaakst gebruikt
 * in de style-guide en tijdens isolated testing.
 */
const NOOP_VALUE: CompareContextValue = {
  compareIds: [],
  isInCompare: () => false,
  toggleCompare: () => 'added',
  registerCompareMaterial: () => {},
  getCompareMaterial: () => undefined,
  removeFromCompare: () => {},
  clearCompare: () => {},
  count: 0,
  isFull: false,
}

/**
 * `useCompare()` — lees + manipuleer de compare-state.
 *
 * @example
 *   const { isInCompare, toggleCompare } = useCompare()
 *   const onClick = () => {
 *     if (!isMember) {
 *       setInsiderGateOpen(true)
 *       return
 *     }
 *     const result = toggleCompare(material.id)
 *     if (result === 'limit-reached') {
 *       toast('You can compare up to 3 materials', 'error')
 *     }
 *   }
 */
export function useCompare(): CompareContextValue {
  return useContext(CompareContext) ?? NOOP_VALUE
}
