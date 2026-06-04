/**
 * Channel-catalogus — de canonieke thema-lijst voor de ChannelBar.
 * ----------------------------------------------------------------------
 * Bron: GET /md/v2/material-channels → channels met `id`, `slug`, `label`,
 * `count`. Levert in één call zowel de bar-opties (label + volgorde) als de
 * slug→id-resolutie die de overzichten nodig hebben voor het server-side
 * thema-filter (`?theme=<id>` op de WP-collecties).
 *
 * Defensief geparsed: accepteert een kale array of een wrapper
 * ({ channels | data | items | terms: [...] }), en een `id` als getal óf als
 * numerieke string (WP-term-id's komen soms als string terug). Faalt zacht
 * naar een lege lijst zodat een hapering de pagina niet breekt.
 */

import {
  wpFetch,
  getTerms,
  getTerm,
  getMediaBatch,
  type WPTermResponse,
} from './wordpress'

export interface Channel {
  id: number
  slug: string
  label: string
  count: number
}

/**
 * Channel zoals getoond op de `/channels`-index (stap 12). Bovenop `Channel`:
 * de term-presentatievelden uit `/wp/v2/theme` (description + thumbnail) en de
 * term-niveau "Featured"-vlag (WF-6).
 *
 * - `count` = **materials**-telling uit `/md/v2/material-channels` (beslist:
 *   één betrouwbare bron i.p.v. een vage cross-type-som).
 * - `description` is HTML (term-description) of `''`.
 * - `thumbnailUrl` is `null` als de term geen thumbnail heeft of de meta nog
 *   niet geëxposed is.
 * - `featured` valt terug op `false` zolang de REST-exposure van de term-vlag
 *   nog niet live is (keuze 5) — sortering valt dan terug op telling.
 */
export interface ChannelIndexItem extends Channel {
  description: string
  thumbnailUrl: string | null
  featured: boolean
}

/** Haal de array uit een kale array of een veelvoorkomende wrapper. */
function extractArray(res: unknown): unknown[] {
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    for (const key of ['channels', 'data', 'items', 'terms']) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[]
    }
  }
  return []
}

/** Map één ruw item naar een Channel, of null als het ongeldig is. */
function toChannel(raw: unknown): Channel | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const id = Number(c.id ?? c.term_id)
  const slug = typeof c.slug === 'string' ? c.slug : ''
  if (!Number.isFinite(id) || id <= 0 || slug.length === 0) return null
  const label =
    typeof c.label === 'string'
      ? c.label
      : typeof c.name === 'string'
        ? c.name
        : slug
  const count = Number(c.count ?? 0)
  return { id, slug, label, count: Number.isFinite(count) ? count : 0 }
}

/**
 * GET /md/v2/material-channels — de canonieke channels met term-id, slug en
 * label. Robuust voor afwijkende response-vormen; lege lijst bij fout.
 */
export async function getChannelCatalog(): Promise<Channel[]> {
  try {
    const res = await wpFetch<unknown>('/md/v2/material-channels', {
      revalidate: 3600,
    })
    return extractArray(res)
      .map(toChannel)
      .filter((c): c is Channel => c !== null)
  } catch {
    return []
  }
}

/**
 * Resolve een channel-slug naar het WP `theme` term-id. `null` betekent
 * "geen filter" (onbekende slug of de "All"-tab).
 */
export function resolveChannelId(
  channels: Channel[],
  slug: string | undefined,
): number | null {
  if (!slug) return null
  return channels.find((c) => c.slug === slug)?.id ?? null
}

// --------------------------------------------------------------------
// Channels-index (stap 12) — de `/channels`-hub-overzichtspagina
// --------------------------------------------------------------------

/** Lees een meta-veld defensief; meta kan een object of (lege) array zijn. */
function readTermMeta(
  meta: Record<string, unknown> | unknown[] | undefined,
  key: string,
): unknown {
  if (!meta || Array.isArray(meta)) return undefined
  return meta[key]
}

/**
 * Term-thumbnail uit meta. `theme_thumbnail` (commit b766803) komt of als
 * directe URL-string, of als attachment-id (integer/numerieke string). We
 * geven hier de URL terug als die er meteen is, of een id om later in batch
 * te resolven. Onbekend → `{ url: null, id: null }`.
 */
function parseThumbnail(value: unknown): { url: string | null; id: number | null } {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length === 0) return { url: null, id: null }
    if (/^https?:\/\//i.test(trimmed)) return { url: trimmed, id: null }
    const asNum = Number(trimmed)
    if (Number.isFinite(asNum) && asNum > 0) return { url: null, id: asNum }
    return { url: null, id: null }
  }
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return { url: null, id: value }
  }
  return { url: null, id: null }
}

/** Coerce een ruwe meta-waarde naar boolean (`true`/`'1'`/`1`/`'true'`). */
function parseFlag(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    return v === '1' || v === 'true' || v === 'yes'
  }
  return false
}

/** Kandidaat-meta-keys voor de term-niveau "Featured"-vlag (fallback als meta niet leeg is). */
const FEATURED_META_KEYS = ['theme_featured', 'featured', 'is_featured', '_featured'] as const

