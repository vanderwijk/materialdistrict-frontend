/**
 * PATCH  /api/dashboard/saved-searches/[id] — update name/query/alerts.
 * DELETE /api/dashboard/saved-searches/[id] — delete (204 → `{ ok: true }`).
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapSavedSearch, toWpSavedSearch } from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const { token, error } = await getTokenOr401()
  if (error) return error

  let body: { name?: string; query?: string; alertsEnabled?: boolean }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapSavedSearch>[0]>(
      `/md/v2/dashboard/saved-searches/${encodeURIComponent(id)}`,
      { method: 'PATCH', bearer: token, body: toWpSavedSearch(body) },
    )
    return NextResponse.json(mapSavedSearch(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'saved-searches')
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const { token, error } = await getTokenOr401()
  if (error) return error
  try {
    await wpDashboardFetch(`/md/v2/dashboard/saved-searches/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      bearer: token,
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'saved-searches')
  }
}
