/**
 * Google Ad Manager — network + ad units.
 *
 * Network code and unit paths supplied by Johan (22-07-2026). The billboard
 * and leaderboard serve a different creative size per breakpoint via GPT
 * `sizeMapping`, so the large banner is never scaled down — a dedicated
 * mobile creative (320×100) is served instead. The medium rectangle is a
 * single fixed size.
 *
 * `theme` targeting (page channel) is set per request in AdSlot, so we can
 * later sell inventory per channel/theme entirely from the GAM side without
 * touching the frontend. The homepage has no single theme and sends none.
 */

export const AD_NETWORK = '85712959'

export type AdSlotName = 'billboard' | 'leaderboard' | 'mrec'

export type AdSize = [number, number]

export interface AdSizeMapping {
  viewport: AdSize
  sizes: AdSize[]
}

export interface AdUnit {
  /** Full ad unit path for `googletag.defineSlot()`. */
  path: string
  /** Union of every size the slot can serve (GPT requirement). */
  sizes: AdSize[]
  /** Responsive breakpoints, largest viewport first. `null` = fixed size. */
  mapping: AdSizeMapping[] | null
}

export const AD_UNITS: Record<AdSlotName, AdUnit> = {
  billboard: {
    path: `/${AD_NETWORK}/md_billboard`,
    sizes: [
      [970, 250],
      [728, 90],
      [320, 100],
    ],
    mapping: [
      { viewport: [1024, 0], sizes: [[970, 250]] },
      { viewport: [768, 0], sizes: [[728, 90]] },
      { viewport: [0, 0], sizes: [[320, 100]] },
    ],
  },
  leaderboard: {
    path: `/${AD_NETWORK}/md_leaderboard`,
    sizes: [
      [728, 90],
      [320, 100],
    ],
    mapping: [
      { viewport: [768, 0], sizes: [[728, 90]] },
      { viewport: [0, 0], sizes: [[320, 100]] },
    ],
  },
  mrec: {
    path: `/${AD_NETWORK}/md_medium_rectangle`,
    sizes: [[300, 250]],
    mapping: null,
  },
}