/** Lees thumbnail uit REST `theme_thumbnail` (primair) of term-meta (fallback). */
function parseThemeThumbnailFromTerm(term: WPTermResponse): {
  url: string | null
  id: number | null
} {
  const rest = term.theme_thumbnail
  if (rest && typeof rest === 'object' && typeof rest.url === 'string' && rest.url) {
    const id = typeof rest.id === 'number' && rest.id > 0 ? rest.id : null
    return { url: rest.url, id }
  }
  const meta = term.meta as Record<string, unknown> | unknown[] | undefined
  return parseThumbnail(readTermMeta(meta, 'theme_thumbnail'))
}

/** Lees featured uit REST `featured` (primair) of term-meta (fallback). */
function parseFeaturedFromTerm(term: WPTermResponse): boolean {
  if (term.featured === true) return true
  const meta = term.meta as Record<string, unknown> | unknown[] | undefined
  return FEATURED_META_KEYS.some((k) => parseFlag(readTermMeta(meta, k)))
}

/**
 * Bouwt de `/channels`-index: alle channels met presentatievelden voor de
 * hub-kaarten, featured-channels vooraan.
 *
 * Twee bronnen, parallel:
 *  1. `/md/v2/material-channels` (`getChannelCatalog`) — de canonieke set +
 *     betrouwbare **materials**-tellingen + label/slug (beslist als de telling
 *     die we tonen).
 *  2. `/wp/v2/theme` (`getTerms`) — term-description, `theme_thumbnail` en de
 *     "Featured"-vlag. Per slug gejoined op de catalogus.
 *
 * De catalogus is leidend (de 20 channels). Faalt `/wp/v2/theme`, dan vallen
 * we terug op kale kaarten (geen description/thumbnail, `featured=false`) zodat
 * de index nooit leeg is.
 *
 * Sortering: featured eerst, daarna telling aflopend, daarna label oplopend.
 * Zolang geen enkele term `featured` is (REST-exposure nog niet live, keuze 5),
 * is dat effectief telling-aflopend.
 */
export async function getChannelsIndex(): Promise<ChannelIndexItem[]> {
  const [catalog, terms] = await Promise.all([
    getChannelCatalog(),
    getTerms('theme', { perPage: 100, hide_empty: false }).catch(() => []),
  ])

  // Term-presentatievelden per slug.
  const termBySlug = new Map<
    string,
    { description: string; thumbUrl: string | null; thumbId: number | null; featured: boolean }
  >()
  for (const t of terms) {
    const { url, id } = parseThemeThumbnailFromTerm(t)
    const featured = parseFeaturedFromTerm(t)
    termBySlug.set(t.slug, {
      description: typeof t.description === 'string' ? t.description : '',
      thumbUrl: url,
      thumbId: id,
      featured,
    })
  }

  // Thumbnails die als attachment-id binnenkwamen in één batch resolven.
  const thumbIds = Array.from(termBySlug.values())
    .map((v) => v.thumbId)
    .filter((id): id is number => id !== null)
  const mediaUrlById = new Map<number, string>()
  if (thumbIds.length > 0) {
    try {
      const media = await getMediaBatch(Array.from(new Set(thumbIds)))
      for (const m of media) mediaUrlById.set(m.id, m.source_url)
    } catch {
      // Thumbnail-resolve is niet kritiek — kaart valt terug op geen-thumbnail.
    }
  }

  const items: ChannelIndexItem[] = catalog.map((c) => {
    const term = termBySlug.get(c.slug)
    const thumbnailUrl =
      term?.thumbUrl ?? (term?.thumbId ? mediaUrlById.get(term.thumbId) ?? null : null)
    return {
      ...c,
      description: term?.description ?? '',
      thumbnailUrl,
      featured: term?.featured ?? false,
    }
  })

  items.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    if (b.count !== a.count) return b.count - a.count
    return a.label.localeCompare(b.label)
  })

  return items
}

// --------------------------------------------------------------------
// Channel-term — hero-data voor `/channels/[slug]` (stap 12)
// --------------------------------------------------------------------

/** Presentatie van één channel-term: hero-naam, -description en -thumbnail. */
export interface ChannelTerm {
  id: number
  slug: string
  label: string
  /** Term-description (HTML) of `''`. */
  description: string
  thumbnailUrl: string | null
}

/**
 * Haal één channel-term op via `/wp/v2/theme` voor de hub-hero (naam +
 * description + `theme_thumbnail`). Accepteert een term-id of slug. `null` bij
 * een onbekende term — de pagina kan dan 404'en (keuze 6).
 */
export async function getChannelTerm(
  idOrSlug: number | string,
): Promise<ChannelTerm | null> {
  const term = await getTerm('theme', idOrSlug).catch(() => null)
  if (!term) return null

  const { url, id } = parseThemeThumbnailFromTerm(term)
  let thumbnailUrl = url
  if (!thumbnailUrl && id) {
    try {
      const [media] = await getMediaBatch([id])
      thumbnailUrl = media?.source_url ?? null
    } catch {
      thumbnailUrl = null
    }
  }

  return {
    id: term.id,
    slug: term.slug,
    label: term.name,
    description: typeof term.description === 'string' ? term.description : '',
    thumbnailUrl,
  }
}
