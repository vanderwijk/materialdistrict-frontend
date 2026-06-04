/**
 * POST /api/dashboard/boards/[id]/items — add a content item to a board
 * (Insider). Body `{ type, itemId }`. Returns the updated `Board`.
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
  if (!body.type || !ALLOWED_TYPES.has(body.type) || typeof body.itemId !== 'number') {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A valid type and itemId are required.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBoard>[0]>(
      `/md/v2/dashboard/boards/${encodeURIComponent(id)}/items`,
      { method: 'POST', bearer: token, body: { type: body.type, item_id: body.itemId } },
    )
    return NextResponse.json(mapBoard(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'boards')
  }
}
