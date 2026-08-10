import * as Sentry from '@sentry/nextjs'

type NoiseEvent = {
  request?: { url?: string }
  tags?: Record<string, unknown> | Array<{ key?: string; value?: unknown }>
  exception?: {
    values?: Array<{
      type?: string
      value?: string
      stacktrace?: {
        frames?: Array<{ filename?: string; in_app?: boolean; lineno?: number }>
      }
    }>
  }
}

function eventPageUrl(event: NoiseEvent): string {
  if (typeof event.request?.url === 'string') return event.request.url
  const tags = event.tags
  if (Array.isArray(tags)) {
    const hit = tags.find((t) => t.key === 'url')
    return typeof hit?.value === 'string' ? hit.value : ''
  }
  if (tags && typeof tags === 'object' && typeof tags.url === 'string') {
    return tags.url
  }
  return ''
}

/**
 * Drop browser-extension / in-app-webview / bot noise that is not actionable
 * in our app code. Keep this list specific — do not blanket-ignore React DOM
 * errors without a third-party fingerprint.
 */
function isThirdPartyNoise(event: NoiseEvent): boolean {
  const values = event.exception?.values ?? []
  const message = values
    .map((v) => `${v.type ?? ''} ${v.value ?? ''}`)
    .join('\n')
  const pageUrl = eventPageUrl(event)

  // Google Translate proxy / in-page translator rewrites the DOM and breaks
  // React hydration; stack frames live under translate_http, not our app.
  if (/translate\.goog|translate_http/i.test(pageUrl)) {
    return true
  }

  if (
    /MetaMask|Java object is gone|Failed to connect to MetaMask/i.test(message)
  ) {
    return true
  }

  // Sentry wraps bare DOM Event objects rejected from extensions as:
  // Event `Event` (type=error) captured as promise rejection
  if (/captured as promise rejection/i.test(message)) {
    return true
  }

  // Stack-less RangeError on mobile WebViews — no in-app frames to act on.
  if (
    /Maximum call stack size exceeded/i.test(message) &&
    !values.some((v) =>
      (v.stacktrace?.frames ?? []).some(
        (f) => f.in_app && typeof f.lineno === 'number',
      ),
    )
  ) {
    return true
  }

  const frames = values.flatMap((v) => v.stacktrace?.frames ?? [])
  const filenames = frames.map((f) => f.filename ?? '').join('\n')
  if (
    /chrome-extension:|moz-extension:|safari-extension:|webkit-masked-url:|scripts\/inpage\.js|navigation_performance_logger|translate_http|translate\.goog/i.test(
      filenames,
    )
  ) {
    return true
  }

  return false
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Session Replay: 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,

  integrations: [Sentry.replayIntegration()],

  ignoreErrors: [
    'MetaMask extension not found',
    'Failed to connect to MetaMask',
    'Error invoking postMessage: Java object is gone',
    /Non-Error promise rejection captured with value:\s*Object/,
  ],

  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /scripts\/inpage\.js/i,
    /translate\.goog/i,
    /translate_http/i,
  ],

  beforeSend(event) {
    // Headless browsers / synthetic monitors — not real user sessions.
    const browserName = event.contexts?.browser?.name
    if (
      typeof browserName === 'string' &&
      /HeadlessChrome/i.test(browserName)
    ) {
      return null
    }

    if (isThirdPartyNoise(event)) return null
    return event
  },

  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV,
})

// Hook into App Router navigation transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
