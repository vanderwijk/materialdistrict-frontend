/**
 * OAuth helpers for Google / LinkedIn social login.
 *
 * Flow:
 *  1. GET /api/auth/oauth/{provider}?next=…  → redirect to provider
 *  2. Provider redirects to /api/auth/oauth/callback?code=…&state=…
 *  3. Callback exchanges code, calls WP /md/v2/auth/oauth, sets md_auth_token
 *
 * Identity stays in WordPress — same JWT cookie as email/password login.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { AuthMeResponse } from '@/types/shared'
import { WP_API_URL, WordPressAuthError, WordPressError } from '@/lib/api/wordpress'
import { mapAuthMeResponse } from '@/lib/api/mappers'
import type { WPAuthMeRawResponse } from '@/types/shared'

export type OAuthProvider = 'google' | 'linkedin'

const STATE_COOKIE = 'md_oauth_state'
const STATE_TTL_SECONDS = 600

export function getOAuthSiteUrl(): string {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  if (site) return site
  return 'http://localhost:3000'
}

export function getOAuthCallbackUrl(): string {
  return `${getOAuthSiteUrl()}/api/auth/oauth/callback`
}

function getStateSecret(): string {
  return (
    process.env.OAUTH_STATE_SECRET ||
    process.env.MD_OAUTH_STATE_SECRET ||
    process.env.REVALIDATE_SECRET ||
    'dev-oauth-state-secret-change-me'
  )
}

export function isOAuthProviderConfigured(provider: OAuthProvider): boolean {
  if (provider === 'google') {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  }
  return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)
}

export function sanitizeOAuthNext(raw: string | null | undefined): string {
  if (!raw) return '/'
  let value = raw.trim()
  try {
    value = decodeURIComponent(value)
  } catch {
    // keep raw
  }
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

interface OAuthStatePayload {
  provider: OAuthProvider
  next: string
  nonce: string
  exp: number
}

function signPayload(payload: string): string {
  return createHmac('sha256', getStateSecret()).update(payload).digest('base64url')
}

export function createOAuthState(provider: OAuthProvider, next: string): string {
  const payload: OAuthStatePayload = {
    provider,
    next: sanitizeOAuthNext(next),
    nonce: randomBytes(16).toString('hex'),
    exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS,
  }
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${body}.${signPayload(body)}`
}

export function parseOAuthState(state: string): OAuthStatePayload | null {
  const [body, sig] = state.split('.')
  if (!body || !sig) return null
  const expected = signPayload(body)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  try {
    const json = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OAuthStatePayload
    if (!json || (json.provider !== 'google' && json.provider !== 'linkedin')) return null
    if (typeof json.exp !== 'number' || json.exp < Math.floor(Date.now() / 1000)) return null
    return {
      provider: json.provider,
      next: sanitizeOAuthNext(json.next),
      nonce: String(json.nonce || ''),
      exp: json.exp,
    }
  } catch {
    return null
  }
}

export { STATE_COOKIE, STATE_TTL_SECONDS }

export function buildProviderAuthorizeUrl(
  provider: OAuthProvider,
  state: string,
): string {
  const redirectUri = getOAuthCallbackUrl()
  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not configured')
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('state', state)
    url.searchParams.set('access_type', 'online')
    url.searchParams.set('prompt', 'select_account')
    return url.toString()
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  if (!clientId) throw new Error('LINKEDIN_CLIENT_ID is not configured')
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  // OpenID Connect scopes for Sign In with LinkedIn.
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', state)
  return url.toString()
}

interface TokenExchangeResult {
  idToken?: string
  accessToken?: string
}

async function exchangeGoogleCode(code: string): Promise<TokenExchangeResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new WordPressAuthError(
      'md_auth_oauth_not_configured',
      'Google OAuth is not configured.',
      503,
      '/oauth/google',
    )
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getOAuthCallbackUrl(),
    grant_type: 'authorization_code',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })
  const json = (await res.json()) as Record<string, unknown>
  if (!res.ok || typeof json.id_token !== 'string') {
    throw new WordPressAuthError(
      'md_auth_oauth_provider_error',
      'Google token exchange failed.',
      401,
      '/oauth/google',
      json,
    )
  }
  return {
    idToken: json.id_token,
    accessToken: typeof json.access_token === 'string' ? json.access_token : undefined,
  }
}

async function exchangeLinkedInCode(code: string): Promise<TokenExchangeResult> {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new WordPressAuthError(
      'md_auth_oauth_not_configured',
      'LinkedIn OAuth is not configured.',
      503,
      '/oauth/linkedin',
    )
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getOAuthCallbackUrl(),
    grant_type: 'authorization_code',
  })

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })
  const json = (await res.json()) as Record<string, unknown>
  if (!res.ok || typeof json.access_token !== 'string') {
    throw new WordPressAuthError(
      'md_auth_oauth_provider_error',
      'LinkedIn token exchange failed.',
      401,
      '/oauth/linkedin',
      json,
    )
  }
  return {
    accessToken: json.access_token,
    idToken: typeof json.id_token === 'string' ? json.id_token : undefined,
  }
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
): Promise<TokenExchangeResult> {
  return provider === 'google'
    ? exchangeGoogleCode(code)
    : exchangeLinkedInCode(code)
}

/**
 * Ask WordPress to verify the provider token and issue our JWT.
 */
export async function completeOAuthWithWordPress(
  provider: OAuthProvider,
  tokens: TokenExchangeResult,
): Promise<AuthMeResponse & { created?: boolean }> {
  const payload =
    provider === 'google'
      ? { provider, id_token: tokens.idToken }
      : { provider, access_token: tokens.accessToken }

  const url = `${WP_API_URL}/md/v2/auth/oauth`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const raw = (await res.json().catch(() => null)) as unknown

  if (
    raw &&
    typeof raw === 'object' &&
    typeof (raw as { code?: unknown }).code === 'string' &&
    String((raw as { code: string }).code).startsWith('md_auth_')
  ) {
    const err = raw as {
      code: import('@/types/shared').AuthErrorCode
      message?: string
      data?: { status?: number }
    }
    throw new WordPressAuthError(
      err.code,
      typeof err.message === 'string' ? err.message : 'OAuth login failed.',
      typeof err.data?.status === 'number' ? err.data.status : res.status || 401,
      '/md/v2/auth/oauth',
      raw,
    )
  }

  if (!res.ok || !raw || typeof raw !== 'object') {
    throw new WordPressError(
      'OAuth login failed.',
      res.status || 500,
      '/md/v2/auth/oauth',
      raw,
    )
  }

  const mapped = mapAuthMeResponse(raw as WPAuthMeRawResponse)
  return {
    ...mapped,
    created: Boolean((raw as { created?: boolean }).created),
  }
}
