/**
 * Material types
 * ----------------------------------------------------------------------
 * Domain-model voor materials. Gemodelleerd op:
 *  - `/wp/v2/material/<id>` REST response (sessie 2 verkenning, OBRO)
 *  - `class_list` als bron van eigenschap-taxonomieën
 *  - Developer-handover (rest-post-meta.php)
 *
 * Drie laag-onderscheid:
 *  - `WPMaterialRaw` — exacte API-response (in `lib/api/wordpress.ts`)
 *  - `MaterialMeta` — getypte meta-velden zoals door de plugin-handover
 *    geëxposeerd (alleen aliassen + publieke meta, geen underscore-velden)
 *  - `Material` / `MaterialListItem` — domain-types voor de UI
 *
 * Eigenschap-taxonomieën (glossiness, hardness, etc.) komen NIET via meta
 * maar via `class_list`. Zie `parseMaterialProperties()` in
 * `lib/utils/material-properties.ts`.
 */

import type { Gallery, MediaImage } from './media'

// --------------------------------------------------------------------
// Eigenschap-waarden (uit `class_list`)
// --------------------------------------------------------------------
//
// In de OBRO-response zien we slugs zoals:
//   "glossiness-variable", "translucence-50-100-percent",
//   "hardness-soft", "renewable-no", ...
//
// `parseMaterialProperties()` (utils) haalt het deel ná de eerste streep
// als de waarde, en het deel ervoor als de eigenschap-naam.
//
// De waarden zijn open enums — WP kan altijd nieuwe terms toevoegen.
// Daarom typen we ze als `string` en niet als literal unions, om te
// voorkomen dat een nieuwe term de typecheck breekt.

/**
 * Alle gestructureerde eigenschappen van een material, geëxtraheerd
 * uit `class_list`. Lege string als de eigenschap niet is ingesteld.
 *
 * Voorbeeld waarden (niet uitputtend):
 *   glossiness:           'matte' | 'satin' | 'glossy' | 'variable' | ''
 *   translucence:         '0-percent' | '0-50-percent' | '50-100-percent' | '100-percent' | ''
 *   structure:            'open' | 'closed' | 'variable' | ''
 *   texture:              'fine' | 'medium' | 'coarse' | 'variable' | ''
 *   hardness:             'soft' | 'medium' | 'hard' | 'variable' | ''
 *   temperature:          'cool' | 'medium' | 'warm' | 'variable' | ''
 *   acoustics:            'poor' | 'moderate' | 'good' | 'variable' | ''
 *   odeur:                'none' | 'low' | 'medium' | 'strong' | ''
 *   weight:               'light' | 'medium' | 'heavy' | 'variable' | ''
 *   fire_resistance:      'poor' | 'moderate' | 'good' | 'unknown' | ''
 *   uv_resistance:        idem
 *   weather_resistance:   idem
 *   scratch_resistance:   idem
 *   chemical_resistance:  idem
 *   renewable:            'yes' | 'no' | 'partial' | ''
 */
export interface MaterialProperties {
  glossiness: string
  translucence: string
  structure: string
  texture: string
  hardness: string
  temperature: string
  acoustics: string
  odeur: string
  weight: string
  fire_resistance: string
  uv_resistance: string
  weather_resistance: string
  scratch_resistance: string
  chemical_resistance: string
  renewable: string
}

/** Veldnamen die overeenkomen met de FacetWP-facets. */
export type MaterialPropertyKey = keyof MaterialProperties

// --------------------------------------------------------------------
// Meta-shape (uit de developer-handover)
// --------------------------------------------------------------------

/**
 * Meta-velden zoals geëxposeerd door `rest-post-meta.php` op `material`.
 *
 * Bevat alleen:
 *  - frontend-vriendelijke aliassen (brand_id, material_code, ...)
 *  - publieke extra meta (gallery, video_url, datasheet_url, ...)
 *
 * De ruwe `_material_*`-velden worden door de plugin óók geëxposeerd
 * maar gebruiken we niet — voor onderhoudbaarheid is er één bron van
 * waarheid in de frontend.
 *
 * BELANGRIJK — sample-aanvraag-flag:
 * De handover noemt een alias `samples_available`. Die is misleidend:
 * het ruwe veld in WP heet `_material_disable_sample_request` (negatief).
 * In overleg met opdrachtgever wordt de alias door de WP-developer
 * omgedraaid naar `disable_sample_request` (zelfde semantiek als bron).
 * Tot die fix gebruiken we hier `disable_sample_request` in de TS-types,
 * en wordt de `samples_available`-alias straks genegeerd.
 *
 * Standaard sample-aanvraag is dus AAN; alleen brands kunnen 'm uitzetten.
 */
