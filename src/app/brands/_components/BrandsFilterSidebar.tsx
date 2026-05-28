'use client'

/**
 * BrandsFilterSidebar — filter-sidebar voor de brands-overzichtspage.
 *
 * Sessie 5.
 *
 * Voor v1 één sectie: **Country** (searchable multi-select). De mockup
 * toont daarnaast een cascading "Application area"-filter, maar die hangt
 * op een APPLICATIONS-taxonomie die nog niet als brand-data beschikbaar
 * is — geparkeerd (zelfde status als de ChannelBar). Zodra Johan
 * application-area-data per brand levert, voegen we hier een tweede
 * FilterSection toe; de URL-bridge hieronder is daar al op voorbereid
 * (generieke key→searchParam-mapping).
 *
 * URL-bridge: de generieke <FilterSidebar> is callback-based
 * (onChange(selection)). Deze wrapper vertaalt selection['country'] naar
 * de `?country=NL,DE`-searchParam (komma-gescheiden, net als de
 * materials-facets) en reset `?page=`. Behoudt `?q=`.
 *
 * Op mobile gedraagt de sidebar zich als drawer via de bestaande
 * `.ov-wrap > .uf-sidebar`-CSS (sessie 6/7). Voor v1 houden we de
 * trigger simpel: de sidebar staat altijd in de DOM; CSS verbergt 'm
 * op smal scherm tenzij een toekomstige trigger 'm opent. (De brands-
 * page heeft minder filters dan materials, dus geen aparte
 * FilterProvider/Trigger nodig — bewust simpeler gehouden.)
 */

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  FilterSidebar,
  type FilterOption,
  type FilterSelection,
} from '@/components/ui/FilterSidebar'

export interface BrandsFilterSidebarProps {
  /** Beschikbare landen met resultaat-aantallen (server-side berekend). */
  countryOptions: FilterOption[]
  /** Momenteel geselecteerde land-waarden (uit `?country=`). */
  selectedCountries: string[]
}

export function BrandsFilterSidebar({
  countryOptions,
  selectedCountries,
}: BrandsFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const selected: FilterSelection = { country: selectedCountries }

  const pushSelection = (next: FilterSelection) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    const countries = next.country ?? []
    if (countries.length > 0) {
      params.set('country', countries.join(','))
    } else {
      params.delete('country')
    }
    params.delete('page')

    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    startTransition(() => {
      router.push(url, { scroll: false })
    })
  }

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.delete('country')
    params.delete('page')
    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    startTransition(() => {
      router.push(url, { scroll: false })
    })
  }

  return (
    <FilterSidebar
      sections={[
        {
          key: 'country',
          title: 'Country',
          options: countryOptions,
          searchable: true,
          defaultOpen: true,
          selectMode: 'multi',
        },
      ]}
      selected={selected}
      onChange={pushSelection}
      onClearAll={handleClearAll}
    />
  )
}
