/**
 * /api/follows  (GET | POST | DELETE)
 *
 * Proxy voor de follow-relaties → WordPress `/md/v2/follows`. Mirror van de
 * interactions-proxy: leest de HttpOnly-auth-cookie, stuurt 'm door als Bearer,
 * mapt camelCase → snake_case en WordPress-fouten terug naar de client.
 * Login vereist (volgen kan alleen met account).
 *
 *   GET    → { follows: [...], mailFrequency }
 *   POST   { entityType, entityId, types }  → volg/upsert
 *   DELETE { entityType, entityId }          → ontvolg
 */

import { NextResponse, type NextRequest } from 'next/server'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { getAuthCookie } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'

const VALID_ENTITY = new Set(['channel', 'brand'])

type WpFollowRecord = {
  entity_type?: string
  entity_id?: number | string
  types?: string[]
}

type WpFollowsResponse = {
  follows?: WpFollowRecord[]
  mail_frequency?: string
}

function mapFollowsResponse(raw: WpFollowsResponse) {
  return {
    follows: Array.isArray(raw.follows)
      ? raw.follows.map((row) => ({
          entityType: row.entity_type,
          entityId: row.entity_id,
          types: Array.isArray(row.types) ? row.types : [],
        }))
      : [],
    mailFrequency: raw.mail_frequency ?? 'weekly',
  }
}

function unauthorized(): NextResponse {
  return NextResponse.json(
    { code: 'md_unauthorized', message: 'Please sign in to follow.' },
    { status: 401 },
  )
}

function fail(err: unknown): NextResponse {
  if (err instanceof DashboardApiError) {
    return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
  }
  console.error('[api/follows]', err)
  return NextResponse.json(
    { code: 'md_internal_error', message: 'Something went wrong.' },
    { status: 500 },
  )
}

function isValidEntity(body: Record<string, unknown>): boolean {
  if (typeof body.entityType !== 'string' || !VALID_ENTITY.has(body.entityType)) return false
  const id = body.entityId
  return typeof id === 'number' || typeof id === 'string'
}

export async function GET(): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) return unauthorized()
  try {
    const result = await wpDashboardFetch<WpFollowsResponse>('/md/v2/follows', { method: 'GET', bearer: token })
    return NextResponse.json(mapFollowsResponse(result))
  } catch (err) {
    return fail(err)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) return unauthorized()

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ code: 'md_invalid_request', message: 'Invalid JSON body.' }, { status: 400 })
  }
  const body = raw as Record<string, unknown>
  if (!body || !isValidEntity(body)) {
    return NextResponse.json({ code: 'md_invalid_request', message: 'Invalid follow payload.' }, { status: 400 })
  }

  const wpBody: Record<string, unknown> = {
    entity_type: body.entityType,
    entity_id: body.entityId,
  }
  if (Array.isArray(body.types)) wpBody.types = body.types

  try {
    const result = await wpDashboardFetch('/md/v2/follows', { method: 'POST', bearer: token, body: wpBody })
    return NextResponse.json(result)
  } catch (err) {
    return fail(err)
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) return unauthorized()

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ code: 'md_invalid_request', message: 'Invalid JSON body.' }, { status: 400 })
  }
  const body = raw as Record<string, unknown>
  if (!body || !isValidEntity(body)) {
    return NextResponse.json({ code: 'md_invalid_request', message: 'Invalid follow payload.' }, { status: 400 })
  }

  try {
    const result = await wpDashboardFetch('/md/v2/follows', {
      method: 'DELETE',
      bearer: token,
      body: { entity_type: body.entityType, entity_id: body.entityId },
    })
    return NextResponse.json(result)
  } catch (err) {
    return fail(err)
  }
}
