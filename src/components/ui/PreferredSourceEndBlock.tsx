/**
 * PreferredSourceEndBlock — einde-tekst CTA op detailpagina's.
 * ----------------------------------------------------------------------
 * Rustig blok ná de content (vóór prev/next). Herbruikt op alle detail-
 * pagina's; per pagina alleen een andere `placement` (voor de analytics) en
 * optioneel andere tekst. Leunt op de bestaande `.pref-source-endblock`-CSS.
 */

import { PreferredSourceButton } from './PreferredSourceButton'

export interface PreferredSourceEndBlockProps {
  /** Plek voor de click-analytics: article | material | brand | talk | event | book. */
  placement: string
  heading?: string
  sub?: string
}

export function PreferredSourceEndBlock({
  placement,
  heading = 'Enjoyed this?',
  sub = 'Make MaterialDistrict a preferred source — see our content first in Google.',
}: PreferredSourceEndBlockProps) {
  return (
    <aside
      className="pref-source-endblock"
      aria-label="Make MaterialDistrict your preferred source on Google"
    >
      <div className="pref-source-endblock-txt">
        <span className="pref-source-endblock-h">{heading}</span>
        <span className="pref-source-endblock-sub">{sub}</span>
      </div>
      <PreferredSourceButton variant="default" placement={placement} />
    </aside>
  )
}
