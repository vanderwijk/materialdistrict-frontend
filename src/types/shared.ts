/**
 * Shared base types
 *
 * Contains WordPress-core types (post, media, term) and the domain types for
 * User & Membership. The membership shape follows the definitive datacontract
 * confirmed during the Johan call of 12-05-2026 — see `datacontract-proposal.md`
 * v0.2 and `vragen-johan.md` for the underlying decisions.
 *
 * API → frontend mapping:
 *  - The WordPress API delivers snake_case (see datacontract); the frontend
 *    uses camelCase. The mapper layer (`src/lib/api/mappers.ts`) handles the
 *    translation so that domain types stay clean and don't double as an
 *    API mirror.
 *  - Fields like `is_placeholder` stay explicitly present — `true` while the
 *    Stripe sync hasn't been completed across all brands; the UI may react
 *    visually to this (dev banner) but production logic does not change.
 *
 * Status: contract definitive (Johan-call 12-05-2026). Future changes flow
 * through this file and the mapper, not scattered across components.
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

/** Generic WP post shape — concrete types extend this. */
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
  /** ACF fields come through the `acf` property in the REST response. */
  acf?: Record<string, unknown>
  /** Embedded resources (media, terms) via `?_embed`. */
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[]
    'wp:term'?: WPTerm[][]
  }
}

// ============================================================
// Membership — shared primitives
// ============================================================

/**
 * Stripe / WP subscription status — six values, one-to-one with Stripe.
 *
 * Confirmed by Johan on 12-05-2026: WordPress passes the Stripe status
 * through unchanged. The frontend does NOT compute whether a status maps
 * to "is a member" — see the `is_member` field, which is calculated by
 * WordPress (rule: "WordPress computes, frontend reads").
 *
 *  - `inactive`  — no active subscription (free users, never subscribed)
 *  - `trialing`  — in a trial period; treated as member by WordPress
 *  - `active`    — paying member, everything works
 *  - `past_due`  — Stripe payment failed; subscription still considered
 *                   active by WordPress (member access kept) while Stripe
 *                   retries. UI may show a warning banner.
 *  - `canceled`  — cancellation processed; access ended
 *  - `unpaid`    — Stripe gave up retrying; access ended
 *
 * Note: the `legacy` value (for grandfathered free brands without a Stripe
 * link) lives ONLY on brand-level membership, never on user-level. See the
 * brand status enum in `vragen-johan.md` (legacy-conversion vragen 10-13)
 * for that separate field.
 */
export type MembershipStatus =
  | 'inactive'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

/** Billing interval for Insider (free has `null`). */
export type BillingInterval = 'monthly' | 'annual'

// ============================================================
// Reader Insider Membership (per user)
// ============================================================

/**
 * Reader membership as delivered by `/auth/me` → `user.membership`.
 *
 * The UI almost always only uses `isInsider`. The other fields are for
 * account pages (session 11) and dashboard (Phase 2) — billing status,
 * cancellation notice, payment-issue warning.
 *
 * Derived fields (notably `isInsider`) are computed by WordPress and read
 * by the frontend, never recomputed here. This matches the architecture
 * rule "Derived fields — source of truth" (see `architecture-rules.md`).
 */
export interface Membership {
  /** Reader tier. */
  tier: ReaderTier
  /**
   * Convenience field, computed by WordPress.
   * `true` when the user has Insider access right now, including during
   * `trialing` and `past_due`. Frontend uses this directly for gating
   * decisions and never recomputes from `status`.
   */
  isInsider: boolean
  /** Subscription status (one of six Stripe values). */
  status: MembershipStatus
  /** `null` for free users. */
  billingInterval: BillingInterval | null
  /** ISO string. When Insider access expires. `null` for free users. */
  validUntil: string | null
  /** Canceled, runs until `validUntil`. */
  cancelAtPeriodEnd: boolean
  /** `true` while the Stripe link isn't live — UI may show a placeholder banner. */
  isPlaceholder: boolean
}

// ============================================================
// Brand Membership (per brand, per user)
// ============================================================

