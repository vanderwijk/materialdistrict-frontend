/**
 * MaterialDistrict — Centrale Membership Configuratie
 *
 * Dit is de ENIGE plek waar membership-instellingen worden gedefinieerd.
 * Nooit membership-logica verspreid over losse components of API-calls.
 *
 * Bron: project-bestand `membership-config.md`
 */

// ============================================================
// Type definities
// ============================================================

export type ReaderTier = 'free' | 'insider'
export type ManufacturerTier = 'free' | 'basis' | 'plus' | 'partner'

export type ManufacturerFeature =
  | 'Listed in Brand Directory'
  | 'Individual Brand Page'
  | 'Listed in Materials Directory'
  | 'Individual Material Pages'
  | 'Receive Sample & Info Requests'
  | 'Access to Statistics'
  | 'Geo-based Lead Routing'
  | 'Add Brochures & Videos'
  | 'PDF & EPD downloads'
  | 'Video uploads'
  | 'Video link'
  | 'Keywords'
  | 'Lead routing'
  | 'Exclusive Networking Events'
  | 'Featured placement'
  | 'Networking events'

// ============================================================
// Insider (Reader) Membership
// ============================================================

export const INSIDER_PRICING = {
  monthly: {
    amount: 10,
    currency: 'EUR' as const,
    interval: 'month' as const,
    cancelAnytime: true,
  },
  // Jaarabonnement nog niet in mockup; placeholder voor later.
  // annual: { amount: 96, currency: 'EUR', interval: 'year' },
} as const

export const VAT = {
  rate: 0.21,
  included: false,
} as const

export const BOOK_DISCOUNT = {
  insiderDiscount: 0.10,
} as const

export const INSIDER_BADGE = {
  // Gebaseerd op de mockup-discrepantie (#1E8FA1 vs --ct-member #007890):
  // we harmoniseren naar --ct-member voor consistentie met het Insider-palet.
  color: 'var(--ct-member)',
  label: 'Insider',
} as const

// Features per Insider-tier — voor UI-checks (`canReader('boards', tier)`)
export const READER_FEATURES = {
  free: {
    viewMaterials: true,
    viewBrands: true,
    viewArticlesNonGated: true,
    bookmarks: true,
    compareLimit: 3,
    fullCompare: false,
    downloadPdfsEpds: false,
    sampleRequests: false,
    exportCompareAsPdf: false,
    savedSearchesAlerts: false,
    insiderInsights: false,
    boards: false,
    insiderArticles: false,
    bookDiscount: false,
    freeEventEntryPerYear: false,
  },
  insider: {
    viewMaterials: true,
    viewBrands: true,
    viewArticlesNonGated: true,
    bookmarks: true,
    compareLimit: Infinity,
    fullCompare: true,
    downloadPdfsEpds: true,
    sampleRequests: true,
    exportCompareAsPdf: true,
    savedSearchesAlerts: true,
    insiderInsights: true,
    boards: true,
    insiderArticles: true,
    bookDiscount: true,
    freeEventEntryPerYear: true,
  },
} as const

// ============================================================
// Manufacturer Membership
// ============================================================

export const MANUFACTURER_PRICING = {
  free: {
    annual: 0,
    materialPrice: 150, // per materiaal per jaar (losse publicatie)
    materialsIncluded: 0,
  },
  basis: {
    annual: 750,
    materialsIncluded: 5,
  },
  plus: {
    annual: 1250,
    materialsIncluded: 15,
  },
  partner: {
    annual: 3750,
    materialsIncluded: Infinity,
  },
} as const

export const FAIR_DISCOUNT: Record<ManufacturerTier, number> = {
  free: 0,
  basis: 0.05,
  plus: 0.10,
  partner: 0.15,
}

// Blacklist-aanpak: features die NIET beschikbaar zijn per tier.
export const MANUFACTURER_FEATURE_GATES: Record<ManufacturerTier, ManufacturerFeature[]> = {
  basis: [
    'PDF & EPD downloads',
    'Video uploads',
    'Video link',
    'Lead routing',
    'Add Brochures & Videos',
    'Geo-based Lead Routing',
    'Exclusive Networking Events',
    'Featured placement',
    'Networking events',
    'Keywords',
  ],
  plus: [
    'Featured placement',
    'Networking events',
    'Exclusive Networking Events',
  ],
  partner: [],
  free: [
    'Receive Sample & Info Requests',
    'Access to Statistics',
    'Geo-based Lead Routing',
    'Add Brochures & Videos',
    'PDF & EPD downloads',
    'Video uploads',
    'Video link',
    'Lead routing',
    'Keywords',
    'Exclusive Networking Events',
    'Featured placement',
    'Networking events',
  ],
}

export const MANUFACTURER_TIER_COLORS: Record<ManufacturerTier, string> = {
  free:    '#6090B8',
  basis:   '#0058A0',
  plus:    '#183E90',
  partner: '#0E2E78',
}

// Legacy-modus — brands die vóór het nieuwe systeem materialen hadden
export const LEGACY_MODE = {
  archiveDeadline: new Date('2027-04-30T00:00:00Z'),
  bannerCopy: 'Your materials expire in {months} months',
} as const

// ============================================================
// Helper functies
// ============================================================

/**
 * Check of een feature beschikbaar is voor een manufacturer-tier.
 */
export function canManufacturerAccess(
  tier: ManufacturerTier,
  feature: ManufacturerFeature
): boolean {
  return !MANUFACTURER_FEATURE_GATES[tier].includes(feature)
}

/**
 * Materiaal-limiet per manufacturer-tier.
 */
export function getMaterialLimit(tier: ManufacturerTier): number {
  return MANUFACTURER_PRICING[tier].materialsIncluded
}

/**
 * Bereken de boekprijs voor een gebruiker (met of zonder Insider-korting).
 */
export function getBookPrice(basePrice: number, isInsider: boolean): number {
  if (!isInsider) return basePrice
  return Number((basePrice * (1 - BOOK_DISCOUNT.insiderDiscount)).toFixed(2))
}

/**
 * Bereken de beurskorting in euro's voor een manufacturer.
 */
export function getFairDiscountAmount(
  tier: ManufacturerTier,
  baseAmount: number
): number {
  return Number((baseAmount * FAIR_DISCOUNT[tier]).toFixed(2))
}

/**
 * Bereken BTW over een bedrag op basis van VAT-config.
 * @param amount basisbedrag (excl. BTW indien VAT.included = false)
 * @param vatExempt true bij EU B2B met geldig VAT-nummer of niet-EU
 */
export function calculateVat(amount: number, vatExempt = false): {
  net: number
  vat: number
  gross: number
} {
  if (vatExempt) {
    return { net: amount, vat: 0, gross: amount }
  }
  if (VAT.included) {
    const net = amount / (1 + VAT.rate)
    const vat = amount - net
    return { net: Number(net.toFixed(2)), vat: Number(vat.toFixed(2)), gross: amount }
  }
  const vat = amount * VAT.rate
  return {
    net: amount,
    vat: Number(vat.toFixed(2)),
    gross: Number((amount + vat).toFixed(2)),
  }
}

/**
 * Check een Insider-feature voor een reader-tier.
 * Geeft `boolean` voor flag-features en `number` voor `compareLimit`.
 */
type ReaderFeatureValue = boolean | number

export function canReader(
  feature: keyof typeof READER_FEATURES.free,
  tier: ReaderTier
): ReaderFeatureValue {
  return READER_FEATURES[tier][feature]
}
