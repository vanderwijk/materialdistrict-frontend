/**
 * Dashboard datacontract — typed interfaces per panel.
 *
 * This file is an OUTPUT derived from `MaterialDistrict_MockUp_DEF.html`
 * (the `renderDashboard` panels), NOT input waiting on Johan. Each interface
 * documents the WordPress/WooCommerce endpoint that will later deliver it.
 * Until those endpoints exist the dashboard runs on typed fixtures
 * (`src/lib/dashboard/mock.ts`), accessed through the data layer
 * (`src/lib/dashboard/data.ts`), so the real endpoints click in afterwards
 * without touching components.
 *
 * Conventions (architecture-rules.md):
 *  - "WordPress computes, frontend reads": derived fields (quota, isInsider,
 *    statistics totals) arrive ready-to-use. No recomputation here.
 *  - All shapes are camelCase domain types. The mapper layer translates the
 *    snake_case WordPress payloads (see `dashboard-datacontract.md`).
 *  - User / Membership / BrandMembership live in `shared.ts` and are reused
 *    here rather than duplicated.
 */

import type { ManufacturerTier } from '@/lib/config/membership'
import type { MaterialProperties } from '@/types/material'

// ============================================================
// Shared primitives
// ============================================================

/** Online/offline publication state of a material, as the brand sees it. */
export type MaterialPublicationStatus = 'online' | 'offline' | 'draft'

/** Invoice payment state. Mirrors the WooCommerce / Stripe invoice status. */
export type InvoiceStatus = 'paid' | 'open' | 'overdue' | 'refunded'

/**
 * Invoice source. Today only 'membership' (Stripe subscriptions) exists; 'order'
 * arrives with the parked WooCommerce checkout. Drives the Type label in the
 * unified invoice list (review point 8).
 */
export type InvoiceKind = 'membership' | 'order'

/**
 * One invoice line. Shared by the personal account and per-brand invoice
 * panels — the only difference is the source scope (see the data layer).
 *
 * Endpoint: `GET /md/v2/dashboard/invoices?scope=user`
 *           `GET /md/v2/dashboard/brands/{brandId}/invoices`
 */
export interface Invoice {
  id: string
  /** ISO date string. Formatted client-side with Intl.DateTimeFormat. */
  date: string
  description: string
  /** Amount in minor units is avoided — WooCommerce delivers a decimal. */
  amount: number
  currency: string
  status: InvoiceStatus
  /**
   * Source of this invoice. Defaults to 'membership' when absent (all current
   * invoices are Stripe membership charges).
   */
  kind?: InvoiceKind
  /** Signed download URL, or `null` while not yet generated. */
  pdfUrl: string | null
}

// ============================================================
// Personal account — My profile
// ============================================================

/**
 * Editable personal profile. Superset of the identity fields already on
 * `User` (shared.ts); the dashboard form edits these.
 *
 * Endpoint:
 *  - read  `GET  /md/v2/dashboard/profile`
 *  - write `POST /md/v2/dashboard/profile`
 */
export interface UserProfile {
  // --- Personal details ---
  firstName: string
  lastName: string
  email: string
  phone: string
  /** Profession dropdown value (slug). Options come from `getProfileFieldOptions`. */
  profession: string
  /** Industry/sector dropdown value (slug). Options come from `getProfileFieldOptions`. */
  industry: string
  // --- Billing & address ---
  address: string
  /** Optionele tweede adresregel (suite, etage, etc.); WP user-meta `address_2`. */
  address2?: string
  postcode: string
  city: string
  country: string
  /**
   * When true the next invoice is issued to a company; `company` + `vatNumber`
   * then apply. Drives the "Invoice to a company" toggle in the form.
   */
  invoiceToCompany: boolean
  /** Company (billing) name, used when `invoiceToCompany` is true. */
  company: string
  /** VAT number for business invoices (EU B2B). */
  vatNumber: string
  /** Avatar upload URL, or `null` to fall back to initials. */
  avatarUrl: string | null
}

/** One option in a profile dropdown (profession / industry). */
export interface ProfileFieldOption {
  value: string
  label: string
}

