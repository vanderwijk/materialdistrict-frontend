import * as Sentry from '@sentry/nextjs'
import { clientBeforeSend } from '@/lib/sentry/noise-filters'

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
    /Non-Error promise rejection captured with value:\s*(Object|undefined)/,
    /Invalid call to runtime\.sendMessage\(\)/,
    /Failed to execute 'removeChild' on 'Node'/,
    /The object can not be found here/,
    /^Load failed$/,
    /Converting circular structure to JSON/,
    /WordPress fetch failed \(503/,
    /FacetWPError:.*\(503/,
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

  beforeSend: clientBeforeSend,

  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV,
})

// Hook into App Router navigation transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
