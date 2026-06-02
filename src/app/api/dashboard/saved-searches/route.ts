/**
 * POST /api/dashboard/saved-searches — create a saved search (Insider).
 * Body `{ name, query, alertsEnabled? }`. Returns the new `SavedSearch`.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapSavedSearch, toWpSavedSearch } from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function POST(request: Request): Promise<NextResponse> {
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
  if (!body.name?.trim() || !body.query?.trim()) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A name and query are required.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapSavedSearch>[0]>(
      '/md/v2/dashboard/saved-searches',
      { method: 'POST', bearer: token, body: toWpSavedSearch(body) },
    )
    return NextResponse.json(mapSavedSearch(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'saved-searches')
  }
}
