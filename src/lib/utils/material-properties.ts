/**
 * Material properties utility
 * ----------------------------------------------------------------------
 * Parseert `class_list: string[]` (uit de WP REST `material`-response)
 * naar een gestructureerd `MaterialProperties`-object van 24 velden,
 * verdeeld over 4 groepen (Sensorial / Technical / Environmental /
 * Content composition).
 *
 * `class_list` bevat post-classes die WP genereert, waaronder
 * taxonomie-term-slugs in de vorm `<facet>-<value>`. Bijvoorbeeld:
 *   "glossiness-variable", "translucence-50-100-percent",
 *   "hardness-soft", "renewable-no", ...
 *
 * Niet-ingevulde velden krijgen `''` als waarde — UI rendert die als
 * "Not specified" zodat fabrikanten zien wat ze nog moeten aanvullen.
 */

import type {
  MaterialProperties,
  MaterialPropertyKey,
  MaterialTag,
} from '@/types/material'

// --------------------------------------------------------------------
// FACETS — alle 24 properties die UI kent
// --------------------------------------------------------------------

const FACETS: readonly MaterialPropertyKey[] = [
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
  // Content composition (percentages)
  'biobased_content',
  'recycled_content',
  'upcycled_content',
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
  energy_saving: '',
  climate_neutral: '',
  generates_energy: '',
  reduces_energy_use: '',
  reduces_water_use: '',
  reduces_waste: '',
  reduces_transport: '',
  sustainably_produced: '',
  free_from_toxins: '',
  biobased_content: '',
  recycled_content: '',
  upcycled_content: '',
}

// --------------------------------------------------------------------
// Parser
// --------------------------------------------------------------------

/**
 * Parseer `class_list` naar een gestructureerd properties-object.
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

// --------------------------------------------------------------------
// Humanizers
// --------------------------------------------------------------------

/**
 * Humaniseer een waarde-slug naar een leesbaar label.
 *
 * Voorbeelden:
 *   '50-100-percent'  → '50–100%'
 *   '0-percent'       → '0%'
 *   'variable'        → 'Variable'
 *   'good'            → 'Good'
 */
