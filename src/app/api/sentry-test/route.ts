import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

/**
 * Temporary verification endpoint for Sentry wiring.
 * DELETE after the first error is confirmed in the Sentry Issues UI.
 *
 * GET /api/sentry-test/?token=<SENTRY_TEST_TOKEN>
 */
export async function GET(request: Request) {
  const expected = process.env.SENTRY_TEST_TOKEN
  if (!expected) {
    return NextResponse.json(
      { error: 'SENTRY_TEST_TOKEN is not configured.' },
      { status: 404 },
    )
  }

  const token = new URL(request.url).searchParams.get('token')
  if (token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const err = new Error('Sentry test error — delete /api/sentry-test after verify')
  Sentry.captureException(err)
  throw err
}
