import type { User } from '@/types'
import type { WPAuthUserPayload } from './types'

/**
 * Map de raw WP `/md/v2/auth/*`-user-payload naar het domain-`User` shape.
 *
 * Houd dit de enige plek waar de mapping plaatsvindt. Route Handlers,
 * SSR-helpers en eventuele Server Actions gebruiken allemaal deze functie
 * zodat de naming-conventie (snake_case → camelCase) op één plek leeft.
 */
export function mapWPUser(payload: WPAuthUserPayload): User {
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    displayName: payload.display_name || undefined,
    firstName: payload.first_name ?? undefined,
    lastName: payload.last_name ?? undefined,
    avatarUrl: payload.avatar_url ?? undefined,
    roles: Array.isArray(payload.roles) ? payload.roles : [],
    profession: payload.profession ?? undefined,
    company: payload.company ?? undefined,
    membership: {
      tier: payload.membership.tier,
      validUntil: payload.membership.valid_until ?? undefined,
      cancelAtPeriodEnd: payload.membership.cancel_at_period_end,
    },
  }
}
