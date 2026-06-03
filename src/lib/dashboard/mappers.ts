/**
 * Dashboard mappers — batch 1.
 *
 * Translate the snake_case WordPress payloads to the camelCase domain types
 * in `src/types/dashboard.ts` (read direction), and back to the snake_case
 * bodies WP expects (write direction). Only the live batch-1 endpoints are
 * covered: user profile, brand profile, material list rows. Other panels stay
 * on mock until their endpoints ship.
 */

import type {
  UserProfile,
  BrandProfile,
  BrandSocialLinks,
  MaterialListRow,
  MaterialPublicationStatus,
  BookmarkItem,
  BookmarkType,
  Board,
  SavedSearch,
  InsightReport,
  Invoice,
  InvoiceStatus,
  MaterialFormData,
  MaterialCategoryPath,
  MaterialTypeOption,
  MaterialAsset,
  FeaturedPlacement,
  FeaturedSlotStatus,
  BrandCandidate,
  MyRequest,
  RequestKind,
  Interaction,
  InteractionType,
  StatMetric,
  MaterialStatRow,
  BrandStatistics,
  LeadRoute,
  LeadRoutingConfig,
} from '@/types/dashboard'

// ---- Raw WP shapes (only the fields we read) ----

interface RawUserProfile {
  first_name?: string
  last_name?: string
  email?: string
  profession?: string
  company?: string
  country?: string
  avatar_url?: string | null
}

interface RawBrandProfile {
  brand_id: number
  slug: string
  brand_name?: string
  description?: string
  website?: string
  email?: string
  phone?: string
  country?: string
  address?: string
  postcode?: string
  city?: string
  vat_number?: string
  chamber_number?: string
  social?: Partial<BrandSocialLinks>
  logo_url?: string | null
  logo_name?: string | null
  channels?: string[]
  keywords?: string[]
}

interface RawMaterialListRow {
  id: number
  name?: string
  category?: string
  status?: MaterialPublicationStatus
  updated_at?: string
  counts_against_quota?: boolean
}

const EMPTY_SOCIAL: BrandSocialLinks = {
  twitter: '', instagram: '', linkedin: '', youtube: '', pinterest: '', facebook: '',
}

// ---- Read direction (WP → domain) ----

export function mapUserProfile(raw: RawUserProfile): UserProfile {
  return {
    firstName: raw.first_name ?? '',
    lastName: raw.last_name ?? '',
    email: raw.email ?? '',
    profession: raw.profession ?? '',
    company: raw.company ?? '',
    country: raw.country ?? '',
    avatarUrl: raw.avatar_url ?? null,
  }
}

export function mapBrandProfile(raw: RawBrandProfile): BrandProfile {
  return {
    brandId: raw.brand_id,
    slug: raw.slug,
    brandName: raw.brand_name ?? '',
    description: raw.description ?? '',
    website: raw.website ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    country: raw.country ?? '',
    address: raw.address ?? '',
    postcode: raw.postcode ?? '',
    city: raw.city ?? '',
    vatNumber: raw.vat_number ?? '',
    chamberNumber: raw.chamber_number ?? '',
    social: { ...EMPTY_SOCIAL, ...(raw.social ?? {}) },
    logoUrl: raw.logo_url ?? null,
    logoName: raw.logo_name ?? null,
    channels: raw.channels ?? [],
    keywords: raw.keywords ?? [],
  }
}

export function mapMaterialListRow(raw: RawMaterialListRow): MaterialListRow {
  return {
    id: raw.id,
    name: raw.name ?? '',
    category: raw.category ?? '',
    status: raw.status ?? 'draft',
    updatedAt: raw.updated_at ?? '',
    countsAgainstQuota: raw.counts_against_quota ?? false,
  }
}

export function mapMaterialListRows(raw: RawMaterialListRow[]): MaterialListRow[] {
  return Array.isArray(raw) ? raw.map(mapMaterialListRow) : []
}

// ---- Write direction (domain → WP body) ----

export function toWpUserProfile(p: UserProfile): Record<string, unknown> {
  return {
    first_name: p.firstName,
    last_name: p.lastName,
    email: p.email,
    profession: p.profession,
    company: p.company,
    country: p.country,
  }
}

