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
 *
 * Sessie 6 (19-05-2026): `MaterialFilterSection.group` toegevoegd voor
 * property-groep-mapping (Sensorial / Technical / Environmental /
 * Content composition). `FACET_UI_HINTS` uitgebreid met 12 nieuwe
 * environmental + content-composition facets. Mapper is robuust voor
 * facets die (nog) niet in de baseline staan — die worden overgeslagen,
 * geen error.
 */

import type {
  Article,
  ArticleListItem,
  RelatedContentType,
  RelatedItem,
  TaxonomyTerm,
} from '@/types/article'
import type { Brand, BrandListItem } from '@/types/brand'
import type { Event, EventListItem, EventVenue, EventVideo } from '@/types/event'
import type { Material, MaterialListItem, MaterialPublication, MaterialDownload } from '@/types/material'
import type { Gallery, ImageSizeKey, MediaImage, MediaSize } from '@/types/media'
import type { Talk, TalkListItem, TalkSpeaker } from '@/types/talk'
import type { Page, PageSeo } from '@/types/page'
import type {
  AuthMeResponse,
  BrandMembership,
  Membership,
  User,
  WPAuthMeRawResponse,
} from '@/types/shared'
import {
  MATERIAL_FACET_TO_GROUP,
  MATERIAL_FILTER_FACETS,
  type FacetWPFetchResponse,
  type MaterialFacetGroup,
  type MaterialFacetName,
} from '@/types/facetwp'

import { parseMaterialProperties } from '@/lib/utils/material-properties'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import { toStoryType } from '@/lib/config/story-types'
import { toEventType } from '@/lib/config/event-types'

import type {
  WPArticleRawResponse,
  WPBrandRawResponse,
  WPEventRawResponse,
  WPEventVenueRaw,
  WPEventVideoRaw,
  WPMaterialRawResponse,
  WPMediaResponse,
  WPMetaTermRaw,
  WPPageRaw,
  WPRelatedItemRaw,
  WPTalkRawResponse,
  WPTalkSpeakerRaw,
} from './wordpress'

/**
 * Veilige accessor voor WP `{ rendered }`-velden. Het WP REST-schema typeert
 * `excerpt`/`content` als verplicht, maar bij sommige CPT's (brand, article)
 * ontbreekt het veld in de praktijk — dan is `field` undefined. Geef dan een
 * lege string terug i.p.v. te crashen op `.rendered`.
 */
function wpRenderedHtml(
  field: { rendered?: string } | undefined | null,
): string {
  return field?.rendered ?? ''
}

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
    title: decodeHtmlEntities(raw.title.rendered),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    hero: featuredImage ?? null,
    properties: parseMaterialProperties(raw.class_list),
    brandName: brandName ? decodeHtmlEntities(brandName) : null,
    brandId: raw.meta?.brand_id ?? null,
    brandSlug: stringOrNull(raw.meta?.brand_slug),
    brandCountry: raw.meta?.brand_country?.label ?? null,
    materialCode: stringOrNull(raw.meta?.material_code),
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
/**
 * Map de downloads-entiteit van een material. Items zonder bruikbare url
 * worden overgeslagen; `id` valt terug op de url als er geen attachment-id is.
 */
function mapMaterialDownloads(
  raw: Array<{ id?: string | number; title?: string; url?: string; type?: string }> | undefined,
): MaterialDownload[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((d): d is { id?: string | number; title?: string; url?: string; type?: string } =>
      !!d && typeof d.url === 'string' && d.url.length > 0,
    )
    .map((d) => ({
      id: String(d.id ?? d.url),
      title: typeof d.title === 'string' ? d.title : '',
      url: String(d.url),
      type: typeof d.type === 'string' ? d.type : '',
    }))
}

