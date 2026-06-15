/**
 * Checkout client — WooCommerce Store API (`/wc/store/v1/checkout` + `/order`)
 * ----------------------------------------------------------------------
 * Werkt verder op dezelfde mand-sessie (Cart-Token + Nonce) via `storeRequest`
 * uit de cart-client. De order-fetch op de bevestigingspagina gebruikt de
 * `order_key` als credential (geen mand-token nodig).
 *
 * Geverifieerd tegen productie: `POST /checkout` verwacht top-level
 * `billing_address`, `shipping_address`, `payment_method`, `payment_data`
 * (+ optioneel `customer_note`, `create_account`); retour bevat `order_id`,
 * `order_key`, `payment_result`.
 *
 * Stripe `payment_data`-sleutels: zie `buildStripePaymentData` (afgeleid van
 * block-checkout payment-processor.js).
 */

import { storeRequest, type StoreAddress } from './cart'

export type { StoreAddress }

export interface PaymentDataItem {
  key: string
  value: string | boolean
}

export interface CheckoutPayload {
  billing_address: StoreAddress
  shipping_address: StoreAddress
  payment_method: string
  payment_data: PaymentDataItem[]
  customer_note?: string
}

export type PaymentStatus = 'success' | 'failure' | 'pending' | 'error'

export interface CheckoutResult {
  order_id: number
  order_key: string
  order_number?: string
  status: string
  payment_result: {
    payment_status: PaymentStatus
    redirect_url?: string
    payment_details?: Array<{ key: string; value: string }>
  }
}

export function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  return storeRequest<CheckoutResult>('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// --------------------------------------------------------------------
// Order-bevestiging
// --------------------------------------------------------------------

export interface StoreOrderItem {
  name: string
  quantity: number
  totals: { line_total: string; currency_minor_unit: number }
}

export interface StoreOrder {
  id: number
  number: string
  status: string
  order_key: string
  totals: {
    total_price: string
    total_tax: string
    currency_code: string
    currency_minor_unit: number
    currency_symbol: string
  }
  items: StoreOrderItem[]
  billing_address?: StoreAddress
  shipping_address?: StoreAddress
}

/**
 * Haalt de order op voor de bevestigingspagina. De `order_key` is de credential;
 * `billing_email` is vereist door de Store API (we bewaren 'm bij submit in
 * localStorage, want redirect-gateways geven 'm niet terug in de return-URL).
 */
export function fetchOrder(
  orderId: number | string,
  orderKey: string,
  billingEmail: string,
): Promise<StoreOrder> {
  const path =
    `/order/${encodeURIComponent(String(orderId))}` +
    `?key=${encodeURIComponent(orderKey)}` +
    `&billing_email=${encodeURIComponent(billingEmail)}`

  // Via dezelfde proxy (`/api/store-cart/order/…`). De `order_key` is de
  // credential; een eventueel meegestuurde JWT is onschadelijk.
  return storeRequest<StoreOrder>(path)
}

// --------------------------------------------------------------------
// Bewaar order-email lokaal (voor de fetch op de bevestigingspagina na een
// redirect-gateway, die de e-mail niet in de return-URL teruggeeft).
// --------------------------------------------------------------------

const LAST_ORDER_KEY = 'md_last_order'

export function rememberOrderEmail(orderId: number | string, email: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      LAST_ORDER_KEY,
      JSON.stringify({ orderId: String(orderId), email }),
    )
  } catch {
    /* noop */
  }
}

export function recallOrderEmail(orderId: number | string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LAST_ORDER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { orderId: string; email: string }
    return parsed.orderId === String(orderId) ? parsed.email : null
  } catch {
    return null
  }
}

// --------------------------------------------------------------------
// ⚠️ CAPTURE-AFHANKELIJK — DE ENIGE PLEK DIE NOG BEVESTIGD MOET WORDEN
// --------------------------------------------------------------------
/**
 * Bouwt de `payment_data` voor de officiële WooCommerce Stripe Gateway
 * (deferred-intent UPE-flow). Keys zijn afgeleid van block-checkout
 * (`client/blocks/upe/upe-deferred-intent-creation/payment-processor.js`).
 *
 * `payment_method` in payment_data is verplicht: Store API kopieert payment_data
 * naar `$_POST`, en de gateway leest daar `payment_method` om het UPE-type te
 * bepalen (`stripe` → card, `stripe_ideal` → ideal).
 */
export function buildStripePaymentData(
  paymentMethodId: string,
  gatewayId: string,
  billing?: StoreAddress,
): PaymentDataItem[] {
  const items: PaymentDataItem[] = [
    { key: 'payment_method', value: gatewayId },
    { key: 'wc-stripe-payment-method', value: paymentMethodId },
    { key: 'save_payment_method', value: 'no' },
  ]

  if (billing) {
    items.push(
      { key: 'billing_email', value: billing.email ?? '' },
      { key: 'billing_first_name', value: billing.first_name },
      { key: 'billing_last_name', value: billing.last_name },
      { key: 'billing_address_1', value: billing.address_1 },
      { key: 'billing_address_2', value: billing.address_2 ?? '' },
      { key: 'billing_city', value: billing.city },
      { key: 'billing_state', value: billing.state ?? '' },
      { key: 'billing_postcode', value: billing.postcode },
      { key: 'billing_country', value: billing.country },
    )
  }

  return items
}

/** Stripe-gateway-id's (zoals WC ze registreert). */
export const STRIPE_CARD_METHOD = 'stripe'
export const STRIPE_IDEAL_METHOD = 'stripe_ideal'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [STRIPE_CARD_METHOD]: 'Credit or debit card',
  [STRIPE_IDEAL_METHOD]: 'iDEAL',
  'ppcp-gateway': 'PayPal',
}

/** Leesbare label voor een Store-API `payment_methods`-id. */
export function paymentMethodLabel(id: string): string {
  return PAYMENT_METHOD_LABELS[id] ?? id
}

/** Stripe-kaart/iDEAL/PayPal — alles wat we in checkout ondersteunen. */
export function isSupportedCheckoutPaymentMethod(id: string): boolean {
  return id === STRIPE_CARD_METHOD || id === STRIPE_IDEAL_METHOD || id === 'ppcp-gateway'
}
