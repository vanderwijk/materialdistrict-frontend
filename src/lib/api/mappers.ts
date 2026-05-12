/**
 * Domain mappers
 * ----------------------------------------------------------------------
 * Converteer raw WP REST responses naar de domain-types die de UI gebruikt.
 *
 * Mappers zijn pure functions — geen fetches, geen side effects. Ze nemen
 * een raw response (en optioneel resolved relations) en geven een
 * domain-object terug.
 *
 * Resolutie van relations (gallery via attachments-fetch, brand via
 * brand-fetch) gebeurt in de bovenliggende `getMaterial()` /
 * `getBrand()` functies — die orchestreren mapper + resolver.
 *
 * Sessie 4 (12-05-2026): `mapFacetWPToFilterSections` toegevoegd —
 * merget baseline (volledige facet-set) met filtered (counts + selected)
 * tot een UI-klare `MaterialFilterSection[]` voor de FilterSidebar.
 */

import type { Article, ArticleListItem } from '@/types/article'
import type { Brand, BrandListItem } from '@/types/brand'
import type { Event, EventListItem } from '@/types/event'
import type { Material, MaterialListItem, MaterialPublication } from '@/types/material'
import type { Gallery, ImageSizeKey, MediaImage, MediaSize } from '@/types/media'
import type { Talk, TalkListItem } from '@/types/talk'
import type {
  AuthMeResponse,
  BrandMembership,
  Membership,
  User,
  WPAuthMeRawResponse,
} from '@/types/shared'
import {
  MATERIAL_FILTER_FACETS,
  type FacetWPFetchResponse,
  type MaterialFacetName,
} from '@/types/facetwp'

import { parseMaterialProperties } from '@/lib/utils/material-properties'

import type {
  WPArticleRawResponse,
  WPBrandRawResponse,
  WPEventRawResponse,
  WPMaterialRawResponse,
  WPMediaResponse,
  WPTalkRawResponse,
} from './wordpress'

// --------------------------------------------------------------------
// Media
// --------------------------------------------------------------------

export function mapMedia(raw: WPMediaResponse): MediaImage {
  const sizes: Partial<Record<ImageSizeKey, MediaSize>> = {}

  if (raw.media_details.sizes) {
    for (const [key, size] of Object.entries(raw.media_details.sizes)) {
      sizes[key as ImageSizeKey] = {
        url: size.source_url,
        width: size.width,
        height: size.height,
        filesize: size.filesize,
        mimeType: size.mime_type,
      }
    }
  }

  // Garandeer een `full` size — sommige WP-installaties zetten `full` niet
  // in de sizes-array maar gebruiken alleen `source_url` op het top-level.
  if (!sizes.full) {
    sizes.full = {
      url: raw.source_url,
      width: raw.media_details.width,
      height: raw.media_details.height,
      mimeType: raw.mime_type,
    }
  }

  return {
    id: raw.id,
    alt: raw.alt_text ?? '',
    caption: raw.caption?.rendered ?? '',
    description: raw.description?.rendered ?? '',
    mimeType: raw.mime_type,
    sourceUrl: raw.source_url,
    width: raw.media_details.width,
    height: raw.media_details.height,
    sizes,
    parentPostId: raw.post ?? 0,
    menuOrder: raw.menu_order,
  }
}

/**
 * Splits een lijst attachments in hero + thumbs.
 *
 * Strategie:
 *  1. Als `featuredMediaId` is gezet en die staat in de lijst → die is hero
 *  2. Anders: de eerste attachment is hero
 *  3. Alle overige attachments worden thumbs, in de volgorde van de lijst
 *
 * Lege input → `{ hero: null, thumbs: [], total: 0 }`
 */
export function splitGallery(
  attachments: MediaImage[],
  featuredMediaId?: number | null,
): Gallery {
  if (attachments.length === 0) {
    return { hero: null, thumbs: [], total: 0 }
  }

  let hero: MediaImage | null = null
  let thumbs: MediaImage[] = []

  if (featuredMediaId && featuredMediaId > 0) {
    const heroIndex = attachments.findIndex((a) => a.id === featuredMediaId)
    if (heroIndex >= 0) {
      hero = attachments[heroIndex]
      thumbs = attachments.filter((_, i) => i !== heroIndex)
    }
  }

  if (!hero) {
    hero = attachments[0]
    thumbs = attachments.slice(1)
  }

  return { hero, thumbs, total: attachments.length }
}

