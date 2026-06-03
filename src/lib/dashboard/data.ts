/**
 * Dashboard data layer.
 *
 * The single seam between the dashboard UI and its data source. Each function
 * either calls WordPress (batch 1 — live) or still returns a typed fixture
 * from `mock.ts` (batch 2 — pending endpoints). Components and pages never
 * import `mock.ts` directly; flipping a panel to live is a change here only.
 *
 * Batch 1 live (real WP): getProfile, getBrandProfile, getBrandMaterials.
 * Everything else is still mock until its endpoint ships.
 *
 * Reads run server-side with the JWT from the HttpOnly cookie (same auth path
 * as the rest of the app). All functions are async so call sites are already
 * written against the network shape.
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
  MaterialCategoryPath,
  MaterialTypeOption,
  Interaction,
  BrandStatistics,
  LeadRoutingConfig,
  FeaturedPlacement,
  BrandCandidate,
} from '@/types/dashboard'
import { getAuthCookie } from '@/lib/auth/cookies'
import { getInitialUser } from '@/lib/auth/get-current-user'
import { findBrandMembership } from '@/lib/auth/user-helpers'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import {
  mapUserProfile,
  mapBrandProfile,
  mapMaterialListRows,
  mapBookmarks,
  mapBoards,
  mapSavedSearches,
  mapInsights,
  mapInvoices,
  mapMaterialFormData,
  mapFeaturedPlacements,
  mapBrandCandidates,
  mapMyRequests,
  mapInteractions,
  mapBrandStatistics,
  mapLeadRoutingConfig,
  mapMaterialCategoryOptions,
  mapMaterialTypeOptions,
} from './mappers'
import { MOCK_MATERIAL_FORM } from './mock'

/**
 * Resolve a brand slug to its numeric WP id via the current user's brands.
 * Returns null when the user does not manage a brand with that slug — callers
 * map that to `notFound()` (the page-level `requireManagedBrand` does too).
 */
async function resolveBrandId(slug: string): Promise<number | null> {
  const user = await getInitialUser()
  if (!user) return null
  const brand = findBrandMembership(user, { slug })
  return brand ? brand.id : null
}

/** Read the JWT from the cookie or throw a clean 401 (caller is gated). */
async function requireToken(): Promise<string> {
  const token = await getAuthCookie()
  if (!token) throw new DashboardApiError('md_auth_unauthenticated', 'Not signed in', 401)
  return token
}

// ------------------------------------------------------------
// Personal account
// ------------------------------------------------------------

/** GET /md/v2/dashboard/profile (batch 1 — live) */
export async function getProfile(): Promise<UserProfile> {
  const token = await getAuthCookie()
  if (!token) throw new DashboardApiError('md_auth_unauthenticated', 'Not signed in', 401)
  const raw = await wpDashboardFetch<Parameters<typeof mapUserProfile>[0]>(
    '/md/v2/dashboard/profile',
    { method: 'GET', bearer: token },
  )
  return mapUserProfile(raw)
}

/** GET /md/v2/dashboard/bookmarks (batch 3 — live) */
export async function getBookmarks(): Promise<BookmarkItem[]> {
  const raw = await wpDashboardFetch<Parameters<typeof mapBookmarks>[0]>(
    '/md/v2/dashboard/bookmarks',
    { method: 'GET', bearer: await requireToken() },
  )
  return mapBookmarks(raw)
}

/** GET /md/v2/dashboard/boards (batch 3 — live, Insider) */
export async function getBoards(): Promise<Board[]> {
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBoards>[0]>(
      '/md/v2/dashboard/boards',
      { method: 'GET', bearer: await requireToken() },
    )
    return mapBoards(raw)
  } catch (err) {
    if (err instanceof DashboardApiError && err.status === 403) return []
    throw err
  }
}

