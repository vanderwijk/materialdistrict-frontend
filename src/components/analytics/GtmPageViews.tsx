'use client'

/**
 * GtmPageViews — virtual pageviews on App Router navigations.
 * ----------------------------------------------------------------------
 * The GTM snippet in `layout.tsx` covers the first load (`gtm.js`). Next.js
 * then changes the URL with the History API, which the old WordPress
 * container never saw. This pushes a `page_view` event on subsequent
 * route changes so GA4 / GTM can track them (Custom Event trigger: page_view).
 *
 * The first render is skipped to avoid double-counting the initial hit.
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function GtmPageViews() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    const id = window.setTimeout(() => {
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({
        event: 'page_view',
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      })
    }, 0)

    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}