// --------------------------------------------------------------------
// Material
// --------------------------------------------------------------------

/**
 * Bouwt een publication-placeholder voor wanneer Johan's WP-meta nog
 * geen `publication`-object levert. Zolang dat niet live is, behandelen
 * we elk material als zichtbaar (`isOnline: true`) zodat overzichts-
 * filtering geen materials onbedoeld verbergt — `isPlaceholder: true`
 * markeert dat dit geen echte WP-data is.
 *
 * Zie `datacontract-proposal.md` §3 voor het uiteindelijke contract.
 */
function publicationFromMeta(
  meta: WPMaterialRawResponse['meta'] | undefined,
): MaterialPublication {
  // `meta.publication` is `unknown` (catch-all index-signature). Runtime-check
  // de shape voor we hem doorgeven; anders fallback op de placeholder.
  const pub = meta?.publication
  if (
    pub &&
    typeof pub === 'object' &&
    'isOnline' in pub &&
    typeof (pub as { isOnline: unknown }).isOnline === 'boolean'
  ) {
    return pub as MaterialPublication
  }
  return {
    isOnline: true,
    source: null,
    validUntil: null,
    isPlaceholder: true,
  }
}

/**
 * Mapper voor lijst-pagina's. Geen brand-resolve, alleen featured image.
 *
 * @param raw - WP REST material response
 * @param featuredImage - opgehaalde featured image (optioneel)
 * @param brandName - opgeloste brand-naam (optioneel)
 */
export function mapMaterialListItem(
  raw: WPMaterialRawResponse,
  featuredImage?: MediaImage | null,
  brandName?: string | null,
): MaterialListItem {
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    excerptHtml: raw.excerpt.rendered,
    hero: featuredImage ?? null,
    properties: parseMaterialProperties(raw.class_list),
    brandName: brandName ?? null,
    brandId: raw.meta?.brand_id ?? null,
    featured: Boolean(raw.meta?.featured),
    date: raw.date,
    modified: raw.modified,
    publication: publicationFromMeta(raw.meta),
  }
}

/**
 * Mapper voor de detailpagina. Verwacht een opgeloste gallery.
 *
 * @param raw - WP REST material response
 * @param gallery - gallery uit `splitGallery(attachments, featured_media)`
 */
export function mapMaterial(
  raw: WPMaterialRawResponse,
  gallery: Gallery,
): Material {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    contentHtml: raw.content.rendered,
    excerptHtml: raw.excerpt.rendered,

    gallery,
    properties: parseMaterialProperties(raw.class_list),

    taxonomies: {
      tags: raw.tags ?? [],
      sector: raw.sector ?? [],
      theme: raw.theme ?? [],
      material_category: raw.material_category ?? [],
      product_category: raw.product_category ?? [],
    },

    brandId: typeof m.brand_id === 'number' && m.brand_id > 0 ? m.brand_id : null,

    // Default: sample-aanvraag AAN. Brand zet 'm uit met `disable_sample_request: true`.
    disableSampleRequest: Boolean(m.disable_sample_request),

    featured: Boolean(m.featured),
    notAvailable: Boolean(m.not_available),
    commercialMaterial: Boolean(m.commercial_material),

    materialCode: stringOrNull(m.material_code),
    shortDescription: stringOrNull(m.short_description),
    transportWeight: stringOrNull(m.transport_weight),

    videoUrl: stringOrNull(m.video_url),
    datasheetUrl: stringOrNull(m.datasheet_url),
    epdUrl: stringOrNull(m.epd_url),
    productUrl: stringOrNull(m.product_url),

    date: raw.date,
    modified: raw.modified,
    publication: publicationFromMeta(raw.meta),
  }
}

// --------------------------------------------------------------------
// Brand
// --------------------------------------------------------------------

export function mapBrandListItem(
  raw: WPBrandRawResponse,
  logo?: MediaImage | null,
): BrandListItem {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    name: raw.title.rendered,
    excerptHtml: raw.excerpt.rendered,
    logo: logo ?? null,
    country: stringOrNull(m._brand_country),
    partner: Boolean(m._partner),
    featured: Boolean(m._featured),
  }
}

