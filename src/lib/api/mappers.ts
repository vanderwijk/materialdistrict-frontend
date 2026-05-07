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
 */

import type { Article, ArticleListItem } from '@/types/article'
import type { Brand, BrandListItem } from '@/types/brand'
import type { Event, EventListItem } from '@/types/event'
import type { Material, MaterialListItem } from '@/types/material'
import type { Gallery, ImageSizeKey, MediaImage, MediaSize } from '@/types/media'
import type { Talk, TalkListItem } from '@/types/talk'

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