/** POST body for brand profile — omits server-managed `brand_id` / `slug`. */
export function toWpBrandProfile(p: BrandProfile): Record<string, unknown> {
  return {
    brand_name: p.brandName,
    description: p.description,
    website: p.website,
    email: p.email,
    phone: p.phone,
    country: p.country,
    address: p.address,
    postcode: p.postcode,
    city: p.city,
    vat_number: p.vatNumber,
    chamber_number: p.chamberNumber,
    social: p.social,
    channels: p.channels,
    keywords: p.keywords,
  }
}

// ============================================================
// Batch 3 — reader panels + material form
// ============================================================

// ---- Bookmarks ----

interface RawBookmark {
  id: string
  type?: BookmarkType
  title?: string
  label?: string
  href?: string
  image_url?: string | null
  gradient?: string | null
  saved_at?: string
}

export function mapBookmark(raw: RawBookmark): BookmarkItem {
  return {
    id: raw.id,
    type: raw.type ?? 'materials',
    title: raw.title ?? '',
    label: raw.label ?? '',
    href: raw.href ?? '#',
    imageUrl: raw.image_url ?? null,
    gradient: raw.gradient ?? null,
    savedAt: raw.saved_at ?? '',
  }
}

export function mapBookmarks(raw: RawBookmark[]): BookmarkItem[] {
  return Array.isArray(raw) ? raw.map(mapBookmark) : []
}

// ---- Boards ----

interface RawBoard {
  id: string
  name?: string
  created_at?: string
  material_count?: number
  article_count?: number
  cover_gradient?: string
}

export function mapBoard(raw: RawBoard): Board {
  return {
    id: raw.id,
    name: raw.name ?? '',
    createdAt: raw.created_at ?? '',
    materialCount: raw.material_count ?? 0,
    articleCount: raw.article_count ?? 0,
    coverGradient: raw.cover_gradient ?? 'linear-gradient(135deg,#d7e8b6,#eef6ff)',
  }
}

export function mapBoards(raw: RawBoard[]): Board[] {
  return Array.isArray(raw) ? raw.map(mapBoard) : []
}

// ---- Saved searches ----

interface RawSavedSearch {
  id: string
  name?: string
  summary?: string
  query?: string
  result_count?: number
  alerts_enabled?: boolean
  created_at?: string
}

export function mapSavedSearch(raw: RawSavedSearch): SavedSearch {
  return {
    id: raw.id,
    name: raw.name ?? '',
    summary: raw.summary ?? '',
    query: raw.query ?? '',
    resultCount: raw.result_count ?? 0,
    alertsEnabled: raw.alerts_enabled ?? false,
    createdAt: raw.created_at ?? '',
  }
}

export function mapSavedSearches(raw: RawSavedSearch[]): SavedSearch[] {
  return Array.isArray(raw) ? raw.map(mapSavedSearch) : []
}

// ---- Insider insights ----

interface RawInsight {
  id: string
  title?: string
  summary?: string
  date?: string
  category?: string
  href?: string
}

export function mapInsight(raw: RawInsight): InsightReport {
  return {
    id: raw.id,
    title: raw.title ?? '',
    summary: raw.summary ?? '',
    date: raw.date ?? '',
    category: raw.category ?? 'Article',
    href: raw.href ?? '#',
  }
}

export function mapInsights(raw: RawInsight[]): InsightReport[] {
  return Array.isArray(raw) ? raw.map(mapInsight) : []
}

// ---- Invoices ----

interface RawInvoice {
  id: string
  date?: string
  description?: string
  amount?: number
  currency?: string
  status?: InvoiceStatus
  pdf_url?: string | null
}

export function mapInvoice(raw: RawInvoice): Invoice {
  return {
    id: raw.id,
    date: raw.date ?? '',
    description: raw.description ?? '',
    amount: raw.amount ?? 0,
    currency: raw.currency ?? 'EUR',
    status: raw.status ?? 'open',
    pdfUrl: raw.pdf_url ?? null,
  }
}

export function mapInvoices(raw: RawInvoice[]): Invoice[] {
  return Array.isArray(raw) ? raw.map(mapInvoice) : []
}

// ---- Material form ----

interface RawMaterialAsset {
  id: string | number
  name?: string
  url?: string | null
}

interface RawMaterialCategory {
  id: string | number
  l1?: string
  l2?: string
  l3?: string
}

interface RawMaterialFormData {
  mode?: 'create' | 'edit'
  id?: number | null
  name?: string
  description?: string
  type?: string
  featured_image?: RawMaterialAsset | null
  categories?: RawMaterialCategory[]
  channels?: string[]
  gallery?: RawMaterialAsset[]
  videos?: string[]
  downloads?: RawMaterialAsset[]
  keywords?: string[]
}

