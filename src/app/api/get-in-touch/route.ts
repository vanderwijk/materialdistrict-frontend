/**
 * POST /api/get-in-touch
 *
 * Receives a "Get in touch" request from a logged-in user and forwards it
 * to the brand's email address via MaterialDistrict.
 *
 * Auth (session 12 — cookie-rename fix):
 *  - Reads the JWT from the HttpOnly `md_auth_token` cookie and validates
 *    it against WordPress via `getCurrentUser()`. This is the same live
 *    path that `/api/auth/me` and the SSR layout hydration use.
 *  - Replaces the previous `@/lib/auth/server` helper, which read the
 *    now-retired `md_session` cookie that the app never set — so an
 *    authenticated user was read as logged out.
 *
 * Provisional implementation:
 *  - Requires a logged-in user
 *  - Validates request body shape
 *  - Forwarding to email is a **stub** — Johan still needs to deliver:
 *    (a) brand email per material (via brand_id)
 *    (b) a mail transport (SMTP/SendGrid/Postmark/SES)
 *  - For now: log the request and return success. Once the mail transport
 *    exists, insert the actual email call here.
 *
 * Body shape (exactly one of materialId / brandId is required):
 *   {
 *     materialId?: number
 *     brandId?: number
 *     options: ('call_back' | 'catalogue' | 'rep' | 'sample' | 'question')[]
 *     message: string | null
 *   }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser, WordPressAuthError } from '@/lib/api/wordpress'
import { clearAuthCookie, getAuthCookie } from '@/lib/auth/cookies'
import type { User } from '@/types/shared'

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

  // Precies één target: materialId of brandId. Beide moeten (als gezet)
  // een geldig getal zijn; minstens één is verplicht.
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
  // Auth-check: alleen ingelogde users mogen requests sturen. Lees de JWT
  // uit de HttpOnly-cookie en valideer hem server-side tegen WordPress.
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_unauthorized', message: 'Please sign in to send a request.' },
      { status: 401 },
    )
  }

  let user: User
  try {
    const auth = await getCurrentUser(token)
    user = auth.user
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      // Cookie aanwezig maar afgekeurd (verlopen/ingetrokken). Wis de cookie
      // zodat de volgende request een schone uitgelogde staat is, en signaleer 401.
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

  // Truncate message als hij verdacht lang is — basis-bescherming.
  const message =
    raw.message && raw.message.length > 2000
      ? raw.message.slice(0, 2000)
      : raw.message

  // TODO Johan-input: hier de daadwerkelijke email-call invoegen.
  // Voor nu loggen we de request server-side zodat ontwikkelaars kunnen
  // verifiëren dat het end-to-end werkt.
  console.info('[get-in-touch] request received', {
    userId: user.id,
    userEmail: user.email,
    target: typeof raw.brandId === 'number' ? 'brand' : 'material',
    materialId: raw.materialId,
    brandId: raw.brandId,
    options: raw.options,
    hasMessage: Boolean(message),
  })

  return NextResponse.json({ ok: true })
}
