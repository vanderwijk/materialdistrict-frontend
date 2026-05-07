import 'server-only'

import { cookies } from 'next/headers'
import { WP_API_URL } from '@/lib/api/wordpress'
import type { User } from '@/types'
import { SESSION_COOKIE } from './cookie'
import { mapWPUser } from './mappers'
import type { WPAuthMeResponse } from './types'

/**
 * Server-side auth helpers. Alleen importeren vanuit Server Components,
 * Route Handlers of Server Actions — de `server-only` import voorkomt dat
 * deze module per ongeluk in een client component eindigt.
 */

/**
 * Lees de huidige sessie-cookie. Returnt `null` als er geen cookie is.
 */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies()
  const value = store.get(SESSION_COOKIE)?.value
  return value && value.length > 0 ? value : null
}

/**
 * Haal de actieve gebruiker op via `/md/v2/auth/me`.
 *
 * - Returnt `null` als er geen cookie is, het token verlopen/ongeldig is,
 *   of WP onbereikbaar is.
 * - `cache: 'no-store'` — user-data mag nooit gecached worden.
 * - Cookie wordt hier NIET gewist bij 401; dat kan alleen vanuit een
 *   Route Handler of Server Action. Bij de volgende navigatie ziet de
 *   provider dan gewoon `user = null`.
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null

  try {
    const res = await fetch(`${WP_API_URL}/md/v2/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as WPAuthMeResponse
    if (!data?.user) return null
    return mapWPUser(data.user)
  } catch {
    // Netwerkfout, JSON-parsefout, etc. — geen user; UI valt terug op uitgelogd.
    return null
  }
}