export function mapBrand(raw: WPBrandRawResponse, gallery: Gallery): Brand {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    name: raw.title.rendered,
    contentHtml: raw.content.rendered,
    excerptHtml: raw.excerpt.rendered,

    gallery,

    country: stringOrNull(m._brand_country),
    website: stringOrNull(m._brand_website),
    email: stringOrNull(m._brand_email),

    socials: {
      facebook: stringOrNull(m._brand_facebook),
      instagram: stringOrNull(m._brand_instagram),
      linkedin: stringOrNull(m._brand_linkedin),
      twitter: stringOrNull(m._brand_twitter),
      youtube: stringOrNull(m._brand_youtube),
    },

    partner: Boolean(m._partner),
    featured: Boolean(m._featured),

    date: raw.date,
    modified: raw.modified,
  }
}

// --------------------------------------------------------------------
// Article
// --------------------------------------------------------------------

export function mapArticleListItem(
  raw: WPArticleRawResponse,
  hero?: MediaImage | null,
): ArticleListItem {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    excerptHtml: raw.excerpt.rendered,
    hero: hero ?? null,
    authorId: raw.author,
    categoryIds: raw.categories ?? [],
    tagIds: raw.tags ?? [],
    featured: Boolean(m._featured),
    insiderOnly: false, // BLOCKER sessie 6
    date: raw.date,
  }
}

export function mapArticle(
  raw: WPArticleRawResponse,
  hero?: MediaImage | null,
  authorName?: string | null,
): Article {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    contentHtml: raw.content.rendered,
    excerptHtml: raw.excerpt.rendered,
    hero: hero ?? null,
    authorId: raw.author,
    authorName: authorName ?? null,
    categoryIds: raw.categories ?? [],
    tagIds: raw.tags ?? [],
    featured: Boolean(m._featured),
    insiderOnly: false, // BLOCKER sessie 6
    date: raw.date,
    modified: raw.modified,
  }
}

// --------------------------------------------------------------------
// Event
// --------------------------------------------------------------------

export function mapEventListItem(
  raw: WPEventRawResponse,
  hero?: MediaImage | null,
): EventListItem {
  const m = raw.meta ?? {}
  const startDate = stringOrNull(m._event_date_start)
  const endDate = stringOrNull(m._event_date_end)
  const startTime = stringOrNull(m._event_time_start)
  const endTime = stringOrNull(m._event_time_end)
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    excerptHtml: raw.excerpt.rendered,
    hero: hero ?? null,
    startsAt: combineDateTime(startDate, startTime),
    endsAt: combineDateTime(endDate, endTime),
    featured: Boolean(m._featured),
  }
}

export function mapEvent(raw: WPEventRawResponse, hero?: MediaImage | null): Event {
  const m = raw.meta ?? {}
  const startDate = stringOrNull(m._event_date_start)
  const endDate = stringOrNull(m._event_date_end)
  const startTime = stringOrNull(m._event_time_start)
  const endTime = stringOrNull(m._event_time_end)
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    contentHtml: raw.content.rendered,
    excerptHtml: raw.excerpt.rendered,
    hero: hero ?? null,
    startsAt: combineDateTime(startDate, startTime),
    endsAt: combineDateTime(endDate, endTime),
    startDate,
    endDate,
    startTime,
    endTime,
    externalWebsite: stringOrNull(m._event_external_website),
    costs: stringOrNull(m._event_costs),
    featured: Boolean(m._featured),
    date: raw.date,
    modified: raw.modified,
  }
}

// --------------------------------------------------------------------
// Talk
// --------------------------------------------------------------------

export function mapTalkListItem(
  raw: WPTalkRawResponse,
  hero?: MediaImage | null,
): TalkListItem {
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    excerptHtml: raw.excerpt.rendered,
    hero: hero ?? null,
    date: raw.date,
  }
}

export function mapTalk(raw: WPTalkRawResponse, hero?: MediaImage | null): Talk {
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    contentHtml: raw.content.rendered,
    excerptHtml: raw.excerpt.rendered,
    hero: hero ?? null,
    date: raw.date,
    modified: raw.modified,
  }
}

