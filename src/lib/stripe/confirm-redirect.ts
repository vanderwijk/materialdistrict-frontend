/**
 * Post-checkout Stripe redirect handling for WooCommerce Stripe Gateway.
 *
 * The gateway returns either:
 *  - a full bank URL (`redirect_to_url` next action), or
 *  - a hash like `#wc-stripe-confirm-pi:{order_id}:{client_secret}:{nonce}`
 *    that requires client-side `confirmPayment()` before the bank redirect.
 *
 * Mirrors the block-checkout flow in woocommerce-gateway-stripe
 * (`client/api/index.js` → `confirmIntent`).
 */

import type { Stripe } from '@stripe/stripe-js'

const CONFIRM_HASH =
  /^#wc-stripe-confirm-(pi|si):([^:]+):([^:]+):(.+)$/

export interface StripeConfirmOptions {
  /** Fallback when the server already completed payment without redirect. */
  fallbackReturnUrl: string
}

/**
 * Resolves a WooCommerce Stripe `payment_result.redirect_url` to a URL the
 * browser should navigate to. May call Stripe.js and the WC update-order AJAX
 * endpoint before returning.
 */
export async function resolveStripeCheckoutRedirect(
  stripe: Stripe,
  redirectUrl: string,
  options: StripeConfirmOptions,
): Promise<string> {
  const trimmed = redirectUrl.trim()
  if (!trimmed) {
    throw new Error('Missing payment redirect URL.')
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const match = trimmed.match(CONFIRM_HASH)
  if (!match) {
    throw new Error('Unsupported payment redirect format.')
  }

  const isSetupIntent = match[1] === 'si'
  const orderId = match[2]
  const clientSecret = match[3]
  const nonce = match[4]

  const confirmArgs = {
    clientSecret,
    redirect: 'if_required' as const,
    confirmParams: {
      return_url: options.fallbackReturnUrl,
    },
  }

  const result = isSetupIntent
    ? await stripe.confirmSetup(confirmArgs)
    : await stripe.confirmPayment(confirmArgs)

  if (result.error) {
    throw new Error(result.error.message ?? 'Payment confirmation failed.')
  }

  const intentId =
    ('paymentIntent' in result && result.paymentIntent?.id) ||
    ('setupIntent' in result && result.setupIntent?.id) ||
    ''

  return updateStripeOrderStatus(orderId, intentId, nonce, options.fallbackReturnUrl)
}

async function updateStripeOrderStatus(
  orderId: string,
  intentId: string,
  nonce: string,
  fallbackReturnUrl: string,
): Promise<string> {
  const body = new URLSearchParams({
    order_id: orderId,
    intent_id: intentId,
    payment_method_id: '',
    _ajax_nonce: nonce,
  })

  const res = await fetch('/api/stripe/update-order-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  let data: { success?: boolean; data?: { return_url?: string; error?: { message?: string } } }
  try {
    data = (await res.json()) as typeof data
  } catch {
    throw new Error('Could not verify payment status.')
  }

  if (!res.ok || !data.success) {
    const message = data.data?.error?.message
    throw new Error(message ?? 'Could not verify payment status.')
  }

  return data.data?.return_url ?? fallbackReturnUrl
}
