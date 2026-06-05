/**
 * GET /api/dashboard/insider-insights/[id]/download
 *
 * Streams an insider report's PDF. The file lives in the WP media library and is
 * NEVER exposed as a public URL: this proxy forwards the user's JWT to the gated
 * WP endpoint, which checks Insider access + `insider_only`, then serves the
 * media-library file with the Insider's name baked into the filename (and
 * embedded traceability metadata). We stream the bytes back and forward the
 * file headers, so the personalised filename from Content-Disposition reaches
 * the browser. A shared link is useless to a third party: the route requires the
 * Insider's own cookie.
 */

import { WP_API_URL } from '@/lib/api/wordpress'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'
import { DashboardApiError } from '@/lib/api/dashboard'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { token, error } = await getTokenOr401()
  if (error) return error

  const { id } = await params

  try {
    const res = await fetch(
      `${WP_API_URL}/md/v2/dashboard/insider-insights/${encodeURIComponent(id)}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    )

    if (!res.ok || !res.body) {
      const data = (await res.json().catch(() => null)) as
        | { message?: string; code?: string }
        | null
      throw new DashboardApiError(
        data?.code ?? 'md_dashboard_unavailable',
        data?.message ?? 'This report is not available to download.',
        res.status || 502,
        data,
      )
    }

    const headers = new Headers()
    headers.set('Content-Type', res.headers.get('Content-Type') ?? 'application/pdf')
    const disposition = res.headers.get('Content-Disposition')
    if (disposition) headers.set('Content-Disposition', disposition)
    const length = res.headers.get('Content-Length')
    if (length) headers.set('Content-Length', length)
    headers.set('Cache-Control', 'private, no-store')

    return new Response(res.body, { status: 200, headers })
  } catch (err) {
    return dashboardError(err, 'insider-insights/download')
  }
}
