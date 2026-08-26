/**
 * `POST /api/revalidate` — WordPress meldt een wijziging, de frontend ververst.
 *
 * §BETA-FIX-24-08 (H2) — opzet.
 * §CACHE-FIX-26-08     — herzien: gericht ontcachen in plaats van site-breed.
 *
 * Het probleem dat dit oplost: de site bakt pagina's voor en ververst ze op een
 * timer (materials 6 uur, brands 24 uur, redactioneel 1 uur). De redactie zag
 * een net gepubliceerd materiaal wél op het overzicht en niet op de homepage —
 * twee pagina's met twee termijnen. WordPress belt daarom bij elke opslag dit
 * endpoint.
 *
 * ---------------------------------------------------------------------------
 * Waarom deze herziening
 * ---------------------------------------------------------------------------
 * De eerste versie verklaarde per opslag de tag van het hele contenttype
 * ongeldig (`wp:material`), plus altijd `wp:media`, plus `revalidatePath('/')`,
 * plus `revalidatePath('/channel', 'layout')`. Omdat `wpFetch` die type-tags
 * aan élke gecachete fetch hangt, betekende dat: één opslag = de hele site
 * ontcachet. Bij een bulk-import of een redacteur die acht foto's uploadt
 * gebeurde dat tientallen keren achter elkaar, waardoor de cache nooit meer
 * gevuld raakte en elke bezoeker rechtstreeks op WordPress landde.
 *
 * Meetbaar gevolg op de CMS-server (4 vCPU): load 20, alle 20 php-fpm-workers
 * bezet, ~95% user-CPU. Zie de PR-beschrijving voor de volledige meting.
 *
 * Nu verklaren we alleen de tags van het gewijzigde record ongeldig plus de
 * lijst-tags van zijn type (zie `tagsForTarget`). De duizenden andere
 * detailpagina's en alle niet-betrokken media blijven staan.
 *
 * `revalidatePath` gebruiken we nog uitsluitend voor de detailpagina van het
 * gewijzigde item. De homepage, de overzichten en de channel-hubs lezen hun
 * data via getagde lijst-fetches en verversen dus vanzelf mee — daar is geen
 * apart pad-commando voor nodig. De oorspronkelijke klacht blijft daarmee
 * opgelost, zonder de site-brede flush.
 *
 * Beveiliging. De aanroep draagt `REVALIDATE_SECRET` mee (header
 * `x-md-revalidate-secret`, of `secret` in de body). Zonder geldig geheim: 401.
 * Is het geheim niet gezet in de omgeving, dan is het endpoint uit — liever
 * niets doen dan een open ontcache-knop op internet.
 *
 * Het endpoint blijft ruimhartig in wat het accepteert: onbekende posttypes
 * leveren geen fout maar een nette "niets te doen". WordPress hoeft dus niet te
 * weten welke types de frontend kent.
 */

import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import {
  POST_TYPE_ROUTES,
  tagsForTarget,
  type RevalidateTarget,
} from '@/lib/api/cache-tags'

/** Nooit cachen — dit is een schrijfactie. */
export const dynamic = 'force-dynamic'

interface RevalidatePayload {
  /** WP-posttype: material, article, brand, event, talk, book, product, media. */
  type?: string
  /** Slug van het gewijzigde item (voor de detailpagina). */
  slug?: string
  /** Id van het gewijzigde item — nauwkeuriger dan de slug bij `?include=`. */
  postId?: number
  /** Slug van de brand waar een materiaal onder hangt, indien bekend. */
  brandSlug?: string
  /** Attachment-id, alleen bij een media-ping. */
  mediaId?: number
  /** Post waar de attachment onder hangt, alleen bij een media-ping. */
  parentId?: number
  /**
   * `'all'` leegt het complete contenttype. Bedoeld voor handmatig onderhoud
   * (een migratie, een herstelde back-up) — niet voor gewone opslagacties.
   */
  scope?: 'record' | 'all'
  /** Losse extra paden die mee moeten verversen. */
  paths?: string[]
  secret?: string
}

