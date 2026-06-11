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
 *  - Request stuurt ALTIJD alle facet-keys (lege arrays voor ongeselecteerd)
 *
 * Sessie 6 (19-05-2026) — 12 environmental + content-composition facets
 * toegevoegd (zelfde model als sensorial/technical). Facets staan in FacetWP;
 * choices in baseline/filter-UI blijven leeg zolang er nog geen materialen
 * met die termen geïndexeerd zijn. De frontend stuurt ze al mee in requests.
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
 *
 * Gegroepeerd zoals ze in de FilterSidebar verschijnen — zie
 * `MATERIAL_FACET_GROUPS` voor de runtime-mapping naar property-groepen.
 */
export type MaterialFacetName =
  // Categorisering
  | 'material_category'
  // Sensorial
  | 'glossiness'
  | 'translucence'
  | 'structure'
  | 'texture'
  | 'hardness'
  | 'temperature'
  | 'acoustics'
  | 'odeur'
  | 'weight'
  // Technical
  | 'fire_resistance'
  | 'uv_resistance'
  | 'weather_resistance'
  | 'scratch_resistance'
  | 'chemical_resistance'
  // Environmental
  | 'renewable'
  | 'energy_saving'
  | 'climate_neutral'
  | 'generates_energy'
  | 'reduces_energy_use'
  | 'reduces_water_use'
  | 'reduces_waste'
  | 'reduces_transport'
  | 'sustainably_produced'
  | 'free_from_toxins'
  // Content composition
  | 'biobased_content'
  | 'recycled_content'
  | 'upcycled_content'

/** Vrije zoek-facet (SearchWP engine `swp_materials`). */
export type MaterialSearchFacetName = 'search_materials'

/** Sortering. */
export type MaterialSortFacetName = 'order'

/**
 * Channel-facet — de `theme`-taxonomie ("channels"). Gevuld via de ChannelBar
 * (één slug), niet via de FilterSidebar. FacetWP-taxonomiefacets verwachten
 * term-slugs als waarde (niet term-id's, anders dan de WP-REST-collecties).
 */
export type MaterialChannelFacetName = 'theme'

/**
 * Brand-facet — FacetWP-facet `brand`, gekeyed op de brand-post-slug
 * (Johan 11-06-2026, plugin `facetwp-brand-facet.php`). Gevuld via
 * `?brand=<slug>` (deep-link vanaf "Materials by [brand]"), niet via de
 * FilterSidebar — puur een deep-link-facet.
 */
export type MaterialBrandFacetName = 'brand'

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
  | MaterialChannelFacetName
  | MaterialBrandFacetName

/**
 * Volledige lijst van alle facet-keys die ALTIJD in de request worden
 * meegestuurd. Volgorde komt overeen met Johan's voorbeeld-payload,
 * uitgebreid in sessie 6 met de environmental + content-composition
 * facets.
 *
 * Conventie uit het contract: lege arrays voor facets zonder selectie,
 * niet weglaten. Facets die aan WP-zijde nog niet als FacetWP-facet
 * geconfigureerd zijn worden door FacetWP genegeerd zonder error.
 */
export const ALL_MATERIAL_FACET_KEYS: readonly AnyMaterialFacetName[] = [
  'search_materials',
  'order',
  'theme',
  'brand',
  'material_category',
  // Sensorial
  'glossiness',
  'translucence',
  'structure',
  'texture',
  'hardness',
  'temperature',
  'acoustics',
  'odeur',
  'weight',
  // Technical
  'fire_resistance',
  'uv_resistance',
  'weather_resistance',
  'scratch_resistance',
  'chemical_resistance',
  // Environmental
  'renewable',
  'energy_saving',
  'climate_neutral',
  'generates_energy',
  'reduces_energy_use',
  'reduces_water_use',
  'reduces_waste',
  'reduces_transport',
  'sustainably_produced',
  'free_from_toxins',
  // Content composition
  'biobased_content',
  'recycled_content',
  'upcycled_content',
] as const

/**
 * Sub-set: alleen de filter-facets die in de FilterSidebar verschijnen
 * (zonder `search_materials` en `order` — die hebben aparte UI).
 */
