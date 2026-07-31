'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Post-checkout notices on /membership (`?checkout=…`).
 *
 * - success: payment completed; refresh auth so Insider state appears once
 *   the Stripe webhook has written membership meta on CMS.
 * - cancel / unavailable / error / already: one-shot banners.
 */
export function CheckoutNotice() {
  const params = useSearchParams()
  const router = useRouter()
  const status = params.get('checkout')

  useEffect(() => {
    if (status !== 'success') return

    // Webhook usually lands within a second; refresh twice so CTA flips to Insider.
    const first = window.setTimeout(() => router.refresh(), 800)
    const second = window.setTimeout(() => router.refresh(), 3500)
    return () => {
      window.clearTimeout(first)
      window.clearTimeout(second)
    }
  }, [status, router])

  if (!status) return null

  if (status === 'success') {
    return (
      <div className="form-banner is-success" role="status">
        <strong>Payment received.</strong> Your Insider membership activates
        within a few seconds — this page will update automatically. If it still
        says Free, refresh once.
      </div>
    )
  }

  if (status === 'cancel') {
    return (
      <div className="form-banner" role="status">
        Checkout was cancelled. No charge was made — you can try again whenever
        you like.
      </div>
    )
  }

  if (status === 'already') {
    return (
      <div className="form-banner is-success" role="status">
        You already have an active Insider membership.
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="form-banner is-error" role="alert">
        <strong>Something went wrong starting checkout.</strong> Please try
        again in a moment.
      </div>
    )
  }

  if (status === 'unavailable') {
    return (
      <div className="form-banner is-error" role="alert">
        <strong>Checkout isn&rsquo;t available right now.</strong> Please try
        again in a moment.
      </div>
    )
  }

  return null
}
