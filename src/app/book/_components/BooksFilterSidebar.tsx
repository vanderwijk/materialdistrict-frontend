'use client'

/**
 * BooksFilterSidebar — filterblok links op /book, in de gedeelde huis-
 * `FilterSidebar` (zelfde component als materials), zodat /book één familie is.
 *
 * Props-gedreven: de pagina levert de secties + tellingen (server-side afgeleid
 * uit de catalogus) en de huidige selectie (uit de URL). Een wijziging schrijft
 * de selectie terug naar de URL als herhaalde query-params (`?format=...&
 * publisher=...`), reset `?page=`, en behoudt overige params (q, channel) —
 * exact het patroon van de ChannelBar. Publisher staat bewust ZONDER zoekbox.
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  FilterSidebar,
  type FilterSection,
  type FilterSelection,
} from '@/components/ui'

interface BooksFilterSidebarProps {
  sections: FilterSection[]
  selected: FilterSelection
}

export function BooksFilterSidebar({ sections, selected }: BooksFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (sections.length === 0) return null

  function handleChange(next: FilterSelection) {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.delete('page')
    for (const section of sections) {
      params.delete(section.key)
      for (const value of next[section.key] ?? []) {
        params.append(section.key, value)
      }
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <FilterSidebar
      sections={sections}
      selected={selected}
      onChange={handleChange}
    />
  )
}