export interface MaterialMeta {
  /** Post-ID van het brand. 0 of undefined als niet ingesteld. */
  brand_id?: number
  /** Of sample-aanvraag is UITGESCHAKELD voor dit material (default false). */
  disable_sample_request?: boolean
  material_code?: string
  short_description?: string
  transport_weight?: string
  /** Material is uit catalogus, maar (tijdelijk) niet bestelbaar. */
  not_available?: boolean
  /** Featured op homepage / overzicht. */
  featured?: boolean
  /** Commercieel material (vs. concept / R&D). */
  commercial_material?: boolean
  /** Volgorde van afbeelding-IDs (zie session-log: deze gebruiken we NIET). */
  gallery?: number[]
  video_url?: string
  datasheet_url?: string
  epd_url?: string
  product_url?: string
}

// --------------------------------------------------------------------
// Taxonomie-IDs (zoals ze ruw uit de API komen)
// --------------------------------------------------------------------

/**
 * Material-post komt met taxonomieën als ID-arrays.
 * Voor weergave (naam + slug) moeten we ze óf via `class_list` parseren
 * (snel, geen extra fetch) óf via `getTerms()` ophalen (volledig).
 */
export interface MaterialTaxonomyIds {
  tags: number[]
  sector: number[]
  theme: number[]
  material_category: number[]
  product_category: number[]
}

// --------------------------------------------------------------------
// Domain-types voor de UI
// --------------------------------------------------------------------

/** Compacte material-tag voor in cards en op detailpagina. */
export interface MaterialTag {
  /** De facet-naam, bv. 'glossiness'. */
  facet: MaterialPropertyKey
  /** De waarde, bv. 'variable'. */
  value: string
  /** Weergave-label (gegenereerd of opgehaald). Voor nu: gehumaniseerde slug. */
  label: string
}

/**
 * Lichtgewicht material voor overzichtspagina's en cards.
 * Geen brand-resolve, geen full gallery — alleen wat een card toont.
 */
export interface MaterialListItem {
  id: number
  slug: string
  /** Detail-URL pad, bv. `/material/obro-leather-infused-translucent-pvc-composite`. */
  link: string
  title: string
  /** HTML — gebruik dangerouslySetInnerHTML in een gecontroleerde container. */
  excerptHtml: string
  /** Hero-image. Null als post geen featured_media of attachments heeft. */
  hero: MediaImage | null
  /** Alle eigenschappen uit class_list — overzichtspagina toont een paar. */
  properties: MaterialProperties
  /** Brand-naam (resolved). Null als brand_id ontbreekt of brand niet kon worden opgehaald. */
  brandName: string | null
  /** Brand-ID (uit meta). Null als niet ingesteld. */
  brandId: number | null
  /** Featured op homepage / overzicht. */
  featured: boolean
  /** Sortering. */
  date: string
  modified: string
}

/**
 * Volledig material voor de detailpagina.
 * Inclusief gallery, content-HTML, video, downloads, brand-object.
 */
export interface Material {
  id: number
  slug: string
  link: string
  title: string
  /** Volledige body-HTML. */
  contentHtml: string
  excerptHtml: string

  /** Hero + thumbs uit attachments (zie `splitGallery`). */
  gallery: Gallery

  /** Eigenschappen uit class_list. */
  properties: MaterialProperties

  /** Tags + categorieën (term-IDs). Ophalen voor labels via `getTerms`. */
  taxonomies: MaterialTaxonomyIds

  /** Brand-relatie. `brand` is null tot opgelost; `brandId` mag ook null. */
  brandId: number | null

  /** Sample-aanvraag. true = uitgeschakeld door brand. */
  disableSampleRequest: boolean

  /** Status-vlaggen. */
  featured: boolean
  notAvailable: boolean
  commercialMaterial: boolean

  /** Tekst-velden uit meta. */
  materialCode: string | null
  shortDescription: string | null
  transportWeight: string | null

  /** Media-velden. */
  videoUrl: string | null

  /** Externe links — Insider gated downloads (gating gebeurt in UI). */
  datasheetUrl: string | null
  epdUrl: string | null
  productUrl: string | null

  /** Datums. */
  date: string
  modified: string
}
