/**
 * PATCH  /api/dashboard/boards/[id] — rename a board. Body `{ name }`.
 * DELETE /api/dashboard/boards/[id] — delete a board (204 → `{ ok: true }`).
 */

import { NextResponse } from 'next/server'
import { wpDashboardFetch } from '@/lib/api/dashboard'
import { mapBoard, toWpBoard } from '@/lib/dashboard/mappers'
import { getTokenOr401, dashboardError } from '@/lib/api/dashboard-proxy'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
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
      `/md/v2/dashboard/boards/${encodeURIComponent(id)}`,
      { method: 'PATCH', bearer: token, body: toWpBoard(name.trim()) },
    )
    return NextResponse.json(mapBoard(raw), { status: 200 })
  } catch (err) {
    return dashboardError(err, 'boards')
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const { token, error } = await getTokenOr401()
  if (error) return error
  try {
    await wpDashboardFetch(`/md/v2/dashboard/boards/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      bearer: token,
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return dashboardError(err, 'boards')
  }
}
