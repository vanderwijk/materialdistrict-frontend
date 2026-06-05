/**
 * buildMaterialPropertyOptions — assembles the per-property select options for
 * the material form's "Search & filtering" block.
 *
 * All 24 property facets use the same model (WP taxonomy + FacetWP + class_list).
 * The live FacetWP baseline is authoritative whenever it returns choices — that
 * keeps form selects aligned with the public filters. Environmental and content-
 * composition facets are in FacetWP too; they often have empty choices until
 * materials carry those terms. When a facet is missing from the baseline or has
 * no choices yet, we fall back to static `PROPERTY_VALUE_OPTIONS`.
 */

import type { MaterialPropertyKey } from '@/types/material'
import type { AnyMaterialFacetName, FacetWPFetchResponse } from '@/types/facetwp'
import {
  PROPERTY_VALUE_OPTIONS,
  type PropertyValueOption,
} from '@/lib/utils/material-properties'

export type MaterialPropertyOptions = Record<MaterialPropertyKey, PropertyValueOption[]>

export function buildMaterialPropertyOptions(
  baseline?: FacetWPFetchResponse | null,
): MaterialPropertyOptions {
  const keys = Object.keys(PROPERTY_VALUE_OPTIONS) as MaterialPropertyKey[]
  const out = {} as MaterialPropertyOptions

  for (const key of keys) {
    const facet = baseline?.facets?.[key as AnyMaterialFacetName]
    const choices = facet?.choices
    if (choices && choices.length > 0) {
      out[key] = choices
        .filter((c) => c.value !== '')
        .map((c) => ({ value: c.value, label: c.label || c.value }))
    } else {
      out[key] = PROPERTY_VALUE_OPTIONS[key]
    }
  }

  return out
}
