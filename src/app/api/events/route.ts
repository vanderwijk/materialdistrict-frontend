/**
 * POST /api/events
 *
 * Generieke, anoniem-vriendelijke events-proxy. Forwardt naar WordPress
 * `POST /md/v2/events` (zie backend-spec). Anders dan de interactions-proxy
 * is login NIET verplicht: anonieme events zijn de norm.
 *
 * - Ingelogd → de auth-cookie gaat mee als Bearer; WordPress leidt user_id af.
 * - Anoniem → de `md_aid`-cookie (pseudoniem id) gaat mee als `anonymous_id`.
 *
 * Body (camelCase van de client → snake_case naar WordPress):
 *   { eventType, objectType, objectId?, source?, attributes? }
 *     → { event_type, object_type, object_id?, source?, attributes?, anonymous_id? }
 *
 * Best-effort: dit is een logging-beacon, dus we falen nooit hard naar de
 * client. Een WordPress-fout (of een nog-niet-bestaand endpoint) levert een
 * stille 202 op zodat `keepalive`-beacons en navigaties niet stuk gaan.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { getAuthCookie } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'

const ANON_COOKIE = 'md_aid'

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

  const body = raw as Record<string, unknown>
  if (
    !body ||
    typeof body.eventType !== 'string' ||
    typeof body.objectType !== 'string'
  ) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Invalid event payload.' },
      { status: 400 },
    )
  }

  const token = await getAuthCookie()
  const jar = await cookies()
  const anonId = jar.get(ANON_COOKIE)?.value

  const wpBody: Record<string, unknown> = {
    event_type: body.eventType,
    object_type: body.objectType,
  }
  if (body.objectId !== undefined && body.objectId !== null && body.objectId !== '') {
    wpBody.object_id = body.objectId
  }
  if (typeof body.source === 'string') wpBody.source = body.source
  if (body.attributes && typeof body.attributes === 'object') {
    wpBody.attributes = body.attributes
  }
  // Anonymous id alleen meesturen als er geen ingelogde user is.
  if (!token && anonId) wpBody.anonymous_id = anonId

  try {
    await wpDashboardFetch('/md/v2/events', {
      method: 'POST',
      bearer: token ?? undefined,
      body: wpBody,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    // Best-effort: nooit hard falen. Onbekende fouten loggen we wel server-side.
    if (!(err instanceof DashboardApiError)) {
      console.error('[api/events]', err)
    }
    return NextResponse.json({ ok: false }, { status: 202 })
  }
}
