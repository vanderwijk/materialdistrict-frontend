/**
 * Free-shipping thresholds (per verzendzone)
 * ----------------------------------------------------------------------
 * Spiegelt de WooCommerce free-shipping-minima per zone. Gebruikt voor de
 * "Spend €X more for free shipping"-melding in de mand en op de checkout.
 *
 * LET OP — synchroon houden met WooCommerce: als Johan een drempel wijzigt,
 * pas die hier óók aan. De bedragen zijn incl. btw (de melding vergelijkt tegen
 * het incl-btw goederen-subtotaal, conform de live bookstore).
 *
 * Zones (zoals op de huidige bookstore):
 *   Netherlands           → gratis vanaf €30
 *   Belgium & Germany     → gratis vanaf €60
 *   Europe (EU/EEA + GB)  → gratis vanaf €120
 *   Rest of World         → gratis vanaf €300
 */

const NL = ['NL']
const BE_DE = ['BE', 'DE']
const EUROPE = [
  'AT', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'GB', 'NO', 'CH', 'IS', 'LI',
]

const THRESHOLDS: Array<{ countries: string[]; amount: number }> = [
  { countries: NL, amount: 30 },
  { countries: BE_DE, amount: 60 },
  { countries: EUROPE, amount: 120 },
]

/** Rest-of-World fallback. */
const ROW_THRESHOLD = 300

/** Het free-shipping-drempelbedrag (incl. btw, EUR) voor een land. */
export function freeShippingThreshold(country: string | undefined): number {
  const code = (country ?? 'NL').toUpperCase()
  for (const zone of THRESHOLDS) {
    if (zone.countries.includes(code)) return zone.amount
  }
  return ROW_THRESHOLD
}

/**
 * Hoeveel er (incl. btw) nog bij moet voor gratis verzending. 0 = al gehaald.
 * `subtotalInclVat` is het goederen-subtotaal incl. btw, exclusief verzending.
 */
export function freeShippingRemaining(
  country: string | undefined,
  subtotalInclVat: number,
): number {
  const remaining = freeShippingThreshold(country) - subtotalInclVat
  return remaining > 0 ? Number(remaining.toFixed(2)) : 0
}
