/**
 * FacetWP REST client
 * ----------------------------------------------------------------------
 * Communiceert met `POST /wp-json/facetwp/v1/fetch` voor de
 * materials-overzichtspagina.
 *
 * Bevestigd contract (Johan, sessie 4, 12-05-2026):
 *  - Body wordt ingepakt in `{ data: { facets, query_args } }`
 *  - Alle 18 facet-keys altijd aanwezig in `data.facets` (lege arrays voor ongeselecteerd)
 *  - Response: `results: number[]`, `facets: { ... }`, `pager: { ... }`
 *  - Sort-waarden: `newest` / `oldest` / `az` / `za`
 *
 * Twee high-level helpers:
 *  - `fetchMaterialsFiltered(params)` — actuele query (filters + sort + zoek + paging)
 *  - `fetchMaterialFacetsBaseline()`  — ontdek-call met alle facets leeg, voor
 *    de volledige facet-set (label + alle choices) waarmee de FilterSidebar
 *    initieel rendert
 *
 * Beide retourneren de volledige FacetWP-response zodat de mapper-laag
 * later baseline en filtered kan mergen tot één UI-shape.
 *
 * Architectuur-regels (zie `architecture-rules.md`):
 *  - Altijd via FacetWP, nooit eigen filterlogica
 *  - Geen client-side filtering
 *
 * Productie-vereiste (open issue W12):
 *  - `/facetwp/v1/fetch` moet aan WP-zijde geactiveerd zijn via het
 *    `facetwp_api_can_access`-filter. Door Johan inmiddels open gezet.
 */

import {
  ALL_MATERIAL_FACET_KEYS,
  type AnyMaterialFacetName,
  type FacetSelection,
  type FacetWPFetchRequest,
  type FacetWPFetchResponse,
  type MaterialSortValue,
} from '@/types/facetwp'

import { WP_API_URL, isCacheDisabled } from './wordpress'

// --------------------------------------------------------------------
// Endpoint + constants
// --------------------------------------------------------------------

const FACETWP_FETCH_ENDPOINT = `${WP_API_URL}/facetwp/v1/fetch`

/** Default per-page voor de materials-grid. Aansluit op mockup (3 kolommen × 4 rijen). */
const DEFAULT_PER_PAGE = 12

/** Default revalidate-tijd in seconden voor materials-overzicht. */
const DEFAULT_REVALIDATE_FILTERED = 60

/**
 * Baseline-call (ongefilterde facet-set) verandert vrijwel niet — alleen
 * wanneer Johan nieuwe terms toevoegt of een facet hernoemt. Daarom een
 * agressievere cache-tijd dan de gefilterde call.
 */
const DEFAULT_REVALIDATE_BASELINE = 600

// --------------------------------------------------------------------
// Errors
// --------------------------------------------------------------------

export class FacetWPError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'FacetWPError'
  }
}

// --------------------------------------------------------------------
// Body builder — normaliseert selectie naar het 18-keys-formaat
// --------------------------------------------------------------------

/**
 * Bouwt de `data.facets`-shape: elke van de 18 facet-keys aanwezig,
 * met een (mogelijk lege) string-array als waarde.
 *
 * Conventie uit Johan's contract: keys mogen NIET ontbreken.
 */
function buildFacetsPayload(
  selection: FacetSelection,
): Record<AnyMaterialFacetName, string[]> {
  const out = {} as Record<AnyMaterialFacetName, string[]>
  for (const key of ALL_MATERIAL_FACET_KEYS) {
    const value = selection[key as keyof FacetSelection]
    out[key] = Array.isArray(value) ? (value as string[]) : []
  }
  return out
}

// --------------------------------------------------------------------
// Core fetch — low-level, dunne wrapper
// --------------------------------------------------------------------

/**
 * Low-level POST naar `/facetwp/v1/fetch`. Geeft de ruwe response terug.
 *
 * Gebruik bij voorkeur `fetchMaterialsFiltered` of
 * `fetchMaterialFacetsBaseline` — die zorgen voor het 18-keys-formaat
 * en de juiste cache-strategie.
 */
