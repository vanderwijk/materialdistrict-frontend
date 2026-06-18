/**
 * POST /api/dashboard/upgrade-request
 * Files a membership upgrade request for a managed brand (team notification via SES).
 * Body: `{ brandId, brandSlug, targetTier }` → `{ status: 'ok' }`.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function POST(request: Request): Promise<NextResponse> {
  const { token, error } = await getTokenOr401()
  if (error) return error

  let body: { brandId?: number; brandSlug?: string; targetTier?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  if (!body.brandId || !body.targetTier?.trim()) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'brandId and targetTier are required.' },
      { status: 400 },
    )
  }

  try {
    const data = await wpDashboardFetch<{ status: string }>(
      '/md/v2/dashboard/upgrade-request',
      {
        method: 'POST',
        bearer: token,
        body: {
          brandId: body.brandId,
          brandSlug: body.brandSlug ?? '',
          targetTier: body.targetTier.trim(),
        },
      },
    )
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'upgrade-request')
  }
}
