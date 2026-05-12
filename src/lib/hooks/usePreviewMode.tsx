'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * usePreviewMode + PreviewModeProvider — page-scoped state voor
 * brand-tier preview-modus.
 *
 * Werkt per pagina: `<PreviewModeProvider>` wrapt de hele dashboard-pagina,
 * elke `<BrandTierGate variant="section">` registreert zichzelf met een
 * unique id, en kan `enable(id)`/`disable(id)` aanroepen om zijn eigen
 * preview-status om te zetten.
 *
 * Het globale `<PreviewModeIndicator>` luistert naar dezelfde context en
 * toont het aantal actieve previews + "Close all"-knop.
 *
 * Geen persistence (localStorage etc.) — preview-state reset bij navigatie.
 *
 * Submit-blokkering werkt automatisch: zolang `activePreviews.size > 0`
 * geeft `useSubmitBlocked()` `true` terug. Forms moeten hier zelf op
 * checken (of via een wrapped SubmitButton variant in batch 6).
 */

interface PreviewModeContextValue {
  activePreviews: ReadonlySet<string>
  enable: (id: string) => void
  disable: (id: string) => void
  closeAll: () => void
  isEnabled: (id: string) => boolean
}

const PreviewModeContext = createContext<PreviewModeContextValue | null>(null)

export function PreviewModeProvider({ children }: { children: ReactNode }) {
  const [activePreviews, setActivePreviews] = useState<Set<string>>(
    () => new Set(),
  )

  const enable = useCallback((id: string) => {
    setActivePreviews((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const disable = useCallback((id: string) => {
    setActivePreviews((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const closeAll = useCallback(() => {
    setActivePreviews(new Set())
  }, [])

  const isEnabled = useCallback(
    (id: string) => activePreviews.has(id),
    [activePreviews],
  )

  const value = useMemo<PreviewModeContextValue>(
    () => ({
      activePreviews,
      enable,
      disable,
      closeAll,
      isEnabled,
    }),
    [activePreviews, enable, disable, closeAll, isEnabled],
  )

  return (
    <PreviewModeContext.Provider value={value}>
      {children}
    </PreviewModeContext.Provider>
  )
}

/**
 * usePreviewMode — toegang tot de preview-state binnen een Provider.
 * Buiten een Provider returned hij een no-op context (alle methodes
 * werken, niets gebeurt).
 */
export function usePreviewMode(): PreviewModeContextValue {
  const ctx = useContext(PreviewModeContext)
  if (!ctx) {
    return NOOP_CONTEXT
  }
  return ctx
}

/**
 * useSubmitBlocked — true als er ten minste één preview actief is.
 * Forms kunnen hierop checken om submit te blokkeren (gebruikers-keuze:
 * strikt, geen partial submits in preview-mode).
 */
export function useSubmitBlocked(): boolean {
  return usePreviewMode().activePreviews.size > 0
}

const EMPTY_SET = new Set<string>()
const NOOP_CONTEXT: PreviewModeContextValue = {
  activePreviews: EMPTY_SET,
  enable: () => {},
  disable: () => {},
  closeAll: () => {},
  isEnabled: () => false,
}
