/**
 * POST /api/get-in-touch
 *
 * Proxies authenticated get-in-touch submissions to WordPress
 * `POST /md/v2/get-in-touch`.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser, WordPressAuthError } from '@/lib/api/wordpress'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { clearAuthCookie, getAuthCookie } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'

const VALID_OPTIONS = new Set([
  'call_back',
  'catalogue',
  'rep',
  'sample',
  'question',
])

interface GetInTouchBody {
  materialId?: number
  brandId?: number
  options: string[]
  message: string | null
}

function isValidBody(input: unknown): input is GetInTouchBody {
  if (!input || typeof input !== 'object') return false
  const body = input as Record<string, unknown>

  const hasMaterial =
    typeof body.materialId === 'number' && Number.isFinite(body.materialId)
  const hasBrand =
    typeof body.brandId === 'number' && Number.isFinite(body.brandId)
  if (!hasMaterial && !hasBrand) return false

  if (!Array.isArray(body.options) || body.options.length === 0) return false
  for (const opt of body.options) {
    if (typeof opt !== 'string' || !VALID_OPTIONS.has(opt)) return false
  }
  if (body.message !== null && typeof body.message !== 'string') return false
  return true
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_unauthorized', message: 'Please sign in to send a request.' },
      { status: 401 },
    )
  }

  try {
    await getCurrentUser(token)
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      await clearAuthCookie()
      return NextResponse.json(
        { code: 'md_unauthorized', message: 'Please sign in to send a request.' },
        { status: 401 },
      )
    }
    console.error('[api/get-in-touch] auth check failed', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 },
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

  const message =
    raw.message && raw.message.length > 2000
      ? raw.message.slice(0, 2000)
      : raw.message

  const wpBody: Record<string, unknown> = {
    options: raw.options,
    message,
  }
  if (typeof raw.materialId === 'number') wpBody.material_id = raw.materialId
  if (typeof raw.brandId === 'number') wpBody.brand_id = raw.brandId

  try {
    const result = await wpDashboardFetch<{ ok: boolean; lead_id: number }>(
      '/md/v2/get-in-touch',
      { method: 'POST', bearer: token, body: wpBody },
    )
    return NextResponse.json({ ok: true, leadId: result.lead_id })
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/get-in-touch]', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}
