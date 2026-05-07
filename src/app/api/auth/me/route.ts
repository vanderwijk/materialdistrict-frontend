import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'

/**
 * GET /api/auth/me
 *
 * Proxyt naar WP `/md/v2/auth/me` via de SSR-helper. Returnt 200 met
 * `{ user: User | null }`. Statuscode is altijd 200 zodat de client niet
 * hoeft te onderscheiden tussen "uitgelogd" en "fout" — beide → user is null.
 */
export async function GET() {
  const user = await getCurrentUser()
  return NextResponse.json({ user }, { status: 200 })
}
