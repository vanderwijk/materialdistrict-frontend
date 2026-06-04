/**
 * DELETE /api/dashboard/brands/[brandId]/featured-slots/[slotId]
 * Cancels a booked featured week (Partner). Only `scheduled` slots are
 * cancelable; WP enforces that and returns a clear error otherwise. The slot id
 * is an opaque string (uuid), so it is only checked for non-emptiness here.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ brandId: string; slotId: string }> },
): Promise<NextResponse> {
  const { brandId, slotId } = await params
  if (!/^\d+$/.test(brandId) || !slotId) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid id.' },
      { status: 400 },
    )
  }

  const { token, error } = await getTokenOr401()
  if (error) return error

  try {
    await wpDashboardFetch(
      `/md/v2/dashboard/brands/${brandId}/featured-slots/${encodeURIComponent(slotId)}`,
      { method: 'DELETE', bearer: token },
    )
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'featured-slots')
  }
}