/**
 * Option lists for the profile dropdowns, sourced from WordPress (the same
 * lists the legacy registration used). Empty arrays → the form falls back to a
 * free-text input for that field.
 *
 * Endpoint: `GET /md/v2/dashboard/profile-options`
 */
export interface ProfileFieldOptions {
  professions: ProfileFieldOption[]
  industries: ProfileFieldOption[]
}

// ============================================================
// Personal account — Bookmarks
// ============================================================

/** Content types a visitor can bookmark. Keys match the bookmark tabs. */
export type BookmarkType = 'materials' | 'articles' | 'brands' | 'talks' | 'events' | 'books'

/**
 * One bookmarked item. `href` points at the public detail page so the card
 * is clickable; `gradient` mirrors the public card thumbnail styling.
 *
 * Endpoint: `GET  /md/v2/dashboard/bookmarks`
 *           `POST /md/v2/dashboard/bookmarks` (body `{ type, item_id }`)
 *           `DELETE /md/v2/dashboard/bookmarks/{id}`
 */
export interface BookmarkItem {
  id: string
  type: BookmarkType
  /**
   * Underlying WordPress post id of the bookmarked content (material /
   * article / brand / …). Lets the public-site Save buttons map an item to
   * its bookmark record without matching on slug. Supplied by WordPress on
   * both the list and create responses.
   */
  itemId: number
  title: string
  /** Short content-type label shown on the card (e.g. "Material"). */
  label: string
  href: string
  /** Optional thumbnail; gradient is the fallback (matches public cards). */
  imageUrl: string | null
  gradient: string | null
  savedAt: string
}

// ============================================================
// Personal account — Boards (Insider)
// ============================================================

/**
 * A board groups bookmarked materials/articles into a project folder.
 * Insider-only feature; the panel is gated for free users.
 *
 * Endpoint: `GET /md/v2/dashboard/boards`
 *           `POST/PATCH/DELETE /md/v2/dashboard/boards/{id}`
 */
export interface Board {
  id: string
  name: string
  createdAt: string
  /** Counts are computed by WordPress; the frontend only displays them. */
  materialCount: number
  articleCount: number
  /** CSS gradient string for the cover, injected via a custom property. */
  coverGradient: string
}

/**
 * One item inside a board's detail view. Same display shape as `BookmarkItem`
 * but without the bookmark record id — boards key items on `type` + `itemId`.
 *
 * Endpoint: `GET /md/v2/dashboard/boards/{id}` (the `items[]`).
 */
export interface BoardItem {
  type: BookmarkType
  /** Underlying WP post id of the saved content. */
  itemId: number
  title: string
  label: string
  href: string
  imageUrl: string | null
  gradient: string | null
  savedAt: string
}

/**
 * A board plus its (published) items. Orphan/unpublished items are filtered
 * server-side, like bookmarks.
 *
 * Endpoint: `GET /md/v2/dashboard/boards/{id}`
 */
export interface BoardDetail extends Board {
  items: BoardItem[]
}

// ============================================================
// Personal account — Saved searches (Insider)
// ============================================================

/**
 * A saved filter combination, optionally with e-mail alerts.
 * Insider-only feature.
 *
 * Endpoint: `GET /md/v2/dashboard/saved-searches`
 *           `POST/PATCH/DELETE /md/v2/dashboard/saved-searches/{id}`
 */
export interface SavedSearch {
  id: string
  name: string
  /** Human-readable summary of the filters (computed server-side). */
  summary: string
  /** Canonical query string to re-run the search on `/material`. */
  query: string
  /** Result count at last evaluation. */
  resultCount: number
  alertsEnabled: boolean
  createdAt: string
}

// ============================================================
// Personal account — Insider insights
// ============================================================

/**
 * An insider report: a standalone downloadable document with its OWN CPT —
 * not an article/story. Reports flagged `insiderOnly` are gated for non-Insiders
 * (the S13.5 tier-preview lets them peek); un-flagged reports download for anyone.
 *
 * Endpoint: `GET /md/v2/dashboard/insider-insights`
 */
