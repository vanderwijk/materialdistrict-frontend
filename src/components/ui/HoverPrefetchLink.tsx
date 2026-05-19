'use client'

/**
 * HoverPrefetchLink — sessie 6 performance.
 *
 * Een Next.js `<Link>` met `prefetch={false}` die alsnog prefetcht op
 * user-intent (mouseenter / focus / touchstart). Sluit aan bij Next.js'
 * client-API: `router.prefetch(href)` warmt de RSC-cache voor de bestemming
 * zonder de viewport-trigger van het default Link-gedrag.
 *
 * Waarom een eigen component (en niet `Card.tsx` rechtstreeks `'use client'`
 * maken)?
 *  - Card.tsx wordt veel gebruikt door server-components (ContentCard,
 *    artikelen, events, talks). Die willen we server-rendered houden om
 *    de client-bundle klein te laten — dat is sneller dan een hover-
 *    optimalisatie van de prefetch.
 *  - Door `HoverPrefetchLink` als eigen client-island te isoleren, blijven
 *    alle andere Card-paden server. Alleen MaterialCard-instances krijgen
 *    een mini client-boundary rond de buitenste Link.
 *
 * Idempotent: na de eerste trigger zetten we een ref-flag zodat hover-flick
 * niet leidt tot herhaalde prefetches.
 *
 * Touch-devices: `touchstart` triggert eerder dan `click`, dus de RSC-
 * payload is doorgaans al binnen tegen de tijd dat de tap-event verwerkt is.
 * Op iOS Safari blijft mouseenter ongebruikt (die fired niet vóór click),
 * dus we hebben touchstart per se nodig.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

interface HoverPrefetchLinkProps {
  href: string
  className?: string
  ariaLabel?: string
  children: ReactNode
}

export function HoverPrefetchLink({
  href,
  className,
  ariaLabel,
  children,
}: HoverPrefetchLinkProps) {
  const router = useRouter()
  const prefetchedRef = useRef(false)

  const triggerPrefetch = useCallback(() => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true
    try {
      router.prefetch(href)
    } catch {
      // Defensief — `router.prefetch` is in oudere Next-versies optioneel.
      // Falen is no-op; navigatie werkt nog steeds, alleen niet geprefetched.
    }
  }, [router, href])

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      prefetch={false}
      onMouseEnter={triggerPrefetch}
      onFocus={triggerPrefetch}
      onTouchStart={triggerPrefetch}
    >
      {children}
    </Link>
  )
}
