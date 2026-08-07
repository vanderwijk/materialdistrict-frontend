import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SentryDebugClient } from './_components/SentryDebugClient'

/**
 * Temporary verification page for client-side Sentry.
 * DELETE after the first browser event is confirmed in Sentry Issues.
 *
 * GET /sentry-debug/?token=<SENTRY_TEST_TOKEN>
 */
export const metadata: Metadata = {
  title: 'Sentry debug',
  robots: { index: false, follow: false },
}

export default async function SentryDebugPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const expected = process.env.SENTRY_TEST_TOKEN
  if (!expected) {
    notFound()
  }

  const { token } = await searchParams
  if (token !== expected) {
    notFound()
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Sentry browser debug</h1>
      <p>
        Use a button below. Console <code>ReferenceError</code>s from DevTools
        are sandboxed and will not appear in Sentry.
      </p>
      <SentryDebugClient />
    </main>
  )
}