export function mapMaterial(
  raw: WPMaterialRawResponse,
  gallery: Gallery,
  brandName?: string | null,
): Material {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: decodeHtmlEntities(raw.title.rendered),
    contentHtml: wpRenderedHtml(raw.content),
    excerptHtml: wpRenderedHtml(raw.excerpt),

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
    brandName: brandName ? decodeHtmlEntities(brandName) : null,
    brandSlug: stringOrNull(m.brand_slug),
    brandCountry: m.brand_country?.label ?? null,

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

    downloads: mapMaterialDownloads(m.downloads),
    brandWebsite: stringOrNull(m.brand_website),
    sampleRequestsInsidersOnly: Boolean(m.brand_sample_requests_insiders_only),
    downloadsInsidersOnly: Boolean(m.brand_downloads_insiders_only),
    restrictToListedCountries: Boolean(m.brand_restrict_to_listed_countries),
    acceptedCountries: Array.isArray(m.brand_accepted_countries) ? m.brand_accepted_countries : [],

    date: raw.date,
    modified: raw.modified,
    publication: publicationFromMeta(raw.meta),
  }
}

// --------------------------------------------------------------------
// Brand
// --------------------------------------------------------------------
//
// Normalized contract (Johan-handoff 27-05-2026): de plugin levert nu
// schone genormaliseerde velden naast de raw underscore-velden. We
// gebruiken de genormaliseerde als canonieke bron, en vallen alleen
// terug op underscore-velden tijdens rollout (rollout-tolerantie).
//
// Weergave-keuzes:
//  - country  → `country_detail.label` (leesbaar, bv. "Japan"), niet de
//    kale code. Fallback op `_brand_country` als detail ontbreekt.
//  - socials  → genormaliseerd `socials.*`, fallback op `_brand_*`.

export function mapBrandListItem(
  raw: WPBrandRawResponse,
  logo?: MediaImage | null,
): BrandListItem {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    name: decodeHtmlEntities(raw.title.rendered),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    logo: logo ?? null,
    country: m.country_detail?.label ?? stringOrNull(m._brand_country),
    city: stringOrNull(m.city),
    materialCount: typeof m.material_count === 'number' ? m.material_count : 0,
    partner: truthyFlag(m.partner, m._partner),
    featured: truthyFlag(m.featured, m._featured),
  }
}

export function mapBrand(raw: WPBrandRawResponse, gallery: Gallery): Brand {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    name: decodeHtmlEntities(raw.title.rendered),
    contentHtml: wpRenderedHtml(raw.content),
    excerptHtml: wpRenderedHtml(raw.excerpt),

    gallery,

    country: m.country_detail?.label ?? stringOrNull(m._brand_country),
    city: stringOrNull(m.city),
    address: stringOrNull(m.address),
    website: m.website ?? stringOrNull(m._brand_website),
    email: m.contact_email ?? stringOrNull(m._brand_email),

    founded: displayValueOrNull(m.founded),
    employees: displayValueOrNull(m.employees),

    materialCount: typeof m.material_count === 'number' ? m.material_count : 0,

    socials: {
      facebook: m.socials?.facebook ?? stringOrNull(m._brand_facebook),
      instagram: m.socials?.instagram ?? stringOrNull(m._brand_instagram),
      linkedin: m.socials?.linkedin ?? stringOrNull(m._brand_linkedin),
      twitter: m.socials?.twitter ?? stringOrNull(m._brand_twitter),
      youtube: m.socials?.youtube ?? stringOrNull(m._brand_youtube),
    },

    partner: truthyFlag(m.partner, m._partner),
    featured: truthyFlag(m.featured, m._featured),

    date: raw.date,
    modified: raw.modified,
  }
}

// --------------------------------------------------------------------
// Article
// --------------------------------------------------------------------

/**
 * D3 — resolve channel-tags uit `meta.channels` (`{id,slug,label}[]`).
 * Faalbestendig: ontbrekend veld of niet-array → lege lijst (geen pills).
 * Gedeeld door beide article-mappers (DRY).
 */