// --------------------------------------------------------------------
// Auth
// --------------------------------------------------------------------
//
// Map the raw snake_case response from `/wp-json/md/v2/auth/login` and
// `/wp-json/md/v2/auth/me` into the camelCase `AuthMeResponse` domain type.
//
// Derived fields like `is_insider`, `publication_quota` and
// `publications_used` are passed through unchanged — WordPress computes
// them, the frontend reads them off (see architecture-rules.md
// "Derived fields — source of truth").

function mapMembership(raw: WPAuthMeRawResponse['user']['membership']): Membership {
  return {
    tier: raw.tier,
    isInsider: raw.is_insider,
    status: raw.status,
    billingInterval: raw.billing_interval,
    validUntil: raw.valid_until,
    cancelAtPeriodEnd: raw.cancel_at_period_end,
    isPlaceholder: raw.is_placeholder,
  }
}

/**
 * Map one raw brand-membership entry to the camelCase domain type.
 *
 * Exported because a future dedicated brand-membership endpoint (e.g.
 * the brand dashboard) may want to reuse this without going through the
 * full `/auth/me` response.
 */
export function mapBrandMembership(
  raw: WPAuthMeRawResponse['user']['connected_brands'][number],
): BrandMembership {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    tier: raw.tier,
    status: raw.status,
    validUntil: raw.valid_until,
    cancelAtPeriodEnd: raw.cancel_at_period_end,
    publicationQuota: raw.publication_quota,
    publicationsUsed: raw.publications_used,
    isPlaceholder: raw.is_placeholder,
  }
}

function mapUser(raw: WPAuthMeRawResponse['user']): User {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    displayName: raw.display_name,
    firstName: raw.first_name,
    lastName: raw.last_name,
    roles: raw.roles,
    avatarUrl: raw.avatar_url,
    profession: raw.profession,
    company: raw.company,
    membership: mapMembership(raw.membership),
    brands: raw.connected_brands.map(mapBrandMembership),
  }
}

/**
 * Map the full `/auth/login` or `/auth/me` response.
 *
 * Pure function — no side effects, no fetches. The caller is responsible
 * for storing `token` + `expiresAt` in the auth cookie.
 */
export function mapAuthMeResponse(raw: WPAuthMeRawResponse): AuthMeResponse {
  return {
    token: raw.token,
    expiresAt: raw.expires_at,
    user: mapUser(raw.user),
  }
}

// --------------------------------------------------------------------
// FacetWP → FilterSidebar
// --------------------------------------------------------------------

/**
 * UI-klare facet-sectie voor de FilterSidebar.
 *
 * Komt uit `mapFacetWPToFilterSections` — een merge van de baseline-
 * call (volledige set facets + alle choices) met de filtered-call
 * (huidige counts + selected).
 *
 * De `key` matcht een `MaterialFacetName` zodat we de selectie 1-op-1
 * terug kunnen mappen naar de FacetWP-request.
 */
export interface MaterialFilterSection {
  /** Facet-naam (matcht een `MaterialFacetName`). */
  key: MaterialFacetName
  /** Sectie-header, uit de baseline-response. */
  title: string
  /** Beschikbare opties met live counts. */
  options: Array<{
    value: string
    label: string
    count: number
    /** True wanneer huidige filter resulteert in 0 matches voor deze optie. */
    isGhost: boolean
  }>
  /** Op dit moment geselecteerde waarden. */
  selected: string[]
  /** Multi-select (checkboxes) of single-select (radio). */
  selectMode: 'multi' | 'single'
  /** Of de sectie standaard open is bij eerste render. */
  defaultOpen: boolean
  /** Of er een zoekveld binnen de sectie staat (lange opties-lijst). */
  searchable: boolean
}

/**
 * UI-conventies per facet — leidend voor hoe de FilterSidebar de sectie
 * rendert. Niet uit de FacetWP-response af te leiden; statisch gebonden
 * aan ons mockup-ontwerp.
 *
 * - `material_category` is single-select (één hoofdcategorie tegelijk)
 *   en standaard open
 * - alle eigenschap-facets zijn multi-select en standaard dicht
 * - facets met >8 opties krijgen een `searchable`-veld binnen de sectie
 */