export interface InsightReport {
  id: string
  title: string
  /** Description of the document (shown on the report, not in the list row). */
  description: string
  /** ISO date; formatted client-side to e.g. "Apr 2026". */
  date: string
  /** Page count for the meta line ("28 pages"). */
  pages: number
  /** File format label, e.g. "PDF". */
  format: string
  /** Thumbnail image URL; falls back to `gradient` when null. */
  thumbnailUrl: string | null
  /** CSS gradient fallback for the thumbnail block when no image is set. */
  gradient: string
  /** Insider-only gating — its OWN checkbox on the insider-report CPT. */
  insiderOnly: boolean
  /**
   * Whether a PDF lives in the media library for this report. The file itself
   * is NEVER exposed as a URL — downloads run through the gated, per-user
   * endpoint `/api/dashboard/insider-insights/{id}/download`.
   */
  hasPdf: boolean
  href: string
}

// ============================================================
// Personal account — My requests
// ============================================================

/** What a visitor asked for on a material/brand page. */
export type RequestKind = 'sample' | 'info' | 'brochure' | 'contact'

/**
 * A request the logged-in visitor submitted (distinct from a brand's
 * incoming Interactions). Read-only history.
 *
 * Endpoint: `GET /md/v2/dashboard/requests`
 */
export interface MyRequest {
  id: string
  kind: RequestKind
  /** Material or brand the request was about. */
  subject: string
  brandName: string
  date: string
  /** Free-text label, e.g. "Sent", "Answered". */
  status: string
  message: string
}

// ============================================================
// Brand — Profile + keywords
// ============================================================

export interface BrandSocialLinks {
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
  pinterest: string
  facebook: string
}

/**
 * Editable brand profile. Mirrors the mockup `formState`.
 *
 * Endpoint:
 *  - read  `GET  /md/v2/dashboard/brands/{brandId}/profile`
 *  - write `POST /md/v2/dashboard/brands/{brandId}/profile`
 */
export interface BrandProfile {
  brandId: number
  slug: string
  brandName: string
  description: string
  website: string
  email: string
  phone: string
  country: string
  /** Street + number. */
  addressLine1: string
  /** Optional second address line (suite, floor, etc.). */
  addressLine2: string
  postcode: string
  city: string
  vatNumber: string
  chamberNumber: string
  social: BrandSocialLinks
  logoUrl: string | null
  logoName: string | null
  /** Set after a fresh media upload; sent as `logo_attachment_id` on save. */
  logoId?: string | null
  /** Material channels the brand participates in (e.g. Biobased). */
  channels: string[]
  /** SEO / discovery keywords (Plus+ feature). */
  keywords: string[]
  /**
   * Sectors & applications — the 3-level application paths this brand serves
   * (max 3). Same shape and shared picker as a material's `applications`.
   * Plus+ feature.
   */
  applications: MaterialCategoryPath[]
  /** Video links (YouTube / Vimeo URLs) shown on the brand page (Plus+). */
  videos: string[]
  /** Gallery images shown on the brand page, in display order. */
  gallery: MaterialAsset[]
  /** Downloads & brochures (each with an optional document title). */
  downloads: MaterialAsset[]
}

// ============================================================
// Brand — Materials management
// ============================================================

/**
 * One row in the brand's material list.
 *
 * Endpoint: `GET /md/v2/dashboard/brands/{brandId}/materials`
 *           `PATCH /md/v2/dashboard/brands/{brandId}/materials/{id}` (status)
 */
export interface MaterialListRow {
  id: number
  name: string
  category: string
  status: MaterialPublicationStatus
  /** ISO date of last update. */
  updatedAt: string
  /** Whether this slot counts against the tier quota (false = standalone). */
  countsAgainstQuota: boolean
  /**
   * Featured booking on this material (calendar week), null = none. Drives the
   * non-blocking heads-up when taking a featured material offline. This is the
   * booking state, not visibility (WP hides offline materials from the slots).
   */
  featuredState: 'active' | 'scheduled' | null
  /** ISO Monday of the relevant featured week, or null. */
  featuredWeekStart: string | null
}

