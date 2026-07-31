/**
 * POST /api/feedback
 *
 * Forwards a soft-launch problem report to WordPress
 * `POST /md/v2/feedback`, which mails it to webmaster@materialdistrict.com.
 *
 * Anonymous-friendly, like `/api/events`: most reporters during the test
 * month will not be signed in. When an auth cookie is present it is passed
 * through as a Bearer token so WordPress can attribute the report to a user;
 * without one the report is simply anonymous.
 *
 * Body (camelCase from the client → snake_case to WordPress):
 *   { message, url, viewport?, userAgent? }
 *     → { message, url, viewport?, user_agent?, referrer? }
 *
 * Unlike the events beacon this is NOT best-effort: the visitor is waiting
 * for confirmation, so a failure has to surface as a real status code.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { getAuthCookie } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'

const MAX_MESSAGE = 4000
const MAX_URL = 2000
const MAX_UA = 400

interface FeedbackBody {
  message: string
  url: string
  viewport?: string
  userAgent?: string
}

function isValidBody(input: unknown): input is FeedbackBody {
  if (!input || typeof input !== 'object') return false
  const body = input as Record<string, unknown>

  if (typeof body.message !== 'string') return false
  if (body.message.trim().length < 3) return false
  if (body.message.length > MAX_MESSAGE) return false

  if (typeof body.url !== 'string' || body.url.length > MAX_URL) return false
  if (body.viewport !== undefined && typeof body.viewport !== 'string') return false
  if (body.userAgent !== undefined && typeof body.userAgent !== 'string') return false

  return true
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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
      { code: 'md_invalid_request', message: 'Invalid feedback payload.' },
      { status: 400 },
    )
  }

  const token = await getAuthCookie()

  const wpBody: Record<string, unknown> = {
    message: raw.message.trim().slice(0, MAX_MESSAGE),
    url: raw.url.slice(0, MAX_URL),
  }
  if (raw.viewport) wpBody.viewport = raw.viewport.slice(0, 32)
  if (raw.userAgent) wpBody.user_agent = raw.userAgent.slice(0, MAX_UA)

  const referrer = request.headers.get('referer')
  if (referrer) wpBody.referrer = referrer.slice(0, MAX_URL)

  try {
    await wpDashboardFetch('/md/v2/feedback', {
      method: 'POST',
      bearer: token ?? undefined,
      body: wpBody,
    })
    return NextResponse.json({ ok: true }, { status: 202 })
  } catch (error) {
    if (error instanceof DashboardApiError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status },
      )
    }
    return NextResponse.json(
      { code: 'md_feedback_failed', message: 'Could not send feedback.' },
      { status: 502 },
    )
  }
}
