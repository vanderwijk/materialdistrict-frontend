/**
 * `/order-confirmation/{orderId}?key={orderKey}` — post-payment landing.
 * Return-route voor redirect-gateways (handoff §4.3). Niet indexeerbaar.
 * Next 15: `params`/`searchParams` zijn promises → awaiten.
 */

import type { Metadata } from 'next'
import { OrderConfirmationView } from './_components/OrderConfirmationView'

export const metadata: Metadata = {
  title: 'Order confirmation',
  robots: { index: false, follow: false },
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { orderId } = await params
  const sp = await searchParams
  const key = typeof sp.key === 'string' ? sp.key : ''

  return (
    <div className="ov-wrap-single">
      <OrderConfirmationView orderId={orderId} orderKey={key} />
    </div>
  )
}
