/**
 * POST /api/dashboard/media
 *
 * Uploads a file to the WP media library (`POST /wp/v2/media`) on the user's
 * behalf and returns a `MaterialAsset` ({ id, name, url }) the material form
 * can reference. The JWT is HttpOnly, so the browser uploads to this proxy
 * (multipart, field `file`) and we forward the bytes with the Bearer token.
 *
 * WP checks the user may create/own the attachment; failures bubble up.
 */

import { NextResponse } from 'next/server'
import { WP_API_URL } from '@/lib/api/wordpress'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'
import { DashboardApiError } from '@/lib/api/dashboard'
import type { MaterialAsset } from '@/types/dashboard'

export async function POST(request: Request): Promise<NextResponse> {
  const { token, error } = await getTokenOr401()
  if (error) return error

  let file: File | null = null
  try {
    const form = await request.formData()
    const f = form.get('file')
    if (f instanceof File) file = f
  } catch {
    // fall through to the missing-file error
  }
  if (!file) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'No file provided.' },
      { status: 400 },
    )
  }

  try {
    const res = await fetch(`${WP_API_URL}/wp/v2/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      },
      body: await file.arrayBuffer(),
      cache: 'no-store',
    })

    const data = (await res.json().catch(() => null)) as
      | { id?: number; source_url?: string; title?: { rendered?: string }; message?: string }
      | null

    if (!res.ok || !data?.id) {
      throw new DashboardApiError(
        'md_dashboard_unavailable',
        data?.message ?? 'Upload failed.',
        res.status || 502,
        data,
      )
    }

    const asset: MaterialAsset = {
      id: String(data.id),
      name: data.title?.rendered || file.name,
      url: data.source_url ?? null,
    }
    return NextResponse.json(asset, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'media')
  }
}
