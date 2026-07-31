import type { Metadata } from 'next'
import Link from 'next/link'
import { NotFoundLogger } from '@/app/_components/NotFoundLogger'

/**
 * Site-wide 404.
 * ----------------------------------------------------------------------
 * Replaces the Next.js default ("This page could not be found."), which
 * renders outside the site chrome and offers the visitor no way onward.
 *
 * Two jobs:
 *   1. Give the visitor somewhere to go — most 404s after a migration are
 *      old inbound links, not typos, so the visitor had real intent.
 *   2. Log the hit, so the misses become the redirect worklist.
 */

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <NotFoundLogger />
      <main id="main" className="nf-wrap">
        <div className="nf-inner">
          <p className="nf-eyebrow">404</p>
          <h1 className="nf-title">This page has moved or no longer exists</h1>
          <p className="nf-body">
            We rebuilt MaterialDistrict, so some older links no longer resolve.
            The material, story or brand you were looking for is most likely
            still here under a different address.
          </p>

          <div className="nf-actions">
            <Link href="/material/" className="btn btn-primary">
              Browse materials
            </Link>
            <Link href="/article/" className="btn btn-outline">
              Read stories
            </Link>
          </div>

          <p className="nf-help">
            Still stuck? Let us know via the feedback button and we will point
            you to the right page.
          </p>
        </div>
      </main>
    </>
  )
}
