/**
 * POST /api/dashboard/brands/[brandId]/materials — create a material (draft).
 * Body: camelCase `MaterialFormData`; converted to the WP snake_case body.
 * Returns the created `MaterialFormData` (mode `edit`, `id` set).
 *
 * Tier gates (videos/downloads = Basis+, non-empty keywords = Plus+) are
 * enforced by WP; a `403 md_dashboard_forbidden` is forwarded as-is.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapMaterialFormData, toWpMaterialForm } from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'
import type { MaterialFormData } from '@/types/dashboard'

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

  let body: MaterialFormData
  try {
    body = (await request.json()) as MaterialFormData
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapMaterialFormData>[0]>(
      `/md/v2/dashboard/brands/${brandId}/materials`,
      { method: 'POST', bearer: token, body: toWpMaterialForm(body) },
    )
    return NextResponse.json(mapMaterialFormData(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'materials-create')
  }
}
