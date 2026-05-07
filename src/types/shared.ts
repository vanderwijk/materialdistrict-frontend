/**
 * Gedeelde basistypes
 *
 * Voorlopige interfaces gebaseerd op project-brief en mockup.
 * Worden bijgewerkt in sessie 2 op basis van werkelijke API-response.
 */

import type { ReaderTier, ManufacturerTier } from '@/lib/config/membership'

// ============================================================
// WordPress core
// ============================================================

export interface WPRendered {
  rendered: string
  protected?: boolean
}

export interface WPMedia {
  id: number
  source_url: string
  alt_text: string
  media_details: {
    width: number
    height: number
    sizes?: Record<string, {
      source_url: string
      width: number
      height: number
    }>
  }
}

export interface WPTerm {
  id: number
  name: string
  slug: string
  taxonomy: string
  description?: string
  count?: number
}

/** Generiek WP post-shape — concrete types extenden dit. */
export interface WPPostBase {
  id: number
  date: string
  modified: string
  slug: string
  status: 'publish' | 'draft' | 'private'
  link: string
  title: WPRendered
  excerpt: WPRendered
  content: WPRendered
  featured_media: number
  /** ACF velden komen via het `acf` veld in de REST response. */
  acf?: Record<string, unknown>
  /** Embedded resources (media, terms) via `?_embed`. */
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[]
    'wp:term'?: WPTerm[][]
  }
}

// ============================================================
// User & membership
// ============================================================

export interface User {
  id: number
  name: string
  email: string
  avatarUrl?: string
  readerTier: ReaderTier
  /** Aanwezig als de gebruiker tegelijk een brand-account heeft. */
  manufacturerTier?: ManufacturerTier
  /** Brand-id wanneer dit account aan een merk is gekoppeld. */
  brandId?: number
}

// ============================================================
// Gating
// ============================================================

export type GateReason = 'insider-only' | 'manufacturer-tier' | 'login-required'

export interface Gate {
  reason: GateReason
  ctaLabel?: string
  ctaHref?: string
}

// ============================================================
// Pagination
// ============================================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

// ============================================================
// API request shared params
// ============================================================

export interface ListParams {
  page?: number
  per_page?: number
  search?: string
  orderby?: string
  order?: 'asc' | 'desc'
}