function isAuthorised(request: Request, body: RevalidatePayload): boolean {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) return false
  const provided =
    request.headers.get('x-md-revalidate-secret') ?? body.secret ?? ''
  // Lengtes verschillen? Dan hoeft de vergelijking niet eens.
  if (provided.length !== expected.length) return false
  // Constante-tijd-vergelijking: voorkomt dat je het geheim uit responstijden
  // kunt afleiden.
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i)
  }
  return diff === 0
}

/** Alleen echte, positieve id's doorlaten — geen "0", geen NaN. */
function toId(value: unknown): number | undefined {
  const n = typeof value === 'string' ? Number(value) : value
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) return undefined
  return n
}

export async function POST(request: Request) {
  let body: RevalidatePayload = {}
  try {
    body = (await request.json()) as RevalidatePayload
  } catch {
    // Lege of onleesbare body — hieronder afgevangen door de secret-check.
  }

  if (!isAuthorised(request, body)) {
    return NextResponse.json(
      { revalidated: false, reason: 'unauthorised' },
      { status: 401 },
    )
  }

  const type = (body.type ?? '').trim()
  if (!type) {
    return NextResponse.json(
      { revalidated: false, reason: 'no type' },
      { status: 400 },
    )
  }

  const target: RevalidateTarget = {
    type,
    slug: body.slug?.trim() || undefined,
    postId: toId(body.postId),
    brandSlug: body.brandSlug?.trim() || undefined,
    mediaId: toId(body.mediaId),
    parentId: toId(body.parentId),
    scope: body.scope === 'all' ? 'all' : 'record',
  }

  // 1. Data-cache: alleen de tags van het gewijzigde record en de lijsten
  //    waar het in voorkomt.
  //
  //    Het tweede argument is in Next 16 verplicht. `'max'` = de tag volledig
  //    ongeldig verklaren; de eerstvolgende aanvraag haalt verse data op.
  //    (`updateTag` kan alleen vanuit een Server Action, niet vanuit een route
  //    handler zoals deze.)
  const tags = tagsForTarget(target)
  for (const tag of tags) revalidateTag(tag, 'max')

  // 2. Route-cache: uitsluitend de detailpagina van het gewijzigde item.
  //
  //    Overzichten, homepage en channel-hubs hebben dit niet nodig: hun
  //    WP-fetches dragen de lijst-tags die hierboven al ongeldig zijn
  //    verklaard, en Next gooit de bijbehorende route-cache-entries daarmee
  //    mee weg. Een `revalidatePath('/')` bij élke opslag — of erger, een
  //    `revalidatePath('/channel', 'layout')` die de hele subtree meeneemt —
  //    was precies wat de cache permanent leeg hield.
  const paths = new Set<string>()
  const baseRoute = POST_TYPE_ROUTES[type]
  if (baseRoute && target.slug) {
    paths.add(`${baseRoute}/${target.slug}`)
  }
  if (target.brandSlug) {
    paths.add(`/brand/${target.brandSlug}`)
  }
  for (const extra of body.paths ?? []) {
    // Alleen eigen paden — nooit een absolute URL of een pad-uitbraak.
    if (
      extra.startsWith('/') &&
      !extra.startsWith('//') &&
      !extra.includes('..')
    ) {
      paths.add(extra)
    }
  }
  for (const path of paths) revalidatePath(path)

  return NextResponse.json({
    revalidated: true,
    type,
    scope: target.scope,
    tags,
    paths: Array.from(paths),
    at: new Date().toISOString(),
  })
}

/** Handig om te controleren of het endpoint bereikbaar is (zonder te ontcachen). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.REVALIDATE_SECRET),
    hint: 'POST met x-md-revalidate-secret en { type, slug, postId }',
  })
}