export async function facetwpFetch(
  body: FacetWPFetchRequest,
  options?: { revalidate?: number; signal?: AbortSignal },
): Promise<FacetWPFetchResponse> {
  const fetchOptions: RequestInit & {
    next?: { revalidate?: number }
  } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    signal: options?.signal,
  }

  // Sessie 6 — feedback Johan: cache-kill-switch voor staging/dev.
  // Zie `isCacheDisabled` + de toplevel comment in `wordpress.ts`.
  if (isCacheDisabled()) {
    fetchOptions.cache = 'no-store'
  } else {
    fetchOptions.next = {
      revalidate: options?.revalidate ?? DEFAULT_REVALIDATE_FILTERED,
    }
  }

  const res = await fetch(FACETWP_FETCH_ENDPOINT, fetchOptions)

  if (!res.ok) {
    let payload: unknown
    try {
      payload = await res.json()
    } catch {
      // body niet parsbaar — laat undefined
    }
    throw new FacetWPError(
      `FacetWP fetch failed (${res.status} ${res.statusText})`,
      res.status,
      payload,
    )
  }

  return (await res.json()) as FacetWPFetchResponse
}

// --------------------------------------------------------------------
// High-level helpers — material-overzichtspagina
// --------------------------------------------------------------------

export interface FetchMaterialsFilteredParams {
  /** Geselecteerde facet-waarden. Kan leeg zijn voor "alles". */
  facets?: FacetSelection
  /** 1-indexed paginanummer. Default 1. */
  page?: number
  /** Aantal per pagina. Default 12. */
  perPage?: number
  /** Sortering. Wanneer afwezig: WP-default (meestal `newest`). */
  sort?: MaterialSortValue
  /** Vrije zoekterm (gaat door SearchWP-engine `swp_materials`). */
  search?: string
  /** Optionele revalidate-tijd in seconden. Default 60. */
  revalidate?: number
  /** Cancel-signal. */
  signal?: AbortSignal
}

/**
 * Haal de gefilterde + gesorteerde + gepagineerde materials-lijst op.
 *
 * Retourneert de volledige FacetWP-response — de mapper-laag haalt daar
 * `results` (post-IDs), `facets.<name>.choices` (counts) en
 * `facets.<name>.selected` (actuele selectie) uit, en het pager-object.
 */
export async function fetchMaterialsFiltered(
  params: FetchMaterialsFilteredParams = {},
): Promise<FacetWPFetchResponse> {
  const selection: FacetSelection = { ...(params.facets ?? {}) }

  // Sort en search via de facets-payload (FacetWP-conventie).
  if (params.sort) {
    selection.order = [params.sort]
  }
  if (params.search && params.search.trim().length > 0) {
    selection.search_materials = [params.search.trim()]
  }

  const body: FacetWPFetchRequest = {
    data: {
      facets: buildFacetsPayload(selection),
      query_args: {
        post_type: 'material',
        posts_per_page: params.perPage ?? DEFAULT_PER_PAGE,
        paged: params.page ?? 1,
      },
    },
  }

  return facetwpFetch(body, {
    revalidate: params.revalidate ?? DEFAULT_REVALIDATE_FILTERED,
    signal: params.signal,
  })
}

/**
 * Baseline-call: alle facets leeg, één bekende per-page om snel te zijn.
 *
 * Doel: de FilterSidebar moet altijd ALLE facets tonen, ook die zonder
 * actuele selectie. De `facets`-map in de filtered-response bevat alleen
 * de relevante facets — onvoldoende voor de UI. Deze baseline geeft de
 * complete set met labels + alle choices.
 *
 * Cache-strategie: 10 minuten. De baseline verandert vrijwel niet —
 * alleen wanneer Johan facets aanpast aan WP-zijde.
 */