function mapChannels(raw: WPMetaTermRaw[] | undefined): TaxonomyTerm[] {
  if (!Array.isArray(raw)) return []
  return raw.map((t) => ({ id: t.id, slug: t.slug, label: t.label }))
}

export function mapArticleListItem(
  raw: WPArticleRawResponse,
  hero?: MediaImage | null,
): ArticleListItem {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: decodeHtmlEntities(raw.title.rendered),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    hero: hero ?? null,
    authorId: raw.author,
    categoryIds: raw.categories ?? [],
    tagIds: raw.tags ?? [],
    featured: Boolean(m._featured),
    // D1: story-type uit WP-taxonomy `story_type`. Leest de platte canonieke
    // slug `meta._story_type`, met fallback op de eerste term in
    // `meta.story_type[]`. `toStoryType` valt terug op 'news' bij onbekend.
    type: toStoryType(m._story_type ?? m.story_type?.[0]?.slug),
    // D2: Insider-only gating. `meta.insider_only` met underscore-alias.
    insiderOnly: Boolean(m._insider_only ?? m.insider_only),
    // D3: channel-tags voor de witte pills op de cards.
    channels: mapChannels(m.channels),
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
    title: decodeHtmlEntities(raw.title.rendered),
    contentHtml: wpRenderedHtml(raw.content),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    hero: hero ?? null,
    authorId: raw.author,
    authorName: authorName ?? null,
    categoryIds: raw.categories ?? [],
    tagIds: raw.tags ?? [],
    featured: Boolean(m._featured),
    // D1: story-type uit WP-taxonomy `story_type`. Leest de platte canonieke
    // slug `meta._story_type`, met fallback op de eerste term in
    // `meta.story_type[]`. `toStoryType` valt terug op 'news' bij onbekend.
    type: toStoryType(m._story_type ?? m.story_type?.[0]?.slug),
    // D2: Insider-only gating. `meta.insider_only` met underscore-alias.
    insiderOnly: Boolean(m._insider_only ?? m.insider_only),
    // D3: channel-tags voor de witte pills op de cards.
    channels: mapChannels(m.channels),
    date: raw.date,
    modified: raw.modified,
  }
}

/**
 * D5 — raw related-item → domain `RelatedItem`. Narrowt het `type`-veld
 * naar de drie bekende content-types; onbekende types geven `null` (worden
 * door de caller weggefilterd). Lege thumbnail → `null`.
 */
const RELATED_TYPES: readonly RelatedContentType[] = ['article', 'material', 'talk']

function isRelatedType(value: unknown): value is RelatedContentType {
  return typeof value === 'string' && (RELATED_TYPES as readonly string[]).includes(value)
}

export function mapRelatedItem(raw: WPRelatedItemRaw): RelatedItem | null {
  if (!isRelatedType(raw.type)) return null
  return {
    type: raw.type,
    id: raw.id,
    slug: raw.slug,
    title: decodeHtmlEntities(raw.title),
    thumbnail: raw.thumbnail || null,
    link: raw.link,
  }
}

// --------------------------------------------------------------------
// Event
// --------------------------------------------------------------------

/**
 * Resolve de gedenormaliseerde venue (`meta.venue`) naar de domain-shape.
 * `null` bij geen venue (online events). `country` komt bij voorkeur uit
 * `country_detail` ({code,label}); valt terug op de kale ISO-code als
 * `country_detail` ontbreekt, en op `null` als beide leeg zijn.
 */
function mapEventVenue(raw: WPEventVenueRaw | null | undefined): EventVenue | null {
  if (!raw || typeof raw.id !== 'number') return null
  const country = raw.country_detail
    ? { code: raw.country_detail.code, label: raw.country_detail.label }
    : stringOrNull(raw.country)
      ? { code: raw.country as string, label: raw.country as string }
      : null
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    street: stringOrNull(raw.street),
    postcode: stringOrNull(raw.postcode),
    city: stringOrNull(raw.city),
    country,
  }
}

