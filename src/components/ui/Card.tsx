import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode, MouseEventHandler, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils/cn'
import { normalizeMediaUrl } from '@/lib/utils/normalize-media-url'
import { HoverPrefetchLink } from './HoverPrefetchLink'

// ============================================================
// Card root — compositie wrapper
// ============================================================

interface CardBaseProps {
  children: ReactNode
  className?: string
}

interface CardLinkProps extends CardBaseProps {
  href: string
  onClick?: never
  ariaLabel?: string
  /**
   * Next.js Link prefetch-strategie.
   * Default: `undefined` — Next.js standaardgedrag (prefetch zodra in
   * viewport). Zet expliciet op `false` om viewport-prefetch uit te zetten.
   *
   * Combineer met `prefetchOn="hover"` om op user-intent (hover/focus)
   * te prefetchen zonder elke card-in-viewport te warmen.
   *
   * Sessie 6 (performance): gebruikt door MaterialCard om 12 simultane
   * prefetches per `/material`-page te voorkomen.
   */
  prefetch?: boolean
  /**
   * Wanneer de prefetch getriggerd wordt.
   * - `'render'` (default): standaard Next.js gedrag — viewport-based.
   * - `'hover'`: prefetch pas op `mouseenter` / `focus` / `touchstart`.
   *   Zet `prefetch={false}` samen met deze waarde — anders heeft het
   *   geen effect (Next.js zou alsnog viewport-prefetchen).
   */
  prefetchOn?: 'render' | 'hover'
}

interface CardClickableProps extends CardBaseProps {
  href?: never
  onClick: MouseEventHandler<HTMLDivElement>
  ariaLabel: string
}

interface CardStaticProps extends CardBaseProps {
  href?: never
  onClick?: never
  ariaLabel?: never
}

type CardProps = CardLinkProps | CardClickableProps | CardStaticProps

/**
 * Card root component. Compositie-aanpak:
 *   <Card href="/foo">
 *     <Card.Thumb src="..." alt="..." />
 *     <Card.Body>
 *       <Tag contentType="material" />
 *       <Card.Brand>Eternit</Card.Brand>
 *       <Card.Title>Recycled Glass Composite</Card.Title>
 *     </Card.Body>
 *   </Card>
 *
 * Drie modi:
 *  - href="..." → Link wrapper, klik = navigatie
 *  - onClick=...  → interactieve div, role="button" met keyboard support
 *  - geen van beide → presentational div
 *
 * Sessie 6 (performance): twee optionele Link-props:
 *  - `prefetch` (boolean) — passthrough naar Next.js' Link
 *  - `prefetchOn` ('render' | 'hover') — wanneer er geprefetched wordt
 *
 * Default-gedrag is ongewijzigd. Alleen MaterialCard zet
 * `prefetch={false}` + `prefetchOn="hover"`. Andere content-types
 * (articles, events, talks) blijven standaard viewport-prefetch gebruiken
 * — die staan zelden 12+ per pagina, dus minder verspilling.
 */
function CardRoot(props: CardProps) {
  const { children, className } = props
  const isInteractive = ('href' in props && props.href) || ('onClick' in props && props.onClick)
  const classes = cn('card', isInteractive && 'is-interactive', className)

  if ('href' in props && props.href) {
    const prefetch = props.prefetch
    const prefetchOn = props.prefetchOn ?? 'render'
    const useHoverPrefetch = prefetchOn === 'hover' && prefetch === false

    if (useHoverPrefetch) {
      return (
        <HoverPrefetchLink
          href={props.href}
          className={classes}
          ariaLabel={props.ariaLabel}
        >
          {children}
        </HoverPrefetchLink>
      )
    }

    return (
      <Link
        href={props.href}
        className={classes}
        aria-label={props.ariaLabel}
        prefetch={prefetch}
      >
        {children}
      </Link>
    )
  }

  if ('onClick' in props && props.onClick) {
    const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        // Forward to onClick — gebruik currentTarget.click() om consistente event te krijgen
        ;(e.currentTarget as HTMLDivElement).click()
      }
    }
    return (
      <div
        className={classes}
        onClick={props.onClick}
        onKeyDown={handleKey}
        role="button"
        tabIndex={0}
        aria-label={props.ariaLabel}
      >
        {children}
      </div>
    )
  }

  return <div className={classes}>{children}</div>
}

// ============================================================
// Card.Thumb — media area, met optionele overlays
// ============================================================

interface CardThumbProps {
  src?: string
  alt?: string
  /** Vaste achtergrond-kleur of gradient als fallback / placeholder. */
  background?: string
  /** Overlays (badges, action-knoppen) — gepositioneerd binnen de thumb. */
  children?: ReactNode
  className?: string
}

/**
 * Card thumbnail/media zone.
 * Zet `src` voor een afbeelding, of `background` voor een gradient/kleur.
 * `children` wordt absoluut gepositioneerd binnen de thumb (overlays).
 *
 * Voor aspect-ratio varianten: gebruik className 'is-portrait' / 'is-landscape' /
 * 'is-square' / 'is-wide' (gedefinieerd in globals.css §34). Default: 16/9.
 *
 * NB: `background` prop is een dynamische CSS-waarde (gradient/kleur per item)
 * die niet voorspelbaar is op compile-time, dus inline. Voor vaste kleuren:
 * voeg een eigen klasse toe in globals.css.
 */
function CardThumb({
  src,
  alt = '',
  background,
  children,
  className,
}: CardThumbProps) {
  const normalizedSrc = src ? normalizeMediaUrl(src) ?? src : undefined

  return (
    <div
      className={cn('card-thumb', className)}
      style={background ? { background } : undefined}
    >
      {normalizedSrc && (
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}
      {children}
    </div>
  )
}

// ============================================================
// Card.Body — content zone onder de thumb
// ============================================================

function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card-body', className)}>{children}</div>
}

// ============================================================
// Card text-helpers — gebruik binnen Card.Body
// ============================================================

function CardBrand({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card-brand', className)}>{children}</div>
}

function CardTitle({
  children,
  className,
  as: Component = 'h3',
}: {
  children: ReactNode
  className?: string
  as?: 'h2' | 'h3' | 'h4' | 'div'
}) {
  return <Component className={cn('card-title', className)}>{children}</Component>
}

function CardDate({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card-date', className)}>{children}</div>
}

// ============================================================
// Compound API
// ============================================================

export const Card = Object.assign(CardRoot, {
  Thumb: CardThumb,
  Body: CardBody,
  Brand: CardBrand,
  Title: CardTitle,
  Date: CardDate,
})

export type { CardProps }
