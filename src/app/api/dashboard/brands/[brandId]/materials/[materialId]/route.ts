/**
 * PATCH  /api/dashboard/brands/[brandId]/materials/[materialId]
 *   - Body with only `{ status }`  → status toggle  → returns MaterialListRow
 *   - Body with any form field     → form save      → returns MaterialFormData
 *   Mirrors WP's own dispatch (presence of a form field = form save).
 * DELETE /api/dashboard/brands/[brandId]/materials/[materialId] → trash (204).
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import {
  mapMaterialListRow,
  mapMaterialFormData,
  toWpMaterialForm,
} from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'
import type { MaterialFormData, MaterialPublicationStatus } from '@/types/dashboard'

const STATUS: MaterialPublicationStatus[] = ['online', 'offline', 'draft']
const FORM_KEYS = [
  'name', 'description', 'type', 'featuredImage', 'gallery',
  'downloads', 'videos', 'keywords', 'categories', 'channels',
]

function validIds(brandId: string, materialId: string): boolean {
  return /^\d+$/.test(brandId) && /^\d+$/.test(materialId)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ brandId: string; materialId: string }> },
): Promise<NextResponse> {
  const { brandId, materialId } = await params
  if (!validIds(brandId, materialId)) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid id.' },
      { status: 400 },
    )
  }

  const { token, error } = await getTokenOr401()
  if (error) return error

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const path = `/md/v2/dashboard/brands/${brandId}/materials/${materialId}`
  const isFormSave = FORM_KEYS.some((k) => k in body)

  try {
    if (isFormSave) {
      const raw = await wpDashboardFetch<Parameters<typeof mapMaterialFormData>[0]>(path, {
        method: 'PATCH',
        bearer: token,
        body: toWpMaterialForm(body as unknown as MaterialFormData),
      })
      return NextResponse.json(mapMaterialFormData(raw), { status: 200 })
    }

    // Status toggle (batch 1 behaviour).
    const status = body.status
    if (typeof status !== 'string' || !STATUS.includes(status as MaterialPublicationStatus)) {
      return NextResponse.json(
        { code: 'md_dashboard_invalid_request', message: 'Invalid status.' },
        { status: 400 },
      )
    }
    const raw = await wpDashboardFetch<Parameters<typeof mapMaterialListRow>[0]>(path, {
      method: 'PATCH',
      bearer: token,
      body: { status },
    })
    return NextResponse.json(mapMaterialListRow(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'materials')
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ brandId: string; materialId: string }> },
): Promise<NextResponse> {
  const { brandId, materialId } = await params
  if (!validIds(brandId, materialId)) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid id.' },
      { status: 400 },
    )
  }
  const { token, error } = await getTokenOr401()
  if (error) return error
  try {
    await wpDashboardFetch(
      `/md/v2/dashboard/brands/${brandId}/materials/${materialId}`,
      { method: 'DELETE', bearer: token },
    )
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'materials')
  }
}
