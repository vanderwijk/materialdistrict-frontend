/**
 * Debounce-helpers
 * ----------------------------------------------------------------------
 * - `useDebouncedValue` — laat een waarde "rusten" voordat React 'm doorgeeft.
 *   Klassieke use-case: de gebruiker tikt in een zoekveld; we willen pas
 *   na 250ms stilte een fetch doen, niet na elke toets.
 *
 * - `debounce` — pure functie-versie voor non-React contexten.
 *
 * Beide bewust minimaal — geen leading/trailing-toggles, geen `cancel()`-
 * methode op de hook (de Effect-cleanup doet dat al). Voeg die pas toe
 * wanneer er een echte casus is.
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Hook die de input pas teruggeeft nadat `delay`-ms voorbij zijn zonder
 * dat de waarde wijzigde. Tijdens "tikken" blijft de oude waarde staan.
 *
 * @example
 *   const [search, setSearch] = useState('')
 *   const debounced = useDebouncedValue(search, 250)
 *   useEffect(() => { fetch(...) }, [debounced])
 */
export function useDebouncedValue<T>(value: T, delay: number = 250): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    if (delay <= 0) {
      setDebounced(value)
      return
    }
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debounced
}

/**
 * Pure functie-debounce. Returns een nieuwe functie die de originele pas
 * uitvoert wanneer er `delay`-ms geen nieuwe call meer is geweest.
 *
 * Gebruik in event-handlers waar geen React-state betrokken is, of in
 * niet-component code (bv. analytics, scroll-listeners).
 *
 * @example
 *   const onResize = debounce(() => recalcLayout(), 100)
 *   window.addEventListener('resize', onResize)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<TArgs extends any[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: TArgs) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      fn(...args)
    }, delay)
  }
}

/**
 * Variant die de laatst-gegeven callback debounced uitvoert. Handig
 * binnen een component waar de callback identiteit per render verandert
 * (bv. closure over state). Houd de timer in een ref zodat re-renders
 * niet meerdere timers maken.
 *
 * @example
 *   const debouncedSearch = useDebouncedCallback((q: string) => {
 *     fetchResults(q)
 *   }, 250)
 *
 *   <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<TArgs extends any[]>(
  callback: (...args: TArgs) => void,
  delay: number = 250,
): (...args: TArgs) => void {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Houd de callback-ref up-to-date zonder de debounced functie zelf te
  // hercreëren — anders zou elke parent-render de timer resetten.
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup bij unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (...args: TArgs) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      callbackRef.current(...args)
    }, delay)
  }
}
