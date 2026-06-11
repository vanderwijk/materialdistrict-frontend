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
  error: string | null
  addItem: (id: number, quantity?: number) => Promise<void>
  updateItem: (key: string, quantity: number) => Promise<void>
  removeItem: (key: string) => Promise<void>
  applyCouponCode: (code: string) => Promise<void>
  removeCouponCode: (code: string) => Promise<void>
  setCustomer: (shipping: StoreAddress, billing?: StoreAddress) => Promise<void>
  selectShipping: (rateId: string) => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [loading, setLoading] = useState(false)
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
  useEffect(() => {
    if (!hasCartToken()) return
    run(fetchCart).catch(() => {
      /* stille mislukking — lege mand is een prima beginstaat */
    })
  }, [run])

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
      error,
      addItem,
      updateItem,
      removeItem,
      applyCouponCode,
      removeCouponCode,
      setCustomer,
      selectShipping,
      refresh,
    }),
    [
      cart,
      itemCount,
      loading,
      error,
      addItem,
      updateItem,
      removeItem,
      applyCouponCode,
      removeCouponCode,
      setCustomer,
      selectShipping,
      refresh,
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
