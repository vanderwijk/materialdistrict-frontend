/**
 * `/checkout` — afrekenpagina (all-NextJS order-flow). Niet indexeerbaar.
 * Dunne server-wrapper rond de client-`CheckoutView`. Dit is ook de
 * cancel/failure-return-route voor redirect-gateways (handoff §4.3).
 */

import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { getCheckoutPrefill } from '@/lib/checkout/prefill'
import { CheckoutView } from './_components/CheckoutView'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const prefill = await getCheckoutPrefill()

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb
            items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]}
          />
          <h1 className="t-display-lg">Checkout</h1>
        </div>
      </header>

      <div className="ov-wrap-single">
        <CheckoutView prefill={prefill} />
      </div>
    </>
  )
}
