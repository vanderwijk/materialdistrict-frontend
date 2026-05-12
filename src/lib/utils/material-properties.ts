/**
 * Material properties utility
 * ----------------------------------------------------------------------
 * Parseert `class_list: string[]` (uit de WP REST `material`-response)
 * naar een gestructureerd `MaterialProperties`-object.
 *
 * `class_list` bevat post-classes die WP genereert, waaronder taxonomie-
 * term-slugs in de vorm `<facet>-<value>`. Bijvoorbeeld:
 *   "glossiness-variable", "translucence-50-100-percent",
 *   "hardness-soft", "renewable-no", ...
 *
 * Dit bespaart een of meer extra `getTerms()`-calls op overzichtspagina's.
 */

import type {
  MaterialProperties,
  MaterialPropertyKey,
  MaterialTag,
} from '@/types/material'

const FACETS: readonly MaterialPropertyKey[] = [
  'glossiness',
  'translucence',
  'structure',
  'texture',
  'hardness',
  'temperature',
  'acoustics',
  'odeur',
  'weight',
  'fire_resistance',
  'uv_resistance',
  'weather_resistance',
  'scratch_resistance',
  'chemical_resistance',
  'renewable',
] as const

const EMPTY_PROPERTIES: MaterialProperties = {
  glossiness: '',
  translucence: '',
  structure: '',
  texture: '',
  hardness: '',
  temperature: '',
  acoustics: '',
  odeur: '',
  weight: '',
  fire_resistance: '',
  uv_resistance: '',
  weather_resistance: '',
  scratch_resistance: '',
  chemical_resistance: '',
  renewable: '',
}

/**
 * Parseer `class_list` naar een gestructureerd properties-object.
 *
 * Algoritme: voor elke string in `class_list`, kijk of die start met
 * een bekende facet-prefix (`<facet>-`). Zo ja, dan is de rest de waarde.
 *
 * Belangrijk: facet-namen met underscore (`fire_resistance`) en waarden
 * met streepjes (`50-100-percent`) bestaan beide. We matchen op de
 * langste facet-prefix die past, anders zou `weather_resistance-good`
 * kunnen worden geïnterpreteerd als facet `weather` met waarde
 * `resistance-good`.
 *
 * Onbekende keys worden genegeerd (zoals `post-136538`, `material`,
 * `type-material`, `status-publish`, etc.).
 */
export function parseMaterialProperties(
  classList: string[] | undefined,
): MaterialProperties {
  const result: MaterialProperties = { ...EMPTY_PROPERTIES }

  if (!classList || classList.length === 0) return result

  for (const cls of classList) {
    for (const facet of FACETS) {
      const prefix = `${facet}-`
      if (cls.startsWith(prefix)) {
        const value = cls.slice(prefix.length)
        if (value.length > 0) {
          result[facet] = value
        }
        break // class kan maar één facet matchen
      }
    }
  }

  return result
}

/**
 * Humaniseer een waarde-slug naar een leesbaar label.
 * Voor weergave in tags op de UI.
 *
 * Voorbeelden:
 *   '50-100-percent'  → '50–100%'
 *   'variable'        → 'Variable'
 *   'fire_resistance' → 'Fire resistance'
 *   'good'            → 'Good'
 *   '0-percent'       → '0%'
 */
export function humanizeValue(value: string): string {
  if (!value) return ''

  // Speciale case: percentages
  const pctMatch = value.match(/^(\d+)-(\d+)-percent$/)
  if (pctMatch) {
    return `${pctMatch[1]}–${pctMatch[2]}%`
  }
  const singlePctMatch = value.match(/^(\d+)-percent$/)
  if (singlePctMatch) {
    return `${singlePctMatch[1]}%`
  }

  // Default: vervang streepjes/underscores door spaties en kapitaliseer
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

/**
 * Humaniseer een facet-naam naar een label.
 * 'fire_resistance' → 'Fire resistance'
 */
export function humanizeFacet(facet: MaterialPropertyKey): string {
  return facet
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

/**
 * Convert MaterialProperties naar een lijst van tags voor UI-weergave.
 * Lege waarden worden weggelaten.
 *
 * `limit` filtert de lijst op de eerste N (gebruik op cards die maar
 * een paar tags tonen).
 */
export function toMaterialTags(
  properties: MaterialProperties,
  limit?: number,
): MaterialTag[] {
  const tags: MaterialTag[] = []

  for (const facet of FACETS) {
    const value = properties[facet]
    if (!value) continue
    tags.push({
      facet,
      value,
      label: humanizeValue(value),
    })
    if (limit !== undefined && tags.length >= limit) break
  }

  return tags
}

// --------------------------------------------------------------------
// Property groups (sessie 4 — detail page rebuild)
// --------------------------------------------------------------------

/**
 * Vier semantische groepen waarin we de eigenschappen weergeven op de
 * detail-page (afgesproken indeling met Jeroen, sessie 4 part 2):
 *
 *  - sensorial:       zintuiglijke waarnemingen (glansgraad, structuur,
 *                     hardheid, temperatuur, geur, gewicht)
 *  - technical:       prestatiegerichte eigenschappen (brand-/UV-/weer-/
 *                     krasbestendigheid, chemische bestendigheid)
 *  - environmental:   hernieuwbaarheid en circulariteit
 *  - content:         materiaal-samenstelling (biobased%, recycled%,
 *                     upcycled% — komt nog niet uit Johan's WP)
 *
 * `content` blijft voorlopig leeg — komt zodra de data-laag het levert.
 */
export type MaterialPropertyGroupKey =
  | 'sensorial'
  | 'technical'
  | 'environmental'
  | 'content'

const PROPERTY_GROUPS: Record<
  MaterialPropertyGroupKey,
  readonly MaterialPropertyKey[]
> = {
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
  environmental: ['renewable'],
  content: [], // tot Johan biobased_content / recycled_content / upcycled_content levert
}

/** Display-labels voor de groep-kopjes. */
export const PROPERTY_GROUP_LABELS: Record<MaterialPropertyGroupKey, string> = {
  sensorial: 'Sensorial properties',
  technical: 'Technical properties',
  environmental: 'Environmental',
  content: 'Content composition',
}

/**
 * Convert MaterialProperties naar een gegroepeerde lijst van tags, klaar
 * voor render. Lege groepen worden weggelaten zodat de UI niet "lege
 * kopjes" rendert.
 *
 * Returnt een array van groepen in vaste volgorde
 * (sensorial → technical → environmental → content) — ook al is dat
 * lexicaal onhandig, het volgt de mockup-volgorde en geeft consistente
 * page-structuur.
 */
export function groupTagsByCategory(
  properties: MaterialProperties,
): Array<{
  group: MaterialPropertyGroupKey
  label: string
  tags: MaterialTag[]
}> {
  const order: MaterialPropertyGroupKey[] = [
    'sensorial',
    'technical',
    'environmental',
    'content',
  ]

  return order
    .map((group) => {
      const tags: MaterialTag[] = []
      for (const facet of PROPERTY_GROUPS[group]) {
        const value = properties[facet]
        if (!value) continue
        tags.push({ facet, value, label: humanizeValue(value) })
      }
      return { group, label: PROPERTY_GROUP_LABELS[group], tags }
    })
    .filter((g) => g.tags.length > 0)
}
