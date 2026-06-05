/**
 * POST /api/dashboard/media
 *
 * Uploads a file to the WP media library on the user's behalf and returns a
 * `MaterialAsset` ({ id, name, url }) the dashboard forms can reference. The
 * JWT is HttpOnly, so the browser uploads to this proxy (multipart) and we
 * forward it with the Bearer token.
 *
 * Dashboard users are WP subscribers without `upload_files`, so we forward to
 * the scoped, brand-managed endpoint `POST /md/v2/dashboard/brands/{id}/media`
 * (not generic `/wp/v2/media`, which 401s for these users). WP sets
 * `post_author` to the current user; on save, gallery/featured attachments get
 * `post_parent` so the public site reads them via `?parent=<post_id>`.
 *
 * FormData: `file` (required), `brand_id` (required), `context` (`image` |
 * `document`, default `image`). Do not set Content-Type manually — fetch keeps
 * the multipart boundary intact.
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
  let brandId: string | null = null
  let context: 'image' | 'document' = 'image'

  try {
    const form = await request.formData()
    const f = form.get('file')
    if (f instanceof File) file = f

    const rawBrandId = form.get('brand_id')
    if (typeof rawBrandId === 'string' && /^\d+$/.test(rawBrandId)) {
      brandId = rawBrandId
    }

    const rawContext = form.get('context')
    if (rawContext === 'document') context = 'document'
  } catch {
    // fall through to validation errors below
  }

  if (!brandId) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Brand id is required.' },
      { status: 400 },
    )
  }

  if (!file) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'No file provided.' },
      { status: 400 },
    )
  }

  try {
    const wpForm = new FormData()
    wpForm.append('file', file, file.name)
    wpForm.append('context', context)

    const res = await fetch(`${WP_API_URL}/md/v2/dashboard/brands/${brandId}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: wpForm,
      cache: 'no-store',
    })

    const data = (await res.json().catch(() => null)) as
      | { id?: string; name?: string; url?: string | null; code?: string; message?: string }
      | null

    if (!res.ok || !data?.id) {
      throw new DashboardApiError(
        data?.code ?? 'md_dashboard_unavailable',
        data?.message ?? 'Upload failed.',
        res.status || 502,
        data,
      )
    }

    const asset: MaterialAsset = {
      id: String(data.id),
      name: data.name || file.name,
      url: data.url ?? null,
    }
    return NextResponse.json(asset, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'media')
  }
}
