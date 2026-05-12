'use client'

import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconLock, IconShield, IconArrowRight } from '@/components/ui/icons'
import { usePreviewMode } from '@/lib/hooks/usePreviewMode'

export type BrandTier = 'basis' | 'plus' | 'partner'

interface BrandTierGateBaseProps {
  /** Vereist tier — bepaalt welke kleur/icoon variant getoond wordt. */
  required: BrandTier
  /** Korte titel boven de gate (bv. "Statistics", "Lead routing"). */
  title: string
  /**
   * Beschrijvende tekst onder de titel — wat doet deze functionaliteit en
   * waarom upgrade?
   */
  description: ReactNode
  /** Upgrade-CTA href. */
  upgradeHref: string
  /** Override voor de CTA-tekst. Default: "Upgrade to {tier} →". */
  ctaLabel?: string
  className?: string
}

interface BrandTierGatePageProps extends BrandTierGateBaseProps {
  variant: 'page'
}

interface BrandTierGateSectionProps extends BrandTierGateBaseProps {
  variant: 'section'
  /**
   * De content die in preview-mode wordt onthuld. Vereist voor `section`
   * variant — anders heeft preview geen inhoud om te tonen.
   */
  children: ReactNode
}

type BrandTierGateProps = BrandTierGatePageProps | BrandTierGateSectionProps

/**
 * BrandTierGate — functionaliteit-gate voor manufacturer-side dashboards.
 *
 * Twee varianten:
 *   - `page`: hele dashboard-pagina afgeschermd (Statistics, Lead routing).
 *     Geen preview-modus — alleen upgrade-CTA.
 *   - `section`: inline overlay over een specifieke form-sectie binnen een
 *     dashboard-pagina. **Met preview-modus** — knop "Preview" onthult de
 *     content (read-only effectief), en het globale `<PreviewModeIndicator>`
 *     verschijnt onderaan de pagina.
 *
 * Onderscheid t.o.v. `<InsiderGate>`:
 *   - InsiderGate = content-gating voor specifiers/visitors (teal, "Become an Insider")
 *   - BrandTierGate = functionaliteit-gating voor brand-eigenaren (navy/grijs, "Upgrade to {tier}")
 *
 * Voor preview-coordinatie: wrap de pagina in `<PreviewModeProvider>`.
 *
 * @example Page-variant (geen preview):
 *   <BrandTierGate variant="page" required="plus" title="Statistics"
 *     description="See who views and downloads your samples."
 *     upgradeHref="/dashboard/billing" />
 *
 * @example Section-variant (met preview):
 *   <BrandTierGate variant="section" required="partner" title="Brochures"
 *     description="Upload PDF brochures with each material."
 *     upgradeHref="/dashboard/billing">
 *     <BrochureUploadForm />
 *   </BrandTierGate>
 */
export function BrandTierGate(props: BrandTierGateProps) {
  const reactId = useId()
  const gateId = `brand-tier-gate-${reactId}`
  const { isEnabled, enable } = usePreviewMode()

  // Is preview-mode geactiveerd voor deze section?
  const previewActive =
    props.variant === 'section' && isEnabled(gateId)

  const tierLabel = {
    basis: 'Basis',
    plus: 'Plus',
    partner: 'Partner',
  }[props.required]

  const ctaLabel = props.ctaLabel ?? `Upgrade to ${tierLabel} →`

  // Tier bepaalt het icoon: hoger tier = strenger lock
  const TierIcon =
    props.required === 'partner' ? IconShield : IconLock

  // === Page variant ===
  if (props.variant === 'page') {
    return (
      <section
        className={cn('brand-tier-gate is-page', `is-${props.required}`, props.className)}
        aria-labelledby={`${gateId}-title`}
      >
        <div className="brand-tier-gate-inner">
          <div className="brand-tier-gate-icon" aria-hidden="true">
            <TierIcon size={28} strokeWidth={1.75} />
          </div>
          <div className="brand-tier-gate-tier">{tierLabel} feature</div>
          <h2 id={`${gateId}-title`} className="brand-tier-gate-title t-display-md">
            {props.title}
          </h2>
          <p className="brand-tier-gate-description t-body">
            {props.description}
          </p>
          <a href={props.upgradeHref} className="btn btn-primary btn-md">
            {ctaLabel}
          </a>
        </div>
      </section>
    )
  }

  // === Section variant ===
  if (previewActive) {
    // Preview is aan: render de content gewoon. Geen overlay meer.
    return (
      <div
        className={cn('brand-tier-gate is-section is-preview-active', props.className)}
        data-preview-id={gateId}
      >
        {props.children}
      </div>
    )
  }

  return (
    <div
      className={cn('brand-tier-gate is-section', `is-${props.required}`, props.className)}
      aria-labelledby={`${gateId}-title`}
      data-preview-id={gateId}
    >
      {/* Achterliggende content blurred renderen voor visuele context */}
      <div className="brand-tier-gate-content-blur" aria-hidden="true">
        {props.children}
      </div>
      <div className="brand-tier-gate-overlay">
        <div className="brand-tier-gate-icon" aria-hidden="true">
          <TierIcon size={22} strokeWidth={1.75} />
        </div>
        <div className="brand-tier-gate-tier">{tierLabel} feature</div>
        <h3 id={`${gateId}-title`} className="brand-tier-gate-title t-display-sm">
          {props.title}
        </h3>
        <p className="brand-tier-gate-description t-body-sm">
          {props.description}
        </p>
        <div className="brand-tier-gate-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => enable(gateId)}
          >
            Preview
          </button>
          <a href={props.upgradeHref} className="btn btn-primary btn-sm">
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  )
}
