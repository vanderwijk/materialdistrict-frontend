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

// ============================================================
// Shared primitives
// ============================================================

/** Online/offline publication state of a material, as the brand sees it. */
export type MaterialPublicationStatus = 'online' | 'offline' | 'draft'

/** Invoice payment state. Mirrors the WooCommerce / Stripe invoice status. */
export type InvoiceStatus = 'paid' | 'open' | 'overdue' | 'refunded'

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
  firstName: string
  lastName: string
  email: string
  profession: string
  company: string
  country: string
  /** Avatar upload URL, or `null` to fall back to initials. */
  avatarUrl: string | null
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
 * Endpoint: `GET /md/v2/dashboard/bookmarks`
 *           `DELETE /md/v2/dashboard/bookmarks/{id}`
 */
export interface BookmarkItem {
  id: string
  type: BookmarkType
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
  /** Canonical query string to re-run the search on `/materials`. */
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
 * A trend report / insight entry. Insider-only content; non-Insiders see a
 * teaser + gate.
 *
 * Endpoint: `GET /md/v2/dashboard/insider-insights`
 */
export interface InsightReport {
  id: string
  title: string
  summary: string
  date: string
  /** e.g. "Trend report", "Material forecast". */
  category: string
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
  address: string
  postcode: string
  city: string
  vatNumber: string
  chamberNumber: string
  social: BrandSocialLinks
  logoUrl: string | null
  logoName: string | null
  /** Material channels the brand participates in (e.g. Biobased). */
  channels: string[]
  /** SEO / discovery keywords (Plus+ feature). */
  keywords: string[]
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

/** A gallery image reference in the material form. */
export interface MaterialAsset {
  id: string
  name: string
  url: string | null
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
  featuredImage: MaterialAsset | null
  categories: MaterialCategoryPath[]
  channels: string[]
  gallery: MaterialAsset[]
  videos: string[]
  downloads: MaterialAsset[]
  keywords: string[]
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

/** Per-material performance row. */
export interface MaterialStatRow {
  materialId: number
  name: string
  views: number
  requests: number
  downloads: number
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
