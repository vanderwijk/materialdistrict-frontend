/**
 * POST /api/contact
 *
 * Forwards the site-wide contact form to WordPress `POST /md/v2/contact`,
 * which mails it to info@materialdistrict.com via SES.
 *
 * Anonymous-friendly. When an auth cookie is present it is passed through
 * as a Bearer token so WordPress can attribute the message to a user.
 *
 * Body (camelCase from the client):
 *   { name, email, company?, subject, message, website? }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { getAuthCookie } from '@/lib/auth/cookies'
import { CONTACT_TOPICS } from '@/lib/config/contact'

export const dynamic = 'force-dynamic'

const MAX_NAME = 120
const MAX_COMPANY = 160
const MAX_SUBJECT = 200
const MAX_MESSAGE = 4000

const ALLOWED_SUBJECTS = new Set(CONTACT_TOPICS.map((t) => t.subject))

interface ContactBody {
  name: string
  email: string
  company?: string
  subject: string
  message: string
  website?: string
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isAllowedSubject(subject: string): boolean {
  if (ALLOWED_SUBJECTS.has(subject)) return true
  // become-a-partner deep link: "Brand Membership — Plus"
  return subject.startsWith('Brand Membership')
}

function isValidBody(input: unknown): input is ContactBody {
  if (!input || typeof input !== 'object') return false
  const body = input as Record<string, unknown>

  if (typeof body.name !== 'string' || body.name.trim().length < 1) return false
  if (body.name.length > MAX_NAME) return false

  if (typeof body.email !== 'string' || !isEmail(body.email.trim())) return false

  if (body.company !== undefined && typeof body.company !== 'string') return false
  if (typeof body.company === 'string' && body.company.length > MAX_COMPANY) return false

  if (typeof body.subject !== 'string' || !isAllowedSubject(body.subject.trim())) {
    return false
  }
  if (body.subject.length > MAX_SUBJECT) return false

  if (typeof body.message !== 'string') return false
  if (body.message.trim().length < 3) return false
  if (body.message.length > MAX_MESSAGE) return false

  if (body.website !== undefined && typeof body.website !== 'string') return false

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
      { code: 'md_invalid_request', message: 'Invalid contact payload.' },
      { status: 400 },
    )
  }

  if (raw.website?.trim()) {
    return NextResponse.json({ ok: true }, { status: 202 })
  }

  const token = await getAuthCookie()

  const wpBody = {
    name: raw.name.trim().slice(0, MAX_NAME),
    email: raw.email.trim(),
    company: (raw.company ?? '').trim().slice(0, MAX_COMPANY),
    subject: raw.subject.trim().slice(0, MAX_SUBJECT),
    message: raw.message.trim().slice(0, MAX_MESSAGE),
    website: '',
  }

  try {
    await wpDashboardFetch('/md/v2/contact', {
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
      { code: 'md_contact_failed', message: 'Could not send message.' },
      { status: 502 },
    )
  }
}
