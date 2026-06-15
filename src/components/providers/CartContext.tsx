'use client'

/**
 * CartContext — winkelmand-state voor de headless storefront.
 *
 * Wraps de Store-API-cart-client in React-state. Lazy bootstrap: alleen als de
 * browser al een Cart-Token heeft (terugkerende shopper) halen we bij mount de
 * mand op — bezoekers die nooit shoppen veroorzaken dus geen cart-request.
 *
 * Alle mutaties gaan via `run`, dat loading/error centraal beheert en de
 * nieuwe mand (uit de Store-API-response) in state zet. Prijzen/totalen komen
 * altijd uit de response; we rekenen niets zelf na.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  addToCart,
  applyCoupon,
  clearCartSession,
  fetchCart,
  hasCartToken,
  removeCartItem,
  removeCoupon,
  selectShippingRate,
  updateCartItem,
  updateCustomer,
  type StoreAddress,
  type StoreCart,
} from '@/lib/api/cart'

interface CartContextValue {
  cart: StoreCart | null
  itemCount: number
  loading: boolean
  /** False tot de eerste mand-bootstrap klaar is (token-fetch óf "geen token"). */
  initialized: boolean
  error: string | null
  addItem: (id: number, quantity?: number) => Promise<void>
  updateItem: (key: string, quantity: number) => Promise<void>
  removeItem: (key: string) => Promise<void>
  applyCouponCode: (code: string) => Promise<void>
  removeCouponCode: (code: string) => Promise<void>
  setCustomer: (shipping: StoreAddress, billing?: StoreAddress) => Promise<void>
  selectShipping: (rateId: string) => Promise<void>
  refresh: () => Promise<void>
  /** Leegt de mand-sessie (token) + state ná een geplaatste order. */
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (op: () => Promise<StoreCart>) => {
    setLoading(true)
    setError(null)
    try {
      const next = await op()
      setCart(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Lazy bootstrap: alleen voor terugkerende shoppers met een bestaand token.
  // `initialized` gaat altijd op true zodra de bootstrap-beslissing rond is —
  // ook zonder token — zodat de checkout de laad-staat van de leeg-staat kan
  // onderscheiden (geen "mandje is leeg"-flits tijdens het ophalen).
  useEffect(() => {
    if (!hasCartToken()) {
      setInitialized(true)
      return
    }
    run(fetchCart)
      .catch(() => {
        clearCartSession()
      })
      .finally(() => setInitialized(true))
  }, [run])

  const clearCart = useCallback(() => {
    // Ná een geplaatste order: de server-side mand is de order geworden.
    // Token + nonce wissen en de client-state legen; een volgende add-to-cart
    // bootstrapt vanzelf een verse sessie.
    clearCartSession()
    setCart(null)
    setError(null)
  }, [])

  const addItem = useCallback(
    (id: number, quantity = 1) => run(() => addToCart(id, quantity)),
    [run],
  )
  const updateItem = useCallback(
    (key: string, quantity: number) => run(() => updateCartItem(key, quantity)),
    [run],
  )
  const removeItem = useCallback(
    (key: string) => run(() => removeCartItem(key)),
    [run],
  )
  const applyCouponCode = useCallback(
    (code: string) => run(() => applyCoupon(code)),
    [run],
  )
  const removeCouponCode = useCallback(
    (code: string) => run(() => removeCoupon(code)),
    [run],
  )
  const setCustomer = useCallback(
    (shipping: StoreAddress, billing?: StoreAddress) =>
      run(() => updateCustomer(shipping, billing)),
    [run],
  )
  const selectShipping = useCallback(
    (rateId: string) => run(() => selectShippingRate(rateId)),
    [run],
  )
  const refresh = useCallback(() => run(fetchCart), [run])

  const itemCount = cart?.items_count ?? 0

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      loading,
      initialized,
      error,
      addItem,
      updateItem,
      removeItem,
      applyCouponCode,
      removeCouponCode,
      setCustomer,
      selectShipping,
      refresh,
      clearCart,
    }),
    [
      cart,
      itemCount,
      loading,
      initialized,
      error,
      addItem,
      updateItem,
      removeItem,
      applyCouponCode,
      removeCouponCode,
      setCustomer,
      selectShipping,
      refresh,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
