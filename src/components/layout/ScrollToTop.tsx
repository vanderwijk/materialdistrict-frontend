'use client'

/**
 * ScrollToTop
 * ----------------------------------------------------------------------
 * Bij elke client-side route-change scrolt het venster naar (0, 0).
 *
 * Sessie 7 fix Punt 17 — voorheen behield Next.js de scroll-positie
 * tussen navigaties. Effect: klik op "Next material" of op een
 * MaterialCard → nieuwe pagina opent ergens halverwege omdat de
 * vorige pagina daar scrolde.
 *
 * Browser-back/forward (POP) respecteert de native scroll-restoration —
 * dan herstelt de browser zelf de eerdere scrollpositie zodat de user
 * terugkeert waar hij was. We forceren `scrollTo` alleen bij PUSH/
 * REPLACE.
 *
 * Detectie via de Navigation API's performance entry: bij eerste paint
 * staat `navigation.type === 'back_forward'` voor BACK-knop. Voor
 * client-side wisselingen kijken we naar of het een nieuwe entry was
 * (`window.history.state` veranderde) of niet. Pragmatische aanpak:
 *  - Op pathname-change: scroll naar top.
 *  - Behalve wanneer de browser zojuist BACK/FORWARD heeft gedaan
 *    en de positie al hersteld is. We detecteren dat via een
 *    `popstate`-listener die een vlag zet vlak voor pathname update.
 *
 * Niets visueels — `return null`.
 */

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const skipNext = useRef(false)
  const isFirstRender = useRef(true)

  // Detecteer browser-back/forward — als die gebeurt, slaan we de
  // eerstvolgende pathname-change over zodat de native scroll-restoration
  // werkt.
  useEffect(() => {
    const onPopState = () => {
      skipNext.current = true
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    // Eerste render: nooit scrollen (de browser doet z'n eigen werk).
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // BACK/FORWARD-navigatie: scrollpositie wordt door de browser hersteld.
    if (skipNext.current) {
      skipNext.current = false
      return
    }

    // PUSH-navigatie: naar boven.
    window.scrollTo(0, 0)
  }, [pathname, searchParams])

  return null
}
