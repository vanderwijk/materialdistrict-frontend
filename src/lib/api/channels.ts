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
  id?: number
  slug?: string
  label?: string
  count?: number
}

/**
 * GET /md/v2/material-channels — de canonieke channels met term-id, slug en
 * label. Faalt zacht naar een lege lijst (de bar toont dan alleen "All" en het
 * overzicht filtert niet), zodat een hapering in de catalogus de pagina niet
 * breekt.
 */
export async function getChannelCatalog(): Promise<Channel[]> {
  try {
    const raw = await wpFetch<RawChannel[]>('/md/v2/material-channels', {
      revalidate: 3600,
    })
    if (!Array.isArray(raw)) return []
    return raw
      .filter((c) => typeof c.id === 'number' && typeof c.slug === 'string')
      .map((c) => ({
        id: c.id as number,
        slug: c.slug as string,
        label: c.label ?? (c.slug as string),
        count: c.count ?? 0,
      }))
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
