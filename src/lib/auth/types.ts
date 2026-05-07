/**
 * Raw shapes voor de WP `/md/v2/auth/*`-endpoints, exact zoals geleverd door
 * de MaterialDistrict-plugin (snake_case). Mapping naar het domain-`User`
 * gebeurt in `mappers.ts`.
 */

export interface WPAuthUserPayload {
  id: number
  email: string
  name: string
  display_name: string
  first_name: string | null
  last_name: string | null
  roles: string[]
  avatar_url: string | null
  profession: string | null
  company: string | null
  membership: {
    tier: 'free' | 'insider'
    valid_until: string | null
    cancel_at_period_end: boolean
  }
}

export interface WPAuthLoginResponse {
  token: string
  /** Unix timestamp (seconden) waarop de JWT verloopt. */
  expires_at: number
  user: WPAuthUserPayload
}

export interface WPAuthMeResponse {
  user: WPAuthUserPayload
}

/** Foutshape uit `WP_Error::get_error_message()` via `rest_ensure_response`. */
export interface WPRestError {
  code?: string
  message?: string
  data?: { status?: number }
}
