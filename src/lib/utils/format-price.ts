/**
 * Prijs-formatting
 * ----------------------------------------------------------------------
 * Kale getallen uit de datalaag → weergave-string. Boeken zitten ruim onder
 * €1.000, dus geen duizendtal-separator nodig; vaste twee decimalen.
 *
 * De Insider-prijs reken je af via `getBookPrice(price, isInsider)` uit
 * `lib/config/membership.ts` en formatteer je daarna met dezelfde helper.
 */

export function formatEur(amount: number): string {
  return `€${amount.toFixed(2)}`
}
