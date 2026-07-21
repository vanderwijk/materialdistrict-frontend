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
  ProfileFieldOption,
  ProfileFieldOptions,
  BrandProfile,
  BrandSocialLinks,
  MaterialListRow,
  MaterialPublicationStatus,
  BookmarkItem,
  BookmarkType,
  Board,
  BoardDetail,
  BoardItem,
  SavedSearch,
  InsightReport,
  Invoice,
  InvoiceKind,
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
  BrochureStatRow,
  MaterialBrochureStatRow,
  BrandBrochureStatistics,
  BrandStatistics,
  LeadRoute,
  LeadRoutingConfig,
} from '@/types/dashboard'
import { bookmarkItemLabel } from '@/lib/dashboard/bookmark-labels'
import type { MaterialProperties } from '@/types/material'
import { EMPTY_MATERIAL_PROPERTIES } from '@/lib/utils/material-properties'

// ---- Raw WP shapes (only the fields we read) ----

interface RawUserProfile {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  profession?: string
  industry?: string
  address?: string
  address_2?: string
  postcode?: string
  city?: string
  country?: string
  invoice_to_company?: boolean
  company?: string
  vat_number?: string
  avatar_url?: string | null
}

interface RawProfileFieldOption {
  value?: string
  label?: string
}

interface RawProfileFieldOptions {
  professions?: RawProfileFieldOption[]
  industries?: RawProfileFieldOption[]
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
  address_line_1?: string
  address_line_2?: string
  postcode?: string
  city?: string
  vat_number?: string
  chamber_number?: string
  social?: Partial<BrandSocialLinks>
  logo_url?: string | null
  logo_name?: string | null
  channels?: string[]
  keywords?: string[]
  applications?: RawMaterialCategory[]
  videos?: string[]
  gallery?: RawMaterialAsset[]
  downloads?: RawMaterialAsset[]
}

interface RawMaterialListRow {
  id: number
  name?: string
  category?: string
  status?: MaterialPublicationStatus
  updated_at?: string
  counts_against_quota?: boolean
  featured_state?: 'active' | 'scheduled' | null
  featured_week_start?: string | null
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
    phone: raw.phone ?? '',
    profession: raw.profession ?? '',
    industry: raw.industry ?? '',
    address: raw.address ?? '',
    address2: raw.address_2 ?? '',
    postcode: raw.postcode ?? '',
    city: raw.city ?? '',
    country: raw.country ?? '',
    invoiceToCompany: raw.invoice_to_company ?? false,
    company: raw.company ?? '',
    vatNumber: raw.vat_number ?? '',
    avatarUrl: raw.avatar_url ?? null,
  }
}

function mapProfileFieldOption(raw: RawProfileFieldOption): ProfileFieldOption {
  return { value: raw.value ?? '', label: raw.label ?? raw.value ?? '' }
}

/** Profile dropdown option lists. Missing/empty → form falls back to free text. */
export function mapProfileFieldOptions(raw: RawProfileFieldOptions): ProfileFieldOptions {
  return {
    professions: Array.isArray(raw?.professions) ? raw.professions.map(mapProfileFieldOption) : [],
    industries: Array.isArray(raw?.industries) ? raw.industries.map(mapProfileFieldOption) : [],
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
    addressLine1: raw.address_line_1 ?? '',
    addressLine2: raw.address_line_2 ?? '',
    postcode: raw.postcode ?? '',
    city: raw.city ?? '',
    vatNumber: raw.vat_number ?? '',
    chamberNumber: raw.chamber_number ?? '',
    social: { ...EMPTY_SOCIAL, ...(raw.social ?? {}) },
    logoUrl: raw.logo_url ?? null,
    logoName: raw.logo_name ?? null,
    channels: raw.channels ?? [],
    keywords: raw.keywords ?? [],
    applications: (raw.applications ?? []).map(mapCategory),
    videos: raw.videos ?? [],
    gallery: (raw.gallery ?? []).map(mapAsset),
    downloads: (raw.downloads ?? []).map(mapAsset),
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
    featuredState: raw.featured_state ?? null,
    featuredWeekStart: raw.featured_week_start ?? null,
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
    phone: p.phone,
    profession: p.profession,
    industry: p.industry,
    address: p.address,
    address_2: p.address2,
    postcode: p.postcode,
    city: p.city,
    country: p.country,
    invoice_to_company: p.invoiceToCompany,
    company: p.company,
    vat_number: p.vatNumber,
  }
}

