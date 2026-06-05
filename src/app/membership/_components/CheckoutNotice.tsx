'use client'

import { useSearchParams } from 'next/navigation'

/**
 * One-off notice on /membership when the checkout couldn't start and bounced
 * back here (`?checkout=unavailable`) — e.g. a transient Stripe/back-end issue.
 *
 * A small client island so the public membership page stays statically
 * rendered (SEO); it reads the query param on the client. Wrap in <Suspense>
 * at the call site, as required for useSearchParams.
 */
export function CheckoutNotice() {
  const params = useSearchParams()
  if (params.get('checkout') !== 'unavailable') return null
  return (
    <div className="form-banner is-error" role="alert">
      <strong>Checkout isn&rsquo;t available right now.</strong> Please try again
      in a moment.
    </div>
  )
}
