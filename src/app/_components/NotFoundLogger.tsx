'use client'

/**
 * NotFoundLogger — logs one `page_not_found` event per 404 render.
 * ----------------------------------------------------------------------
 * Mount this (invisible) client component in `app/not-found.tsx`. It reuses
 * the shared event rail (`logEvent` → `/api/events` → WordPress
 * `/md/v2/events`), so no new infrastructure is involved. Anonymous-safe:
 * `/api/events` does not require a session.
 *
 * The referrer is what makes this list actionable, so it is classified
 * client-side into three buckets:
 *
 *   internal — came from another page on this site → broken internal link
 *   external — came from Google, a blog, a newsletter → missing redirect
 *   direct   — no referrer at all → typed URL, bookmark, or (mostly) a bot
 *
 * Without that split you get one long list nobody can act on. With it, the
 * external bucket is the redirect worklist for the migration.
 *
 * Best-effort: `logEvent` swallows its own errors, so a failed beacon can
 * never affect what the visitor sees.
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { logEvent } from '@/lib/api/events'

export type ReferrerKind = 'internal' | 'external' | 'direct'

/** Bucket a raw referrer string against the current host. */
export function classifyReferrer(referrer: string, host: string): ReferrerKind {
  if (!referrer) return 'direct'
  try {
    const url = new URL(referrer)
    return url.host === host ? 'internal' : 'external'
  } catch {
    return 'direct'
  }
}

/** Strip a referrer down to origin + pathname — no query strings, no PII. */
function safeReferrer(referrer: string): string {
  if (!referrer) return ''
  try {
    const url = new URL(referrer)
    return `${url.origin}${url.pathname}`
  } catch {
    return ''
  }
}

export function NotFoundLogger() {
  const pathname = usePathname()
  const fired = useRef<string | null>(null)

  useEffect(() => {
    // Guard against React strict-mode double-invoke and against re-firing
    // when only the query string changes.
    if (fired.current === pathname) return
    fired.current = pathname

    const referrer = typeof document !== 'undefined' ? document.referrer : ''
    const host = typeof window !== 'undefined' ? window.location.host : ''

    void logEvent({
      eventType: 'page_not_found',
      objectType: 'site',
      source: '404',
      attributes: {
        path: pathname,
        referrer_kind: classifyReferrer(referrer, host),
        referrer: safeReferrer(referrer),
      },
    })
  }, [pathname])

  return null
}
