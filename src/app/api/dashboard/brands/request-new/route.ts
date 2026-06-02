/**
 * POST /api/dashboard/brands/request-new
 * Request a brand-new brand (stored pending in WP usermeta; no auto-create).
 * Body `{ name, website?, email?, message? }` (`name` required) → `{ status }`.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function POST(request: Request): Promise<NextResponse> {
  const { token, error } = await getTokenOr401()
  if (error) return error

  let body: { name?: string; website?: string; email?: string; message?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }
  if (!body.name?.trim()) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A brand name is required.' },
      { status: 400 },
    )
  }

  try {
    const data = await wpDashboardFetch<{ status: string }>(
      '/md/v2/dashboard/brands/request-new',
      {
        method: 'POST',
        bearer: token,
        body: {
          name: body.name.trim(),
          website: body.website?.trim() ?? '',
          email: body.email?.trim() ?? '',
          message: body.message?.trim() ?? '',
        },
      },
    )
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'brand-request-new')
  }
}