function mapAsset(raw: RawMaterialAsset): MaterialAsset {
  return { id: String(raw.id), name: raw.name ?? '', url: raw.url ?? null }
}

function mapCategory(raw: RawMaterialCategory): MaterialCategoryPath {
  return { id: String(raw.id), l1: raw.l1 ?? '', l2: raw.l2 ?? '', l3: raw.l3 ?? '' }
}

/** Full assignable-category catalogue from the material-categories endpoint. */
export function mapMaterialCategoryOptions(raw: RawMaterialCategory[]): MaterialCategoryPath[] {
  return Array.isArray(raw) ? raw.map(mapCategory) : []
}

interface RawMaterialType {
  id: string | number
  name?: string
}

/** Full material-type catalogue from the material-types endpoint. */
export function mapMaterialTypeOptions(raw: RawMaterialType[]): MaterialTypeOption[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    id: String(item.id),
    name: item.name ?? '',
  }))
}

export function mapMaterialFormData(raw: RawMaterialFormData): MaterialFormData {
  return {
    mode: raw.mode ?? 'edit',
    id: raw.id ?? null,
    name: raw.name ?? '',
    description: raw.description ?? '',
    type: raw.type ?? '',
    featuredImage: raw.featured_image ? mapAsset(raw.featured_image) : null,
    categories: (raw.categories ?? []).map(mapCategory),
    channels: raw.channels ?? [],
    gallery: (raw.gallery ?? []).map(mapAsset),
    videos: raw.videos ?? [],
    downloads: (raw.downloads ?? []).map(mapAsset),
    keywords: raw.keywords ?? [],
  }
}

// ---- Write direction (domain → WP body) ----

export function toWpBoard(name: string): Record<string, unknown> {
  return { name }
}

export function toWpSavedSearch(
  p: { name?: string; query?: string; alertsEnabled?: boolean },
): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (p.name !== undefined) body.name = p.name
  if (p.query !== undefined) body.query = p.query
  if (p.alertsEnabled !== undefined) body.alerts_enabled = p.alertsEnabled
  return body
}

/**
 * Material form → WP create/save body. Assets are sent as numeric attachment
 * ids (uploaded separately via /wp/v2/media). Only categories that already
 * have a real term id are forwarded — newly-picked paths without a term id are
 * dropped (a real taxonomy picker is a follow-up).
 */
export function toWpMaterialForm(form: MaterialFormData): Record<string, unknown> {
  const numId = (v: string): number | null => {
    const n = Number(v)
    return Number.isFinite(n) && v.trim() !== '' && !v.startsWith('local-') ? n : null
  }
  return {
    name: form.name,
    description: form.description,
    type_id: numId(form.type),
    featured_image_id: form.featuredImage ? numId(form.featuredImage.id) : null,
    gallery_attachment_ids: form.gallery.map((a) => numId(a.id)).filter((n): n is number => n !== null),
    download_attachment_ids: form.downloads.map((a) => numId(a.id)).filter((n): n is number => n !== null),
    videos: form.videos,
    keywords: form.keywords,
    categories: form.categories
      .map((c) => numId(c.id))
      .filter((n): n is number => n !== null)
      .map((id) => ({ id })),
    channels: form.channels,
  }
}

// ============================================================
// Batch 4 — featured placements + brand candidates
// ============================================================

interface RawFeaturedPlacement {
  id: string
  slot?: string
  status?: FeaturedSlotStatus
  starts_at?: string | null
  ends_at?: string | null
  subject?: string | null
}

export function mapFeaturedPlacement(raw: RawFeaturedPlacement): FeaturedPlacement {
  return {
    id: raw.id,
    slot: raw.slot ?? '',
    status: raw.status ?? 'available',
    startsAt: raw.starts_at ?? null,
    endsAt: raw.ends_at ?? null,
    subject: raw.subject ?? null,
  }
}

export function mapFeaturedPlacements(raw: RawFeaturedPlacement[]): FeaturedPlacement[] {
  return Array.isArray(raw) ? raw.map(mapFeaturedPlacement) : []
}

interface RawBrandCandidate {
  id: number
  name?: string
  domain?: string
  website?: string
  email?: string
  logo_label?: string
}

export function mapBrandCandidate(raw: RawBrandCandidate): BrandCandidate {
  return {
    id: raw.id,
    name: raw.name ?? '',
    domain: raw.domain ?? '',
    website: raw.website ?? '',
    email: raw.email ?? '',
    logoLabel: raw.logo_label ?? '',
  }
}