/**
 * Quota sentinel for unlimited publications (Partner tier).
 * The datacontract uses `-1`; this constant exists for readability in code.
 */
export const UNLIMITED_PUBLICATIONS = -1

/**
 * Brand membership as delivered by `/auth/me` → `user.brands[]`.
 *
 * A user can manage multiple brands (think: agency with several manufacturer
 * accounts). Each element in the array is one brand with its own tier and
 * status.
 *
 * Field values:
 *  - `tier`              — `'free' | 'basis' | 'plus' | 'partner'`
 *  - `publicationQuota`  — included slots: 0 (free), 5 (basis),
 *                          15 (plus), `UNLIMITED_PUBLICATIONS` (-1) for partner
 *  - `publicationsUsed`  — number of online materials using a tier slot
 *                          (excludes standalone €250-per-year publications)
 *
 * Both `publicationQuota` and `publicationsUsed` are computed by WordPress
 * and delivered ready-to-use. The frontend does not recompute tier rules.
 */
export interface BrandMembership {
  /** WP post ID of the brand. */
  id: number
  /** URL slug for routing. */
  slug: string
  /** Display name. */
  name: string
  /** Brand tier. */
  tier: ManufacturerTier
  /** Subscription status (one of six Stripe values). */
  status: MembershipStatus
  /** ISO string. When the brand subscription expires. `null` for free. */
  validUntil: string | null
  /** Canceled, runs until `validUntil`. */
  cancelAtPeriodEnd: boolean
  /** Included publication slots. `UNLIMITED_PUBLICATIONS` (-1) for partner. */
  publicationQuota: number
  /** Number of online materials using a tier slot (excl. standalone). */
  publicationsUsed: number
  /** `true` while the Stripe link isn't live. */
  isPlaceholder: boolean
}

// ============================================================
// User
// ============================================================

/**
 * The logged-in user as delivered by `/auth/me` and `/auth/login`.
 *
 * `membership` is always present (default: free / inactive).
 * `brands` is an array — empty if the user manages no brand.
 *
 * Identity fields (`profession`, `company`) are optional: WordPress has
 * them in user meta, but not every user has filled them in.
 */
export interface User {
  id: number
  email: string
  name: string
  displayName: string
  firstName: string | null
  lastName: string | null
  /** WP roles — most users have `['subscriber']`. */
  roles: string[]
  /** Gravatar or custom upload URL. */
  avatarUrl: string | null
  /** Profile field — not always filled. */
  profession: string | null
  /** Profile field — not always filled. */
  company: string | null
  /**
   * Readable country label (e.g. `Netherlands`) as delivered by `/auth/me`,
   * matching the dashboard profile and a brand's `accepted_countries`. `null`
   * when not set. Used for the lead-routing country gate on public material
   * pages (matched label-against-label; `/auth/me` also exposes an optional
   * ISO `country_code` for code-level logic, not consumed here yet).
   */
  country: string | null

  /**
   * Optioneel signaal van `/auth/me`: heeft de gebruiker een compleet
   * bezorgadres op naam (straat, postcode, plaats, land)? Gebruikt om fysieke
   * sample-aanvragen te poorten. `undefined` zolang het backend-signaal nog
   * niet live is — de frontend valt dan netjes terug (geen harde blokkade).
   * Johan levert dit veld op `/auth/me` (zie Johan-handoff).
   */
  hasShippingAddress?: boolean

  /** Reader membership (always present, default free/inactive). */
  membership: Membership

  /** Brand memberships — empty array if the user manages no brand. */
  brands: BrandMembership[]
}

// ============================================================
// Auth response wrapper
// ============================================================

/**
 * Full shape of `POST /wp-json/md/v2/auth/login` AND `GET /wp-json/md/v2/auth/me`.
 *
 * Both endpoints return the same shape: token + expiry + full user object.
 * The login endpoint includes them after a successful credential check;
 * the `/auth/me` endpoint includes a refreshed token+expiry whenever it is
 * called with a still-valid token (so the Next.js server route can quietly
 * extend the cookie on activity if it wants to).
 *
 * Token + expiry sit on the response so the Next.js server route knows
 * exactly when the cookie should expire. The cookie itself stores only
 * the token; these fields are for diagnostics and optional refresh logic.
 */
