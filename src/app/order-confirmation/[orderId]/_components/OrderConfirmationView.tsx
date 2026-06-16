'use client'

/**
 * OrderConfirmationView — haalt de order op met de `order_key` (credential) +
 * de bij submit lokaal bewaarde e-mail. Na succes wordt de mand-sessie geleegd.
 *
 * Fallbacks:
 *  - geen lokale e-mail (bv. terugkomst op een ander apparaat) → minimale
 *    bevestiging op ordernummer.
 *  - fetch-fout → nette foutstaat met het ordernummer.
 */

import { useEffect, useState } from 'react'
import { clearCartSession, storeMinorToNumber } from '@/lib/api/cart'
import { fetchOrder, recallOrderEmail, type StoreOrder } from '@/lib/api/checkout'
import { formatEur } from '@/lib/utils/format-price'

type Phase = 'loading' | 'ok' | 'noemail' | 'error'

export function OrderConfirmationView({
  orderId,
  orderKey,
}: {
  orderId: string
  orderKey: string
}) {
  const [order, setOrder] = useState<StoreOrder | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')

  useEffect(() => {
    const email = recallOrderEmail(orderId)
    if (!email) {
      setPhase('noemail')
      clearCartSession()
      return
    }
    let active = true
    fetchOrder(orderId, orderKey, email)
      .then((o) => {
        if (!active) return
        setOrder(o)
        setPhase('ok')
        clearCartSession()
      })
      .catch(() => {
        if (active) setPhase('error')
      })
    return () => {
      active = false
    }
  }, [orderId, orderKey])

  if (phase === 'loading') {
    return <p className="confirm-loading">Loading your order…</p>
  }

  if (phase === 'noemail') {
    return (
      <div className="confirm-card">
        <h1 className="confirm-title">Order #{orderId} received</h1>
        <p className="confirm-lead">
          Thank you. A confirmation has been emailed to you. Full order details
          aren&apos;t available in this browser session.
        </p>
        <a className="confirm-link" href="/book">
          Continue browsing<span aria-hidden="true"> →</span>
        </a>
      </div>
    )
  }

  if (phase === 'error' || !order) {
    return (
      <div className="confirm-card">
        <h1 className="confirm-title">We couldn&apos;t load order #{orderId}</h1>
        <p className="confirm-lead">
          Your payment may still have gone through — please check your email for
          a confirmation. If you need help, contact us with order #{orderId}.
        </p>
        <a className="confirm-link" href="/book">
          Continue browsing<span aria-hidden="true"> →</span>
        </a>
      </div>
    )
  }

  const minor = order.totals.currency_minor_unit ?? 2
  const money = (v?: string) => formatEur(storeMinorToNumber(v, minor))

  return (
    <div className="confirm-card">
      <div className="confirm-check" aria-hidden="true">
        ✓
      </div>
      <h1 className="confirm-title">Thank you for your order</h1>
      <p className="confirm-lead">
        Order <strong>#{order.number || orderId}</strong> is confirmed. A receipt
        has been sent to your email.
      </p>

      <div className="confirm-items">
        {order.items.map((item, i) => (
          <div key={`${item.name}-${i}`} className="confirm-item">
            <span className="confirm-item-qty">{item.quantity}×</span>
            <span className="confirm-item-name">{item.name}</span>
            <span className="confirm-item-amount">
              {money(item.totals.line_total)}
            </span>
          </div>
        ))}
      </div>

      <div className="confirm-total">
        <span>Total</span>
        <span>{money(order.totals.total_price)}</span>
      </div>

      <a className="confirm-link" href="/book">
        Continue browsing<span aria-hidden="true"> →</span>
      </a>
    </div>
  )
}
