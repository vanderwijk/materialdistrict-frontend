/**
 * DELETE /api/dashboard/bookmarks/[id]
 * Removes a saved bookmark. WP returns 204; we return 200 `{ ok: true }`.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const { token, error } = await getTokenOr401()
  if (error) return error
  try {
    await wpDashboardFetch(`/md/v2/dashboard/bookmarks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      bearer: token,
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'bookmarks')
  }
}
