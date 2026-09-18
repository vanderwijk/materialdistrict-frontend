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

import type { StoreOrder, StoreOrderItem } from '@/lib/api/checkout'
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

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * `prices.price` is the catalog price — wrong once a coupon applies (coupons
 * discount per line, e.g. `bookshops40%off`). The actual amount paid per unit
 * is derived from the line totals instead: `line_total`/`line_total_tax` is
 * what's left after the coupon, `line_subtotal`/`line_subtotal_tax` is before
 * it, so their difference is the discount. Falls back to `prices.price` (no
 * discount) if an order predates these totals fields.
 */
function itemPriceAndDiscount(
  item: StoreOrderItem,
  minor: number,
): { price: number; discount: number } {
  const { line_total, line_total_tax, line_subtotal, line_subtotal_tax } = item.totals
  if (line_subtotal === undefined || line_subtotal_tax === undefined || line_total_tax === undefined) {
    return { price: storeMinorToNumber(item.prices.price, minor), discount: 0 }
  }

  const paid = storeMinorToNumber(line_total, minor) + storeMinorToNumber(line_total_tax, minor)
  const catalog = storeMinorToNumber(line_subtotal, minor) + storeMinorToNumber(line_subtotal_tax, minor)

  return {
    price: round2(paid / item.quantity),
    discount: round2((catalog - paid) / item.quantity),
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
  const coupon = order.coupons?.[0]?.code

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
      ...(coupon ? { coupon } : {}),
      items: order.items.map((item) => {
        const { price, discount } = itemPriceAndDiscount(item, minor)
        return {
          // Matches the Merchant Center feed's `g:id` (md-product-feed.php):
          // SKU (ISBN-13 for books), falling back to the WooCommerce product id.
          item_id: item.sku || String(item.id),
          item_name: item.name,
          price,
          quantity: item.quantity,
          discount,
        }
      }),
    },
  })

  markTracked(orderId)
}