/**
 * Parse a stringified asset/term id to a real numeric WP id, or null for
 * not-yet-persisted local ids (empty, `local-…`, or the `app:` path ids the
 * application picker assigns before a real term id exists).
 */
function wpNumericId(v: string): number | null {
  const n = Number(v)
  return Number.isFinite(n) && v.trim() !== '' && !v.startsWith('local-') && !v.startsWith('app:')
    ? n
    : null
}

/** Ordered numeric attachment ids for a gallery (drops not-yet-persisted ids). */
function galleryToWp(assets: MaterialAsset[]): number[] {
  return assets.map((a) => wpNumericId(a.id)).filter((n): n is number => n !== null)
}

/** Downloads → `[{ id, title }]`, preserving the document title; drops local ids. */
function downloadsToWp(assets: MaterialAsset[]): Array<{ id: number; title: string }> {
  return assets
    .map((a) => {
      const id = wpNumericId(a.id)
      return id === null ? null : { id, title: a.title ?? '' }
    })
    .filter((d): d is { id: number; title: string } => d !== null)
}

/** Application paths → term-id objects (only paths that already carry a real term id). */
function applicationsToWp(paths: MaterialCategoryPath[]): Array<{ id: number }> {
  return paths
    .map((c) => wpNumericId(c.id))
    .filter((n): n is number => n !== null)
    .map((id) => ({ id }))
}

/** POST body for brand profile — omits server-managed `brand_id` / `slug`. */
export function toWpBrandProfile(p: BrandProfile): Record<string, unknown> {
  const body: Record<string, unknown> = {
    brand_name: p.brandName,
    description: p.description,
    website: p.website,
    email: p.email,
    phone: p.phone,
    country: p.country,
    address_line_1: p.addressLine1,
    address_line_2: p.addressLine2,
    postcode: p.postcode,
    city: p.city,
    vat_number: p.vatNumber,
    chamber_number: p.chamberNumber,
    social: p.social,
    channels: p.channels,
    keywords: p.keywords,
    applications: applicationsToWp(p.applications),
    videos: p.videos,
    gallery_attachment_ids: galleryToWp(p.gallery),
    downloads: downloadsToWp(p.downloads),
  }

  const logoId = p.logoId ? wpNumericId(p.logoId) : null
  if (logoId !== null) {
    body.logo_attachment_id = logoId
  }

  return body
}

// ============================================================
// Batch 3 — reader panels + material form
// ============================================================

// ---- Bookmarks ----

interface RawBookmark {
  id: string
  type?: BookmarkType
  item_id?: number
  title?: string
  label?: string
  href?: string
  image_url?: string | null
  gradient?: string | null
  saved_at?: string
}

