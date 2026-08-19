import * as Sentry from '@sentry/nextjs'
import { shouldDropRequestError } from '@/lib/sentry/noise-filters'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Captures unhandled server-side request errors (App Router).
// Drop CMS upstream saturation (503/502) — tracked in infra, not app bugs.
export const onRequestError: typeof Sentry.captureRequestError = (
  error,
  request,
  context,
) => {
  if (shouldDropRequestError(error)) return
  return Sentry.captureRequestError(error, request, context)
}