export const MATERIAL_FILTER_FACETS: readonly MaterialFacetName[] = [
  'material_category',
  // Sensorial
  'glossiness',
  'translucence',
  'structure',
  'texture',
  'hardness',
  'temperature',
  'acoustics',
  'odeur',
  'weight',
  // Technical
  'fire_resistance',
  'uv_resistance',
  'weather_resistance',
  'scratch_resistance',
  'chemical_resistance',
  // Environmental
  'renewable',
  'energy_saving',
  'climate_neutral',
  'generates_energy',
  'reduces_energy_use',
  'reduces_water_use',
  'reduces_waste',
  'reduces_transport',
  'sustainably_produced',
  'free_from_toxins',
  // Content composition
  'biobased_content',
  'recycled_content',
  'upcycled_content',
] as const

// --------------------------------------------------------------------
// Property-groep-mapping (sessie 6) — leidend voor de FilterSidebar layout
// --------------------------------------------------------------------

/**
 * Filter-groep-keys. Komen overeen met de mockup-structuur:
 *  - `category`: het Material type-blok bovenaan (single-select)
 *  - `sensorial` / `technical` / `environmental` / `content`:
 *    de vier property-sub-groepen onder de "PROPERTIES"-separator
 *
 * Mockup-volgorde: Material type → Application (UI-placeholder) →
 * Properties (Sensorial → Technical → Environmental → Content).
 */
export type MaterialFacetGroup =
  | 'category'
  | 'sensorial'
  | 'technical'
  | 'environmental'
  | 'content'

/** Display-labels voor de property-groep-kopjes in de FilterSidebar. */
export const MATERIAL_FACET_GROUP_LABELS: Record<MaterialFacetGroup, string> = {
  category: 'Material type',
  sensorial: 'Sensorial',
  technical: 'Technical',
  environmental: 'Environmental',
  content: 'Content composition',
}

/**
 * Welke facets vallen onder welke property-groep. Statisch gebonden aan
 * ons UI-ontwerp — niet uit de FacetWP-response af te leiden.
 *
 * Volgorde binnen elke groep = volgorde van weergave in de sidebar.
 */
export const MATERIAL_FACET_GROUPS: Record<MaterialFacetGroup, readonly MaterialFacetName[]> = {
  category: ['material_category'],
  sensorial: [
    'glossiness',
    'translucence',
    'structure',
    'texture',
    'hardness',
    'temperature',
    'acoustics',
    'odeur',
    'weight',
  ],
  technical: [
    'fire_resistance',
    'uv_resistance',
    'weather_resistance',
    'scratch_resistance',
    'chemical_resistance',
  ],
  environmental: [
    'renewable',
    'energy_saving',
    'climate_neutral',
    'generates_energy',
    'reduces_energy_use',
    'reduces_water_use',
    'reduces_waste',
    'reduces_transport',
    'sustainably_produced',
    'free_from_toxins',
  ],
  content: ['biobased_content', 'recycled_content', 'upcycled_content'],
}

/**
 * Reverse-lookup: gegeven een facet-naam, in welke groep zit hij?
 * Gegenereerd uit `MATERIAL_FACET_GROUPS` zodat één bron van waarheid
 * blijft.
 */
export const MATERIAL_FACET_TO_GROUP: Record<MaterialFacetName, MaterialFacetGroup> = (() => {
  const out = {} as Record<MaterialFacetName, MaterialFacetGroup>
  for (const [group, facets] of Object.entries(MATERIAL_FACET_GROUPS) as Array<
    [MaterialFacetGroup, readonly MaterialFacetName[]]
  >) {
    for (const facet of facets) {
      out[facet] = group
    }
  }
  return out
})()

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
 * voor alle facet-keys (conform Johan's contract).
 */
export type FacetSelection = {
  [K in MaterialFacetName]?: string[]
} & {
  search_materials?: string[]
  order?: MaterialSortValue[]
  /** Channel (theme-taxonomie), één slug. Gevuld via `?channel=`. */
  theme?: string[]
  /** Brand (FacetWP `brand`-facet, brand-slug), één slug. Gevuld via `?brand=`. */
  brand?: string[]
}

// --------------------------------------------------------------------
// Request shape — `POST /wp-json/facetwp/v1/fetch`
// --------------------------------------------------------------------

/**
 * Inner body — wat onder de top-level `data`-key zit.
 *
 * Bevestigd door Johan's contract dat ALLE facet-keys verplicht aanwezig
 * zijn (lege arrays voor ongeselecteerd).
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