/** A taxonomy assignment on a material (3-level category path). */
export interface MaterialCategoryPath {
  id: string
  l1: string
  l2: string
  l3: string
}

/** One assignable material type from the `material_category` taxonomy. */
export interface MaterialTypeOption {
  id: string
  name: string
}

/**
 * An uploaded asset reference (gallery image or download) used in both forms.
 * `title` is the optional, human-entered document title for downloads &
 * brochures (shared shape across brand profile and material forms); gallery
 * images leave it undefined.
 */
export interface MaterialAsset {
  id: string
  name: string
  url: string | null
  title?: string
}

/**
 * The material create/edit form payload.
 *
 * Endpoint:
 *  - read  `GET  /md/v2/dashboard/brands/{brandId}/materials/{id}`
 *  - write `POST /md/v2/dashboard/brands/{brandId}/materials` (create)
 *          `PATCH /md/v2/dashboard/brands/{brandId}/materials/{id}` (edit)
 */
export interface MaterialFormData {
  mode: 'create' | 'edit'
  id: number | null
  name: string
  description: string
  /** material_category term id (stringified). */
  type: string
  /**
   * Indoor / outdoor classification. Multi-select: a material may be both.
   * Empty array = not yet specified.
   */
  indoorOutdoor: Array<'indoor' | 'outdoor'>
  featuredImage: MaterialAsset | null
  /**
   * Material applications — the 3-level application paths (max 3). Same shape
   * and shared picker as a brand's `applications`. Was previously `categories`.
   */
  applications: MaterialCategoryPath[]
  channels: string[]
  gallery: MaterialAsset[]
  videos: string[]
  downloads: MaterialAsset[]
  keywords: string[]
  /**
   * Search & filtering properties (24 fields / 4 groups). Drives discovery and
   * compare. Same taxonomy + FacetWP model for all groups; form options come
   * from the FacetWP baseline when choices exist, else static defaults.
   */
  properties: MaterialProperties
}

// ============================================================
// Brand — Interactions (incoming requests)
// ============================================================

export type InteractionType = 'request' | 'brochure-download' | 'info' | 'contact'

/**
 * An incoming lead/request on one of the brand's pages. Read + status only.
 *
 * Endpoint: `GET /md/v2/dashboard/brands/{brandId}/interactions`
 *           `PATCH /md/v2/dashboard/brands/{brandId}/interactions/{id}`
 */
export interface Interaction {
  id: number
  type: InteractionType
  /** Material/brand page the interaction came from. */
  page: string
  person: string
  role: string
  industry: string
  company: string
  email: string
  phone: string
  address: string
  postcode: string
  city: string
  country: string
  date: string
  /** Pre-formatted relative time (computed server-side for stable display). */
  timeAgo: string
  /** Short status label, e.g. "Request", "Download". */
  status: string
  message: string
  /** Options the visitor ticked (e.g. "Send me a sample"). */
  requestOptions: string[]
}

// ============================================================
// Brand — Statistics
// ============================================================

/** A single headline metric (the stat cards). */
export interface StatMetric {
  label: string
  value: number
  /** Optional secondary note (e.g. "+12% vs last month"). */
  note: string | null
}

/** Per-material performance row. Downloads are a separate entity (see `brochures`). */
export interface MaterialStatRow {
  materialId: number
  name: string
  views: number
  requests: number
}

/** Per-brochure download row (brand or material scope). */
export interface BrochureStatRow {
  attachmentId: number
  title: string
  downloads: number
}

/** Material-scoped brochure row (includes parent material). */
export interface MaterialBrochureStatRow extends BrochureStatRow {
  materialId: number
  materialName: string
}

/** Per-scope brochure download breakdown for the statistics panel. */
export interface BrandBrochureStatistics {
  brand: BrochureStatRow[]
  material: MaterialBrochureStatRow[]
}

/**
 * The statistics panel payload. Everything is pre-aggregated by WordPress.
 *
 * Endpoint: `GET /md/v2/dashboard/brands/{brandId}/statistics?range=...`
 */