export function humanizeValue(value: string): string {
  if (!value) return ''

  // Percentages
  const pctRange = value.match(/^(\d+)-(\d+)-percent$/)
  if (pctRange) return `${pctRange[1]}–${pctRange[2]}%`
  const pctSingle = value.match(/^(\d+)-percent$/)
  if (pctSingle) return `${pctSingle[1]}%`

  return value
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

/**
 * Humaniseer een facet-naam naar een label.
 * 'fire_resistance' → 'Fire resistance', 'energy_saving' → 'Energy saving'.
 */
export function humanizeFacet(facet: MaterialPropertyKey): string {
  // Speciale gevallen waar de auto-titlecase te kort komt
  const overrides: Partial<Record<MaterialPropertyKey, string>> = {
    uv_resistance: 'UV resistance',
    reduces_energy_use: 'Reduces energy-use',
    reduces_water_use: 'Reduces water-use',
    free_from_toxins: 'Free from toxins',
    biobased_content: 'Biobased content',
    recycled_content: 'Recycled content',
    upcycled_content: 'Upcycled content',
  }
  if (overrides[facet]) return overrides[facet]!

  return facet
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

/**
 * Convert MaterialProperties naar een lijst van tags voor UI-weergave.
 * Lege waarden worden weggelaten (gebruik op MaterialCard waar maar een
 * paar tags worden getoond — niet op de detail-page die ook lege rijen
 * moet tonen).
 *
 * `limit` filtert op eerste N.
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
// Property groups — 4 categorieën zoals mockup
// --------------------------------------------------------------------

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

/** Display-labels voor de groep-kopjes. */
export const PROPERTY_GROUP_LABELS: Record<MaterialPropertyGroupKey, string> = {
  sensorial: 'Sensorial',
  technical: 'Technical',
  environmental: 'Environmental',
  content: 'Content composition',
}

// --------------------------------------------------------------------
// Semantic value scoring (positive / neutral / negative / unknown)
// --------------------------------------------------------------------

/**
 * Welke semantische pill-kleur past bij een gegeven facet+value combinatie?
 * Bron voor de CSS-klassen die op `.mat-property-tag-value` worden gezet.
 *
 *  - 'positive'   → groen (Yes, Good, Renewable, Sustainably produced)
 *  - 'neutral'    → geel (Moderate, Variable, Medium ...)
 *  - 'negative'   → rood (No, Poor, Hard, etc — alleen voor
 *                   sustainability-velden waar 'No' echt slecht is)
 *  - 'unknown'    → grijs (lege waarde of "Unknown")
 *  - 'default'    → grijs (descriptief, geen oordeel — bv Glossiness=Matte)
 */
export type PillSemantic = 'positive' | 'neutral' | 'negative' | 'unknown' | 'default'

/**
 * Voor sustainability-velden is een Yes positief en een No negatief.
 * Voor andere velden is Yes/No descriptief, geen waarde-oordeel.
 */
const SUSTAINABILITY_FACETS = new Set<MaterialPropertyKey>([
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
])

export function getPillSemantic(
  facet: MaterialPropertyKey,
  rawValue: string,
): PillSemantic {
  if (!rawValue) return 'unknown'
  const v = rawValue.toLowerCase()

  // Sustainability: Yes = positief, No = negatief
  if (SUSTAINABILITY_FACETS.has(facet)) {
    if (v === 'yes') return 'positive'
    if (v === 'no') return 'negative'
  }

  // Performance-velden (Technical resistance + acoustics): Good/Poor zijn oordeels-waarden
  if (v === 'good' || v === 'yes') return 'positive'
  if (v === 'moderate' || v === 'variable' || v === 'medium') return 'neutral'
  if (v === 'poor' || v === 'no') return 'negative'
  if (v === 'unknown') return 'unknown'

  // Default: descriptieve waarde zonder oordeel
  return 'default'
}

// --------------------------------------------------------------------
// Grouped properties for detail-page render
// --------------------------------------------------------------------

export interface GroupedPropertyEntry {
  facet: MaterialPropertyKey
  /** Label van het facet, bv. "Glossiness". */
  facetLabel: string
  /** Raw waarde uit de mapper (lege string = niet gespecificeerd). */
  rawValue: string
  /** Display-label voor in de UI ("Not specified" als raw leeg is). */
  displayValue: string
  /** Semantische pill-kleur. */
  semantic: PillSemantic
}

export interface GroupedPropertyResult {
  group: MaterialPropertyGroupKey
  label: string
  entries: GroupedPropertyEntry[]
}

/**
 * Voor de detail-page: rendert ALLE properties in 4 groepen, incl. lege.
 * Lege waarden krijgen `"Not specified"` als display-label en een grijze
 * pill. Dit motiveert brands om hun data aan te vullen.
 *
 * Voor MaterialCard (compact): gebruik `toMaterialTags` ipv deze functie
 * — die slaat lege waarden over.
 */
export function getAllPropertyGroups(
  properties: MaterialProperties,
): GroupedPropertyResult[] {
  const order: MaterialPropertyGroupKey[] = [
    'sensorial',
    'technical',
    'environmental',
    'content',
  ]

  return order.map((group) => ({
    group,
    label: PROPERTY_GROUP_LABELS[group],
    entries: PROPERTY_GROUPS[group].map((facet): GroupedPropertyEntry => {
      const rawValue = properties[facet]
      const hasValue = rawValue !== ''
      return {
        facet,
        facetLabel: humanizeFacet(facet),
        rawValue,
        displayValue: hasValue ? humanizeValue(rawValue) : 'Not specified',
        semantic: hasValue ? getPillSemantic(facet, rawValue) : 'unknown',
      }
    }),
  }))
}

/**
 * Legacy alias — gebruikt door eerdere render-code die `groupTagsByCategory`
 * verwachtte. Deze versie skipt lege waarden (oude gedrag); voor de
 * nieuwe altijd-tonen-detail-page is `getAllPropertyGroups` de juiste.
 */
export function groupTagsByCategory(
  properties: MaterialProperties,
): Array<{
  group: MaterialPropertyGroupKey
  label: string
  tags: MaterialTag[]
}> {
  return getAllPropertyGroups(properties)
    .map((g) => ({
      group: g.group,
      label: g.label,
      tags: g.entries
        .filter((e) => e.rawValue !== '')
        .map((e) => ({
          facet: e.facet,
          value: e.rawValue,
          label: e.displayValue,
        })),
    }))
    .filter((g) => g.tags.length > 0)
}
