'use client'

/**
 * MaterialsFilterSidebar — URL-state-bridge tussen MaterialFilterSection
 * (uit `mappers.ts`) en de bestaande generieke `<FilterSidebar>`.
 *
 * Sessie 4 batch 3.
 *
 * Verantwoordelijkheden:
 *  - Mapt `MaterialFilterSection[]` naar de generieke `FilterSection[]`-
 *    shape die de bestaande sidebar verwacht.
 *  - Vertaalt selection-changes naar `router.push()` met geüpdate
 *    searchParams (filter-keys als comma-separated lijsten).
 *  - Reset `?page` naar 1 bij elke filter-wijziging (anders kan een filter
 *    op een hogere pagina blijven hangen en lege resultaten geven).
 *  - Behoudt search (`?q`) en sort (`?sort`) in de URL bij filter-changes.
 *  - "Clear all" wist alle filter-keys maar behoudt `?q` en `?sort`.
 *
 * Niet verantwoordelijk voor:
 *  - Save search-knop — Insider-feature, komt in een volgende sessie als
 *    `onSaveSearch` doorgegeven wordt
 *  - Mobile drawer-toggle — handelt de bestaande FilterSidebar zelf af
 */

import { useMemo, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  FilterSidebar,
  type FilterSection,
  type FilterSelection,
} from '@/components/ui'
import { MATERIAL_FILTER_FACETS } from '@/types/facetwp'
import type { MaterialFilterSection } from '@/lib/api/mappers'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialsFilterSidebarProps {
  /** Filter-secties uit `listMaterialsWithFacets()`. */
  sections: MaterialFilterSection[]
  /** Volledige zoekquery uit de URL (excl. paging). Voor "Clear all"-behoud. */
  preservedParams?: { q?: string; sort?: string }
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

/**
 * Verzameling van alle facet-keys waar deze sidebar wel/niet schrijft.
 * Gebruikt om "Clear all" alleen onze keys te laten wissen, en pre-existing
 * search/sort-params te behouden.
 */
const FILTER_KEYS = new Set<string>(MATERIAL_FILTER_FACETS)

export function MaterialsFilterSidebar({
  sections,
  preservedParams,
}: MaterialsFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  // Map MaterialFilterSection[] naar FilterSection[] voor de generieke sidebar
  const uiSections: FilterSection[] = useMemo(
    () =>
      sections.map((s) => ({
        key: s.key,
        title: s.title,
        options: s.options.map((o) => ({
          value: o.value,
          label: o.label,
          count: o.count,
        })),
        searchable: s.searchable,
        defaultOpen: s.defaultOpen,
        selectMode: s.selectMode,
      })),
    [sections],
  )

  // Huidige selection bouwen uit de baseline-data — server is bron van waarheid
  const selected: FilterSelection = useMemo(() => {
    const out: FilterSelection = {}
    for (const s of sections) {
      if (s.selected.length > 0) {
        out[s.key] = s.selected
      }
    }
    return out
  }, [sections])

  // Helper: bouw een nieuwe URLSearchParams op basis van een filter-update
  const buildUrl = (next: FilterSelection): string => {
    const params = new URLSearchParams()

    // Filter-keys eerst — uit de incoming selection
    for (const key of Object.keys(next)) {
      if (!FILTER_KEYS.has(key)) continue
      const values = next[key]
      if (!values || values.length === 0) continue
      params.set(key, values.join(','))
    }

    // Preserve search en sort uit huidige URL
    if (preservedParams?.q) params.set('q', preservedParams.q)
    if (preservedParams?.sort) params.set('sort', preservedParams.sort)

    // Geen page-param toevoegen — filter-wijziging reset naar pagina 1

    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  const handleChange = (next: FilterSelection) => {
    startTransition(() => {
      router.push(buildUrl(next), { scroll: false })
    })
  }

  const handleClearAll = () => {
    // Behoud alleen search + sort; alle filter-keys vallen weg
    const params = new URLSearchParams()
    if (preservedParams?.q) params.set('q', preservedParams.q)
    if (preservedParams?.sort) params.set('sort', preservedParams.sort)
    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname

    startTransition(() => {
      router.push(url, { scroll: false })
    })
  }

  return (
    <FilterSidebar
      sections={uiSections}
      selected={selected}
      onChange={handleChange}
      onClearAll={handleClearAll}
    />
  )
}
