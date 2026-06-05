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
 * usePreviewMode + PreviewModeProvider — tier-preview-modus.
 *
 * Eén generieke, id-gebaseerde context die zowel de brand-tier-gates
 * (`<BrandTierGate variant="section">`) als de reader/Insider-gates
 * (`<InsiderGate variant="preview">`) bedient: elke previewbare gate
 * registreert zich met een unique id en zet via `enable(id)`/`disable(id)`
 * zijn eigen preview-status om. De context weet niets van brand vs reader —
 * dat onderscheid leeft in de gate-componenten + hun styling.
 *
 * Mounting: `<PreviewModeProvider>` + het globale `<PreviewModeIndicator>`
 * staan in `DashboardShell`, dus de preview-modus is **dashboard-breed**:
 * hij blijft staan terwijl je tussen panelen navigeert (de shell blijft
 * gemount) en reset zodra je het dashboard verlaat. Geen persistence
 * (localStorage etc.).
 *
 * Submit-blokkering werkt automatisch: zolang `activePreviews.size > 0`
 * geeft `useSubmitBlocked()` `true` terug. Forms moeten hier zelf op
 * checken (of via een wrapped SubmitButton variant). Alleen relevant voor
 * de brand-kant (forms); de reader-preview is puur read-only.
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
