/**
 * `POST /api/revalidate` — WordPress meldt een wijziging, de frontend ververst.
 *
 * §BETA-FIX-24-08 (H2).
 *
 * Het probleem dat dit oplost: de site bakt pagina's voor en ververst ze op
 * een timer (materials 6 uur, brands 24 uur, redactioneel 1 uur). Snel en
 * DDOS-bestendig, maar de redactie zag een net gepubliceerd materiaal wél op
 * het overzicht en niet op de homepage — twee pagina's met twee termijnen. En
 * een vervangen thumbnail bleef lang hangen, omdat die in de media-cache zit
 * en niet in die van de post.
 *
 * Vanaf nu belt WordPress bij elke opslag dit endpoint. Dat verklaart de
 * cache-tags van het betreffende contenttype ongeldig en laat de geraakte
 * routes opnieuw bakken: de detailpagina, het overzicht en de homepage.
 * Publiceren is daarmee binnen enkele seconden zichtbaar, zonder dat de site
 * zijn snelheid of cache-bescherming verliest.
 *
 * Beveiliging. De aanroep draagt `REVALIDATE_SECRET` mee (header
 * `x-md-revalidate-secret`, of `secret` in de body). Zonder geldig geheim:
 * 401. Is het geheim niet gezet in de omgeving, dan is het endpoint uit — dan
 * liever niets doen dan een open ontcache-knop op internet.
 *
 * Het endpoint is bewust ruimhartig in wat het accepteert: onbekende posttypes
 * leveren geen fout maar een nette "niets te doen". WordPress hoeft dus niet
 * te weten welke types de frontend kent.
 */

import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { POST_TYPE_ROUTES, tagsForPostType } from '@/lib/api/cache-tags'

/** Nooit cachen — dit is een schrijfactie. */
export const dynamic = 'force-dynamic'

interface RevalidatePayload {
  /** WP-posttype: material, article, brand, event, talk, book, product. */
  type?: string
  /** Slug van het gewijzigde item (voor de detailpagina). */
  slug?: string
  /** Slug van de brand waar een materiaal onder hangt, indien bekend. */
  brandSlug?: string
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

export async function POST(request: Request) {
  let body: RevalidatePayload = {}
  try {
    body = (await request.json()) as RevalidatePayload
  } catch {
    // Lege of onleesbare body — hieronder afgevangen door de secret-check.
  }

  if (!isAuthorised(request, body)) {
    return NextResponse.json({ revalidated: false, reason: 'unauthorised' }, { status: 401 })
  }

  const type = (body.type ?? '').trim()
  if (!type) {
    return NextResponse.json({ revalidated: false, reason: 'no type' }, { status: 400 })
  }

  // 1. Data-cache: de WP-fetches van dit type (plus media, en de andere kant
  //    van de brand/material-relatie) opnieuw ophalen.
  //
  //    Het tweede argument is in Next 16 verplicht. `'max'` = de tag volledig
  //    ongeldig verklaren; de eerstvolgende aanvraag haalt verse data op.
  //    (`updateTag` kan alleen vanuit een Server Action, niet vanuit een
  //    route handler zoals deze.)
  const tags = tagsForPostType(type)
  for (const tag of tags) revalidateTag(tag, 'max')

  // 2. Route-cache: de pagina's waar dit type op voorkomt opnieuw bakken.
  const base = POST_TYPE_ROUTES[type]
  const paths = new Set<string>(['/'])
  if (base) {
    paths.add(base)
    if (body.slug) paths.add(`${base}/${body.slug}`)
  }
  if (body.brandSlug) paths.add(`/brand/${body.brandSlug}`)
  for (const extra of body.paths ?? []) {
    // Alleen eigen paden — nooit een absolute URL of een pad-uitbraak.
    if (extra.startsWith('/') && !extra.startsWith('//') && !extra.includes('..')) {
      paths.add(extra)
    }
  }
  for (const path of paths) revalidatePath(path)
  // Channel-hubs mixen alle types. Alleen `/channel` ontcachen laat de
  // hub-detailpagina's (`/channel/[slug]`) op de oude timer staan.
  if (
    type === 'material' ||
    type === 'article' ||
    type === 'brand' ||
    type === 'event' ||
    type === 'talk' ||
    type === 'theme'
  ) {
    revalidatePath('/channel', 'layout')
    paths.add('/channel')
  }

  return NextResponse.json({
    revalidated: true,
    type,
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
    hint: 'POST met x-md-revalidate-secret en { type, slug }',
  })
}