/** GET /md/v2/dashboard/saved-searches (batch 3 — live, Insider) */
export async function getSavedSearches(): Promise<SavedSearch[]> {
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapSavedSearches>[0]>(
      '/md/v2/dashboard/saved-searches',
      { method: 'GET', bearer: await requireToken() },
    )
    return mapSavedSearches(raw)
  } catch (err) {
    if (err instanceof DashboardApiError && err.status === 403) return []
    throw err
  }
}

/** GET /md/v2/dashboard/insider-insights (batch 3 — live, Insider) */
export async function getInsiderInsights(): Promise<InsightReport[]> {
  // The insights page fetches unconditionally and renders a locked state for
  // non-Insiders, so swallow the insider-required 403 and return [].
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapInsights>[0]>(
      '/md/v2/dashboard/insider-insights',
      { method: 'GET', bearer: await requireToken() },
    )
    return mapInsights(raw)
  } catch (err) {
    if (err instanceof DashboardApiError && err.status === 403) return []
    throw err
  }
}

/** GET /md/v2/dashboard/requests */
export async function getMyRequests(): Promise<MyRequest[]> {
  const raw = await wpDashboardFetch<Parameters<typeof mapMyRequests>[0]>(
    '/md/v2/dashboard/requests',
    { method: 'GET', bearer: await requireToken() },
  )
  return mapMyRequests(raw)
}

/** GET /md/v2/dashboard/invoices?scope=user (batch 3 — live) */
export async function getUserInvoices(): Promise<Invoice[]> {
  const raw = await wpDashboardFetch<Parameters<typeof mapInvoices>[0]>(
    '/md/v2/dashboard/invoices?scope=user',
    { method: 'GET', bearer: await requireToken() },
  )
  return mapInvoices(raw)
}

// ------------------------------------------------------------
// Brand scope — all keyed by slug
// ------------------------------------------------------------

/**
 * GET /md/v2/dashboard/brands/{brandId}/profile (batch 1 — live)
 * Returns `null` when the slug is unknown/unmanaged → page calls `notFound()`.
 */
export async function getBrandProfile(slug: string): Promise<BrandProfile | null> {
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return null
  const token = await getAuthCookie()
  if (!token) throw new DashboardApiError('md_auth_unauthenticated', 'Not signed in', 401)
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBrandProfile>[0]>(
      `/md/v2/dashboard/brands/${brandId}/profile`,
      { method: 'GET', bearer: token },
    )
    return mapBrandProfile(raw)
  } catch (err) {
    if (err instanceof DashboardApiError && err.status === 404) return null
    throw err
  }
}

/** GET /md/v2/dashboard/brands/{brandId}/materials (batch 1 — live) */
export async function getBrandMaterials(slug: string): Promise<MaterialListRow[]> {
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return []
  const token = await getAuthCookie()
  if (!token) throw new DashboardApiError('md_auth_unauthenticated', 'Not signed in', 401)
  const raw = await wpDashboardFetch<Parameters<typeof mapMaterialListRows>[0]>(
    `/md/v2/dashboard/brands/${brandId}/materials`,
    { method: 'GET', bearer: token },
  )
  return mapMaterialListRows(raw)
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
  // Edit: fetch the form from WP (batch 3 — live).
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return { ...MOCK_MATERIAL_FORM, id: materialId }
  const raw = await wpDashboardFetch<Parameters<typeof mapMaterialFormData>[0]>(
    `/md/v2/dashboard/brands/${brandId}/materials/${materialId}`,
    { method: 'GET', bearer: await requireToken() },
  )
  return mapMaterialFormData(raw)
}

/**
 * GET /md/v2/dashboard/material-categories — assignable category catalogue with
 * real WP term ids. Until the endpoint is live it 404s → empty catalogue, and
 * the picker shows a "not available yet" hint (the form still works).
 */
export async function getMaterialCategories(): Promise<MaterialCategoryPath[]> {
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapMaterialCategoryOptions>[0]>(
      '/md/v2/dashboard/material-categories',
      { method: 'GET', bearer: await requireToken() },
    )
    return mapMaterialCategoryOptions(raw)
  } catch (err) {
    if (err instanceof DashboardApiError) return []
    throw err
  }
}

