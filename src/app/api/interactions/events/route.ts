/**
 * POST /api/interactions/events
 *
 * Proxies authenticated front-end interaction events to WordPress
 * `POST /md/v2/interactions/events`. Mirrors the get-in-touch proxy:
 * reads the HttpOnly auth cookie, forwards it as a Bearer token, and
 * maps WordPress errors back to the client.
 *
 * Body (camelCase from the client, snake_case to WordPress):
 *   { type, brandId?, materialId?, downloadId? }
 *     → { type, brand_id?, material_id?, download_id? }
 *
 * `type` is one of `website_click` | `brochure_download`. At least one of
 * `brandId` / `materialId` must be present so WordPress can resolve the
 * brand context. This is a best-effort logging beacon, so we skip the
 * extra `getCurrentUser` round-trip the get-in-touch route does — an
 * expired token simply yields WordPress' own 401 passthrough.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { getAuthCookie } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'

const VALID_TYPES = new Set(['website_click', 'brochure_download'])

interface EventBody {
  type: string
  brandId?: number
  materialId?: number
  downloadId?: number
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidBody(input: unknown): input is EventBody {
  if (!input || typeof input !== 'object') return false
  const body = input as Record<string, unknown>

  if (typeof body.type !== 'string' || !VALID_TYPES.has(body.type)) return false

  const hasBrand = isFiniteNumber(body.brandId)
  const hasMaterial = isFiniteNumber(body.materialId)
  if (!hasBrand && !hasMaterial) return false

  if (body.brandId !== undefined && !isFiniteNumber(body.brandId)) return false
  if (body.materialId !== undefined && !isFiniteNumber(body.materialId)) return false
  if (body.downloadId !== undefined && !isFiniteNumber(body.downloadId)) return false
  return true
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_unauthorized', message: 'Please sign in.' },
      { status: 401 },
    )
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Invalid JSON body.' },
      { status: 400 },
    )
  }

  if (!isValidBody(raw)) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Invalid request payload.' },
      { status: 400 },
    )
  }

  const wpBody: Record<string, unknown> = { type: raw.type }
  if (isFiniteNumber(raw.brandId)) wpBody.brand_id = raw.brandId
  if (isFiniteNumber(raw.materialId)) wpBody.material_id = raw.materialId
  if (isFiniteNumber(raw.downloadId)) wpBody.download_id = raw.downloadId

  try {
    const result = await wpDashboardFetch<Record<string, unknown>>(
      '/md/v2/interactions/events',
      { method: 'POST', bearer: token, body: wpBody },
    )
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/interactions/events]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong.' },
      { status: 500 },
    )
  }
}
