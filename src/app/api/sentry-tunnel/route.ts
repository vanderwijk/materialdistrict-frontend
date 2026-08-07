import { NextResponse } from 'next/server'

/**
 * Same-origin Sentry envelope tunnel.
 *
 * Why a custom route (not `tunnelRoute` in withSentryConfig):
 * `trailingSlash: true` 308s `/monitoring` → `/monitoring/`, and the
 * webpack rewrite only matched the non-slash path — browser events were
 * dropped. This App Router handler is reached at `/api/sentry-tunnel/`.
 *
 * DELETE is optional once ad-blocker coverage is confirmed; keep for Brave
 * / uBlock users who otherwise never reach *.ingest.de.sentry.io.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function allowedIngestHost(host: string): boolean {
  return (
    host === 'ingest.sentry.io' ||
    host.endsWith('.ingest.sentry.io') ||
    host === 'ingest.de.sentry.io' ||
    host.endsWith('.ingest.de.sentry.io')
  )
}

function configuredProjectId(): string | null {
  const dsn =
    process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? ''
  if (!dsn) return null
  try {
    return new URL(dsn).pathname.replace(/^\//, '') || null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const expectedProject = configuredProjectId()
  if (!expectedProject) {
    return NextResponse.json(
      { error: 'Sentry DSN is not configured.' },
      { status: 503 },
    )
  }

  const body = Buffer.from(await request.arrayBuffer())
  const newline = body.indexOf(0x0a)
  if (newline <= 0) {
    return NextResponse.json({ error: 'Invalid envelope.' }, { status: 400 })
  }

  let header: { dsn?: string }
  try {
    header = JSON.parse(body.subarray(0, newline).toString('utf8')) as {
      dsn?: string
    }
  } catch {
    return NextResponse.json({ error: 'Invalid envelope header.' }, { status: 400 })
  }

  if (!header.dsn) {
    return NextResponse.json({ error: 'Missing envelope DSN.' }, { status: 400 })
  }

  let dsnUrl: URL
  try {
    dsnUrl = new URL(header.dsn)
  } catch {
    return NextResponse.json({ error: 'Invalid envelope DSN.' }, { status: 400 })
  }

  const projectId = dsnUrl.pathname.replace(/^\//, '')
  if (projectId !== expectedProject || !allowedIngestHost(dsnUrl.hostname)) {
    return NextResponse.json({ error: 'DSN not allowed.' }, { status: 403 })
  }

  const upstream = `https://${dsnUrl.host}/api/${projectId}/envelope/`
  const upstreamRes = await fetch(upstream, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': request.headers.get('content-type') ?? 'application/x-sentry-envelope',
    },
  })

  return new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type':
        upstreamRes.headers.get('content-type') ?? 'application/json',
    },
  })
}