/**
 * Resolve `meta.videos[]` naar de domain-shape. Entries zonder geldige `url`
 * worden weggefilterd; `title`/`thumbnail` normaliseren naar `null` bij leeg.
 * Provider-detectie (YouTube/Vimeo/unlisted) zit in de video-util, niet hier.
 */
function mapEventVideos(raw: WPEventVideoRaw[] | undefined): EventVideo[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((v) => {
      const url = stringOrNull(v.url)
      if (!url) return null
      return { url, title: stringOrNull(v.title), thumbnail: stringOrNull(v.thumbnail) }
    })
    .filter((v): v is EventVideo => v !== null)
}

export function mapEventListItem(
  raw: WPEventRawResponse,
  hero?: MediaImage | null,
): EventListItem {
  const m = raw.meta ?? {}
  const startDate = stringOrNull(m.date_start)
  const endDate = stringOrNull(m.date_end)
  const startTime = stringOrNull(m.time_start)
  const endTime = stringOrNull(m.time_end)
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: decodeHtmlEntities(raw.title.rendered),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    hero: hero ?? null,
    type: toEventType(m.event_type_slug ?? m.event_type?.[0]?.slug),
    startsAt: combineDateTime(startDate, startTime),
    endsAt: combineDateTime(endDate, endTime),
    startDate,
    startTime,
    isMdEvent: Boolean(m.is_md_event),
    venue: mapEventVenue(m.venue),
    channels: mapChannels(m.channels),
    featured: Boolean(m.featured),
  }
}

export function mapEvent(
  raw: WPEventRawResponse,
  hero: MediaImage | null,
  gallery: Gallery,
): Event {
  const m = raw.meta ?? {}
  const startDate = stringOrNull(m.date_start)
  const endDate = stringOrNull(m.date_end)
  const startTime = stringOrNull(m.time_start)
  const endTime = stringOrNull(m.time_end)
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: decodeHtmlEntities(raw.title.rendered),
    contentHtml: wpRenderedHtml(raw.content),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    hero: hero ?? null,
    type: toEventType(m.event_type_slug ?? m.event_type?.[0]?.slug),
    startsAt: combineDateTime(startDate, startTime),
    endsAt: combineDateTime(endDate, endTime),
    startDate,
    endDate,
    startTime,
    endTime,
    isMdEvent: Boolean(m.is_md_event),
    externalWebsite: stringOrNull(m.external_website),
    costs: stringOrNull(m.costs),
    featured: Boolean(m.featured),
    venue: mapEventVenue(m.venue),
    channels: mapChannels(m.channels),
    videos: mapEventVideos(m.videos),
    gallery,
    date: raw.date,
    modified: raw.modified,
  }
}

// --------------------------------------------------------------------
// Talk
// --------------------------------------------------------------------

/**
 * C10 — parse `talk_duration` naar seconden. Formaat: "mm:ss" (2 segmenten)
 * of "h:mm:ss" (3 segmenten). `null` bij leeg of ongeldig (geen "0 min" in UI).
 */
function parseTalkDuration(raw: string | undefined): number | null {
  if (!raw) return null
  const parts = raw.trim().split(':')
  if (parts.length !== 2 && parts.length !== 3) return null
  const nums = parts.map((p) => Number(p))
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null
  return parts.length === 3
    ? nums[0] * 3600 + nums[1] * 60 + nums[2]
    : nums[0] * 60 + nums[1]
}

/** C11 — map de opgeloste persons-objects. Lege array bij ontbreken (geen UI-rommel). */
function mapTalkSpeakers(raw: WPTalkSpeakerRaw[] | undefined): TalkSpeaker[] {
  if (!Array.isArray(raw)) return []
  return raw.map((s) => ({
    id: s.id,
    name: decodeHtmlEntities(s.name),
    slug: s.slug,
  }))
}

