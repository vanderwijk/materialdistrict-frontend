/**
 * GET /api/auth/oauth/[provider]
 *
 * Starts Google or LinkedIn OAuth: sets a signed state cookie and redirects
 * to the provider authorize URL. Callback lands on /api/auth/oauth/callback.
 */

import { NextResponse, type NextRequest } from 'next/server'
import {
  STATE_COOKIE,
  STATE_TTL_SECONDS,
  buildProviderAuthorizeUrl,
  createOAuthState,
  isOAuthProviderConfigured,
  sanitizeOAuthNext,
  type OAuthProvider,
} from '@/lib/auth/oauth'

function isProvider(value: string): value is OAuthProvider {
  return value === 'google' || value === 'linkedin'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { provider: rawProvider } = await context.params
  if (!isProvider(rawProvider)) {
    return NextResponse.redirect(new URL('/sign-in/?error=oauth_provider', request.url))
  }

  if (!isOAuthProviderConfigured(rawProvider)) {
    return NextResponse.redirect(
      new URL(`/sign-in/?error=oauth_not_configured&provider=${rawProvider}`, request.url),
    )
  }

  const next = sanitizeOAuthNext(request.nextUrl.searchParams.get('next'))
  const origin = request.nextUrl.origin
  const state = createOAuthState(rawProvider, next, origin)

  let authorizeUrl: string
  try {
    authorizeUrl = buildProviderAuthorizeUrl(rawProvider, state, origin)
  } catch {
    return NextResponse.redirect(
      new URL(`/sign-in/?error=oauth_not_configured&provider=${rawProvider}`, request.url),
    )
  }

  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: STATE_TTL_SECONDS,
  })
  return response
}
