/**
 * POST /api/sample-request
 *
 * Sessie 4 batch 3.
 *
 * Sample-request endpoint voor de material-detailpagina. Volgens de
 * decisions uit pre-flight:
 *  - Login-required (read auth-cookie, return 401 if missing)
 *  - Brand kan disablen via material.meta.disable_sample_request (frontend
 *    voorkomt al dat de form rendert, maar deze route doet een extra check)
 *  - NIET Insider-only — alle ingelogde gebruikers mogen samples aanvragen
 *
 * Placeholder-status: forwards to WordPress `POST /md/v2/sample-request`.
 *
 * Body-shape (zie W14 in `open-issues-patch-sessie4.md`):
 *   {
 *     material_id: number,
 *     name: string,
 *     email: string,
 *     company?: string,
 *     project?: string,
 *     message?: string
 *   }
 *
 * Response-shape:
 *   200 { ok: true }
 *   400 { code: 'md_invalid_request', message: string }
 *   401 { code: 'md_auth_required', message: 'Please sign in to request a sample.' }
 *   500 { code: 'md_internal_error', message: 'Something went wrong.' }
 */

import { NextResponse } from 'next/server'
import { getCurrentUser, WordPressAuthError } from '@/lib/api/wordpress'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { clearAuthCookie, getAuthCookie } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'

// --------------------------------------------------------------------
// Validation
// --------------------------------------------------------------------

interface SampleRequestPayload {
  material_id: number
  name: string
  email: string
  company?: string
  project?: string
  message?: string
}

interface ValidationError {
  ok: false
  message: string
}

interface ValidationSuccess {
  ok: true
  payload: SampleRequestPayload
}

type ValidationResult = ValidationError | ValidationSuccess

const EMAIL_RX = /^\S+@\S+\.\S+$/

/**
 * Valideert + saneert de body. Trimt whitespace, enforce types,
 * normaliseert optionele velden naar undefined ipv lege string.
 */
function validateBody(raw: unknown): ValidationResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, message: 'Invalid request body.' }
  }

  const body = raw as Record<string, unknown>

  // material_id
  const materialId = Number(body.material_id)
  if (!Number.isInteger(materialId) || materialId <= 0) {
    return { ok: false, message: 'Invalid material id.' }
  }

  // name
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (name.length === 0) {
    return { ok: false, message: 'Name is required.' }
  }
  if (name.length > 200) {
    return { ok: false, message: 'Name is too long.' }
  }

  // email
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (email.length === 0) {
    return { ok: false, message: 'Email is required.' }
  }
  if (!EMAIL_RX.test(email)) {
    return { ok: false, message: 'Please enter a valid email address.' }
  }
  if (email.length > 200) {
    return { ok: false, message: 'Email is too long.' }
  }

  // optional fields — trim, cap length, drop if empty
  const company = optionalString(body.company, 200)
  const project = optionalString(body.project, 500)
  const message = optionalString(body.message, 2000)

  return {
    ok: true,
    payload: {
      material_id: materialId,
      name,
      email,
      ...(company !== undefined && { company }),
      ...(project !== undefined && { project }),
      ...(message !== undefined && { message }),
    },
  }
}

function optionalString(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  return trimmed.slice(0, maxLen)
}

// --------------------------------------------------------------------
// Handler
// --------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Auth-check — leest de HttpOnly cookie
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      {
        code: 'md_auth_required',
        message: 'Please sign in to request a sample.',
      },
      { status: 401 },
    )
  }

  try {
    await getCurrentUser(token)
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      await clearAuthCookie()
      return NextResponse.json(
        {
          code: 'md_auth_required',
          message: 'Please sign in to request a sample.',
        },
        { status: 401 },
      )
    }
    console.error('[api/sample-request] auth check failed', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong.',
      },
      { status: 500 },
    )
  }

  // Body parse + validate
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      {
        code: 'md_invalid_request',
        message: 'Invalid JSON in request body.',
      },
      { status: 400 },
    )
  }

  const validation = validateBody(rawBody)
  if (!validation.ok) {
    return NextResponse.json(
      {
        code: 'md_invalid_request',
        message: validation.message,
      },
      { status: 400 },
    )
  }

  // Forward to WordPress.
  try {
    await wpDashboardFetch<{ ok: boolean; lead_id: number }>(
      '/md/v2/sample-request',
      {
        method: 'POST',
        bearer: token,
        body: validation.payload,
      },
    )
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/sample-request]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong.' },
      { status: 500 },
    )
  }
}