export function mapTalkListItem(
  raw: WPTalkRawResponse,
  hero?: MediaImage | null,
): TalkListItem {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: decodeHtmlEntities(raw.title.rendered),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    hero: hero ?? null,
    date: raw.date,
    // C14: talk-default `true` bij afwezig veld (≠ article-default false).
    // `??` negeert alleen null/undefined, dus een expliciete `false` blijft false.
    insiderOnly: Boolean(m._insider_only ?? m.insider_only ?? true),
    vimeoId: m.vimeo_id ?? null,
    durationSeconds: parseTalkDuration(m.talk_duration),
    companyName: m.company_name ?? null,
    speakers: mapTalkSpeakers(raw.speakers),
    channels: mapChannels(m.channels),
    featured: truthyFlag(m.featured, m._featured),
  }
}

export function mapTalk(raw: WPTalkRawResponse, hero?: MediaImage | null): Talk {
  const m = raw.meta ?? {}
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: decodeHtmlEntities(raw.title.rendered),
    contentHtml: wpRenderedHtml(raw.content),
    excerptHtml: wpRenderedHtml(raw.excerpt),
    hero: hero ?? null,
    date: raw.date,
    modified: raw.modified,
    // C14: talk-default `true` bij afwezig veld (≠ article-default false).
    insiderOnly: Boolean(m._insider_only ?? m.insider_only ?? true),
    vimeoId: m.vimeo_id ?? null,
    durationSeconds: parseTalkDuration(m.talk_duration),
    companyName: m.company_name ?? null,
    speakers: mapTalkSpeakers(raw.speakers),
    channels: mapChannels(m.channels),
    featured: truthyFlag(m.featured, m._featured),
  }
}

// --------------------------------------------------------------------
// Page (WP-core `page`-posttype) — sessie 11
// --------------------------------------------------------------------

/**
 * Map een raw WP-`page` naar het `Page`-domaintype. Geen relations om te
 * resolven (v1: geen hero). Yoast-velden worden genormaliseerd naar `seo`;
 * de robots-strings worden naar booleans omgezet (default index/follow).
 *
 * Hergebruikt de bestaande `wpRenderedHtml()`-guard, zodat een ontbrekend
 * `title`/`content`-veld niet crasht (zelfde voorzorg als article/brand).
 */
