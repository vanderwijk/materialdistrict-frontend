/**
 * WooCommerce Store API — cart client (headless, client-side)
 * ----------------------------------------------------------------------
 * Verzorgt de winkelmand via `/wc/store/v1/cart*`. Sessie loopt via een
 * **Cart-Token** (NIET cookies): de eerste call levert het token + een Nonce
 * in de response-headers; we bewaren het token in localStorage en sturen
 * token + nonce mee op elke volgende call. Geverifieerd tegen productie
 * (GET cart → 200 + token/nonce; POST add-item → 201).
 *
 * Requests lopen via de same-origin proxy `/api/store-cart` zodat de HttpOnly
 * JWT wordt meegestuurd (Insider-korting in de mand). Cart-Token blijft
 * client-side in localStorage.
 *
 * Bedragen komen uit de Store API in minor-units (string). Nooit zelf prijzen
 * herberekenen — render de totalen/tax/shipping uit de response.
 */

const TOKEN_KEY = 'md_cart_token'

/** Nonce wordt per response ververst; in-memory volstaat. */
let nonce: string | null = null

function storeBase(): string {
  return '/api/store-cart'
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function setToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* private mode / storage disabled — cart blijft per-request werken */
  }
}

/** Heeft deze browser al een winkelmand-sessie? (Voor lazy bootstrap.) */
export function hasCartToken(): boolean {
  return getToken() !== null
}

/** Cart-Token voor server-side merge na inloggen op checkout. */
export function getCartToken(): string | null {
  return getToken()
}

export function clearCartSession(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* noop */
    }
  }
  nonce = null
}

function captureHeaders(res: Response): void {
  const token = res.headers.get('Cart-Token')
  if (token) setToken(token)
  const freshNonce = res.headers.get('Nonce')
  if (freshNonce) nonce = freshNonce
}

export class CartError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'CartError'
    this.status = status
  }
}

async function cartFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Cart-Token'] = token
  if (nonce) headers['Nonce'] = nonce

  const res = await fetch(`${storeBase()}${path}`, {
    ...init,
    headers: { ...headers, ...((init?.headers as Record<string, string>) ?? {}) },
    credentials: 'include',
  })

  captureHeaders(res)

  if (!res.ok) {
    let message = `Cart request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) message = String(body.message)
    } catch {
      /* geen JSON-body */
    }
    throw new CartError(message, res.status)
  }

  return (await res.json()) as T
}

/**
 * Store API mutations need a Cart-Token. After checkout we clear the token;
 * GET /cart bootstraps a fresh session (also recovers stale tokens on 401).
 */
async function ensureCartSession(): Promise<void> {
  if (getToken()) return
  await cartFetch<StoreCart>('/cart')
}

async function cartMutate<T>(path: string, init: RequestInit): Promise<T> {
  await ensureCartSession()
  try {
    return await cartFetch<T>(path, init)
  } catch (err) {
    if (err instanceof CartError && err.status === 401) {
      clearCartSession()
      await cartFetch<StoreCart>('/cart')
      return cartFetch<T>(path, init)
    }
    throw err
  }
}

// --------------------------------------------------------------------
// Types (subset van de Store-API-cart die we renderen)
// --------------------------------------------------------------------

export interface StoreImage {
  src: string
  thumbnail?: string
  alt?: string
}

export interface StoreMonetary {
  currency_code: string
  currency_minor_unit: number
  currency_symbol: string
}

export interface StoreCartItem {
  key: string
  id: number
  quantity: number
  name: string
  permalink: string
  short_description?: string
  images: StoreImage[]
  prices: StoreMonetary & { price: string }
  totals: StoreMonetary & { line_total: string; line_subtotal: string }
}

export interface StoreShippingRate {
  rate_id: string
  name: string
  price: string
  currency_minor_unit: number
  selected: boolean
}

export interface StoreCartTotals extends StoreMonetary {
  total_items: string
  total_price: string
  total_tax: string
  total_shipping?: string
  total_discount?: string
}

export interface StoreCartCoupon {
  code: string
  totals: { total_discount: string }
}

export interface StoreCart {
  items: StoreCartItem[]
  items_count: number
  needs_shipping: boolean
  totals: StoreCartTotals
  coupons: StoreCartCoupon[]
  shipping_rates: Array<{ shipping_rates: StoreShippingRate[] }>
}

// --------------------------------------------------------------------
// Endpoints
// --------------------------------------------------------------------

export function fetchCart(): Promise<StoreCart> {
  return cartFetch<StoreCart>('/cart')
}

export function addToCart(id: number, quantity = 1): Promise<StoreCart> {
  return cartMutate<StoreCart>('/cart/add-item', {
    method: 'POST',
    body: JSON.stringify({ id, quantity }),
  })
}

export function updateCartItem(key: string, quantity: number): Promise<StoreCart> {
  return cartMutate<StoreCart>('/cart/update-item', {
    method: 'POST',
    body: JSON.stringify({ key, quantity }),
  })
}

export function removeCartItem(key: string): Promise<StoreCart> {
  return cartMutate<StoreCart>('/cart/remove-item', {
    method: 'POST',
    body: JSON.stringify({ key }),
  })
}

export function applyCoupon(code: string): Promise<StoreCart> {
  return cartMutate<StoreCart>('/cart/apply-coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function removeCoupon(code: string): Promise<StoreCart> {
  return cartMutate<StoreCart>('/cart/remove-coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

/**
 * Adres-shape voor `update-customer` en de checkout. `email`/`phone` horen bij
 * het billing-adres in de checkout-body.
 */
export interface StoreAddress {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  state?: string
  postcode: string
  country: string
  email?: string
  phone?: string
}

/**
 * Zet het (verzend)adres → de Store API rekent verzendtarieven per zone uit en
 * geeft ze terug in `shipping_rates`. Optioneel ook het billing-adres meesturen.
 */
export function updateCustomer(
  shippingAddress: StoreAddress,
  billingAddress?: StoreAddress,
): Promise<StoreCart> {
  return cartMutate<StoreCart>('/cart/update-customer', {
    method: 'POST',
    body: JSON.stringify({
      shipping_address: shippingAddress,
      ...(billingAddress ? { billing_address: billingAddress } : {}),
    }),
  })
}

export function selectShippingRate(rateId: string): Promise<StoreCart> {
  return cartMutate<StoreCart>('/cart/select-shipping-rate', {
    method: 'POST',
    body: JSON.stringify({ rate_id: rateId }),
  })
}

/**
 * Herbruikbare authed Store-API-call via dezelfde proxy + sessie (Cart-Token +
 * Nonce + JWT). De checkout-module gebruikt dit voor `/checkout` en `/order/*`
 * — één client, één proxy (conform Johans voorkeur).
 */
export function storeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') {
    return cartFetch<T>(path, init)
  }
  return cartMutate<T>(path, { ...init, method })
}

/** Minor-units string ("2350") → euro-getal (23.5). */
export function storeMinorToNumber(
  value: string | undefined,
  minorUnit = 2,
): number {
  if (!value) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n / 10 ** minorUnit : 0
}
