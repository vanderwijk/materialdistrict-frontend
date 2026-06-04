/**
 * POST /api/dashboard/brands/[brandId]/featured-slots
 * Books a featured week for a material (Partner). Body: `{ materialId, weekStart }`
 * → WP snake_case. WP enforces the rules (Partner, max 4, Monday, ≥7 days ahead,
 * material owned by brand, week free) and returns a clear error on violation.
 * Reads stay in the data layer; the client refreshes after a successful POST.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

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

  const { token, error } = await getTokenOr401()
  if (error) return error

  let body: { materialId?: number; weekStart?: string }
  try {
    body = (await request.json()) as { materialId?: number; weekStart?: string }
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  if (typeof body.materialId !== 'number' || typeof body.weekStart !== 'string') {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A material and a week are required.' },
      { status: 400 },
    )
  }

  try {
    await wpDashboardFetch(`/md/v2/dashboard/brands/${brandId}/featured-slots`, {
      method: 'POST',
      bearer: token,
      body: { material_id: body.materialId, week_start: body.weekStart },
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'featured-slots')
  }
}