export async function fetchMaterialFacetsBaseline(options?: {
  revalidate?: number
  signal?: AbortSignal
}): Promise<FacetWPFetchResponse> {
  const body: FacetWPFetchRequest = {
    data: {
      facets: buildFacetsPayload({}),
      query_args: {
        post_type: 'material',
        posts_per_page: 1, // we hebben de results-array niet nodig
        paged: 1,
      },
    },
  }

  return facetwpFetch(body, {
    revalidate: options?.revalidate ?? DEFAULT_REVALIDATE_BASELINE,
    signal: options?.signal,
  })
}

// --------------------------------------------------------------------
// URL searchParams ↔ FacetSelection
// --------------------------------------------------------------------

/**
 * Conventie voor URL-encoding:
 *   ?material_category=biobased,recycled&renewable=yes&q=hemp&sort=newest&page=2
 *
 * - Filter-facets: comma-separated lijst van slugs, één query-param per facet
 * - `q` voor de zoekterm (intern → `search_materials`)
 * - `sort` voor de sortering (intern → `order`)
 * - `page` voor de pagina (separaat van FacetSelection)
 *
 * Lege selecties komen NIET in de URL — schoner voor de gebruiker en
 * voorkomt URL-bloat.
 */

const SEARCH_PARAM_KEY = 'q'
const SORT_PARAM_KEY = 'sort'
const PAGE_PARAM_KEY = 'page'
/** URL-param voor de ChannelBar (identiek op elke overzichtspagina). Mapt naar de `theme`-facet. */
const CHANNEL_PARAM_KEY = 'channel'
/** URL-param voor brand-deeplink ("Materials by [brand]"). REST-route, geen FacetWP. */
export const BRAND_PARAM_KEY = 'brand'

/**
 * Geldige sort-waarden zoals geretourneerd door FacetWP.
 * Gebruikt door de searchParams-parser om ongeldige input te negeren.
 */
const VALID_SORT_VALUES: ReadonlySet<MaterialSortValue> = new Set([
  'newest',
  'oldest',
  'az',
  'za',
])

/**
 * Filter-facet-keys (zonder search/sort) — als ReadonlySet voor snelle
 * include-check tijdens parsing.
 */
const FILTER_FACET_KEYS_SET: ReadonlySet<string> = new Set([
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
])

/**
 * Resultaat van het parsen van Next.js searchParams: zowel de
 * FacetSelection als de paginanummer (page hoort niet in FacetSelection).
 */
export interface ParsedSearchParams {
  selection: FacetSelection
  page: number
}

/**
 * Parse Next.js `searchParams` (string of string[] per key) naar een
 * `FacetSelection` + page.
 *
 * Tolerant: onbekende keys worden genegeerd; ongeldige sort-waarden
 * worden genegeerd; `page` valt terug op 1 bij niet-numeriek.
 */
export function parseFacetSelectionFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ParsedSearchParams {
  const selection: FacetSelection = {}

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (rawValue === undefined) continue
    const value = Array.isArray(rawValue) ? rawValue.join(',') : rawValue

    if (key === SEARCH_PARAM_KEY) {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        selection.search_materials = [trimmed]
      }
      continue
    }

    if (key === SORT_PARAM_KEY) {
      if (VALID_SORT_VALUES.has(value as MaterialSortValue)) {
        selection.order = [value as MaterialSortValue]
      }
      continue
    }

    if (key === PAGE_PARAM_KEY) {
      // page wordt apart geretourneerd, niet in selection
      continue
    }

    if (key === CHANNEL_PARAM_KEY) {
      // ChannelBar levert één slug; FacetWP-themefacet verwacht een slug.
      const slug = value.trim()
      if (slug.length > 0) {
        selection.theme = [slug]
      }
      continue
    }

    if (key === BRAND_PARAM_KEY) {
      // Brand-filter loopt via REST (?brand_id=), niet via FacetWP — zie
      // `parseBrandSlugFromSearchParams` + `listMaterialsForBrandArchive`.
      continue
    }

    if (FILTER_FACET_KEYS_SET.has(key)) {
      const slugs = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
      if (slugs.length > 0) {
        // We weten dat `key` een MaterialFacetName is — cast is safe.
        ;(selection as Record<string, string[]>)[key] = slugs
      }
      continue
    }

    // Onbekende key → genegeerd. Geen warning hier, dit is normaal voor
    // tracking-params (utm_*, fbclid, etc.).
  }

  // Page apart parsen
  const rawPage = searchParams[PAGE_PARAM_KEY]
  const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage
  const pageNum = Number.parseInt(pageStr ?? '', 10)
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1

  return { selection, page }
}

