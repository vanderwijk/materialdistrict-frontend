'use client'

/**
 * AdSlot — renders a single Google Ad Manager slot via Google Publisher Tags.
 *
 * One reusable component for every position (billboard / leaderboard / mrec).
 * It lazily loads gpt.js the first time any slot mounts, so ad-less pages never
 * pull the tag. Each slot defines itself, applies its responsive `sizeMapping`,
 * and registers with `display`. Ad *requests* wait until consent is granted
 * (`disableInitialLoad` + `refresh`), so GPT can load early for a CMP while
 * cookies/identifiers are not used before the visitor agrees.
 *
 * Empty (unbooked) slots collapse via `googletag.setConfig({ collapseDiv })`.
 *
 * `theme` sets page-level targeting (the page channel) before the slot renders,
 * which is how per-channel selling will work later — no frontend change needed,
 * only GAM line-item targeting. The homepage passes no theme.
 *
 * Consent: gpt.js may load so a Google-certified CMP (Privacy & messaging) can
 * appear, but `refresh` only runs after `md_consent=granted` (our bar or TCF).
 */

import { useEffect, useId, useRef, useState } from 'react'
import { AD_UNITS, type AdSize, type AdSlotName } from '@/lib/ads/ad-units'
import { hasConsent, onConsentChange } from '@/lib/consent/consent'
import { updateGoogleConsentMode } from '@/lib/consent/google-consent-mode'

interface GptSlot {
  addService(service: unknown): GptSlot
  defineSizeMapping(mapping: unknown): GptSlot
}

interface GptSizeMappingBuilder {
  addSize(viewport: AdSize, sizes: AdSize[]): GptSizeMappingBuilder
  build(): unknown
}

interface GptPubAdsService {
  setTargeting(key: string, value: string | string[]): GptPubAdsService
  disableInitialLoad(): void
  refresh(slots?: GptSlot[]): void
}

interface GoogleTag {
  cmd: Array<() => void>
  defineSlot(path: string, sizes: AdSize[], divId: string): GptSlot | null
  pubads(): GptPubAdsService
  sizeMapping(): GptSizeMappingBuilder
  enableServices(): void
  display(divId: string): void
  destroySlots(slots?: unknown[]): boolean
  setConfig(config: { collapseDiv?: 'DISABLED' | 'BEFORE_FETCH' | 'ON_NO_FILL' | null }): void
}

declare global {
  interface Window {
    googletag?: GoogleTag
  }
}

const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
const GPT_SCRIPT_ID = 'gpt-js'

/** Global services are enabled once for the whole page, not per slot. */
let servicesEnabled = false

function ensureGpt(): GoogleTag {
  const win = window
  win.googletag = win.googletag ?? ({ cmd: [] } as unknown as GoogleTag)
  if (!document.getElementById(GPT_SCRIPT_ID)) {
    const script = document.createElement('script')
    script.id = GPT_SCRIPT_ID
    script.src = GPT_SRC
    script.async = true
    document.head.appendChild(script)
  }
  return win.googletag
}

export function AdSlot({
  name,
  theme,
  className,
}: {
  name: AdSlotName
  theme?: string
  className?: string
}) {
  const reactId = useId()
  const divId = `gpt-${name}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`
  const slotRef = useRef<GptSlot | null>(null)
  const refreshedRef = useRef(false)
  const [allowed, setAllowed] = useState(false)

  // Read on mount rather than during render: the server has no cookie access,
  // so deciding at render time would produce a hydration mismatch.
  useEffect(() => {
    setAllowed(hasConsent())
    return onConsentChange((value) => setAllowed(value === 'granted'))
  }, [])

  useEffect(() => {
    const gt = ensureGpt()
    const unit = AD_UNITS[name]
    refreshedRef.current = false

    gt.cmd.push(() => {
      if (theme) gt.pubads().setTargeting('theme', theme)

      const slot = gt.defineSlot(unit.path, unit.sizes, divId)
      if (!slot) return

      if (unit.mapping) {
        const builder = gt.sizeMapping()
        for (const step of unit.mapping) builder.addSize(step.viewport, step.sizes)
        slot.defineSizeMapping(builder.build())
      }

      slot.addService(gt.pubads())
      slotRef.current = slot

      if (!servicesEnabled) {
        // Hold requests until consent — also lets a CMP finish before fetch.
        gt.pubads().disableInitialLoad()
        // Replaces deprecated pubads().collapseEmptyDivs().
        gt.setConfig({ collapseDiv: 'BEFORE_FETCH' })
        gt.enableServices()
        servicesEnabled = true
      }

      gt.display(divId)

      if (hasConsent() && !refreshedRef.current) {
        refreshedRef.current = true
        updateGoogleConsentMode('granted')
        gt.pubads().refresh([slot])
      }
    })

    return () => {
      const gtag = window.googletag
      if (!gtag) return
      gtag.cmd.push(() => {
        if (slotRef.current) {
          gtag.destroySlots([slotRef.current])
          slotRef.current = null
        }
      })
    }
  }, [name, theme, divId])

  // Visitor accepted after slots were already registered — fetch now.
  useEffect(() => {
    if (!allowed || refreshedRef.current) return

    const gt = window.googletag
    const slot = slotRef.current
    if (!gt || !slot) return

    refreshedRef.current = true
    updateGoogleConsentMode('granted')
    gt.cmd.push(() => {
      gt.pubads().refresh([slot])
    })
  }, [allowed])

  // Keep the target div in the DOM even before consent so GPT can register
  // the slot; collapseDiv keeps unsold / waiting slots from leaving a gap.
  return (
    <div className={`ad-unit ad-unit--${name}${className ? ` ${className}` : ''}`}>
      <div id={divId} className="ad-unit-target" />
    </div>
  )
}
