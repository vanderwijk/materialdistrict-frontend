/**
 * POST /api/dashboard/brands/[brandId]/lead-routing
 * Saves the lead-routing config (Plus+). Body: camelCase `LeadRoutingConfig`
 * → WP snake_case. WP reassigns route ids. Returns the saved config.
 * 403 `md_dashboard_forbidden` below Plus.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapLeadRoutingConfig, toWpLeadRouting } from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'
import type { LeadRoutingConfig } from '@/types/dashboard'

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

  let body: LeadRoutingConfig
  try {
    body = (await request.json()) as LeadRoutingConfig
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapLeadRoutingConfig>[0]>(
      `/md/v2/dashboard/brands/${brandId}/lead-routing`,
      { method: 'POST', bearer: token, body: toWpLeadRouting(body) },
    )
    return NextResponse.json(mapLeadRoutingConfig(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'lead-routing')
  }
}
