'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconAlert } from '@/components/ui/icons'

/**
 * Error boundary for the whole dashboard segment. Now that panels do real
 * network reads, an unexpected failure (a 500, a dropped connection) renders
 * this friendly state inside the dashboard shell — with a retry — instead of a
 * hard crash. `notFound()` and auth redirects are not errors, so they still
 * behave as before (404 / sign-in).
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard] render error:', error)
  }, [error])

  return (
    <div className="dash-panel">
      <EmptyState
        icon={<IconAlert size={28} />}
        title="Something went wrong"
        description="We couldn't load this part of your dashboard. This is usually temporary — please try again."
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={() => reset()}>
              Try again
            </button>
            <Link href="/dashboard/profile" className="btn btn-outline">
              Back to dashboard
            </Link>
          </>
        }
      />
    </div>
  )
}
