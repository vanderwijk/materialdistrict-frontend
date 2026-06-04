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

import { wpFetch } from './wordpress'

export interface Channel {
  id: number
  slug: string
  label: string
  count: number
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
