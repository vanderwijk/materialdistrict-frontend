/**
 * GA4 `purchase` push for the order-confirmation page.
 * ----------------------------------------------------------------------
 * `dataLayer` typing lives in `google-consent-mode.ts` — reused here, not
 * redeclared. Amounts come from the Store API in minor units; convert with
 * `storeMinorToNumber` before pushing (GA4 wants numbers, never strings).
 *
 * Deduped per order via sessionStorage: a reload or back-navigation to the
 * same `/order-confirmation/{id}` must not push a second `purchase`.
 */

import type { StoreOrder } from '@/lib/api/checkout'
import { storeMinorToNumber } from '@/lib/api/cart'

const TRACKED_KEY_PREFIX = 'md_purchase_tracked_'

function alreadyTracked(orderId: string): boolean {
  try {
    return window.sessionStorage.getItem(TRACKED_KEY_PREFIX + orderId) === '1'
  } catch {
    return false
  }
}

function markTracked(orderId: string): void {
  try {
    window.sessionStorage.setItem(TRACKED_KEY_PREFIX + orderId, '1')
  } catch {
    /* private mode / storage disabled — worst case a repeat push on reload */
  }
}

/**
 * Call only once a confirmed order has actually loaded — never on the
 * "full order details aren't available" fallback, which has no items/totals.
 */
export function trackPurchase(order: StoreOrder): void {
  if (typeof window === 'undefined') return

  const orderId = String(order.id)
  if (alreadyTracked(orderId)) return

  const minor = order.totals.currency_minor_unit ?? 2
  const money = (v?: string) => storeMinorToNumber(v, minor)

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: order.number || orderId,
      value: money(order.totals.total_price),
      currency: order.totals.currency_code,
      tax: money(order.totals.total_tax),
      shipping: money(order.totals.total_shipping),
      items: order.items.map((item) => ({
        // Matches the Merchant Center feed's `g:id` (md-product-feed.php):
        // SKU (ISBN-13 for books), falling back to the WooCommerce product id.
        item_id: item.sku || String(item.id),
        item_name: item.name,
        price: money(item.prices.price),
        quantity: item.quantity,
      })),
    },
  })

  markTracked(orderId)
}
