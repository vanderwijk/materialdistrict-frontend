/**
 * Barrel — alleen non-server-only exports.
 *
 * Server-only helpers (`getCurrentUser`, `getSessionToken`) blijven via
 * directe import uit `@/lib/auth/server` zodat client components geen
 * onbedoelde server-imports binnenslepen.
 */

export {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  getSessionCookieOptions,
  type CookieOptions,
} from './cookie'

export { mapWPUser } from './mappers'

export type {
  WPAuthUserPayload,
  WPAuthLoginResponse,
  WPAuthMeResponse,
  WPRestError,
} from './types'
