import { getChannelCatalog } from './channels'
import type { DigestChannel } from '@/components/layout/FollowDigestBlock'

/**
 * getDigestChannels — levert de top-N channels (op materials-telling) als
 * `DigestChannel[]` voor het volgblok.
 *
 * Tot nu toe gaf alleen de footer het volgblok zijn channels mee (server-side
 * geprept); de detailpagina's riepen `<FollowDigestBlock compact />` zónder
 * channels aan en leunden op een client-fetch die daar leeg terugkwam — vandaar
 * de kale, chip-loze variant. Deze helper centraliseert de prep zodat álle
 * plekken hetzelfde, server-side gevulde blok tonen.
 */
export async function getDigestChannels(limit = 8): Promise<DigestChannel[]> {
  const channels = await getChannelCatalog().catch(() => [])
  return [...channels]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((c) => ({ id: c.id, slug: c.slug, label: c.label }))
}
