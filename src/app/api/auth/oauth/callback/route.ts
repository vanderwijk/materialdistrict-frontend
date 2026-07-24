/**
 * GET /api/auth/oauth/callback
 *
 * OAuth redirect target for Google + LinkedIn. Validates state, exchanges
 * the authorization code, asks WordPress to verify the provider token and
 * issue a JWT, then sets md_auth_token and redirects to `next`.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth/cookies'
import { WordPressAuthError } from '@/lib/api/wordpress'
import {
  STATE_COOKIE,
  completeOAuthWithWordPress,
  exchangeOAuthCode,
  parseOAuthState,
  sanitizeOAuthNext,
} from '@/lib/auth/oauth'

function redirectWithError(
  request: NextRequest,
  code: string,
  next = '/',
): NextResponse {
  const target = new URL('/sign-in/', request.url)
  target.searchParams.set('error', code)
  if (next && next !== '/') target.searchParams.set('next', next)
  const response = NextResponse.redirect(target)
  response.cookies.delete(STATE_COOKIE)
  return response
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl
  const error = url.searchParams.get('error')
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const cookieState = request.cookies.get(STATE_COOKIE)?.value ?? ''

  if (error) {
    return redirectWithError(request, 'oauth_denied')
  }

  if (!code || !stateParam || !cookieState || stateParam !== cookieState) {
    return redirectWithError(request, 'oauth_invalid_state')
  }

  const state = parseOAuthState(stateParam)
  if (!state) {
    return redirectWithError(request, 'oauth_invalid_state')
  }

  try {
    const tokens = await exchangeOAuthCode(state.provider, code)
    if (state.provider === 'google' && !tokens.idToken) {
      return redirectWithError(request, 'oauth_provider_error', state.next)
    }
    if (state.provider === 'linkedin' && !tokens.accessToken) {
      return redirectWithError(request, 'oauth_provider_error', state.next)
    }

    const auth = await completeOAuthWithWordPress(state.provider, tokens)
    const dest = sanitizeOAuthNext(state.next)
    const response = NextResponse.redirect(new URL(dest, request.url))
    response.cookies.delete(STATE_COOKIE)
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: auth.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(auth.expiresAt * 1000),
    })
    return response
  } catch (err) {
    console.error('[api/auth/oauth/callback]', err)
    if (err instanceof WordPressAuthError) {
      const map: Record<string, string> = {
        md_auth_oauth_not_configured: 'oauth_not_configured',
        md_auth_oauth_email_required: 'oauth_email_required',
        md_auth_oauth_email_unverified: 'oauth_email_unverified',
        md_auth_registration_disabled: 'oauth_registration_disabled',
      }
      return redirectWithError(
        request,
        map[err.code] ?? 'oauth_failed',
        state.next,
      )
    }
    return redirectWithError(request, 'oauth_failed', state.next)
  }
}
