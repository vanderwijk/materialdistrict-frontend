/**
 * DELETE /api/dashboard/brands/[brandId]
 * Trashes the brand (and its materials) and unlinks connected users.
 * Irreversible from the dashboard. WP returns 204 → we return `{ ok: true }`.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function DELETE(
  _request: Request,
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
  try {
    await wpDashboardFetch(`/md/v2/dashboard/brands/${brandId}`, {
      method: 'DELETE',
      bearer: token,
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'brand-delete')
  }
}
