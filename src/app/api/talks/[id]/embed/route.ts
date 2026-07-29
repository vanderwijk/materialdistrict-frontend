/**
 * GET /api/talks/[id]/embed
 *
 * Proxies the gated talk Vimeo ID from WordPress. Public /wp/v2/talk strips
 * `meta.vimeo_id` for Insider-only talks; members load it here after login so
 * the ID never appears in anonymous page source / JSON-LD.
 */

import { WP_API_URL } from '@/lib/api/wordpress'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'
import { DashboardApiError } from '@/lib/api/dashboard'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type WpTalkEmbedResponse = {
  id?: number
  vimeo_id?: string | null
  insider_only?: boolean
  code?: string
  message?: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { token, error } = await getTokenOr401()
  if (error) return error

  const { id } = await params
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { code: 'md_talk_not_found', message: 'Talk not found.' },
      { status: 404 },
    )
  }

  try {
    const res = await fetch(
      `${WP_API_URL}/md/v2/talks/${encodeURIComponent(id)}/embed`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    )

    const data = (await res.json().catch(() => null)) as WpTalkEmbedResponse | null

    if (!res.ok) {
      throw new DashboardApiError(
        data?.code ?? 'md_talk_embed_unavailable',
        data?.message ?? 'This talk video is not available.',
        res.status || 502,
        data,
      )
    }

    return NextResponse.json(
      {
        id: data?.id ?? Number(id),
        vimeoId: data?.vimeo_id ?? null,
        insiderOnly: Boolean(data?.insider_only),
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
  } catch (err) {
    return dashboardError(err, 'talks/embed')
  }
}
