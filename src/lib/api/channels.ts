/**
 * Channel-catalogus — de canonieke thema-lijst voor de ChannelBar.
 * ----------------------------------------------------------------------
 * Bron: GET /md/v2/material-channels → `{ id, slug, label, count }` per channel.
 * Levert in één call zowel de bar-opties (label + volgorde) als de slug→id-
 * resolutie die de overzichten nodig hebben voor het server-side thema-filter
 * (`?theme=<id>` op de WP-collecties).
 *
 * `count` is een material-meting (catalog) en wordt niet runtime gebruikt voor
 * andere content-types; de bar toont geen counts.
 */

import { wpFetch } from './wordpress'

export interface Channel {
  id: number
  slug: string
  label: string
  count: number
}

interface RawChannel {
  id?: number | string
  slug?: string
  label?: string
  count?: number
}

function parseChannelId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 0 ? Math.trunc(value) : null
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const id = Number.parseInt(value, 10)
    return id > 0 ? id : null
  }
  return null
}

interface RawMaterialChannelsResponse {
  channels?: RawChannel[]
}

function mapChannelList(raw: RawChannel[] | undefined): Channel[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((c) => {
      const id = parseChannelId(c.id)
      const slug = typeof c.slug === 'string' ? c.slug : ''
      if (null === id || '' === slug) return null
      return {
        id,
        slug,
        label: c.label ?? slug,
        count: typeof c.count === 'number' ? c.count : 0,
      }
    })
    .filter((c): c is Channel => c !== null)
}

/**
 * GET /md/v2/material-channels — de canonieke channels met term-id, slug en
 * label. Faalt zacht naar een lege lijst (de bar toont dan alleen "All" en het
 * overzicht filtert niet), zodat een hapering in de catalogus de pagina niet
 * breekt.
 */
export async function getChannelCatalog(): Promise<Channel[]> {
  try {
    const raw = await wpFetch<RawMaterialChannelsResponse | RawChannel[]>(
      '/md/v2/material-channels',
      {
        revalidate: 3600,
      },
    )
    const list = Array.isArray(raw) ? raw : raw?.channels
    return mapChannelList(list)
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
