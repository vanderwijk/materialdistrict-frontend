/**
 * FacetWP types
 * ----------------------------------------------------------------------
 * Gemodelleerd op de werkelijke FacetWP-config-export uit
 * `facetwp.json` (sessie 2 verkenning, 07-05-2026).
 *
 * Alle filterende facets zijn op `material` van toepassing en zijn
 * van het type `checkboxes` met source `tax/<naam>`.
 *
 * Brand/article/talk/event/book hebben (nog) geen FacetWP-config.
 */

// --------------------------------------------------------------------
// Facet-namen (literal union — exacte slugs uit facetwp.json)
// --------------------------------------------------------------------

/**
 * Filterende facets — material taxonomieën die de gebruiker kan aan/uit zetten.
 * Allemaal `checkboxes`, allemaal `operator: "and"`.
 * De 16 eigenschap-facets staan op `ghosts: yes` (toon ook lege opties).
 */
export type MaterialFacetName =
  // Categorisering
  | 'categories'
  | 'material_category'
  // Visueel
  | 'glossiness'
  | 'translucence'
  | 'structure'
  | 'texture'
  // Fysiek
  | 'hardness'
  | 'temperature'
  | 'acoustics'
  | 'odeur'
  | 'weight'
  // Resistance
  | 'fire_resistance'
  | 'uv_resistance'
  | 'weather_resistance'
  | 'scratch_resistance'
  | 'chemical_resistance'
  // Duurzaamheid
  | 'renewable'

/** Vrije zoek-facet (SearchWP engine `swp_materials`). */
export type MaterialSearchFacetName = 'search_materials'

/** Sortering. */
export type MaterialSortFacetName = 'order'

/** Sort-opties zoals geconfigureerd in FacetWP. */
export type MaterialSortValue =
  | 'newest_first'
  | 'oldest_first'
  | 'a_z'
  | 'z_a'

/** Pagers. */
export type MaterialPagerFacetName = 'results' | 'pagination'

/** Alle bekende facet-namen (filter + zoek + sort + pagers). */
export type AnyMaterialFacetName =
  | MaterialFacetName
  | MaterialSearchFacetName
  | MaterialSortFacetName
  | MaterialPagerFacetName

// --------------------------------------------------------------------
// Selectie (wat de UI naar de API stuurt)
// --------------------------------------------------------------------

/**
 * Door de gebruiker geselecteerde facet-waarden.
 * Voor checkboxes: array van term-slugs (bv. `["plastics", "naturals"]`).
 * Voor search: één string in een array (FacetWP-conventie).
 * Voor sort: één van de `MaterialSortValue` waarden in een array.
 *
 * Lege arrays (geen selectie) horen niet in de payload — laat ze weg.
 */
export type FacetSelection = {
  [K in MaterialFacetName]?: string[]
} & {
  [K in MaterialSearchFacetName]?: [string]
} & {
  [K in MaterialSortFacetName]?: [MaterialSortValue]
}

// --------------------------------------------------------------------
// FacetWP API request/response shape
// --------------------------------------------------------------------

/**
 * Body voor POST /facetwp/v1/fetch
 *
 * `facets` — geselecteerde waarden per facet
 * `query_args` — optioneel; FacetWP staat hier WP_Query-args toe
 * `paged` — paginanummer (1-indexed)
 * `extras` — selecteer welke extras meegeven worden (counts etc.)
 */
export interface FacetWPFetchRequest {
  facets: FacetSelection
  query_args?: {
    post_type?: string
    posts_per_page?: number
    paged?: number
    s?: string
  }
  paged?: number
  extras?: {
    sort?: string
    pager?: boolean
    counts?: boolean
  }
}

/**
 * FacetWP-response.
 *
 * `template` — gerenderd HTML van het FacetWP-template (gebruiken we niet;
 * wij renderen zelf in Next). Maar het veld is altijd aanwezig.
 *
 * `facets` — voor elke facet: het bijgewerkte HTML van de checkbox-lijst
 * MET counts per term, plus de ruwe term-data.
 *
 * `settings` — per facet de actuele opties (post-filter), bruikbaar om
 * de FilterSidebar te updaten.
 *
 * `pager` — pagination state.
 *
 * Belangrijk: deze interface is een conservatieve modellering.
 * FacetWP retourneert meer velden (sort_html, extras, etc.) — voeg
 * pas toe wanneer de UI ze gebruikt.
 */
export interface FacetWPFetchResponse {
  template: string
  settings: {
    [facetName: string]: FacetWPFacetSettings
  }
  facets?: {
    [facetName: string]: string // gerenderd HTML
  }
  pager?: FacetWPPager
  // FacetWP retourneert ook query_args, sql, etc. — niet getypt tot we ze gebruiken
}

/** Per-facet instelling/state na fetch. */
export interface FacetWPFacetSettings {
  facet: {
    name: string
    label: string
    type: string
    [k: string]: unknown
  }
  selected_values?: string[]
  /** Beschikbare opties met huidige counts. */
  choices?: FacetWPChoice[]
}

export interface FacetWPChoice {
  value: string // term-slug
  label: string // weergavenaam
  count: number
  /** Wanneer 0 én ghosts=yes: tonen als uitgegrijsd. */
  is_ghost?: boolean
  depth?: number
  parent_id?: number
}

export interface FacetWPPager {
  page: number
  per_page: number
  total_rows: number
  total_pages: number
}

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

/**
 * Lijst van alle filterende facet-namen — bruikbaar voor de FilterSidebar
 * om dynamisch alle filters te renderen.
 */
export const MATERIAL_FILTER_FACETS: readonly MaterialFacetName[] = [
  'categories',
  'material_category',
  'glossiness',
  'translucence',
  'structure',
  'texture',
  'hardness',
  'temperature',
  'acoustics',
  'odeur',
  'weight',
  'fire_resistance',
  'uv_resistance',
  'weather_resistance',
  'scratch_resistance',
  'chemical_resistance',
  'renewable',
] as const

/**
 * Facets die op `ghosts: yes` staan — opties met 0 resultaten worden
 * tóch getoond (uitgegrijsd) i.p.v. weggelaten.
 */
export const GHOST_ENABLED_FACETS: readonly MaterialFacetName[] = [
  'glossiness',
  'translucence',
  'structure',
  'texture',
  'hardness',
  'temperature',
  'acoustics',
  'odeur',
  'fire_resistance',
  'uv_resistance',
  'weather_resistance',
  'scratch_resistance',
  'weight',
  'chemical_resistance',
  'renewable',
] as const

export function isGhostEnabled(facet: MaterialFacetName): boolean {
  return (GHOST_ENABLED_FACETS as readonly string[]).includes(facet)
}
