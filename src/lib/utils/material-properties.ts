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
