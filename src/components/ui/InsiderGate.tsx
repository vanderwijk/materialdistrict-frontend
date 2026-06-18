'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import {
  IconCompare,
  IconDownload,
  IconCart,
  IconArticle,
  IconSearch,
  IconBoard,
  IconClose,
  IconCheck,
  IconInsiderInsights,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils/cn'
import { usePreviewMode } from '@/lib/hooks/usePreviewMode'
import { useAuth } from '@/components/providers/AuthContext'
import { InsiderMark } from './InsiderMark'

// ============================================================
// Feature presets — titel, omschrijving en icoon per feature
// ============================================================

export type InsiderFeature =
  | 'compare'
  | 'download'
  | 'sample'
  | 'export'
  | 'savedSearch'
  | 'boards'
  | 'article'
  | 'insights'
  | 'custom'

interface FeatureConfig {
  title: string
  description: string
  icon: ReactNode
}

const FEATURE_PRESETS: Record<Exclude<InsiderFeature, 'custom'>, FeatureConfig> = {
  compare: {
    title: 'Compare materials side by side',
    description: 'See how materials stack up — properties, sustainability, and more.',
    icon: <IconCompare size={28} strokeWidth={1.6} />,
  },
  download: {
    title: 'Download datasheets & brochures',
    description: 'Access technical PDFs, EPDs and installation guides from manufacturers.',
    icon: <IconDownload size={28} strokeWidth={1.6} />,
  },
  sample: {
    title: 'Request samples',
    description: 'This manufacturer only accepts sample requests from verified Insider members.',
    icon: <IconCart size={28} strokeWidth={1.6} />,
  },
  export: {
    title: 'Export as PDF',
    description: 'Download your comparison as a clean PDF to share with clients or colleagues.',
    icon: <IconDownload size={28} strokeWidth={1.6} />,
  },
  savedSearch: {
    title: 'Save searches & alerts',
    description: 'Save filter combinations and get notified when new materials match your criteria.',
    icon: <IconSearch size={28} strokeWidth={1.6} />,
  },
  boards: {
    title: 'Organize materials in Boards',
    description: 'Group materials into project folders and share them with your team.',
    icon: <IconBoard size={28} strokeWidth={1.6} />,
  },
  article: {
    title: 'Continue reading with Insider',
    description: 'Get unlimited access to in-depth articles, reports and Insider insights.',
    icon: <IconArticle size={28} strokeWidth={1.6} />,
  },
  insights: {
    title: 'Insider insights & trend reports',
    description: 'Quarterly trend reports, material forecasts and curated industry insights.',
    icon: <IconInsiderInsights size={28} strokeWidth={1.6} />,
  },
}

const ALL_INSIDER_FEATURES = [
  'Full material comparison',
  'Download PDFs & EPDs',
  'Sample requests',
  'Export compare as PDF',
  'Saved searches & alerts',
  'Insider insights',
  'Boards',
  'Insider articles',
]

// ============================================================
// Common props
// ============================================================

interface BaseProps {
  /** Feature waar de gate voor staat — bepaalt titel/icoon (tenzij custom). */
  feature: InsiderFeature
  /** Override de feature-preset titel. */
  title?: string
  /** Override de feature-preset omschrijving. */
  description?: string
  /** Override het feature-preset icoon. */
  icon?: ReactNode
  /** Lijst van features in het body-grid. Default: alle 8 Insider-features. */
  features?: string[]
  /** URL voor de primaire CTA. Default: /membership. */
  ctaHref?: string
  /** Label voor de primaire CTA. Default: "Become an Insider — €10/month". */
  ctaLabel?: string
  /** Login-fallback link voor reeds-Insider gebruikers (default: /sign-in). */
  signInHref?: string
  className?: string
}

interface ModalProps extends BaseProps {
  variant: 'modal'
  open: boolean
  onClose: () => void
  onDismissForever?: (checked: boolean) => void
  initialDismissed?: boolean
}

interface PaywallProps extends BaseProps {
  /** Article cut-off pattern: gefadede preview-content boven de gate. */
  variant: 'paywall'
}

interface PanelProps extends BaseProps {
  /** Full-page panel (Saved searches, Insider insights, Boards landing). */
  variant: 'panel'
}

interface CardProps extends BaseProps {
  /** Compacte sidebar-card binnen artikel-content. */
  variant: 'card'
}

interface PreviewProps extends BaseProps {
  /**
   * Reader-analoog van `BrandTierGate variant="section"`: toont de teal
   * gate-overlay over geblurde Insider-content; de "Preview"-knop onthult
   * `children` read-only en registreert bij de `PreviewModeProvider`
   * (in `DashboardShell`), zodat de globale `PreviewModeIndicator` verschijnt.
   * Sluiten gebeurt centraal via die indicator.
   */
  variant: 'preview'
  /** De Insider-content die in preview-mode read-only wordt onthuld. */
  children: ReactNode
}

