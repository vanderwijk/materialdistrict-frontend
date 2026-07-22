'use client'

/**
 * AdSlot — renders a single Google Ad Manager slot via Google Publisher Tags.
 *
 * One reusable component for every position (billboard / leaderboard / mrec).
 * It lazily loads gpt.js the first time any slot mounts, so ad-less pages never
 * pull the tag. Each slot defines itself, applies its responsive `sizeMapping`,
 * and calls `display`. Empty (unbooked) slots collapse via `collapseEmptyDivs`,
 * so an unsold position leaves no gap on the page.
 *
 * `theme` sets page-level targeting (the page channel) before the slot renders,
 * which is how per-channel selling will work later — no frontend change needed,
 * only GAM line-item targeting. The homepage passes no theme.
 */

import { useEffect, useId, useRef } from 'react'
import { AD_UNITS, type AdSize, type AdSlotName } from '@/lib/ads/ad-units'

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
  collapseEmptyDivs(): void
}

interface GoogleTag {
  cmd: Array<() => void>
  defineSlot(path: string, sizes: AdSize[], divId: string): GptSlot | null
  pubads(): GptPubAdsService
  sizeMapping(): GptSizeMappingBuilder
  enableServices(): void
  display(divId: string): void
  destroySlots(slots?: unknown[]): boolean
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

  useEffect(() => {
    const gt = ensureGpt()
    const unit = AD_UNITS[name]

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
        gt.pubads().collapseEmptyDivs()
        gt.enableServices()
        servicesEnabled = true
      }

      gt.display(divId)
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

  return (
    <div className={`ad-unit ad-unit--${name}${className ? ` ${className}` : ''}`}>
      <div id={divId} className="ad-unit-target" />
    </div>
  )
}
