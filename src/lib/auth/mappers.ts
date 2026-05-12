import type { Membership, User } from '@/types'
import type { WPAuthUserPayload } from './types'

/**
 * Map de raw WP `/md/v2/auth/*`-user-payload naar het domain-`User` shape.
 *
 * Houd dit de enige plek waar de mapping plaatsvindt. Route Handlers,
 * SSR-helpers en eventuele Server Actions gebruiken allemaal deze functie
 * zodat de naming-conventie (snake_case → camelCase) op één plek leeft.
 *
 * Verschil tussen WP-shape en domain-shape:
 *  - Domain `User` heeft `firstName: string | null`; WP levert dit ook
 *    al als `string | null`, dus 1-op-1.
 *  - Domain `Membership` is rijker dan wat WP levert: `isInsider`,
 *    `status`, `billingInterval` en `isPlaceholder` ontbreken nog. Tot
 *    Johan's Stripe-koppeling live is, bouwen we placeholders en
 *    markeren we `isPlaceholder: true` zodat de UI weet dat dit geen
 *    echte abonnementsdata is.
 *  - Domain `User` heeft `brands: BrandMembership[]`; WP levert dit
 *    nog niet, dus leeg.
 */
export function mapWPUser(payload: WPAuthUserPayload): User {
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    // displayName moet altijd een string zijn — fall back op name.
    displayName: payload.display_name || payload.name,
    firstName: payload.first_name,
    lastName: payload.last_name,
    avatarUrl: payload.avatar_url,
    roles: Array.isArray(payload.roles) ? payload.roles : [],
    profession: payload.profession,
    company: payload.company,
    membership: mapMembership(payload.membership),
    // Brands worden nog niet door /md/v2/auth/* geleverd; leeg tot Johan
    // de connected_brands-array meestuurt (zie open-issues W10).
    brands: [],
  }
}

/**
 * Bouwt het domain-`Membership` uit de huidige WP-payload + placeholders
 * voor velden die WP nog niet levert.
 *
 * Zodra Johan's plugin `is_insider`, `status`, `billing_interval` en
 * `is_placeholder` meestuurt, gebruiken we die direct (zie
 * `architecture-rules.md` "Derived fields — source of truth"). Tot die
 * tijd: `isInsider` afleiden van `tier`, status forceren op `inactive`
 * voor free-users en `active` voor insider-users.
 */
function mapMembership(
  raw: WPAuthUserPayload['membership'],
): Membership {
  const isInsider = raw.tier === 'insider'
  return {
    tier: raw.tier,
    isInsider,
    status: isInsider ? 'active' : 'inactive',
    billingInterval: null,
    validUntil: raw.valid_until,
    cancelAtPeriodEnd: raw.cancel_at_period_end,
    // Markeer als placeholder zolang Stripe-koppeling niet live is.
    isPlaceholder: true,
  }
}
