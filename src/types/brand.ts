/**
 * Brand types
 * ----------------------------------------------------------------------
 * Domain-model voor brand-CPT (de fabrikant achter een material).
 *
 * Normalized contract (Johan-handoff 27-05-2026, production verified):
 * de plugin levert nu genormaliseerde, schone meta-velden naast de
 * bestaande raw underscore-velden. De frontend gebruikt de
 * genormaliseerde velden als canonieke bron; de underscore-velden zijn
 * alleen rollout-tolerantie-fallback.
 *
 * Genormaliseerd:
 *   featured, partner, country, country_detail, website, contact_email,
 *   socials, material_count, city, address, founded, employees,
 *   primary_user_id, membership
 *
 * Raw (fallback / debug):
 *   _partner, _featured, _brand_country, _brand_website, _brand_email,
 *   _brand_facebook, _brand_instagram, _brand_linkedin, _brand_twitter,
 *   _brand_youtube
 *
 * Brand-detailpagina toont in de mockup ook een gallery (hero + thumbs).
 * Die komt — net als bij material — uit de attachments van de brand-post,
 * NIET uit een meta-veld (Johan-handoff §5: gallery-gedrag ongewijzigd).
 * Zie session-log sessie 2.
 */

import type { Gallery, MediaImage } from './media'

/**
 * Land-detail-object zoals de plugin het levert: ISO-code + leesbare
 * label. `country` (kale code) en `country_detail.label` (leesbaar)
 * komen beide mee; de UI gebruikt de label.
 */
export interface BrandCountryDetail {
  code: string
  label: string
}

/**
 * Genormaliseerde socials-shape (Johan-handoff). Alle velden nullable —
 * brands vullen vaak maar een deel in.
 */
export interface BrandSocialsMeta {
  facebook?: string | null
  instagram?: string | null
  linkedin?: string | null
  twitter?: string | null
  youtube?: string | null
}

/**
 * Meta-shape volgens het normalized contract (Johan-handoff 27-05-2026).
 *
 * Genormaliseerde velden zijn de canonieke bron. De underscore-velden
 * blijven beschikbaar maar worden alleen als fallback gebruikt tijdens
 * rollout — niet als primaire bron voor UI-rendering.
 */
export interface BrandMeta {
  // --- Genormaliseerd (canoniek) ---
  featured?: boolean
  partner?: boolean
  /** Kale landcode, bv. 'JP'. Voor weergave: gebruik `country_detail.label`. */
  country?: string | null
  country_detail?: BrandCountryDetail | null
  website?: string | null
  contact_email?: string | null
  socials?: BrandSocialsMeta | null
  /** Aantal gepubliceerde materialen — door WP berekend. */
  material_count?: number
  city?: string | null
  address?: string | null
  /** Oprichtingsjaar (4 cijfers) of leeg. */
  founded?: number | string | null
  /** Aantal werknemers — exact getal of band (bv. '51-200'). */
  employees?: number | string | null
  /** Relatie naar primary user (Fase 2 claim-flow). */
  primary_user_id?: number | null
  /** Brand-membership-blok (Fase 2). Shape nog niet hard vastgelegd. */
  membership?: unknown

  // --- Raw underscore (alleen rollout-fallback) ---
  _partner?: boolean | string | null
  _featured?: boolean | string | null
  _brand_country?: string | null
  _brand_website?: string | null
  _brand_email?: string | null
  _brand_facebook?: string | null
  _brand_instagram?: string | null
  _brand_linkedin?: string | null
  _brand_twitter?: string | null
  _brand_youtube?: string | null
}

/** Lichtgewicht brand voor in een card op de brand-overzichtspagina. */
export interface BrandListItem {
  id: number
  slug: string
  link: string
  name: string
  excerptHtml: string
  /** Logo of hero — uit `featured_media` van de brand-post. */
  logo: MediaImage | null
  /** Leesbare landnaam (uit `country_detail.label`). Null als onbekend. */
  country: string | null
  /** Vestigingsplaats. Null als niet ingevuld. */
  city: string | null
  /** Aantal gepubliceerde materialen — door WP berekend (`material_count`). */
  materialCount: number
  partner: boolean
  featured: boolean
}

/** Volledig brand voor de detailpagina. */
export interface Brand {
  id: number
  slug: string
  link: string
  name: string
  contentHtml: string
  excerptHtml: string

  /** Hero + thumbs uit attachments. */
  gallery: Gallery

  /** Contact + locatie. */
  /** Leesbare landnaam (uit `country_detail.label`). Null als onbekend. */
  country: string | null
  /** Vestigingsplaats. Null als niet ingevuld. */
  city: string | null
  /** Volledig vestigingsadres. Null als niet ingevuld. */
  address: string | null
  website: string | null
  email: string | null

  /** Bedrijfsgegevens (Batch B). Null als niet ingevuld. */
  /** Oprichtingsjaar als string voor weergave (bv. '1923'). */
  founded: string | null
  /** Werknemers — exact getal of band, als string voor weergave. */
  employees: string | null

  /** Aantal gepubliceerde materialen — door WP berekend (`material_count`). */
  materialCount: number

  /** Sociale media. */
  socials: {
    facebook: string | null
    instagram: string | null
    linkedin: string | null
    twitter: string | null
    youtube: string | null
  }

  /** Status-vlaggen. */
  partner: boolean
  featured: boolean

  date: string
  modified: string
}
