/**
 * Material Channels — UI-label ↔ WP theme-slug mapping
 * ----------------------------------------------------------------------
 * De ChannelBar op /materials toont 20 thema-tabs. Elke tab is een directe
 * vertegenwoordiger van een term uit de WordPress `theme`-taxonomie.
 *
 * Bron: WP-admin /materials/themes (gecheckt 07-05-2026, 20 termen, alle
 * counts > 0). Zie sessie-log voor de mapping-validatie.
 *
 * Belangrijk:
 *  - Slugs hieronder zijn de WP-slugs, NIET de UI-labels.
 *  - Slugs gebruiken we in de URL en in de WP REST query (`?theme=<id>`
 *    via term-resolve, of als FacetWP-facet wanneer beschikbaar).
 *  - Labels zijn de presentatie. Wijzigingen in WP volgen we hier ná
 *    bevestiging (counts checken).
 *
 * Counts in de tabel zijn een 0-meting voor latere drift-checks; ze
 * worden niet runtime gebruikt.
 */

export interface MaterialChannel {
  /** Het WP theme-slug, bv. `'healing-environment'`. */
  slug: string
  /** Het label in de UI, bv. `'Healing Environment'`. */
  label: string
  /** Aantal materials op het moment van mapping (07-05-2026). Niet runtime. */
  baselineCount: number
}

/**
 * De canonieke "All"-tab. Geen WP-slug — staat voor "geen channel-filter".
 */
export const ALL_CHANNEL_SLUG = 'all' as const
export const ALL_CHANNEL_LABEL = 'All' as const

/**
 * Alle 20 material channels, in de volgorde van de UI mockup
 * (alfabetisch, identiek aan WordPress-admin).
 */
export const MATERIAL_CHANNELS: readonly MaterialChannel[] = [
  { slug: 'acoustic',            label: 'Acoustic',              baselineCount: 190 },
  { slug: 'biobased',            label: 'Biobased',              baselineCount: 2023 },
  { slug: 'biodegradable',       label: 'Biodegradable',         baselineCount: 188 },
  { slug: 'concept',             label: 'Concept',               baselineCount: 489 },
  { slug: 'curious',             label: 'Curious',               baselineCount: 304 },
  { slug: 'ecology',             label: 'Ecology',               baselineCount: 279 },
  { slug: 'healing-environment', label: 'Healing Environment',   baselineCount: 241 },
  { slug: 'high-tech',           label: 'High-tech',             baselineCount: 294 },
  { slug: 'innovation',          label: 'Innovation',            baselineCount: 830 },
  { slug: 'leisure-hospitality', label: 'Leisure & Hospitality', baselineCount: 129 },
  { slug: 'lightweight',         label: 'Lightweight',           baselineCount: 367 },
  { slug: 'manufacture',         label: 'Manufacture',           baselineCount: 251 },
  { slug: 'process',             label: 'Process',               baselineCount: 158 },
  { slug: 'recycling',           label: 'Recycling',             baselineCount: 674 },
  { slug: 'sense-sensibility',   label: 'Sense & Sensibility',   baselineCount: 1359 },
  { slug: 'smart-materials',     label: 'Smart Materials',       baselineCount: 251 },
  { slug: 'sustainable',         label: 'Sustainable',           baselineCount: 1030 },
  { slug: 'technology-transfer', label: 'Technology Transfer',   baselineCount: 81 },
  { slug: 'translucency',        label: 'Translucency',          baselineCount: 94 },
  { slug: 'trend',               label: 'Trend',                 baselineCount: 228 },
] as const

/**
 * Literal union van alle bekende channel-slugs. Krimpt automatisch
 * mee met de array hierboven (TS infereert).
 */
export type MaterialChannelSlug = (typeof MATERIAL_CHANNELS)[number]['slug']

/**
 * Inclusief de sentinel "all"-waarde — handig voor URL-state typing.
 */
export type MaterialChannelSlugOrAll = MaterialChannelSlug | typeof ALL_CHANNEL_SLUG

// --------------------------------------------------------------------
// Lookup helpers
// --------------------------------------------------------------------

/**
 * Zoek een channel op zijn slug. Returns `null` voor onbekende of de
 * sentinel "all"-waarde — UI moet dan geen filter tonen.
 *
 * @example
 *   const channel = getChannelBySlug('healing-environment')
 *   // → { slug: 'healing-environment', label: 'Healing Environment', baselineCount: 241 }
 */
export function getChannelBySlug(slug: string): MaterialChannel | null {
  if (slug === ALL_CHANNEL_SLUG) return null
  return MATERIAL_CHANNELS.find((c) => c.slug === slug) ?? null
}

/**
 * Zoek een channel op zijn UI-label. Returns `null` voor onbekende of "All".
 * Case-sensitive.
 *
 * @example
 *   const channel = getChannelByLabel('Healing Environment')
 *   // → { slug: 'healing-environment', ... }
 */
export function getChannelByLabel(label: string): MaterialChannel | null {
  if (label === ALL_CHANNEL_LABEL) return null
  return MATERIAL_CHANNELS.find((c) => c.label === label) ?? null
}

/**
 * Type-guard: is een willekeurige string een geldige channel-slug?
 * Sentinel "all" valt hier expres buiten (gebruik `isChannelSlugOrAll`
 * als die ook moet matchen).
 */
export function isChannelSlug(value: string): value is MaterialChannelSlug {
  return MATERIAL_CHANNELS.some((c) => c.slug === value)
}

/**
 * Type-guard inclusief sentinel — voor URL-parsing.
 */
export function isChannelSlugOrAll(
  value: string,
): value is MaterialChannelSlugOrAll {
  return value === ALL_CHANNEL_SLUG || isChannelSlug(value)
}

/**
 * Voor de ChannelBar (sessie 3) — die accepteert een readonly string-array.
 * Dit is de UI-volgorde van labels (zonder "All" — die wordt door de
 * ChannelBar zelf vooraan toegevoegd).
 */
export const MATERIAL_CHANNEL_LABELS: readonly string[] = MATERIAL_CHANNELS.map(
  (c) => c.label,
)
