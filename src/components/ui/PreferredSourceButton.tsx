'use client'

import { cn } from '@/lib/utils/cn'
import { logPreferredSourceClick } from '@/lib/api/preferredSource'

// ============================================================
// Constants
// ============================================================

/**
 * Google's deeplink naar de source-preferences tool met ons domein al
 * voorgevuld. Ingelogde Google-gebruikers voegen MaterialDistrict in één tik
 * toe als voorkeursbron — geen zoeken nodig.
 *
 * Alleen domein/subdomein is geschikt (geen subpad), daarom het kale
 * `materialdistrict.com`. Check of het domein in de tool staat door het in te
 * voeren op https://google.com/preferences/source
 */
const PREFERRED_SOURCE_URL =
  'https://google.com/preferences/source?q=materialdistrict.com'

const DEFAULT_LABEL = 'Make MaterialDistrict your preferred source'

// ============================================================
// Types
// ============================================================

export type PreferredSourceButtonVariant = 'default' | 'compact'

export interface PreferredSourceButtonProps {
  /** 'default' = volle CTA; 'compact' = kleine pill voor footer/inline rijen. */
  variant?: PreferredSourceButtonVariant
  /**
   * Waar de knop staat. Puur voor de click-analytics (event `source`), zodat
   * we per plek zien wat converteert (footer/article/homepage/newsletter).
   */
  placement?: string
  /** Override op de standaard-tekst. */
  label?: string
  className?: string
}

/**
 * PreferredSourceButton — Google Preferred Sources CTA.
 * ----------------------------------------------------------------------
 * Stuurt lezers naar Google's source-preferences tool met ons domein
 * voorgevuld, zodat ze MaterialDistrict als voorkeursbron kunnen toevoegen.
 * Wie ons kiest, ziet ons vaker bovenaan in Top Stories én in AI Overviews /
 * AI Mode — directe zichtbaarheidswinst, en het sluit aan op de loyale
 * follow/digest-achterban (zet 'm ook in de digest-mail).
 *
 * Opent in een nieuw tabblad. De klik wordt best-effort gelogd als generiek
 * event (zie `logPreferredSourceClick`), zodat we per plek de conversie zien.
 *
 * Plaatsing (zie docs/preferred-sources-item.md):
 *   - footer-bottom            → variant="compact"
 *   - boven artikelen / homepage / digest → variant="default"
 */
export function PreferredSourceButton({
  variant = 'default',
  placement = 'unknown',
  label = DEFAULT_LABEL,
  className,
}: PreferredSourceButtonProps) {
  return (
    <a
      href={PREFERRED_SOURCE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('pref-source-btn', `pref-source-btn--${variant}`, className)}
      onClick={() => logPreferredSourceClick(placement)}
      data-placement={placement}
    >
      <GoogleGIcon className="pref-source-btn-g" />
      <span className="pref-source-btn-label">{label}</span>
    </a>
  )
}

// ============================================================
// Google "G" — officiële 4-kleuren mark.
// ------------------------------------------------------------
// Google levert ook downloadbare button-assets (deels gelokaliseerd); die
// kunnen 1-op-1 in /public en hier vervangen worden als pixel-perfecte /
// gelokaliseerde branding gewenst is. Inline gehouden zodat de knop out of
// the box werkt zonder extra asset.
// ============================================================

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
