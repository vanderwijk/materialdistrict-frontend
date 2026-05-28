/**
 * POST /api/get-in-touch
 *
 * Ontvangt een "Get in touch"-request van een ingelogde gebruiker en
 * forward deze naar het brand-emailadres via MaterialDistrict.
 *
 * Voorlopige implementatie:
 *  - Vereist een geldige auth-cookie (gebruiker moet ingelogd zijn)
 *  - Valideert request body shape
 *  - Forward naar email is een **stub** — Johan moet nog leveren:
 *    (a) brand-email per material (via brand_id)
 *    (b) een mail-transport (SMTP/SendGrid/Postmark/SES)
 *  - Voor nu: log de request en return success. Zodra de mail-transport
 *    bestaat, hier de daadwerkelijke email-call invoegen.
 *
 * Body shape (precies één van materialId / brandId is verplicht):
 *   {
 *     materialId?: number
 *     brandId?: number
 *     options: ('call_back' | 'catalogue' | 'rep' | 'sample' | 'question')[]
 *     message: string | null
 *   }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'

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
  // Auth-check: alleen ingelogde users mogen requests sturen.
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { code: 'md_unauthorized', message: 'Please sign in to send a request.' },
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
