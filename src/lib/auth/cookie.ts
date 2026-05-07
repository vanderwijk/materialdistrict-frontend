/**
 * Session cookie configuratie.
 *
 * De JWT zelf zit in een httpOnly cookie op het Next.js-domein. De browser
 * kan 'm niet uitlezen via JS — dat is bewust. Alle WP-calls gaan via Next.js
 * server-side (Route Handlers / Server Components), die plakken de Bearer
 * header pas vlak voor de request naar WordPress.
 *
 * Cookie-strategie (zie sessie 4-uitwerking):
 *  - httpOnly: true                    — niet leesbaar via JS
 *  - secure:   alleen in productie     — werkt op localhost via http
 *  - sameSite: 'lax'                   — voorkomt CSRF op POSTs
 *  - path:     '/'                     — alle routes
 *  - maxAge:   7 dagen (afgestemd op JWT-lifetime)
 */

export const SESSION_COOKIE = 'md_session'

/** 7 dagen, in seconden. Komt overeen met JWT-lifetime in de WP-plugin. */
export const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export interface CookieOptions {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  path: string
  maxAge: number
}

export function getSessionCookieOptions(maxAge: number = SESSION_COOKIE_MAX_AGE): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  }
}
