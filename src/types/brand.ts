/**
 * Brand types
 * ----------------------------------------------------------------------
 * Domain-model voor brand-CPT (de fabrikant achter een material).
 *
 * Meta-velden uit developer-handover:
 *   _brand_country, _brand_website, _brand_email, socials,
 *   _partner, _featured
 *
 * Brand-detailpagina toont in de mockup ook een gallery (hero + thumbs).
 * Die komt — net als bij material — uit de attachments van de brand-post,
 * NIET uit een meta-veld. Zie session-log sessie 2.
 */

import type { Gallery, MediaImage } from './media'

/**
 * Meta-shape volgens developer-handover.
 * De underscore-prefix komt direct van WP/PHP — voor brand zijn er
 * (anders dan material) géén schone aliassen.
 *
 * BLOCKER (sessie 2): bevestigen of de underscore-velden via REST
 * écht zichtbaar zijn. WP filtert protected meta met underscore-prefix
 * standaard weg. De `register_post_meta` van de developer moet hier
 * `auth_callback => __return_true` hebben gezet om ze publiek te krijgen.
 */
export interface BrandMeta {
  /** Land-slug of -code, bv. 'NL', 'DE'. Onbekend formaat tot we een ingevulde brand zien. */
  _brand_country?: string
  _brand_website?: string
  _brand_email?: string

  /** Socials. Exacte veldnamen onder socials nog niet bekend uit handover. */
  _brand_facebook?: string
  _brand_instagram?: string
  _brand_linkedin?: string
  _brand_twitter?: string
  _brand_youtube?: string

  /** Partner-status (opvallendere placement). */
  _partner?: boolean
  /** Featured op overzicht / homepage. */
  _featured?: boolean
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
  country: string | null
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
  country: string | null
  website: string | null
  email: string | null

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