const FACET_UI_HINTS: Record<
  MaterialFacetName,
  {
    selectMode: 'multi' | 'single'
    defaultOpen: boolean
    searchable: boolean
  }
> = {
  material_category: { selectMode: 'single', defaultOpen: true, searchable: false },
  glossiness: { selectMode: 'multi', defaultOpen: false, searchable: false },
  translucence: { selectMode: 'multi', defaultOpen: false, searchable: false },
  structure: { selectMode: 'multi', defaultOpen: false, searchable: false },
  texture: { selectMode: 'multi', defaultOpen: false, searchable: false },
  hardness: { selectMode: 'multi', defaultOpen: false, searchable: false },
  temperature: { selectMode: 'multi', defaultOpen: false, searchable: false },
  acoustics: { selectMode: 'multi', defaultOpen: false, searchable: false },
  odeur: { selectMode: 'multi', defaultOpen: false, searchable: false },
  weight: { selectMode: 'multi', defaultOpen: false, searchable: false },
  fire_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  uv_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  weather_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  scratch_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  chemical_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  renewable: { selectMode: 'multi', defaultOpen: false, searchable: false },
}

/**
 * Merget de baseline-response (volledige facet-set) met de filtered-
 * response (counts + selected) tot een lijst `MaterialFilterSection`
 * voor de FilterSidebar.
 *
 * Bron-van-waarheid:
 *  - `baseline.facets.<name>.choices` → de volledige opties-lijst en de
 *    initiële labels. Deze lijst bevat ook waarden die in de huidige
 *    filter 0 hits hebben.
 *  - `filtered.facets.<name>.choices[].count` → de actuele counts. Een
 *    waarde uit baseline die niet in filtered voorkomt krijgt `count: 0`
 *    en `isGhost: true`.
 *  - `filtered.facets.<name>.selected` → wat de gebruiker geselecteerd
 *    heeft. Valt terug op een lege array als de facet niet in `filtered`
 *    voorkomt (treedt op wanneer de filter geen invloed had op deze
 *    facet).
 *
 * Pure function — geen side effects.
 *
 * @param baseline - response van `fetchMaterialFacetsBaseline()`
 * @param filtered - response van `fetchMaterialsFiltered(...)`
 */
export function mapFacetWPToFilterSections(
  baseline: FacetWPFetchResponse,
  filtered: FacetWPFetchResponse,
): MaterialFilterSection[] {
  const sections: MaterialFilterSection[] = []

  for (const key of MATERIAL_FILTER_FACETS) {
    const baselineFacet = baseline.facets[key]
    if (!baselineFacet) {
      // Facet niet in baseline-response — overslaan (mag niet voorkomen
      // bij goed geconfigureerde FacetWP, maar defensief).
      continue
    }

    const filteredFacet = filtered.facets[key]
    const filteredCounts = new Map<string, number>()
    if (filteredFacet) {
      for (const choice of filteredFacet.choices) {
        filteredCounts.set(choice.value, choice.count)
      }
    }

    const options = baselineFacet.choices.map((choice) => {
      const liveCount = filteredCounts.has(choice.value)
        ? (filteredCounts.get(choice.value) as number)
        : 0
      return {
        value: choice.value,
        label: choice.label,
        count: liveCount,
        isGhost: liveCount === 0,
      }
    })

    const ui = FACET_UI_HINTS[key]

    sections.push({
      key,
      title: baselineFacet.label,
      options,
      selected: filteredFacet?.selected ?? [],
      selectMode: ui.selectMode,
      defaultOpen: ui.defaultOpen,
      searchable: ui.searchable,
    })
  }

  return sections
}

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

function stringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Combineer YYYY-MM-DD + HH:MM tot een ISO-string.
 * Gebruikt lokale tijd (server timezone) — voor nu voldoende voor sortering.
 * Voor weergave gebruiken we bij voorkeur de afzonderlijke `startDate` en
 * `startTime` velden uit de event-shape om timezone-conversie te vermijden.
 */
function combineDateTime(date: string | null, time: string | null): string | null {
  if (!date) return null
  if (!time) return `${date}T00:00:00`
  return `${date}T${time}:00`
}
