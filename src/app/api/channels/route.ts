/**
 * /api/channels  (GET)
 *
 * Publieke proxy voor de channel-catalogus → WordPress `/md/v2/material-channels`
 * (via `getChannelCatalog`). Bestaat zodat client-componenten (o.a. het follow-
 * blok, F4a) de volledige channel-lijst kunnen ophalen zonder dat elke pagina
 * 'm server-side hoeft door te geven. Geen auth nodig: channels zijn publiek.
 *
 *   GET → { channels: [{ id, slug, label }] }  (op aantal aflopend gesorteerd)
 *
 * De onderliggende WP-fetch is al gecachet (revalidate 3600 in
 * `getChannelCatalog`); de route-response cachen we hier eveneens.
 */

import { NextResponse } from 'next/server'
import { getChannelCatalog } from '@/lib/api/channels'

export const revalidate = 3600

export async function GET() {
  const channels = await getChannelCatalog().catch(() => [])
  const sorted = [...channels].sort((a, b) => b.count - a.count)
  return NextResponse.json({
    channels: sorted.map((c) => ({ id: c.id, slug: c.slug, label: c.label })),
  })
}
