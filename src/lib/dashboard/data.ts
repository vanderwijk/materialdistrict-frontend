/**
 * Dashboard data layer.
 *
 * The single seam between the dashboard UI and its data source. Today every
 * function returns a typed fixture from `mock.ts`; when Johan ships the
 * endpoints listed in `dashboard-datacontract.md`, only this file changes —
 * each function swaps its `return MOCK_*` for a `wpFetch(...)` + mapper call.
 * Components and pages never import `mock.ts` directly.
 *
 * All functions are async so the call sites are already written against the
 * real (network) shape. Server Components await them directly.
 */

import type {
  UserProfile,
  BookmarkItem,
  Board,
  SavedSearch,
  InsightReport,
  MyRequest,
  Invoice,
  BrandProfile,
  MaterialListRow,
  MaterialFormData,
  Interaction,
  BrandStatistics,
  LeadRoutingConfig,
  FeaturedPlacement,
  BrandCandidate,
} from '@/types/dashboard'
import {
  MOCK_PROFILE,
  MOCK_BOOKMARKS,
  MOCK_BOARDS,
  MOCK_SAVED_SEARCHES,
  MOCK_INSIGHTS,
  MOCK_MY_REQUESTS,
  MOCK_USER_INVOICES,
  MOCK_BRAND_PROFILES,
  MOCK_BRAND_MATERIALS,
  MOCK_MATERIAL_FORM,
  MOCK_INTERACTIONS,
  MOCK_BRAND_STATS,
  MOCK_LEAD_ROUTING,
  MOCK_FEATURED,
  MOCK_BRAND_INVOICES,
  MOCK_BRAND_CANDIDATES,
} from './mock'

// ------------------------------------------------------------
// Personal account
// ------------------------------------------------------------

/** GET /md/v2/dashboard/profile */
export async function getProfile(): Promise<UserProfile> {
  return MOCK_PROFILE
}

/** GET /md/v2/dashboard/bookmarks */
export async function getBookmarks(): Promise<BookmarkItem[]> {
  return MOCK_BOOKMARKS
}

/** GET /md/v2/dashboard/boards (Insider) */
export async function getBoards(): Promise<Board[]> {
  return MOCK_BOARDS
}

/** GET /md/v2/dashboard/saved-searches (Insider) */
export async function getSavedSearches(): Promise<SavedSearch[]> {
  return MOCK_SAVED_SEARCHES
}

/** GET /md/v2/dashboard/insider-insights (Insider) */
export async function getInsiderInsights(): Promise<InsightReport[]> {
  return MOCK_INSIGHTS
}

/** GET /md/v2/dashboard/requests */
export async function getMyRequests(): Promise<MyRequest[]> {
  return MOCK_MY_REQUESTS
}

/** GET /md/v2/dashboard/invoices?scope=user */
export async function getUserInvoices(): Promise<Invoice[]> {
  return MOCK_USER_INVOICES
}

// ------------------------------------------------------------
// Brand scope — all keyed by slug
// ------------------------------------------------------------

/**
 * GET /md/v2/dashboard/brands/{brandId}/profile
 * Returns `null` when the slug is unknown → the page calls `notFound()`.
 * NOTE: authorization (does this user manage this brand?) is enforced at the
 * page level via `findBrandMembership(user, { slug })`, not here.
 */
export async function getBrandProfile(slug: string): Promise<BrandProfile | null> {
  return MOCK_BRAND_PROFILES[slug] ?? null
}

/** GET /md/v2/dashboard/brands/{brandId}/materials */
export async function getBrandMaterials(slug: string): Promise<MaterialListRow[]> {
  return MOCK_BRAND_MATERIALS[slug] ?? []
}

/** GET /md/v2/dashboard/brands/{brandId}/materials/{id} (or blank for create) */
export async function getMaterialForm(
  slug: string,
  materialId: number | null,
): Promise<MaterialFormData> {
  if (materialId === null) {
    return {
      mode: 'create',
      id: null,
      name: '',
      description: '',
      type: '',
      featuredImage: null,
      categories: [],
      channels: [],
      gallery: [],
      videos: [],
      downloads: [],
      keywords: [],
    }
  }
  // Mock: a single editable material regardless of id.
  return { ...MOCK_MATERIAL_FORM, id: materialId }
}

/** GET /md/v2/dashboard/brands/{brandId}/interactions */
export async function getInteractions(slug: string): Promise<Interaction[]> {
  return MOCK_INTERACTIONS[slug] ?? []
}

/** GET /md/v2/dashboard/brands/{brandId}/statistics */
export async function getBrandStatistics(slug: string): Promise<BrandStatistics> {
  return MOCK_BRAND_STATS[slug] ?? { metrics: [], materials: [] }
}

/** GET /md/v2/dashboard/brands/{brandId}/lead-routing */
export async function getLeadRouting(slug: string): Promise<LeadRoutingConfig> {
  return MOCK_LEAD_ROUTING[slug] ?? { defaultName: '', defaultEmail: '', routes: [] }
}

/** GET /md/v2/dashboard/brands/{brandId}/featured */
export async function getFeaturedPlacements(slug: string): Promise<FeaturedPlacement[]> {
  return MOCK_FEATURED[slug] ?? []
}

/** GET /md/v2/dashboard/brands/{brandId}/invoices */
export async function getBrandInvoices(slug: string): Promise<Invoice[]> {
  return MOCK_BRAND_INVOICES[slug] ?? []
}

/** GET /md/v2/dashboard/brand-candidates?q=... */
export async function getBrandCandidates(query: string): Promise<BrandCandidate[]> {
  if (!query.trim()) return MOCK_BRAND_CANDIDATES
  const q = query.toLowerCase()
  return MOCK_BRAND_CANDIDATES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q),
  )
}