export interface AuthMeResponse {
  /** JWT token. */
  token: string
  /** Unix timestamp (seconds) when the token expires. */
  expiresAt: number
  user: User
}

/**
 * Alias for the same shape returned by `/auth/login`.
 *
 * Reads more naturally in code that explicitly deals with the login flow.
 * Single source of truth for the user shape — extending one extends both.
 */
export type AuthLoginResponse = AuthMeResponse

/**
 * Stable error codes emitted by `/wp-json/md/v2/auth/*` endpoints.
 *
 * Confirmed by Johan for login (see `vragen-johan.md` answer 6 and
 * `wordpress-instructions-auth.md`):
 *  - `md_auth_invalid_request`  — required field missing (e.g. no email)
 *  - `md_auth_invalid_email`    — email format invalid
 *  - `md_auth_failed`           — email/password combo wrong
 *
 * Confirmed for the password-reset flow (same instruction doc):
 *  - `md_auth_invalid_token`    — reset token unknown, expired, or already used
 *  - `md_auth_weak_password`    — new password fails server-side strength check
 *
 * RESERVED for the registration flow (added in session 6A — pending
 * Johan implementation per `wordpress-instructions-register.md`):
 *  - `md_auth_email_taken`      — email already registered to an account
 *
 * `md_auth_weak_password` is reused on register (same strength rule as
 * password-reset, no need for a separate code).
 */
export type AuthErrorCode =
  | 'md_auth_invalid_request'
  | 'md_auth_invalid_email'
  | 'md_auth_failed'
  | 'md_auth_invalid_token'
  | 'md_auth_weak_password'
  | 'md_auth_email_taken'
  | 'md_auth_oauth_invalid_request'
  | 'md_auth_oauth_invalid_token'
  | 'md_auth_oauth_email_required'
  | 'md_auth_oauth_email_unverified'
  | 'md_auth_oauth_provider_error'
  | 'md_auth_oauth_not_configured'
  | 'md_auth_registration_disabled'

/**
 * Error response shape from `/wp-json/md/v2/auth/*` endpoints.
 *
 * Matches the standard WordPress error envelope. The frontend renders
 * `message` directly to the user (English copy lives in WordPress) and
 * uses `code` for UI branching (e.g. focus the relevant input).
 */
export interface AuthErrorResponse {
  code: AuthErrorCode
  message: string
  data: {
    /** HTTP status code, mirrored in `data` per WP convention. */
    status: number
  }
}

// ============================================================
// WordPress raw response shapes (snake_case)
// ============================================================

/**
 * Raw response from `POST /wp-json/md/v2/auth/login` and
 * `GET /wp-json/md/v2/auth/me`.
 *
 * Snake_case, exactly as WordPress emits it. The mapper layer
 * (`src/lib/api/mappers.ts` → `mapAuthMeResponse`) converts this into
 * the camelCase `AuthMeResponse` domain type.
 *
 * Keeping the raw shape colocated with the domain type so the contract
 * between WordPress and the mapper is visible in one place.
 */
export interface WPAuthMeRawResponse {
  token: string
  expires_at: number
  user: {
    id: number
    email: string
    name: string
    display_name: string
    first_name: string | null
    last_name: string | null
    roles: string[]
    avatar_url: string | null
    profession: string | null
    company: string | null
    country: string | null
    country_code?: string | null
    has_shipping_address?: boolean
    membership: {
      tier: ReaderTier
      is_insider: boolean
      status: MembershipStatus
      billing_interval: BillingInterval | null
      valid_until: string | null
      cancel_at_period_end: boolean
      is_placeholder: boolean
    }
    connected_brands: Array<{
      id: number
      slug: string
      name: string
      tier: ManufacturerTier
      status: MembershipStatus
      valid_until: string | null
      cancel_at_period_end: boolean
      publication_quota: number
      publications_used: number
      is_placeholder: boolean
    }>
  }
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