type InsiderGateProps = ModalProps | PaywallProps | PanelProps | CardProps | PreviewProps

// Backward-compat: oude `mode` prop accepteren als alias voor `variant`
interface LegacyModeAlias {
  mode?: 'modal' | 'inline'
}

// ============================================================
// Component
// ============================================================

/**
 * InsiderGate — content-gating component voor Insider-only features/content.
 *
 * Sessie 3A batch 5 — vier varianten:
 *   - `modal` — pop-up wanneer free user op gated feature klikt
 *   - `paywall` — article cut-off pattern (gefadede preview + gate eronder)
 *   - `panel` — volledig page-niveau (Saved searches, Insider insights)
 *   - `card` — compacte sidebar-card binnen artikel-content
 *
 * Sessie 3B correctie 8 — alle varianten herzien naar mockup-patroon:
 *   - Top-block met teal Insider-branding (icoon-vierkant, eyebrow, titel
 *     in DM Serif Display, uitleg-tekst — alles in wit op teal)
 *   - Body-block met witte achtergrond, benefits als kaartjes met groene
 *     check, en teal CTA-knop (btn-insider, niet btn-primary)
 *
 * Verschilt van `<BrandTierGate>`: InsiderGate is content-gating voor
 * specifiers/visitors (teal styling, "Become an Insider — €10/month",
 * GEEN preview-modus). BrandTierGate is functionaliteit-gating voor
 * brand-eigenaren (navy/grijs, "Upgrade to {tier}", MET preview).
 *
 * @example Modal:
 *   <InsiderGate variant="modal" open={open} onClose={handleClose} feature="compare" />
 *
 * @example Paywall (article cut-off):
 *   <article>
 *     <p>{firstParagraphs}</p>
 *     <InsiderGate variant="paywall" feature="article" />
 *   </article>
 *
 * @example Panel (full page):
 *   <InsiderGate variant="panel" feature="savedSearch" />
 *
 * @example Card (sidebar):
 *   <InsiderGate variant="card" feature="insights" />
 */
