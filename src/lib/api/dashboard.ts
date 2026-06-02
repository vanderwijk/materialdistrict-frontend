/**
 * Dashboard WP fetch helper.
 *
 * The dashboard endpoints (`/md/v2/dashboard/*`) authenticate with the JWT
 * Bearer token (never the WP application-password Basic auth that public
 * `wpFetch` uses), are always user-specific (`cache: 'no-store'`), and need
 * GET/POST/PATCH. This mirrors the private `wpAuthFetch` used for `/auth/*`,
 * but lives in the dashboard track so it can support PATCH and parse the
 * `md_dashboard_*` error envelope without touching the shared auth module.
 *
 * Reuses only the exported `WP_API_URL` from `wordpress.ts`.
 */

import { WP_API_URL } from '@/lib/api/wordpress'

/** A `{ code, message }` error from a dashboard endpoint (or auth 401). */
export class DashboardApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'DashboardApiError'
  }
}

function isErrorEnvelope(v: unknown): v is { code: string; message?: string } {
  return typeof v === 'object' && v !== null && typeof (v as { code?: unknown }).code === 'string'
}

export async function wpDashboardFetch<T>(
  path: string,
  init: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    bearer?: string
    body?: unknown
  },
): Promise<T> {
  const url = `${WP_API_URL}${path.startsWith('/') ? path : `/${path}`}`

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'
  if (init.bearer) headers.Authorization = `Bearer ${init.bearer}`

  const res = await fetch(url, {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    let payload: unknown
    try {
      payload = await res.json()
    } catch {
      // non-JSON error body
    }
    if (isErrorEnvelope(payload)) {
      throw new DashboardApiError(
        payload.code,
        payload.message ?? 'Request failed',
        res.status,
        payload,
      )
    }
    throw new DashboardApiError(
      'md_dashboard_unavailable',
      `Dashboard request failed (${res.status} ${res.statusText})`,
      res.status,
      payload,
    )
  }

  // 204 No Content (DELETE) or otherwise empty body → nothing to parse.
  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
