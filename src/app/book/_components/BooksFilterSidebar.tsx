'use client'

/**
 * BooksFilterSidebar — filterblok links op /books, in dezelfde huis-`FilterSidebar`
 * als de materials-/overzichtspagina's, zodat /books één familie is met de rest.
 *
 * STRUCTUUR NU, OPTIES LATER (akkoord Jeroen): de secties (Category, Format,
 * Publisher) staan er als huisstijl-structuur; de opties + tellingen vullen
 * zich zodra Johan de boek-categorieën/attributen aanmaakt en de filterbron
 * (FacetWP vs Store-API) is gekozen. Tot die tijd is de selectie een no-op en
 * tonen de secties (uitgeklapt) nog geen opties.
 *
 * Prijs-range, Sale, New releases en Last chance volgen in dezelfde ronde als
 * de databron (range-UI + tag-/on_sale-facetten).
 */

import { useState } from 'react'
import { FilterSidebar, type FilterSection, type FilterSelection } from '@/components/ui'

const BOOK_FILTER_SECTIONS: FilterSection[] = [
  { key: 'category', title: 'Category', options: [], selectMode: 'single' },
  { key: 'format', title: 'Format', options: [] },
  { key: 'publisher', title: 'Publisher', options: [], searchable: true },
]

export function BooksFilterSidebar() {
  // Lokale (no-op) selectie tot de databron er is. Wordt URL-gedreven zodra
  // Johans taxonomie + de filterbron beschikbaar zijn.
  const [selected, setSelected] = useState<FilterSelection>({})

  return (
    <FilterSidebar
      sections={BOOK_FILTER_SECTIONS}
      selected={selected}
      onChange={setSelected}
    />
  )
}