export function InsiderGate(props: InsiderGateProps & LegacyModeAlias) {
  // Preview-coordinatie (alleen actief in de `preview`-variant; NOOP-safe
  // buiten een PreviewModeProvider, dus onschadelijk voor de andere varianten).
  const reactId = useId()
  const gateId = `insider-gate-${reactId}`
  const { isEnabled, enable } = usePreviewMode()
  const { isLoggedIn } = useAuth()

  // Backward-compat: oude `mode` prop → nieuwe `variant` prop
  // (TS struggles with the union narrow here; cast to a permissive shape)
  const legacyMode = (props as { mode?: 'modal' | 'inline' }).mode
  const variant: InsiderGateProps['variant'] =
    props.variant ??
    (legacyMode === 'inline' ? 'paywall' : legacyMode ?? 'modal')

  const config =
    props.feature !== 'custom'
      ? FEATURE_PRESETS[props.feature]
      : { title: '', description: '', icon: null as ReactNode }

  const title = props.title ?? config.title
  const description = props.description ?? config.description
  const icon = props.icon ?? config.icon
  const features = props.features ?? ALL_INSIDER_FEATURES
  const ctaHref = props.ctaHref ?? '/membership'
  const ctaLabel = props.ctaLabel ?? 'Become an Insider — €10/month'
  const signInHref = props.signInHref ?? '/sign-in'

  // === Preview variant — reader reveal (mirror van BrandTierGate section) ===
  if (props.variant === 'preview') {
    // Preview actief: onthul de Insider-content read-only. Sluiten gebeurt
    // centraal via de PreviewModeIndicator.
    if (isEnabled(gateId)) {
      return (
        <div
          className={cn('insider-gate is-preview-active', props.className)}
          data-preview-id={gateId}
        >
          {props.children}
        </div>
      )
    }
    return (
      <div
        className={cn('insider-gate is-preview', props.className)}
        data-preview-id={gateId}
      >
        <div className="insider-gate-content-blur" aria-hidden="true">
          {props.children}
        </div>
        <div className="insider-gate-preview-overlay">
          <div className="insider-gate-card">
            <GateTop title={title} description={description} icon={icon} />
            <div className="insider-gate-preview-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => enable(gateId)}
              >
                Preview
              </button>
              <Link href={ctaHref} className="btn btn-insider btn-sm">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === Modal variant ===
  if (variant === 'modal' && 'open' in props && 'onClose' in props) {
    return (
      <ModalShell open={props.open} onClose={props.onClose} className={props.className}>
        <GateTop title={title} description={description} icon={icon} />
        <GateBody
          features={features}
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          signInHref={signInHref}
          onDismiss={props.onClose}
          onDismissForever={props.onDismissForever}
          initialDismissed={props.initialDismissed}
        />
      </ModalShell>
    )
  }

  // === Paywall variant — article cut-off ===
  if (variant === 'paywall') {
    return (
      <div className={cn('insider-gate is-paywall', props.className)}>
        <div className="insider-gate-fade" aria-hidden="true" />
        <div className="insider-gate-card">
          <GateTop title={title} description={description} icon={icon} />
          <GateBody
            features={features}
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
            signInHref={signInHref}
          />
        </div>
      </div>
    )
  }

  // === Panel variant — full page ===
  if (variant === 'panel') {
    return (
      <section
        className={cn('insider-gate is-panel', props.className)}
        aria-labelledby="insider-gate-panel-title"
      >
        <div className="insider-gate-card is-large">
          <GateTop
            title={title}
            description={description}
            icon={icon}
            titleId="insider-gate-panel-title"
            iconSize="lg"
          />
          <GateBody
            features={features}
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
            signInHref={signInHref}
          />
        </div>
      </section>
    )
  }

  // === Card variant — sidebar / inline-block ===
  return (
    <aside className={cn('insider-gate is-card', props.className)}>
      <div className="insider-gate-card is-compact">
        <div className="insider-gate-card-eyebrow">
          <InsiderMark size="xs" />
          <span>Insider only</span>
        </div>
        <div className="insider-gate-card-title">{title}</div>
        {description && (
          <p className="insider-gate-card-description">{description}</p>
        )}
        <Link href={ctaHref} className="btn btn-insider btn-sm insider-gate-cta">
          {ctaLabel}
        </Link>
        {!isLoggedIn && (
          <a href={signInHref} className="insider-gate-signin-link">
            Already an Insider? Log in →
          </a>
        )}
      </div>
    </aside>
  )
}

// ============================================================
// Sub-components (intern)
// ============================================================

function GateTop({
  title,
  description,
  icon,
  titleId,
  iconSize = 'md',
}: {
  title: string
  description: string
  icon: ReactNode
  titleId?: string
  iconSize?: 'md' | 'lg'
}) {
  return (
    <div className="insider-gate-top">
      {icon && (
        <div className={cn('insider-gate-icon', `is-${iconSize}`)}>{icon}</div>
      )}
      <div className="insider-gate-eyebrow">
        <InsiderMark size="xs" />
        <span>Insider only</span>
      </div>
      <div id={titleId} className="insider-gate-title">{title}</div>
      {description && <div className="insider-gate-sub">{description}</div>}
    </div>
  )
}

function GateBody({
  features,
  ctaHref,
  ctaLabel,
  signInHref,
  onDismiss,
  onDismissForever,
  initialDismissed,
}: {
  features: string[]
  ctaHref: string
  ctaLabel: string
  signInHref: string
  /** Modal-only: optionele "Maybe later" knop die de modal sluit. */
  onDismiss?: () => void
  /** Modal-only: optionele "Don't show this again" checkbox. */
  onDismissForever?: (checked: boolean) => void
  initialDismissed?: boolean
}) {
  const { isLoggedIn } = useAuth()
  return (
    <div className="insider-gate-body">
      <div className="insider-gate-list-label">Included with Insider</div>
      <div className="insider-gate-feature-grid">
        {features.map((feat, i) => (
          <div key={i} className="insider-gate-feature-item">
            <IconCheck size={12} strokeWidth={2.5} />
            {feat}
          </div>
        ))}
      </div>
      {/* Sessie 3B correctie 8: CTA-knop is teal (btn-insider), niet navy. */}
      <Link href={ctaHref} className="btn btn-insider btn-md insider-gate-cta">
        {ctaLabel}
      </Link>
      {!isLoggedIn && (
        <a href={signInHref} className="insider-gate-signin-link">
          Already an Insider? Log in →
        </a>
      )}
      {onDismiss && (
        <button
          type="button"
          className="insider-gate-secondary"
          onClick={onDismiss}
        >
          Maybe later
        </button>
      )}
      {onDismissForever && (
        <div className="insider-gate-footnote">
          <label className="insider-gate-dontshow">
            <input
              type="checkbox"
              defaultChecked={initialDismissed}
              onChange={(e) => onDismissForever(e.target.checked)}
            />
            Don&apos;t show this again
          </label>
        </div>
      )}
    </div>
  )
}

interface ModalShellProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

function ModalShell({ open, onClose, children, className }: ModalShellProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement as HTMLElement | null

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)

    const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="insider-gate-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn('insider-gate-modal', className)}>
        <button
          type="button"
          className="insider-gate-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <IconClose size={16} strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>
  )
}