export interface BrandStatistics {
  /** Headline metrics (4 cards in the mockup). */
  metrics: StatMetric[]
  materials: MaterialStatRow[]
  /**
   * Per-brochure download counts split by brand profile vs material downloads.
   */
  brochures: BrandBrochureStatistics
}

// ============================================================
// Brand — Lead routing
// ============================================================

/**
 * One country → contact routing rule (Plus+ feature).
 *
 * Endpoint: `GET /md/v2/dashboard/brands/{brandId}/lead-routing`
 *           `POST/PATCH/DELETE .../lead-routing/{id}`
 */
export interface LeadRoute {
  id: number
  country: string
  name: string
  email: string
}

/** The default fallback contact used when no country rule matches. */
export interface LeadRoutingConfig {
  defaultName: string
  defaultEmail: string
  routes: LeadRoute[]
  /**
   * When true, only countries that have a rule may submit requests; all other
   * countries are blocked. When false, anyone may submit regardless of country.
   */
  restrictToListedCountries: boolean
  /**
   * Brand-level Insider gate: when true, sample requests on every material page
   * of this brand are restricted to verified Insider members.
   */
  sampleRequestsInsidersOnly: boolean
  /**
   * Brand-level Insider gate: when true, downloads (brochures, datasheets, EPDs)
   * on every material page of this brand are restricted to Insider members.
   */
  downloadsInsidersOnly: boolean
}

// ============================================================
// Brand — Featured placements
// ============================================================

export type FeaturedSlotStatus = 'active' | 'available' | 'scheduled'

/**
 * A featured-placement slot (Partner feature). The catalogue of buyable
 * slots is a RULE and lives in config; per-brand booking state is DATA.
 *
 * Endpoint: `GET /md/v2/dashboard/brands/{brandId}/featured`
 */
export interface FeaturedPlacement {
  id: string
  /** e.g. "Homepage hero", "Category top". */
  slot: string
  status: FeaturedSlotStatus
  /** ISO date range, null when not booked. */
  startsAt: string | null
  endsAt: string | null
  /** Which material/article is placed, if any. */
  subject: string | null
}

/** Status of a weekly featured slot (Partner self-service booking). */
export type FeaturedSlotState = 'scheduled' | 'active' | 'done'

/**
 * One booked featured week for a material (Partner self-service).
 * Endpoint: GET/POST/DELETE /md/v2/dashboard/brands/{brandId}/featured-slots
 */
export interface FeaturedSlot {
  id: string
  materialId: number
  materialName: string
  materialSlug: string
  /** ISO date, Monday of the booked week. */
  weekStart: string
  /** ISO date, Sunday of the booked week. */
  weekEnd: string
  status: FeaturedSlotState
  isFeaturedNow: boolean
  createdAt: string
}

/** Featured-slots payload: the brand's quota plus its booked weeks. */
export interface FeaturedSlotsData {
  total: number
  used: number
  /** ISO date the quota resets (Stripe membership end), null when not applicable. */
  resetDate: string | null
  slots: FeaturedSlot[]
}

// ============================================================
// Brand — Add brand (claim/create)
// ============================================================

/**
 * A brand the user can claim during onboarding (matched on e-mail domain).
 *
 * Endpoint: `GET /md/v2/dashboard/brand-candidates?q=...`
 */
export interface BrandCandidate {
  id: number
  name: string
  domain: string
  website: string
  email: string
  /** 2-letter logo fallback label. */
  logoLabel: string
}

// ============================================================
// Navigation config types (single source for sidebar + mobile nav)
// ============================================================

/** A nav entry in the personal (user) scope. */
export interface UserNavItem {
  key: string
  label: string
  /** Absolute route under /dashboard. */
  href: string
  /** When true, the panel is an Insider extra (gated for free readers). */
  insiderOnly: boolean
}

/** A nav entry in a brand scope. `href` is built per brand at render time. */
export interface BrandNavItem {
  key: string
  label: string
  /** Path segment appended to /dashboard/brands/{slug}. '' = brand profile. */
  segment: string
  /** Minimum tier required to use the panel; null = always available. */
  minTier: ManufacturerTier | null
}
