'use client'

import * as Sentry from '@sentry/nextjs'
import { useState } from 'react'

/**
 * Temporary client harness — console-thrown errors are sandboxed by the
 * browser and never reach Sentry. Use these buttons instead.
 */
export function SentryDebugClient() {
  const [lastCapture, setLastCapture] = useState<string | null>(null)

  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
      <button
        type="button"
        onClick={() => {
          const id = Sentry.captureException(
            new Error('Sentry browser captureException test'),
          )
          setLastCapture(id)
        }}
      >
        captureException (safe)
      </button>

      <button
        type="button"
        onClick={() => {
          throw new Error('Sentry browser throw test')
        }}
      >
        throw Error (unhandled)
      </button>

      {lastCapture ? (
        <p>
          Event id: <code>{lastCapture}</code> — check Issues in Sentry (filter
          environment / last hour).
        </p>
      ) : null}

      <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
        Network tab should show <code>POST /api/sentry-tunnel/</code> → 200.
        Do not test with <code>myUndefinedFunction()</code> in the console —
        DevTools errors are sandboxed and never reach Sentry.
      </p>
    </div>
  )
}
