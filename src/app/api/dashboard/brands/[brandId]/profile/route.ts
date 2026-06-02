/**
 * POST /api/dashboard/brands/[brandId]/profile
 *
 * Proxies a brand-profile save to WP `POST /md/v2/dashboard/brands/{id}/profile`.
 * WP enforces brand ownership and the keywords tier-gate server-side; a
 * `403 md_dashboard_forbidden` (or `404`) is forwarded to the client as-is.
 *
 * Body: camelCase `BrandProfile`; converted to the WP snake_case shape here.
 */

import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { mapBrandProfile, toWpBrandProfile } from '@/lib/dashboard/mappers'
import type { BrandProfile } from '@/types/dashboard'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> },
): Promise<NextResponse> {
  const { brandId } = await params
  if (!/^\d+$/.test(brandId)) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid brand id.' },
      { status: 400 },
    )
  }

  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_auth_unauthenticated', message: 'Please sign in again.' },
      { status: 401 },
    )
  }

  let body: BrandProfile
  try {
    body = (await request.json()) as BrandProfile
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBrandProfile>[0]>(
      `/md/v2/dashboard/brands/${brandId}/profile`,
      { method: 'POST', bearer: token, body: toWpBrandProfile(body) },
    )
    return NextResponse.json(mapBrandProfile(raw), { status: 200 })
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    console.error('[api/dashboard/brands/profile]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
