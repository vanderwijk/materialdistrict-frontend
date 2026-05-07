'use client'

import { useEffect, useRef } from 'react'
import { GitCompareArrows, Download, Package, FileText, Search, X, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

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
  | 'custom'

interface FeatureConfig {
  title: string
  description: string
  icon: React.ReactNode
}

const FEATURE_PRESETS: Record<Exclude<InsiderFeature, 'custom'>, FeatureConfig> = {
  compare: {
    title: 'Compare materials side by side',
    description: 'See how materials stack up — properties, sustainability, and more.',
    icon: <GitCompareArrows size={28} strokeWidth={1.6} />,
  },
  download: {
    title: 'Download datasheets & brochures',
    description: 'Access technical PDFs, EPDs and installation guides from manufacturers.',
    icon: <Download size={28} strokeWidth={1.6} />,
  },
  sample: {
    title: 'Request samples',
    description: 'This manufacturer only accepts sample requests from verified Insider members.',
    icon: <Package size={28} strokeWidth={1.6} />,
  },
  export: {
    title: 'Export as PDF',
    description: 'Download your comparison as a clean PDF to share with clients or colleagues.',
    icon: <FileText size={28} strokeWidth={1.6} />,
  },
  savedSearch: {
    title: 'Save searches & alerts',
    description: 'Save filter combinations and get notified when new materials match your criteria.',
    icon: <Search size={28} strokeWidth={1.6} />,
  },
  boards: {
    title: 'Organize materials in Boards',
    description: 'Group materials into project folders and share them with your team.',
    icon: <Package size={28} strokeWidth={1.6} />,
  },
  article: {
    title: 'Continue reading with Insider',
    description: 'Get unlimited access to in-depth articles, reports and Insider insights.',
    icon: <FileText size={28} strokeWidth={1.6} />,
  },
}

/** De volledige lijst met Insider-features die in elke modal getoond wordt. */
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
  icon?: React.ReactNode
  /** Lijst van features in het body-grid. Default: alle 8 Insider-features. */
  features?: string[]
  /** URL voor de primaire CTA. Default: /membership. */
  ctaHref?: string
  /** Label voor de primaire CTA. Default: "Become an Insider →". */
  ctaLabel?: string
  className?: string
}

// ============================================================
// Modal mode
// ============================================================

interface ModalProps extends BaseProps {
  mode: 'modal'
  /** Of de modal open is. */
  open: boolean
  /** Wordt aangeroepen wanneer de gebruiker de modal sluit (X, Escape, of "Maybe later"). */
  onClose: () => void
  /**
   * Callback wanneer de gebruiker "Don't show again" aanvinkt.
   * Wanneer afwezig, wordt de checkbox niet getoond.
   */
  onDismissForever?: (checked: boolean) => void
  /** Initial state voor de "don't show" checkbox (typisch uit localStorage). */
  initialDismissed?: boolean
}

// ============================================================
// Inline mode
// ============================================================

interface InlineProps extends BaseProps {
  mode: 'inline'
  open?: never
  onClose?: never
  onDismissForever?: never
  initialDismissed?: never
}

type InsiderGateProps = ModalProps | InlineProps

// ============================================================
// Component
// ============================================================

/**
 * InsiderGate — upgrade-prompt voor Insider-only features.
 *
 * Modal mode: pop-up wanneer een free user op een gated feature klikt.
 * Inline mode: gate onder een afgekapte preview (bv. gated article body).
 *
 * @example
 *   // Modal
 *   const [open, setOpen] = useState(false)
 *   <InsiderGate
 *     mode="modal"
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     feature="compare"
 *   />
 *
 *   // Inline
 *   <InsiderGate mode="inline" feature="article" />
 */
export function InsiderGate(props: InsiderGateProps) {
  const config = props.feature !== 'custom'
    ? FEATURE_PRESETS[props.feature]
    : { title: '', description: '', icon: null }

  const title = props.title ?? config.title
  const description = props.description ?? config.description
  const icon = props.icon ?? config.icon
  const features = props.features ?? ALL_INSIDER_FEATURES
  const ctaHref = props.ctaHref ?? '/membership'
  const ctaLabel = props.ctaLabel ?? 'Become an Insider →'

  const cardContent = (
    <>
      <GateTop title={title} description={description} icon={icon} />
      <div className="insider-modal-body">
        <div className="insider-modal-list-label">Included with Insider — €10/month</div>
        <div className="insider-feature-grid">
          {features.map((feat, i) => (
            <div key={i} className="insider-feature-item">
              <Check size={12} strokeWidth={2.5} color="var(--green)" aria-hidden="true" />
              {feat}
            </div>
          ))}
        </div>
        <Link href={ctaHref} className="insider-modal-cta">
          {ctaLabel}
        </Link>
        {props.mode === 'modal' && (
          <>
            <button type="button" className="insider-modal-secondary" onClick={props.onClose}>
              Maybe later
            </button>
            {props.onDismissForever && (
              <div className="insider-modal-footnote">
                <label className="insider-modal-dontshow">
                  <input
                    type="checkbox"
                    defaultChecked={props.initialDismissed}
                    onChange={(e) => props.onDismissForever?.(e.target.checked)}
                  />
                  Don't show this again
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )

  if (props.mode === 'modal') {
    return <ModalShell open={props.open} onClose={props.onClose} className={props.className}>{cardContent}</ModalShell>
  }

  // Inline mode
  return (
    <div className={cn('insider-gate-inline', props.className)}>
      <div className="insider-gate-card">{cardContent}</div>
    </div>
  )
}

// ============================================================
// Sub-components (intern)
// ============================================================

function GateTop({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="insider-modal-top">
      {icon && <div className="insider-modal-icon">{icon}</div>}
      <div className="insider-modal-eyebrow">Insider only</div>
      <div className="insider-modal-title">{title}</div>
      {description && <div className="insider-modal-sub">{description}</div>}
    </div>
  )
}

interface ModalShellProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

/** Modal-overlay met focus-trap, ESC-close en click-outside-close. */
function ModalShell({ open, onClose, children, className }: ModalShellProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus management + ESC handler
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

    // Focus first focusable in modal
    const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    // Lock body scroll
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
      className="insider-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="insider-modal-title"
    >
      <div className={cn('insider-modal', className)}>
        <button
          type="button"
          className="insider-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>
  )
}
