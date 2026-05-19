'use client'

/**
 * PlaceholderContext
 * ----------------------------------------------------------------------
 * React Context voor placeholder-registratie tijdens development. Elk
 * `<PlaceholderMark>` registreert zichzelf hier zodat de
 * `<DevStatusButton>` rechtsonder kan tonen welke W-issues er op de
 * huidige pagina nog open staan.
 *
 * Loose-mode by design: alle hooks zijn no-op buiten een Provider, dus
 * componenten kunnen veilig `useRegisterPlaceholder()` aanroepen zonder
 * dat een Provider mounted hoeft te zijn. Werkt automatisch zodra je
 * ergens een `<PlaceholderProvider>` in de tree zet.
 *
 * Voor productie: rendert geen overhead — de hooks blijven no-op
 * wanneer er geen Provider is, en `<PlaceholderMark>` controleert
 * `arePlaceholdersActive()` voordat hij iets doet.
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

import type { PlaceholderField } from '@/lib/placeholders'

// --------------------------------------------------------------------
// Context shape
// --------------------------------------------------------------------

interface PlaceholderContextValue {
  /** Alle momenteel geregistreerde placeholder-velden. */
  fields: PlaceholderField[]
  /**
   * Registreer een placeholder. Idempotent op `id`: een tweede aanroep
   * met dezelfde id vervangt de bestaande entry.
   */
  register: (field: PlaceholderField) => void
  /** Deregistreer een placeholder (bv. wanneer een component unmount). */
  unregister: (id: string) => void
}

const PlaceholderContext = createContext<PlaceholderContextValue | null>(null)

// --------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------

/**
 * Wikkel een tree hierin om placeholder-registratie via context te laten
 * werken. Niet verplicht — zonder Provider zijn de hooks no-op en
 * gedraagt alles zich correct, zonder Dev Status-knop telling.
 *
 * Plaats in `app/layout.tsx` of een dev-specifieke wrapper:
 *
 *     <PlaceholderProvider>
 *       {children}
 *       <DevStatusButton />
 *     </PlaceholderProvider>
 */
export function PlaceholderProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<PlaceholderField[]>([])

  const register = useCallback((field: PlaceholderField) => {
    setFields((prev) => {
      const existingIndex = prev.findIndex((f) => f.id === field.id)
      if (existingIndex >= 0) {
        // Idempotent: vervang bestaande entry zodat label-updates 
        // doorkomen zonder dubbele registratie.
        const next = [...prev]
        next[existingIndex] = field
        return next
      }
      return [...prev, field]
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const value = useMemo<PlaceholderContextValue>(
    () => ({ fields, register, unregister }),
    [fields, register, unregister],
  )

  return (
    <PlaceholderContext.Provider value={value}>
      {children}
    </PlaceholderContext.Provider>
  )
}

// --------------------------------------------------------------------
// Hooks — consumer API
// --------------------------------------------------------------------

/**
 * Lees alle momenteel geregistreerde placeholder-velden.
 *
 * Loose-mode: zonder Provider retourneert dit een lege lijst en stilzwijgend
 * no-op `register`/`unregister`. Gebruikt door `<DevStatusButton>`.
 */
export function usePlaceholders(): {
  fields: PlaceholderField[]
} {
  const ctx = useContext(PlaceholderContext)
  if (!ctx) {
    return { fields: [] }
  }
  return { fields: ctx.fields }
}

/**
 * Registreer een placeholder. Gebruikt door `<PlaceholderMark>`.
 *
 * @param field - de placeholder-metadata (id, source, label, ...)
 * @param active - of registratie momenteel actief is. Wanneer `false`
 *   wordt er niets geregistreerd én wordt een eventuele eerdere
 *   registratie van dezelfde id opgeruimd. Stelt callers in staat om
 *   feature-flags (`arePlaceholdersActive()`) door te geven zonder zelf
 *   conditional-hook-logica te moeten schrijven.
 *
 * Loose-mode: zonder Provider is dit een no-op.
 */
export function useRegisterPlaceholder(
  field: PlaceholderField,
  active: boolean = true,
): void {
  const ctx = useContext(PlaceholderContext)

  // Stabiele primitieve waarden uit `field` extracten zodat de useEffect-
  // dependency-array stabiel is en geen overbodige re-registraties triggert.
  const { id, source, label, description } = field

  useEffect(() => {
    if (!ctx) return
    if (!active) {
      // Wanneer placeholders gedeactiveerd worden, opruimen.
      ctx.unregister(id)
      return
    }

    ctx.register({ id, source, label, description })

    return () => {
      ctx.unregister(id)
    }
    // `ctx.register` en `ctx.unregister` zijn `useCallback`-stable in de Provider.
  }, [ctx, active, id, source, label, description])
}
