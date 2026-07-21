/**
 * POST   /api/dashboard/boards/[id]/items — add a content item to a board
 * DELETE /api/dashboard/boards/[id]/items — remove a content item from a board
 * (Insider). Body `{ type, itemId }`. POST returns the updated `Board`.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapBoard } from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'
import type { BookmarkType } from '@/types/dashboard'

const ALLOWED_TYPES: ReadonlySet<string> = new Set<BookmarkType>([
  'materials',
  'articles',
  'brands',
  'talks',
  'events',
  'books',
])

function parseItemBody(body: { type?: string; itemId?: number }) {
  if (!body.type || !ALLOWED_TYPES.has(body.type) || typeof body.itemId !== 'number') {
    return null
  }
  return { type: body.type as BookmarkType, itemId: body.itemId }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const { token, error } = await getTokenOr401()
  if (error) return error

  let body: { type?: string; itemId?: number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const parsed = parseItemBody(body)
  if (!parsed) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A valid type and itemId are required.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBoard>[0]>(
      `/md/v2/dashboard/boards/${encodeURIComponent(id)}/items`,
      { method: 'POST', bearer: token, body: { type: parsed.type, item_id: parsed.itemId } },
    )
    return NextResponse.json(mapBoard(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'boards')
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const { token, error } = await getTokenOr401()
  if (error) return error

  let body: { type?: string; itemId?: number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const parsed = parseItemBody(body)
  if (!parsed) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A valid type and itemId are required.' },
      { status: 400 },
    )
  }

  try {
    await wpDashboardFetch(
      `/md/v2/dashboard/boards/${encodeURIComponent(id)}/items`,
      { method: 'DELETE', bearer: token, body: { type: parsed.type, item_id: parsed.itemId } },
    )
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'boards')
  }
}
