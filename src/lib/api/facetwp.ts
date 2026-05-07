/**
 * FacetWP REST client
 * ----------------------------------------------------------------------
 * Roept het FacetWP-eindpunt aan op `/facetwp/v1/fetch` (POST).
 *
 * Architectuur-regels (zie `architecture-rules.md`):
 * - Altijd via FacetWP, nooit eigen filterlogica
 * - Geen client-side filtering
 *
 * Voor materials zijn er 20 facets (zie `src/types/facetwp.ts`).
 * Voor brand/article/talk/event/book is er (nog) géén FacetWP-config.
 */

import type {
  FacetSelection,
  FacetWPFetchRequest,
  FacetWPFetchResponse,
  MaterialSortValue,
} from '@/types/facetwp'

import { WP_API_URL } from './wordpress'

// --------------------------------------------------------------------
// Endpoint
// --------------------------------------------------------------------

const FACETWP_FETCH_ENDPOINT = `${WP_API_URL}/facetwp/v1/fetch`

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
// Core fetch
// --------------------------------------------------------------------

/**
 * Lage API-call. Geeft de ruwe FacetWP-response terug.
 *
 * Gebruik bij voorkeur de hogere helpers hieronder (`fetchMaterials`,
 * `fetchMaterialFacets`) — die zijn typesafe en abstraheren de
 * FacetWP-conventies weg.
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
    next: { revalidate: options?.revalidate ?? 60 },
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
// Hogere helpers — material-overzichtspagina
// --------------------------------------------------------------------

export interface FetchMaterialsParams {
  /** Geselecteerde facet-waarden (taxonomie-slugs per facet). */
  facets?: FacetSelection
  /** 1-indexed paginanummer. */
  page?: number
  /** Aantal per pagina. FacetWP-options: 10, 25, 50, 100. */
  perPage?: 10 | 25 | 50 | 100
  /** Sortering. Default `newest_first`. */
  sort?: MaterialSortValue
  /** Vrije zoekterm (gaat door SearchWP-engine `swp_materials`). */
  search?: string
  /** Optionele revalidate-tijd in seconden. Default 60. */
  revalidate?: number
  /** Cancel-signal. */
  signal?: AbortSignal
}

/**
 * Haal de gefilterde+gesorteerde+gepagineerde materials-lijst op.
 *
 * Geeft de volledige FacetWP-response terug zodat de UI ook de
 * bijgewerkte facet-counts en pager-state kan tonen.
 */
export async function fetchMaterials(
  params: FetchMaterialsParams = {},
): Promise<FacetWPFetchResponse> {
  const facets: FacetSelection = { ...params.facets }

  // Sort als facet-selectie
  if (params.sort) {
    facets.order = [params.sort]
  }

  // Search als facet-selectie
  if (params.search && params.search.trim().length > 0) {
    facets.search_materials = [params.search.trim()]
  }

  const body: FacetWPFetchRequest = {
    facets,
    paged: params.page ?? 1,
    query_args: {
      post_type: 'material',
      posts_per_page: params.perPage ?? 25,
    },
  }

  return facetwpFetch(body, {
    revalidate: params.revalidate,
    signal: params.signal,
  })
}
