/**
 * FacetWP types
 * ----------------------------------------------------------------------
 * Gemodelleerd op het door Johan opgeleverde contract `FacetWP materials
 * contract` (sessie 4, 12-05-2026) — inclusief live-verifieerde request-
 * en response-shapes.
 *
 * Belangrijke verschillen t.o.v. de sessie-2-modellering (gerectificeerd):
 *  - Body wordt INGEPAKT in een top-level `data`-object
 *  - Response top-level is `results: number[]` (post-IDs), niet `template`
 *  - Response `facets` is een object met getypte facet-results, niet HTML
 *  - Sort-waarden zijn `newest` / `oldest` / `az` / `za` (geen `_first`)
 *  - Request stuurt ALTIJD alle 18 facet-keys (lege arrays voor ongeselecteerd)
 *
 * Alle filterende facets zijn op `material` van toepassing.
 *
 * Brand/article/talk/event/book hebben (nog) geen FacetWP-config.
 */

// --------------------------------------------------------------------
// Facet-namen (literal union — exacte slugs uit Johan's contract)
// --------------------------------------------------------------------

/**
 * Filterende facets — material taxonomieën die de gebruiker kan aan/uit zetten.
 */
export type MaterialFacetName =
  // Categorisering
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

/**
 * Sort-opties — exact zoals door FacetWP geretourneerd in
 * `facets.order.choices[].value` (Johan's voorbeeld-response).
 */
export type MaterialSortValue = 'newest' | 'oldest' | 'az' | 'za'

/** Alle bekende facet-namen — bruikbaar als union voor record-keys. */
export type AnyMaterialFacetName =
  | MaterialFacetName
  | MaterialSearchFacetName
  | MaterialSortFacetName

/**
 * Volledige lijst van alle facet-keys die ALTIJD in de request worden
 * meegestuurd. Volgorde komt overeen met Johan's voorbeeld-payload.
 *
 * Conventie uit het contract: lege arrays voor facets zonder selectie,
 * niet weglaten.
 */
export const ALL_MATERIAL_FACET_KEYS: readonly AnyMaterialFacetName[] = [
  'search_materials',
  'order',
  'material_category',
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

/**
 * Sub-set: alleen de filter-facets die in de FilterSidebar verschijnen
 * (zonder `search_materials` en `order` — die hebben aparte UI).
 */
export const MATERIAL_FILTER_FACETS: readonly MaterialFacetName[] = [
  'material_category',
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

// --------------------------------------------------------------------
// Selectie (wat de UI naar de API stuurt)
// --------------------------------------------------------------------

/**
 * Door de gebruiker geselecteerde facet-waarden, gegroepeerd per facet.
 *
 * Conventie:
 *  - Filter-facets: array van term-slugs (bv. `["biobased", "recycled"]`)
 *  - `search_materials`: één string in een array (FacetWP-conventie)
 *  - `order`: één van de `MaterialSortValue`-waarden in een array
 *
 * Anders dan de oorspronkelijke modellering: in de UI mogen lege selecties
 * voorkomen — die worden tijdens het serialiseren naar lege arrays gemapt
 * voor alle 18 facet-keys (conform Johan's contract).
 */
export type FacetSelection = {
  [K in MaterialFacetName]?: string[]
} & {
  search_materials?: string[]
  order?: MaterialSortValue[]
}

// --------------------------------------------------------------------
// Request shape — `POST /wp-json/facetwp/v1/fetch`
// --------------------------------------------------------------------

/**
 * Inner body — wat onder de top-level `data`-key zit.
 *
 * Bevestigd door Johan's contract dat ALLE 18 facet-keys verplicht
 * aanwezig zijn (lege arrays voor ongeselecteerd).
 */
export interface FacetWPFetchRequestData {
  facets: {
    [K in AnyMaterialFacetName]: string[]
  }
  query_args: {
    post_type: 'material'
    posts_per_page: number
    paged: number
  }
}

/**
 * Volledige body — ingepakt in `{ data: ... }`.
 *
 * BELANGRIJK: zonder de `data`-wrapper accepteert FacetWP het verzoek
 * niet. Dit is anders dan wat de oorspronkelijke sessie-2-modellering
 * suggereerde — vandaar de rectificatie.
 */
export interface FacetWPFetchRequest {
  data: FacetWPFetchRequestData
}

// --------------------------------------------------------------------
// Response shape — exact uit Johan's contract
// --------------------------------------------------------------------

/**
 * Eén choice (term) binnen een facet — uit `facets.<name>.choices[]`.
 */
export interface FacetWPFacetChoice {
  /** Term-slug; wat als selectie wordt teruggestuurd. */
  value: string
  /** Weergavenaam voor de UI. */
  label: string
  /** Hiërarchie-diepte (0 = top-level). */
  depth: number
  /** Aantal matchende resultaten voor de huidige query. */
  count: number
}

/**
 * Eén facet binnen de response — uit `facets.<name>`.
 *
 * `type` is altijd `"checkboxes"`, `"search"`, of `"sort"` — afhankelijk
 * van de facet-configuratie aan WP-zijde. De frontend houdt het als string
 * om robuust te blijven bij toekomstige uitbreidingen.
 */
export interface FacetWPFacetResult {
  /** Naam van de facet (matcht een key uit `facets`). */
  name: string
  /** Weergavenaam voor de sectie-header. */
  label: string
  /** Facet-type: `"checkboxes"`, `"search"`, `"sort"`, etc. */
  type: string
  /** Op dit moment geselecteerde waarden. */
  selected: string[]
  /** Beschikbare opties met live counts. */
  choices: FacetWPFacetChoice[]
}

/**
 * Pager-state. `total_rows` is het totaal aantal matchende materials,
 * niet het aantal in de huidige pagina.
 */
export interface FacetWPPager {
  page: number
  per_page: number
  total_rows: number
  total_pages: number
}

/**
 * Volledige response van `POST /wp-json/facetwp/v1/fetch`.
 *
 * - `results`: post-IDs van de matchende materials, in sort-volgorde
 * - `facets`: per facet de huidige state — `Partial` omdat een facet
 *   alleen verschijnt als hij relevant is voor de huidige query
 * - `pager`: pagination-state
 *
 * NB: dit verschilt van de sessie-2-modellering (die `template`/`settings`
 * verwachtte) — gerectificeerd op basis van het Johan-contract.
 */
export interface FacetWPFetchResponse {
  results: number[]
  facets: Partial<Record<AnyMaterialFacetName, FacetWPFacetResult>>
  pager: FacetWPPager
}

// --------------------------------------------------------------------
// FilterSidebar-koppeling — pre-merged shape voor de UI
// --------------------------------------------------------------------

/**
 * Wat de FilterSidebar uiteindelijk binnenkrijgt: alle filter-facets
 * (geen search/sort) met label + opties + counts. Komt uit de mapper-
 * laag (`mapFacetWPToFilterSections` in `mappers.ts`).
 *
 * De `FilterSection`-shape uit `@/components/ui/FilterSidebar` is hier
 * leidend; deze interface is een lokale facet-aware variant zodat we de
 * mapper-laag niet via een component-type hoeven te route-en.
 */
export interface FacetWPFilterSection {
  key: MaterialFacetName
  title: string
  options: Array<{ value: string; label: string; count?: number }>
  selectMode?: 'multi' | 'single'
  defaultOpen?: boolean
  searchable?: boolean
}
