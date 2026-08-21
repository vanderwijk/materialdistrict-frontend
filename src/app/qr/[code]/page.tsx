/**
 * Legacy material QR / archive-label resolver.
 *
 * Printed sample labels (see plugin `print-label.php`) historically encoded
 * `materialdistrict.com/?p={post_id}`. Newer labels and any `/qr/{code|id}`
 * bookmarks land here. We resolve to the public material detail URL.
 *
 * Accepts:
 *  - numeric post ID (durable identity — preferred on labels)
 *  - material code such as ONA1223 (spoken handle; REST lookup)
 */

import { notFound, permanentRedirect } from 'next/navigation'
import {
  getMaterialByCode,
  getMaterialById,
} from '@/lib/api/wordpress'

type PageProps = {
  params: Promise<{ code: string }>
}

export default async function QrMaterialRedirectPage({ params }: PageProps) {
  const { code: raw } = await params
  const token = decodeURIComponent(raw).trim()

  if (!token) {
    notFound()
  }

  let slug: string | null = null

  if (/^\d+$/.test(token)) {
    const byId = await getMaterialById(Number(token))
    slug = byId?.slug ?? null
  }

  if (!slug) {
    const byCode = await getMaterialByCode(token)
    slug = byCode?.slug ?? null
  }

  if (!slug) {
    notFound()
  }

  permanentRedirect(`/material/${slug}/`)
}
