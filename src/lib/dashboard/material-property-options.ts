/**
 * buildMaterialPropertyOptions — assembles the per-property select options for
 * the material form's "Search & filtering" block.
 *
 * For the FILTERABLE facets (sensorial, technical, renewable) the live FacetWP
 * baseline is authoritative — its choices carry the real term slugs and labels
 * that the public filters use, so the form and the filters stay in sync. For
 * the non-filterable environmental/content facets (and as a fallback when the
 * baseline is unavailable) the static `PROPERTY_VALUE_OPTIONS` defaults are
 * used. The non-filterable facets persist server-side (Johan).
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
