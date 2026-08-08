'use client'

/**
 * NotFoundLogger — logs one 404 hit per not-found render.
 * ----------------------------------------------------------------------
 * Mount this (invisible) client component in `app/not-found.tsx`. It sends
 * two independent beacons:
 *
 *   1. Internal events rail — `logEvent` → `/api/events` → WordPress
 *      `/md/v2/events` as `page_not_found` (consent-gated in the EU).
 *   2. Plausible — custom event `404` (always on, cookieless). Needs a
 *      Custom event goal named `404` in the Plausible dashboard to show
 *      under Goals; enable “404 error pages” under Site Installation if
 *      you regenerated the hashed script for that measurement.
 *
 * The referrer is what makes the internal list actionable, so it is
 * classified client-side into three buckets:
 *
 *   internal — came from another page on this site → broken internal link
 *   external — came from Google, a blog, a newsletter → missing redirect
 *   direct   — no referrer at all → typed URL, bookmark, or (mostly) a bot
 *
 * Without that split you get one long list nobody can act on. With it, the
 * external bucket is the redirect worklist for the migration.
 *
 * Best-effort: both beacons swallow their own errors, so a failed log can
 * never affect what the visitor sees.
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { logEvent } from '@/lib/api/events'
import { trackPlausibleEvent } from '@/components/analytics/PlausibleAnalytics'

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
    // Prefer the browser path so soft-404s and trailing-slash variants match
    // what the visitor actually requested (Plausible Top Pages / path prop).
    const path =
      typeof window !== 'undefined' ? window.location.pathname : pathname

    // Plausible goal name must be exactly `404` (see Site settings → Goals).
    // `path` is also sent as a custom prop so property filters work even when
    // the dashboard “404 error pages” measurement is not toggled on.
    trackPlausibleEvent('404', { props: { path: path || '/' } })

    void logEvent({
      eventType: 'page_not_found',
      objectType: 'site',
      source: '404',
      attributes: {
        path: path || pathname,
        referrer_kind: classifyReferrer(referrer, host),
        referrer: safeReferrer(referrer),
      },
    })
  }, [pathname])

  return null
}
