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

import { cache } from 'react'
import { wpFetch, getTerms, getTerm } from './wordpress'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import { normalizeMediaUrl } from '@/lib/utils/normalize-media-url'

export interface Channel {
  id: number
  slug: string
  label: string
  count: number
}

/**
 * Channel zoals getoond op de `/channel`-index (stap 12). Bovenop `Channel`:
 * de term-presentatievelden uit `/wp/v2/theme` (description + thumbnail) en de
 * term-niveau "Featured"-vlag (WF-6).
 *
 * - `count` = **materials**-telling uit `/md/v2/material-channels` (beslist:
 *   één betrouwbare bron i.p.v. een vage cross-type-som).
 * - `description` is HTML (term-description) of `''`.
 * - `thumbnailUrl` is `null` als de term geen `theme_thumbnail` heeft.
 * - `featured` komt uit het top-level REST-veld `featured` (Tax Meta
 *   `_featured`); valt terug op `false` — sortering dan op telling.
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
  const rawLabel =
    typeof c.label === 'string'
      ? c.label
      : typeof c.name === 'string'
        ? c.name
        : slug
  // WP term-names komen HTML-encoded terug (bv. `Leisure &amp; Hospitality`).
  // Decoderen bij de bron zodat de ChannelBar nette tekens toont én de
  // label↔label-matching (active tab + slug-lookup) consistent blijft.
  const label = decodeHtmlEntities(rawLabel)
  const count = Number(c.count ?? 0)
  return { id, slug, label, count: Number.isFinite(count) ? count : 0 }
}

/**
 * GET /md/v2/material-channels — de canonieke channels met term-id, slug en
 * label. Robuust voor afwijkende response-vormen; lege lijst bij fout.
 */
export const getChannelCatalog = cache(async function getChannelCatalog(): Promise<Channel[]> {
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
})

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
// Channels-index (stap 12) — de `/channel`-hub-overzichtspagina
// --------------------------------------------------------------------

/**
 * Bouwt de `/channel`-index: alle channels met presentatievelden voor de
 * hub-kaarten, featured-channels vooraan.
 *
 * Twee bronnen, parallel:
 *  1. `/md/v2/material-channels` (`getChannelCatalog`) — de canonieke set +
 *     betrouwbare **materials**-tellingen + label/slug (beslist als de telling
 *     die we tonen).
 *  2. `/wp/v2/theme` (`getTerms`) — term-`description` + de top-level velden
 *     `theme_thumbnail` (`{ id, url, alt }`) en `featured` (boolean). Per slug
 *     gejoined op de catalogus. (Top-level i.p.v. `meta[]`: term-meta is daar
 *     vaak leeg — bevestigd door Johan, deploy `0b0785e`.)
 *
 * De catalogus is leidend (de 20 channels). Faalt `/wp/v2/theme`, dan vallen
 * we terug op kale kaarten (geen description/thumbnail, `featured=false`) zodat
 * de index nooit leeg is.
 *
 * Sortering: featured eerst, daarna telling aflopend, daarna label oplopend.
 */
export async function getChannelsIndex(): Promise<ChannelIndexItem[]> {
  const [catalog, terms] = await Promise.all([
    getChannelCatalog(),
    getTerms('theme', { perPage: 100, hide_empty: false }).catch(() => []),
  ])

  // Term-presentatievelden per slug (top-level REST-velden).
  const termBySlug = new Map<
    string,
    { description: string; thumbnailUrl: string | null; featured: boolean }
  >()
  for (const t of terms) {
    termBySlug.set(t.slug, {
      description: typeof t.description === 'string' ? t.description : '',
      thumbnailUrl: t.theme_thumbnail?.url ?? null,
      featured: t.featured === true,
    })
  }

  const items: ChannelIndexItem[] = catalog.map((c) => {
    const term = termBySlug.get(c.slug)
    return {
      ...c,
      description: term?.description ?? '',
      thumbnailUrl: term?.thumbnailUrl ?? null,
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
// Channel-term — hero-data voor `/channel/[slug]` (stap 12)
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
export const getChannelTerm = cache(async function getChannelTerm(
  idOrSlug: number | string,
): Promise<ChannelTerm | null> {
  const term = await getTerm('theme', idOrSlug).catch(() => null)
  if (!term) return null

  return {
    id: term.id,
    slug: term.slug,
    label: decodeHtmlEntities(term.name),
    description: typeof term.description === 'string' ? term.description : '',
    thumbnailUrl: normalizeMediaUrl(term.theme_thumbnail?.url ?? null),
  }
})