/**
 * GET /md/v2/dashboard/material-types — material_category taxonomy for the
 * material type dropdown. Until the endpoint is live it 404s → empty list.
 */
export async function getMaterialTypes(): Promise<MaterialTypeOption[]> {
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapMaterialTypeOptions>[0]>(
      '/md/v2/dashboard/material-types',
      { method: 'GET', bearer: await requireToken() },
    )
    return mapMaterialTypeOptions(raw)
  } catch (err) {
    if (err instanceof DashboardApiError) return []
    throw err
  }
}

/** GET /md/v2/dashboard/brands/{brandId}/interactions (batch 2 — live) */
export async function getInteractions(slug: string): Promise<Interaction[]> {
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return []
  const raw = await wpDashboardFetch<Parameters<typeof mapInteractions>[0]>(
    `/md/v2/dashboard/brands/${brandId}/interactions`,
    { method: 'GET', bearer: await requireToken() },
  )
  return mapInteractions(raw)
}

/** GET /md/v2/dashboard/brands/{brandId}/statistics (batch 2 — live; 403 free tier) */
export async function getBrandStatistics(slug: string): Promise<BrandStatistics> {
  const empty: BrandStatistics = { metrics: [], materials: [] }
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return empty
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBrandStatistics>[0]>(
      `/md/v2/dashboard/brands/${brandId}/statistics`,
      { method: 'GET', bearer: await requireToken() },
    )
    return mapBrandStatistics(raw)
  } catch (err) {
    if (err instanceof DashboardApiError && (err.status === 403 || err.status === 404)) return empty
    throw err
  }
}

/** GET /md/v2/dashboard/brands/{brandId}/lead-routing (batch 2 — live; 403 free tier) */
export async function getLeadRouting(slug: string): Promise<LeadRoutingConfig> {
  const empty: LeadRoutingConfig = { defaultName: '', defaultEmail: '', routes: [] }
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return empty
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapLeadRoutingConfig>[0]>(
      `/md/v2/dashboard/brands/${brandId}/lead-routing`,
      { method: 'GET', bearer: await requireToken() },
    )
    return mapLeadRoutingConfig(raw)
  } catch (err) {
    if (err instanceof DashboardApiError && (err.status === 403 || err.status === 404)) return empty
    throw err
  }
}

/** GET /md/v2/dashboard/brands/{brandId}/featured (batch 4 — live, Partner+) */
export async function getFeaturedPlacements(slug: string): Promise<FeaturedPlacement[]> {
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return []
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapFeaturedPlacements>[0]>(
      `/md/v2/dashboard/brands/${brandId}/featured`,
      { method: 'GET', bearer: await requireToken() },
    )
    return mapFeaturedPlacements(raw)
  } catch (err) {
    // Below Partner → 403; unknown brand → 404. Panel gates separately.
    if (err instanceof DashboardApiError && (err.status === 403 || err.status === 404)) return []
    throw err
  }
}

/** GET /md/v2/dashboard/brands/{brandId}/invoices (batch 4 — live) */
export async function getBrandInvoices(slug: string): Promise<Invoice[]> {
  const brandId = await resolveBrandId(slug)
  if (brandId === null) return []
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapInvoices>[0]>(
      `/md/v2/dashboard/brands/${brandId}/invoices`,
      { method: 'GET', bearer: await requireToken() },
    )
    return mapInvoices(raw)
  } catch (err) {
    if (err instanceof DashboardApiError && err.status === 404) return []
    throw err
  }
}

/** GET /md/v2/dashboard/brand-candidates?q=... (batch 4 — live) */
export async function getBrandCandidates(query: string): Promise<BrandCandidate[]> {
  const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
  const raw = await wpDashboardFetch<Parameters<typeof mapBrandCandidates>[0]>(
    `/md/v2/dashboard/brand-candidates${qs}`,
    { method: 'GET', bearer: await requireToken() },
  )
  return mapBrandCandidates(raw)
}
