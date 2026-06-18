'use client'

import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconLock, IconEye } from '@/components/ui/icons'
import { usePreviewMode } from '@/lib/hooks/usePreviewMode'

export type BrandTier = 'basis' | 'plus' | 'partner'

interface BrandTierGateBaseProps {
  /** Vereist tier — bepaalt de tekst ("requires Plus or Partner" / "requires Partner"). */
  required: BrandTier
  /** Naam van de functionaliteit (bv. "Statistics", "Channel coupling"). */
  title: string
  /** Korte upgrade-pitch onder de titel in de overlay. */
  description: ReactNode
  /** Upgrade-CTA href. */
  upgradeHref: string
  /** Override voor de CTA-tekst. Default: "Upgrade to {tier} →". */
  ctaLabel?: string
  /**
   * Extra klassen op de wrapper. Voor de section-variant geef je hier
   * `dash-panel` mee zodat de gate de volle panelkaart wordt en de overlay
   * (incl. de eigen sectietitel + velden erachter) de héle kaart bedekt —
   * exact zoals de demo (mfGate over een `position:relative` paneel).
   */
  className?: string
}

interface BrandTierGatePageProps extends BrandTierGateBaseProps {
  variant: 'page'
}

interface BrandTierGateSectionProps extends BrandTierGateBaseProps {
  variant: 'section'
  /**
   * De échte sectie-inhoud (titel + omschrijving + velden). Wordt vervaagd
   * achter de overlay gerenderd en in preview-modus onthuld.
   */
  children: ReactNode
}

type BrandTierGateProps = BrandTierGatePageProps | BrandTierGateSectionProps

/**
 * BrandTierGate — functionaliteit-gate voor manufacturer-side dashboards.
 *
 * Eén canonieke behandeling, 1-op-1 met de demo (`mfGate` / `pageGate`):
 *   - bare grijs hangslot-icoon (géén gekleurde cirkel),
 *   - titel = "{functionaliteit} requires {tier}",
 *   - korte omschrijving,
 *   - acties: zwarte "Upgrade to {tier} →" + outline "Preview" (oog-icoon).
 *
 * De upgrade-knop is bewust ZWART (niet de blauwe MF_TIERS-kleur uit de demo):
 * groen/kleur is voorbehouden aan de enige primaire actie per pagina (Save
 * changes). Dit is de enige doelbewuste afwijking van de demo.
 *
 * Twee varianten:
 *   - `section`: overlay over de héle sectiekaart. De echte inhoud (de eigen
 *     titel + velden) staat vervaagd erachter; alleen de overlay-titel is
 *     scherp — dus geen dubbele/overlappende titels meer. **Met preview-modus.**
 *   - `page`: volle-breedte gate-kaart (surface2) voor een hele pagina
 *     (Statistics, Lead routing). Alleen upgrade-CTA (geen preview).
 *
 * Onderscheid t.o.v. `<InsiderGate>` (reader-side, teal "Become an Insider").
 */
export function BrandTierGate(props: BrandTierGateProps) {
  const reactId = useId()
  const gateId = `brand-tier-gate-${reactId}`
  const { isEnabled, enable } = usePreviewMode()

  const previewActive = props.variant === 'section' && isEnabled(gateId)

  const tierLabel = {
    basis: 'Basis',
    plus: 'Plus',
    partner: 'Partner',
  }[props.required]

  // Demo-wording: "<feature> requires Plus or Partner" / "requires Partner".
  const requirement =
    props.required === 'partner'
      ? 'Partner'
      : props.required === 'basis'
        ? 'Basis or higher'
        : 'Plus or Partner'
  const gateTitle = `${props.title} requires ${requirement}`
  const ctaLabel = props.ctaLabel ?? `Upgrade to ${tierLabel} →`

  // === Page variant ===
  if (props.variant === 'page') {
    return (
      <section
        className={cn('brand-tier-gate is-page', `is-${props.required}`, props.className)}
        aria-labelledby={`${gateId}-title`}
      >
        <div className="brand-tier-gate-inner">
          <span className="brand-tier-gate-icon" aria-hidden="true">
            <IconLock size={36} strokeWidth={1.5} />
          </span>
          <h2 id={`${gateId}-title`} className="brand-tier-gate-title">
            {gateTitle}
          </h2>
          <p className="brand-tier-gate-description">{props.description}</p>
          <div className="brand-tier-gate-actions">
            <a href={props.upgradeHref} className="btn btn-primary btn-sm">
              {ctaLabel}
            </a>
          </div>
        </div>
      </section>
    )
  }

  // === Section variant — preview aan: gewoon de inhoud, geen overlay ===
  if (previewActive) {
    return (
      <div
        className={cn('brand-tier-gate is-section is-preview-active', props.className)}
        data-preview-id={gateId}
      >
        {props.children}
      </div>
    )
  }

  // === Section variant — gated: echte inhoud vervaagd erachter + overlay erover ===
  return (
    <div
      className={cn('brand-tier-gate is-section', `is-${props.required}`, props.className)}
      aria-labelledby={`${gateId}-title`}
      data-preview-id={gateId}
    >
      <div className="brand-tier-gate-content" aria-hidden="true">
        {props.children}
      </div>
      <div className="brand-tier-gate-overlay">
        <span className="brand-tier-gate-icon" aria-hidden="true">
          <IconLock size={22} strokeWidth={1.5} />
        </span>
        <h3 id={`${gateId}-title`} className="brand-tier-gate-title">
          {gateTitle}
        </h3>
        <p className="brand-tier-gate-description">{props.description}</p>
        <div className="brand-tier-gate-actions">
          <a href={props.upgradeHref} className="btn btn-primary btn-sm">
            {ctaLabel}
          </a>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => enable(gateId)}
          >
            <IconEye size={14} /> Preview
          </button>
        </div>
      </div>
    </div>
  )
}
