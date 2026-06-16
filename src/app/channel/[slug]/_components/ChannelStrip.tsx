/**
 * ChannelStrip — één type-sectie op de channel-hub (stap 12).
 *
 * Sectiekop (h2) + een "view all"-deeplink naar het in-place gefilterde
 * overzicht, gevolgd door een grid met de eerste N kaarten. Generiek over alle
 * content-types; de caller levert de kaarten als children. Hergebruikt de
 * bestaande `ov-grid-*` klassen voor de grid.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'

interface ChannelStripProps {
  title: string
  /** Deeplink naar het gefilterde overzicht, bv. `/material?channel=biobased`. */
  viewAllHref: string
  viewAllLabel: string
  /** Grid-klasse voor de kaarten. Default `ov-grid-4`. */
  gridClassName?: string
  children: ReactNode
}

export function ChannelStrip({
  title,
  viewAllHref,
  viewAllLabel,
  gridClassName = 'ov-grid-4',
  children,
}: ChannelStripProps) {
  return (
    <section className="channel-strip">
      <div className="channel-strip-head">
        <h2 className="t-display-sm">{title}</h2>
        <Link href={viewAllHref} className="channel-strip-link">
          {viewAllLabel} →
        </Link>
      </div>
      <div className={gridClassName}>{children}</div>
    </section>
  )
}
