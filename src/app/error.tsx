'use client'

/**
 * §INCIDENT-02-09 — root error boundary.
 *
 * ChunkLoadError: tijdens CMS-storing of midden in een deploy kan Vercel 429
 * geven op `/_next/static/` chunks. Eén automatische herlaad per sessie; daarna
 * een leesbare melding.
 *
 * Lege renders: `assertRenderable` weigert een pagina zonder kerninhoud te
 * cachen — die fout landt hier als tijdelijke storing, niet als kapotte site.
 */

import * as Sentry from '@sentry/nextjs'
import { useEffect, useState } from 'react'

const RELOAD_FLAG = 'md-chunk-reload-attempted'

function isChunkLoadError(error: Error): boolean {
  const name = error.name ?? ''
  const message = error.message ?? ''
  return (
    name === 'ChunkLoadError' ||
    /loading chunk \S+ failed/i.test(message) ||
    /failed to load chunk/i.test(message) ||
    /importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  )
}

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    if (!isChunkLoadError(error)) {
      Sentry.captureException(error)
      return
    }

    let alreadyTried = true
    try {
      alreadyTried = window.sessionStorage.getItem(RELOAD_FLAG) === '1'
      if (!alreadyTried) {
        window.sessionStorage.setItem(RELOAD_FLAG, '1')
      }
    } catch {
      alreadyTried = true
    }

    if (alreadyTried) {
      Sentry.captureException(error, {
        tags: { chunk_reload: 'already_attempted' },
      })
      return
    }

    Sentry.captureException(error, { tags: { chunk_reload: 'auto' } })
    setRecovering(true)
    window.location.reload()
  }, [error])

  useEffect(() => {
    if (recovering) return
    try {
      window.sessionStorage.removeItem(RELOAD_FLAG)
    } catch {
      // storage niet beschikbaar
    }
  }, [recovering])

  if (recovering) {
    return (
      <div className="ov-wrap-single">
        <div className="ov-page-header">
          <div className="ov-page-header-main">
            <h1 className="t-display-lg">One moment</h1>
            <p className="t-body">Reloading the page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ov-wrap-single">
      <div className="ov-page-header">
        <div className="ov-page-header-main">
          <h1 className="t-display-lg">This page is temporarily unavailable</h1>
          <p className="t-body">
            Something went wrong while loading this page. This is usually
            temporary — please try again in a moment.
          </p>
          <p className="t-body">
            <button type="button" className="btn btn-primary" onClick={reset}>
              Try again
            </button>
          </p>
          {error.digest ? (
            <p className="t-meta">Reference: {error.digest}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