export function mapPage(raw: WPPageRaw): Page {
  const y = raw.yoast_head_json
  const robots = y?.robots ?? {}

  const seo: PageSeo = {
    title: y?.title ?? null,
    description: y?.description ?? null,
    ogTitle: y?.og_title ?? null,
    ogDescription: y?.og_description ?? null,
    ogImage: y?.og_image?.[0]?.url ?? null,
    yoastCanonical: y?.canonical ?? null,
    index: robots.index !== 'noindex',
    follow: robots.follow !== 'nofollow',
  }

  return {
    id: raw.id,
    slug: raw.slug,
    title: decodeHtmlEntities(wpRenderedHtml(raw.title)),
    contentHtml: wpRenderedHtml(raw.content),
    modified: raw.modified,
    seo,
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
    name: decodeHtmlEntities(raw.name),
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
    name: decodeHtmlEntities(raw.name),
    displayName: decodeHtmlEntities(raw.display_name),
    firstName: raw.first_name,
    lastName: raw.last_name,
    roles: raw.roles,
    avatarUrl: raw.avatar_url,
    profession: raw.profession,
    company: raw.company,
    country: raw.country ?? null,
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
 *
 * Sessie 6 (19-05-2026): `group` toegevoegd. De FilterSidebar gebruikt
 * dat om secties onder de juiste property-groep te plaatsen (Sensorial /
 * Technical / Environmental / Content composition). `material_category`
 * krijgt `group: 'category'` en wordt apart bovenaan getoond.
 */
export interface MaterialFilterSection {
  /** Facet-naam (matcht een `MaterialFacetName`). */
  key: MaterialFacetName
  /** Property-groep waaronder deze facet valt in de sidebar. */
  group: MaterialFacetGroup
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
  // Category
  material_category: { selectMode: 'single', defaultOpen: true, searchable: false },
  // Sensorial
  glossiness: { selectMode: 'multi', defaultOpen: false, searchable: false },
  translucence: { selectMode: 'multi', defaultOpen: false, searchable: false },
  structure: { selectMode: 'multi', defaultOpen: false, searchable: false },
  texture: { selectMode: 'multi', defaultOpen: false, searchable: false },
  hardness: { selectMode: 'multi', defaultOpen: false, searchable: false },
  temperature: { selectMode: 'multi', defaultOpen: false, searchable: false },
  acoustics: { selectMode: 'multi', defaultOpen: false, searchable: false },
  odeur: { selectMode: 'multi', defaultOpen: false, searchable: false },
  weight: { selectMode: 'multi', defaultOpen: false, searchable: false },
  // Technical
  fire_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  uv_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  weather_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  scratch_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  chemical_resistance: { selectMode: 'multi', defaultOpen: false, searchable: false },
  // Environmental
  renewable: { selectMode: 'multi', defaultOpen: false, searchable: false },
  energy_saving: { selectMode: 'multi', defaultOpen: false, searchable: false },
  climate_neutral: { selectMode: 'multi', defaultOpen: false, searchable: false },
  generates_energy: { selectMode: 'multi', defaultOpen: false, searchable: false },
  reduces_energy_use: { selectMode: 'multi', defaultOpen: false, searchable: false },
  reduces_water_use: { selectMode: 'multi', defaultOpen: false, searchable: false },
  reduces_waste: { selectMode: 'multi', defaultOpen: false, searchable: false },
  reduces_transport: { selectMode: 'multi', defaultOpen: false, searchable: false },
  sustainably_produced: { selectMode: 'multi', defaultOpen: false, searchable: false },
  free_from_toxins: { selectMode: 'multi', defaultOpen: false, searchable: false },
  // Content composition
  biobased_content: { selectMode: 'multi', defaultOpen: false, searchable: false },
  recycled_content: { selectMode: 'multi', defaultOpen: false, searchable: false },
  upcycled_content: { selectMode: 'multi', defaultOpen: false, searchable: false },
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
 * Sessie 6 robustness: facets die we wel kennen (`MATERIAL_FILTER_FACETS`)
 * maar die nog niet in de baseline-response staan (Johan's WP-import nog
 * niet gedaan, of facet uitgeschakeld) worden simpelweg overgeslagen.
 * Geen error, geen lege sectie — ze verschijnen automatisch zodra ze in
 * baseline opduiken.
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
      // Facet niet in baseline-response — overslaan. Kan voorkomen zolang
      // FacetWP nog geen choices/index voor die facet heeft. Zodra materialen
      // termen dragen en de facet in de baseline zit, verschijnt hij in de UI.
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
    const group = MATERIAL_FACET_TO_GROUP[key]

    sections.push({
      key,
      group,
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
 * Normaliseer een veld dat number óf string mag zijn (bv. `founded`,
 * `employees`) naar een display-string. `0`, lege string en null/undefined
 * worden null. Anders de getrimde string-representatie.
 */
function displayValueOrNull(value: unknown): string | null {
  if (typeof value === 'number') {
    return value > 0 ? String(value) : null
  }
  return stringOrNull(value)
}

/**
 * Coerce een flag die als boolean óf string ('true'/'false') kan
 * binnenkomen naar een echte boolean. Gebruikt voor de brand-velden
 * `partner`/`featured` waar de genormaliseerde waarde een boolean is en
 * de raw underscore-fallback een string. Prefereert de eerste niet-null
 * waarde (genormaliseerd vóór raw).
 */
function truthyFlag(...values: unknown[]): boolean {
  for (const value of values) {
    if (value === undefined || value === null) continue
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true'
  }
  return false
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
