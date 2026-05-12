/**
 * User-aware membership helpers.
 *
 * Deze helpers werken op het complete `User`-object zodat components
 * niet zelf in `user.membership.isInsider` of `user.brands[]` hoeven
 * te graven. Voorkomt verspreide `if (user.X === ...)`-logica
 * (pijler 5 — Memberships uit `project-brief.md`).
 *
 * Gescheiden van `src/lib/config/membership.ts` omdat die file door
 * `src/types/shared.ts` geïmporteerd wordt voor de `ReaderTier` /
 * `ManufacturerTier`-primitives. Door user-aware helpers hier te
 * plaatsen voorkomen we een circulaire import.
 */

import type { User, BrandMembership } from '@/types/shared'
import type { ManufacturerTier } from '@/lib/config/membership'

/**
 * Is deze gebruiker een Insider?
 *
 * Veilig met `null`/`undefined` (uitgelogde bezoekers) — geeft `false`.
 *
 * Gebruikt het convenience-veld uit het datacontract; semantisch
 * equivalent aan `user.membership.tier === 'insider' &&
 * user.membership.status === 'active'`, maar die afleiding is de
 * verantwoordelijkheid van WordPress, niet van de frontend.
 */
export function isInsider(user: User | null | undefined): boolean {
  return user?.membership?.isInsider ?? false
}

/**
 * Vind de brand-membership voor een specifieke brand (op slug of id).
 *
 * Een gebruiker kan meerdere brands beheren — deze helper resolved
 * naar de juiste. Returns `null` als de gebruiker dit brand niet beheert.
 */
export function findBrandMembership(
  user: User | null | undefined,
  brand: { slug?: string; id?: number }
): BrandMembership | null {
  if (!user?.brands?.length) return null
  return (
    user.brands.find(
      (b) =>
        (brand.slug !== undefined && b.slug === brand.slug) ||
        (brand.id !== undefined && b.id === brand.id)
    ) ?? null
  )
}

/**
 * Beheert deze gebruiker dit specifieke brand?
 *
 * Convenience-wrapper rond `findBrandMembership` voor gating-checks
 * waarbij alleen het ja/nee belangrijk is, niet de tier-details.
 */
export function isBrandManager(
  user: User | null | undefined,
  brand: { slug?: string; id?: number }
): boolean {
  return findBrandMembership(user, brand) !== null
}

/**
 * Tier-ranking voor het bepalen van de "hoogste" tier wanneer een
 * gebruiker meerdere brands beheert.
 */
const TIER_RANK: Record<ManufacturerTier, number> = {
  free: 0,
  basis: 1,
  plus: 2,
  partner: 3,
}

/**
 * Hoogste brand-tier die deze gebruiker beheert.
 *
 * Voor dashboard-overzichten of upsell-copy die de "beste" tier wil
 * tonen. Returns `null` als de gebruiker geen brand beheert.
 */
export function getHighestBrandTier(
  user: User | null | undefined
): ManufacturerTier | null {
  if (!user?.brands?.length) return null
  return user.brands.reduce<ManufacturerTier>(
    (highest, b) => (TIER_RANK[b.tier] > TIER_RANK[highest] ? b.tier : highest),
    'free'
  )
}
