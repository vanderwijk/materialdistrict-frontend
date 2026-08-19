import * as Sentry from '@sentry/nextjs'
import { serverBeforeSend } from './src/lib/sentry/noise-filters'

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Local variables can contain fetch Response / Request graphs that make
  // Sentry's serializer throw "Converting circular structure to JSON".
  includeLocalVariables: false,

  enableLogs: true,

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  beforeSend: serverBeforeSend,
})
