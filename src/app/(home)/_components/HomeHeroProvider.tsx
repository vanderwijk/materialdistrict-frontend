'use client'

/**
 * HomeHeroProvider — gedeelde client-state voor de hero-bovenkant (sessie 10).
 *
 * Bepaalt op één plek of de promo-hero (blauw/groen, alleen gast) zichtbaar is.
 * Wordt geconsumeerd door zowel `PromoHero` (de band bovenaan) als
 * `FeaturedArticleHero` (het article-blok in de contentkolom) zodat ze elkaars
 * tegenpool zijn: promo zichtbaar → geen article-hero, en andersom. Daardoor
 * wisselt het wegklikken van de promo direct naar de article-hero.
 *
 * `showPromo = uitgelogd && niet-weggeklikt`. AuthContext is server-gehydrateerd
 * (beslissing 66), dus de juiste variant staat al in de SSR-HTML; alleen de
 * dismiss-status uit localStorage resolve't na mount.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@/components/providers/AuthContext'

const DISMISS_KEY = 'md_hero_dismissed'

interface HomeHeroState {
  showPromo: boolean
  dismissPromo: () => void
}

const HomeHeroContext = createContext<HomeHeroState>({
  showPromo: false,
  dismissPromo: () => {},
})

export function useHomeHero(): HomeHeroState {
  return useContext(HomeHeroContext)
}

export function HomeHeroProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === '1') setDismissed(true)
    } catch {
      /* localStorage niet beschikbaar — promo gewoon tonen. */
    }
  }, [])

  function dismissPromo() {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* negeren */
    }
    setDismissed(true)
  }

  const showPromo = !isLoggedIn && !dismissed

  return (
    <HomeHeroContext.Provider value={{ showPromo, dismissPromo }}>
      {children}
    </HomeHeroContext.Provider>
  )
}