/**
 * Brand-slug uit `?brand=<slug>` — voor de REST-materials-route (geen FacetWP).
 */
export function parseBrandSlugFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): string | undefined {
  const raw = searchParams[BRAND_PARAM_KEY]
  if (raw === undefined) return undefined
  const slug = (Array.isArray(raw) ? raw[0] : raw).trim()
  return slug.length > 0 ? slug : undefined
}

/** Map UI-sort naar WP REST `orderby` + `order` (brand-archive, carousels). */
export function materialSortToWpOrder(sort?: MaterialSortValue): {
  orderby: 'date' | 'title'
  order: 'asc' | 'desc'
} {
  switch (sort) {
    case 'oldest':
      return { orderby: 'date', order: 'asc' }
    case 'az':
      return { orderby: 'title', order: 'asc' }
    case 'za':
      return { orderby: 'title', order: 'desc' }
    case 'newest':
    default:
      return { orderby: 'date', order: 'desc' }
  }
}

/**
 * Inverse: bouwt een `URLSearchParams` (of plain object) uit een
 * `FacetSelection` + page.
 *
 * Gebruik in `<Link href={...}>` voor filter-toggle-knoppen,
 * pagination-links, en clear-actions.
 *
 * Lege selecties worden weggelaten. Page 1 wordt ook weggelaten (schoner).
 */
export function facetSelectionToSearchParams(
  selection: FacetSelection,
  page = 1,
): URLSearchParams {
  const params = new URLSearchParams()

  for (const key of Object.keys(selection) as Array<keyof FacetSelection>) {
    const value = selection[key]
    if (!value || value.length === 0) continue

    if (key === 'search_materials') {
      const term = (value as string[])[0]?.trim()
      if (term) params.set(SEARCH_PARAM_KEY, term)
      continue
    }

    if (key === 'order') {
      const sort = (value as string[])[0]
      if (sort) params.set(SORT_PARAM_KEY, sort)
      continue
    }

    if (key === 'theme') {
      const slug = (value as string[])[0]?.trim()
      if (slug) params.set(CHANNEL_PARAM_KEY, slug)
      continue
    }

    // Filter-facet → comma-separated
    params.set(key, (value as string[]).join(','))
  }

  if (page > 1) {
    params.set(PAGE_PARAM_KEY, String(page))
  }

  return params
}

// --------------------------------------------------------------------
// Backward-compat alias
// --------------------------------------------------------------------

/**
 * Alias voor `fetchMaterialsFiltered`. Behouden zodat bestaande imports
 * (en de barrel-export in `index.ts`) niet breken. Nieuwe code gebruikt
 * de expliciete naam.
 *
 * @deprecated Gebruik `fetchMaterialsFiltered`.
 */
export const fetchMaterials = fetchMaterialsFiltered


/**
 * §F2.8 punt 6 — bouwt een deep-link naar de materials-catalog met EEN
 * facet voorgeselecteerd. Returnt `null` als de facet niet door de
 * URL-parser wordt opgepikt (FILTER_FACET_KEYS_SET) of als de waarde leeg
 * is — dan blijft de property-pill statisch i.p.v. een dode link.
 */
export function materialFilterHref(facet: string, value: string): string | null {
  if (!value) return null
  if (!FILTER_FACET_KEYS_SET.has(facet)) return null
  return `/materials?${facet}=${encodeURIComponent(value)}`
}