export function mapBrandCandidates(raw: RawBrandCandidate[]): BrandCandidate[] {
  return Array.isArray(raw) ? raw.map(mapBrandCandidate) : []
}

// ============================================================
// Batch 2 — requests / interactions / statistics / lead routing
// NOTE: field names inferred from the contract types (Johan's convention is
// pure snake_case, as batch 1 confirmed). Verify against the live responses;
// any mismatch is a one-line fix here.
// ============================================================

interface RawMyRequest {
  id: string
  kind?: RequestKind
  subject?: string
  brand_name?: string
  date?: string
  status?: string
  message?: string
}

export function mapMyRequest(raw: RawMyRequest): MyRequest {
  return {
    id: raw.id,
    kind: raw.kind ?? 'info',
    subject: raw.subject ?? '',
    brandName: raw.brand_name ?? '',
    date: raw.date ?? '',
    status: raw.status ?? '',
    message: raw.message ?? '',
  }
}

export function mapMyRequests(raw: RawMyRequest[]): MyRequest[] {
  return Array.isArray(raw) ? raw.map(mapMyRequest) : []
}

interface RawInteraction {
  id: number
  type?: InteractionType
  page?: string
  person?: string
  role?: string
  industry?: string
  company?: string
  email?: string
  phone?: string
  address?: string
  postcode?: string
  city?: string
  country?: string
  date?: string
  time_ago?: string
  status?: string
  message?: string
  request_options?: string[]
}

export function mapInteraction(raw: RawInteraction): Interaction {
  return {
    id: raw.id,
    type: raw.type ?? 'info',
    page: raw.page ?? '',
    person: raw.person ?? '',
    role: raw.role ?? '',
    industry: raw.industry ?? '',
    company: raw.company ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    address: raw.address ?? '',
    postcode: raw.postcode ?? '',
    city: raw.city ?? '',
    country: raw.country ?? '',
    date: raw.date ?? '',
    timeAgo: raw.time_ago ?? '',
    status: raw.status ?? '',
    message: raw.message ?? '',
    requestOptions: raw.request_options ?? [],
  }
}

export function mapInteractions(raw: RawInteraction[]): Interaction[] {
  return Array.isArray(raw) ? raw.map(mapInteraction) : []
}

interface RawStatMetric {
  label?: string
  value?: number
  note?: string | null
}

interface RawMaterialStatRow {
  material_id: number
  name?: string
  views?: number
  requests?: number
  downloads?: number
}

interface RawBrandStatistics {
  metrics?: RawStatMetric[]
  materials?: RawMaterialStatRow[]
}

function mapStatMetric(raw: RawStatMetric): StatMetric {
  return { label: raw.label ?? '', value: raw.value ?? 0, note: raw.note ?? null }
}

function mapMaterialStatRow(raw: RawMaterialStatRow): MaterialStatRow {
  return {
    materialId: raw.material_id,
    name: raw.name ?? '',
    views: raw.views ?? 0,
    requests: raw.requests ?? 0,
    downloads: raw.downloads ?? 0,
  }
}

export function mapBrandStatistics(raw: RawBrandStatistics): BrandStatistics {
  return {
    metrics: (raw.metrics ?? []).map(mapStatMetric),
    materials: (raw.materials ?? []).map(mapMaterialStatRow),
  }
}

interface RawLeadRoute {
  id: number
  country?: string
  name?: string
  email?: string
}

interface RawLeadRoutingConfig {
  default_name?: string
  default_email?: string
  routes?: RawLeadRoute[]
}

function mapLeadRoute(raw: RawLeadRoute): LeadRoute {
  return { id: raw.id, country: raw.country ?? '', name: raw.name ?? '', email: raw.email ?? '' }
}

export function mapLeadRoutingConfig(raw: RawLeadRoutingConfig): LeadRoutingConfig {
  return {
    defaultName: raw.default_name ?? '',
    defaultEmail: raw.default_email ?? '',
    routes: (raw.routes ?? []).map(mapLeadRoute),
  }
}

/** POST body — WP reassigns route ids, so client temp ids are dropped. */
export function toWpLeadRouting(c: LeadRoutingConfig): Record<string, unknown> {
  return {
    default_name: c.defaultName,
    default_email: c.defaultEmail,
    routes: c.routes.map((r) => ({ country: r.country, name: r.name, email: r.email })),
  }
}
