/**
 * GET  /api/dashboard/bookmarks   — list the signed-in user's bookmarks.
 *                                    Used by the public-site BookmarksProvider
 *                                    to hydrate the saved-state once per session.
 * POST /api/dashboard/bookmarks   — create a bookmark. Body `{ type, itemId }`.
 *                                    Returns the created `BookmarkItem`.
 *
 * (DELETE lives in `[id]/route.ts` — removal is keyed on the bookmark record id.)
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapBookmark, mapBookmarks, toWpBookmark } from '@/lib/dashboard/mappers'
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

export async function GET(): Promise<NextResponse> {
  const { token, error } = await getTokenOr401()
  if (error) return error
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBookmarks>[0]>(
      '/md/v2/dashboard/bookmarks',
      { method: 'GET', bearer: token },
    )
    return NextResponse.json(mapBookmarks(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'bookmarks')
  }
}

export async function POST(request: Request): Promise<NextResponse> {
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
    const raw = await wpDashboardFetch<Parameters<typeof mapBookmark>[0]>(
      '/md/v2/dashboard/bookmarks',
      {
        method: 'POST',
        bearer: token,
        body: toWpBookmark({ type: body.type as BookmarkType, itemId: body.itemId }),
      },
    )
    return NextResponse.json(mapBookmark(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'bookmarks')
  }
}
