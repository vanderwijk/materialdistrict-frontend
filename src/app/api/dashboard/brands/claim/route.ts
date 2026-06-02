/**
 * POST /api/dashboard/brands/claim
 * Claim an existing brand matched on the user's e-mail domain.
 * Body `{ brandId }` → WP `{ brand_id }`. Returns WP's `{ status: "ok" }`.
 * 403 `md_dashboard_forbidden` on domain mismatch / already claimed.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function POST(request: Request): Promise<NextResponse> {
  const { token, error } = await getTokenOr401()
  if (error) return error

  let brandId: unknown
  try {
    const body = (await request.json()) as { brandId?: unknown; brand_id?: unknown }
    brandId = body.brandId ?? body.brand_id
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }
  const idNum = Number(brandId)
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A brand id is required.' },
      { status: 400 },
    )
  }

  try {
    const data = await wpDashboardFetch<{ status: string }>(
      '/md/v2/dashboard/brands/claim',
      { method: 'POST', bearer: token, body: { brand_id: idNum } },
    )
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'brand-claim')
  }
}
