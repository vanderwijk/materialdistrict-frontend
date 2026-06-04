/**
 * GET  /api/dashboard/boards — list the signed-in user's boards (Insider).
 *                              Used by the BoardPickerModal.
 * POST /api/dashboard/boards — create a board (Insider). Body `{ name }`.
 *                              Returns the new `Board`.
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapBoard, mapBoards, toWpBoard } from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function GET(): Promise<NextResponse> {
  const { token, error } = await getTokenOr401()
  if (error) return error
  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBoards>[0]>(
      '/md/v2/dashboard/boards',
      { method: 'GET', bearer: token },
    )
    return NextResponse.json(mapBoards(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'boards')
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const { token, error } = await getTokenOr401()
  if (error) return error

  let name: unknown
  try {
    name = ((await request.json()) as { name?: unknown }).name
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A board name is required.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapBoard>[0]>(
      '/md/v2/dashboard/boards',
      { method: 'POST', bearer: token, body: toWpBoard(name.trim()) },
    )
    return NextResponse.json(mapBoard(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'boards')
  }
}