/** Legacy CMS hrefs used plural segments; Next.js routes are singular. */
export function normalizeDashboardContentHref(href: string): string {
  if (!href || href === '#') return href

  let path = href
  try {
    if (/^https?:\/\//i.test(href)) {
      const url = new URL(href)
      path = `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    // Keep original href when URL parsing fails.
  }

  return path
    .replace(/^\/materials\//, '/material/')
    .replace(/^\/articles\//, '/article/')
    .replace(/^\/brands\//, '/brand/')
    .replace(/^\/talks\//, '/talk/')
    .replace(/^\/events\//, '/event/')
    .replace(/^\/books\//, '/book/')
}

export function mapBookmark(raw: RawBookmark): BookmarkItem {
  const type = raw.type ?? 'materials'
  return {
    id: raw.id,
    type,
    itemId: typeof raw.item_id === 'number' ? raw.item_id : 0,
    title: raw.title ?? '',
    label: bookmarkItemLabel(type, raw.label),
    href: normalizeDashboardContentHref(raw.href ?? '#'),
    imageUrl: raw.image_url ?? null,
    gradient: raw.gradient ?? null,
    savedAt: raw.saved_at ?? '',
  }
}

export function mapBookmarks(raw: RawBookmark[]): BookmarkItem[] {
  return Array.isArray(raw) ? raw.map(mapBookmark) : []
}

/** Write-mapper for creating a bookmark (POST). camelCase → snake_case. */
export function toWpBookmark(input: { type: BookmarkType; itemId: number }): {
  type: BookmarkType
  item_id: number
} {
  return { type: input.type, item_id: input.itemId }
}

// ---- Boards ----

interface RawBoard {
  id: string
  name?: string
  created_at?: string
  material_count?: number
  article_count?: number
  book_count?: number
  event_count?: number
  talk_count?: number
  brand_count?: number
  cover_gradient?: string
}

export function mapBoard(raw: RawBoard): Board {
  return {
    id: raw.id,
    name: raw.name ?? '',
    createdAt: raw.created_at ?? '',
    materialCount: raw.material_count ?? 0,
    articleCount: raw.article_count ?? 0,
    bookCount: raw.book_count ?? 0,
    eventCount: raw.event_count ?? 0,
    talkCount: raw.talk_count ?? 0,
    brandCount: raw.brand_count ?? 0,
    coverGradient: raw.cover_gradient ?? 'linear-gradient(135deg,#d7e8b6,#eef6ff)',
  }
}

export function mapBoards(raw: RawBoard[]): Board[] {
  return Array.isArray(raw) ? raw.map(mapBoard) : []
}

// ---- Board detail (board + its items) ----

interface RawBoardItem {
  type?: BookmarkType
  item_id?: number
  title?: string
  label?: string
  href?: string
  image_url?: string | null
  gradient?: string | null
  saved_at?: string
}

interface RawBoardDetail extends RawBoard {
  items?: RawBoardItem[]
}

export function mapBoardItem(raw: RawBoardItem): BoardItem {
  const type = raw.type ?? 'materials'
  return {
    type,
    itemId: typeof raw.item_id === 'number' ? raw.item_id : 0,
    title: raw.title ?? '',
    label: bookmarkItemLabel(type, raw.label),
    href: normalizeDashboardContentHref(raw.href ?? '#'),
    imageUrl: raw.image_url ?? null,
    gradient: raw.gradient ?? null,
    savedAt: raw.saved_at ?? '',
  }
}

export function mapBoardDetail(raw: RawBoardDetail): BoardDetail {
  return {
    ...mapBoard(raw),
    items: Array.isArray(raw.items) ? raw.items.map(mapBoardItem) : [],
  }
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
  description?: string
  date?: string
  pages?: number
  format?: string
  thumbnail_url?: string | null
  gradient?: string
  /** Own checkbox on the insider-report CPT (not the article meta). */
  insider_only?: boolean
  has_pdf?: boolean
  href?: string
}

export function mapInsight(raw: RawInsight): InsightReport {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    date: raw.date ?? '',
    pages: typeof raw.pages === 'number' ? raw.pages : 0,
    format: raw.format ?? 'PDF',
    thumbnailUrl: raw.thumbnail_url ?? null,
    gradient: raw.gradient ?? 'linear-gradient(135deg,#d7e8b6,#eef6ff)',
    insiderOnly: raw.insider_only ?? false,
    hasPdf: raw.has_pdf ?? false,
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
  kind?: InvoiceKind
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
    kind: raw.kind ?? 'membership',
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
  title?: string
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
  indoor_outdoor?: Array<'indoor' | 'outdoor'>
  featured_image?: RawMaterialAsset | null
  applications?: RawMaterialCategory[]
  channels?: string[]
  gallery?: RawMaterialAsset[]
  videos?: string[]
  downloads?: RawMaterialAsset[]
  keywords?: string[]
  properties?: Partial<MaterialProperties>
}

function mapAsset(raw: RawMaterialAsset): MaterialAsset {
  const asset: MaterialAsset = { id: String(raw.id), name: raw.name ?? '', url: raw.url ?? null }
  if (raw.title !== undefined) asset.title = raw.title
  return asset
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
    indoorOutdoor: Array.isArray(raw.indoor_outdoor) ? raw.indoor_outdoor : [],
    featuredImage: raw.featured_image ? mapAsset(raw.featured_image) : null,
    applications: (raw.applications ?? []).map(mapCategory),
    channels: raw.channels ?? [],
    gallery: (raw.gallery ?? []).map(mapAsset),
    videos: raw.videos ?? [],
    downloads: (raw.downloads ?? []).map(mapAsset),
    keywords: raw.keywords ?? [],
    properties: { ...EMPTY_MATERIAL_PROPERTIES, ...(raw.properties ?? {}) },
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
 * ids (uploaded separately via `/api/dashboard/media` →
 * `/md/v2/dashboard/brands/{brandId}/media`); downloads carry their title.
 * Only applications that already have a real term id are forwarded — paths the
 * picker assigned a local `app:` id are dropped until WP maps them to terms.
 */
export function toWpMaterialForm(form: MaterialFormData): Record<string, unknown> {
  return {
    name: form.name,
    description: form.description,
    type_id: wpNumericId(form.type),
    indoor_outdoor: form.indoorOutdoor,
    featured_image_id: form.featuredImage ? wpNumericId(form.featuredImage.id) : null,
    gallery_attachment_ids: galleryToWp(form.gallery),
    downloads: downloadsToWp(form.downloads),
    videos: form.videos,
    keywords: form.keywords,
    applications: applicationsToWp(form.applications),
    channels: form.channels,
    properties: form.properties,
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
}

interface RawBrochureStatRow {
  attachment_id?: number
  title?: string
  downloads?: number
}

interface RawMaterialBrochureStatRow extends RawBrochureStatRow {
  material_id?: number
  material_name?: string
}

interface RawBrandBrochureStatistics {
  brand?: RawBrochureStatRow[]
  material?: RawMaterialBrochureStatRow[]
}

interface RawBrandStatistics {
  metrics?: RawStatMetric[]
  materials?: RawMaterialStatRow[]
  brochures?: RawBrandBrochureStatistics | RawBrochureStatRow[]
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
  }
}

function mapBrochureStatRow(raw: RawBrochureStatRow): BrochureStatRow {
  return {
    attachmentId: raw.attachment_id ?? 0,
    title: raw.title ?? '',
    downloads: raw.downloads ?? 0,
  }
}

function mapMaterialBrochureStatRow(raw: RawMaterialBrochureStatRow): MaterialBrochureStatRow {
  return {
    ...mapBrochureStatRow(raw),
    materialId: raw.material_id ?? 0,
    materialName: raw.material_name ?? '',
  }
}

function mapBrandBrochureStatistics(
  raw: RawBrandBrochureStatistics | RawBrochureStatRow[] | undefined,
): BrandBrochureStatistics {
  if (Array.isArray(raw)) {
    return { brand: raw.map(mapBrochureStatRow), material: [] }
  }

  return {
    brand: (raw?.brand ?? []).map(mapBrochureStatRow),
    material: (raw?.material ?? []).map(mapMaterialBrochureStatRow),
  }
}

export function mapBrandStatistics(raw: RawBrandStatistics): BrandStatistics {
  return {
    metrics: (raw.metrics ?? []).map(mapStatMetric),
    materials: (raw.materials ?? []).map(mapMaterialStatRow),
    brochures: mapBrandBrochureStatistics(raw.brochures),
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
  restrict_to_listed_countries?: boolean
  sample_requests_insiders_only?: boolean
  downloads_insiders_only?: boolean
}

function mapLeadRoute(raw: RawLeadRoute): LeadRoute {
  return { id: raw.id, country: raw.country ?? '', name: raw.name ?? '', email: raw.email ?? '' }
}

export function mapLeadRoutingConfig(raw: RawLeadRoutingConfig): LeadRoutingConfig {
  return {
    defaultName: raw.default_name ?? '',
    defaultEmail: raw.default_email ?? '',
    routes: (raw.routes ?? []).map(mapLeadRoute),
    restrictToListedCountries: raw.restrict_to_listed_countries ?? false,
    sampleRequestsInsidersOnly: raw.sample_requests_insiders_only ?? false,
    downloadsInsidersOnly: raw.downloads_insiders_only ?? false,
  }
}

/** POST body — WP reassigns route ids, so client temp ids are dropped. */
export function toWpLeadRouting(c: LeadRoutingConfig): Record<string, unknown> {
  return {
    default_name: c.defaultName,
    default_email: c.defaultEmail,
    routes: c.routes.map((r) => ({ country: r.country, name: r.name, email: r.email })),
    restrict_to_listed_countries: c.restrictToListedCountries,
    sample_requests_insiders_only: c.sampleRequestsInsidersOnly,
    downloads_insiders_only: c.downloadsInsidersOnly,
  }
}
