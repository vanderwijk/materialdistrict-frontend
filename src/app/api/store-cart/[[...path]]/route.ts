/**
 * Store API cart proxy — forwards `/api/store-cart/*` to WooCommerce
 * `/wc/store/v1/*` and attaches the HttpOnly JWT when present so Insider
 * book pricing applies server-side in the cart.
 *
 * Cart-Token + Nonce pass through unchanged (client-side session).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'

const FORWARD_REQUEST_HEADERS = ['content-type', 'cart-token', 'nonce', 'x-wc-store-api-nonce'] as const
const EXPOSE_RESPONSE_HEADERS = ['cart-token', 'nonce', 'x-wc-store-api-nonce'] as const

function wpStoreApiUrl(pathSegments: string[], search: string): string {
  const base = (process.env.WP_API_URL ?? '').replace(/\/+$/, '')
  const subpath = pathSegments.length ? `/${pathSegments.join('/')}` : ''
  return `${base}/wc/store/v1${subpath}${search}`
}

async function proxyStoreCart(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const base = (process.env.WP_API_URL ?? '').replace(/\/+$/, '')
  if (!base) {
    return NextResponse.json(
      { code: 'md_config_error', message: 'WP_API_URL is not configured' },
      { status: 503 },
    )
  }

  const headers: Record<string, string> = {}

  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) {
      headers[name] = value
    }
  }

  const token = await getAuthCookie()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const method = request.method.toUpperCase()
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await request.text()

  const upstream = await fetch(wpStoreApiUrl(pathSegments, request.nextUrl.search), {
    method,
    headers,
    body: body || undefined,
    cache: 'no-store',
  })

  const responseHeaders = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) {
    responseHeaders.set('Content-Type', contentType)
  }

  for (const name of EXPOSE_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) {
      responseHeaders.set(name, value)
    }
  }

  const payload = await upstream.arrayBuffer()

  return new NextResponse(payload, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

type RouteContext = { params: Promise<{ path?: string[] }> }

async function handle(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path = [] } = await context.params
  return proxyStoreCart(request, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
