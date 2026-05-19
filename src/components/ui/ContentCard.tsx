import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Card } from './Card'
import { Tag, type ContentType } from './Tag'
import { InsiderMark } from './InsiderMark'

// ============================================================
// Types
// ============================================================

export type ContentCardThumbRatio =
  | 'default'   // 16/9 (default voor materials, articles, talks)
  | 'portrait'  // 3/4 (boeken)
  | 'landscape' // 16/7 (featured articles)
  | 'square'    // 1/1 (brand-logos kunnen kortere ratio zijn)
  | 'wide'      // 21/9

interface ContentCardProps {
  /** URL waar de card naartoe linkt. Vereist — content-cards zijn altijd klikbaar. */
  href: string
  /** Content-type — bepaalt de tag-kleur en het default tag-label/-icoon. */
  contentType: ContentType
  /** Image src voor thumb. Niet meegegeven? Dan wordt `thumbBackground` gebruikt. */
  thumbSrc?: string
  /** Alt-tekst voor de thumb-image. Verplicht als `thumbSrc` is gezet. */
  thumbAlt?: string
  /** CSS-background als alternatief voor afbeelding (kleur, gradient). */
  thumbBackground?: string
  /** Aspect-ratio van de thumb. Default: 'default' (16/9). */
  thumbRatio?: ContentCardThumbRatio
  /**
   * Eyebrow boven de titel — flexibele tweede informatie-laag.
   * Material → brand-naam ("ETERNIT")
   * Article/story → datum
   * Event → locatie
   * Voor backwards-compat: als `eyebrow` ontbreekt maar `brand` is gezet,
   * wordt `brand` gebruikt als eyebrow.
   */
  eyebrow?: ReactNode
  /** @deprecated gebruik `eyebrow` — alias voor backward-compat. */
  brand?: string
  /** Card-titel — verplicht. */
  title: ReactNode
  /**
   * Meta-regel onder titel. String voor enkele regel, array voor meerdere
   * items met dot-separators (bv. `["3 May 2026", "Composites"]`).
   */
  meta?: string | string[]
  /**
   * Channel-tags op de thumb (linksonder, max 2 stuks). Voorbeeld:
   * `["Sustainability", "Healthcare"]`. Extras worden afgekapt.
   */
  channelTags?: string[]
  /** Extra context-tags onder de meta-regel (oude positie, blijft ondersteund). */
  tags?: string[]
  /**
   * Action-buttons als overlay op de thumb. Typisch <ActionButton size="sm" />.
   * Worden rechts-boven gepositioneerd via `.card-thumb-overlay`.
   */
  actions?: ReactNode
  /**
   * Markeer als Insider-only content. Rendert een <InsiderMark> vóór de titel.
   * Vervangt de oude `insiderOnly`-prop (blijft als alias werken).
   */
  isInsiderOnly?: boolean
  /** @deprecated gebruik `isInsiderOnly` — alias voor backward-compat. */
  insiderOnly?: boolean
  /** Custom tag-label. Default = nette versie van contentType. */
  tagLabel?: string
  /**
   * HTML-element voor de titel, voor correct heading-niveau in de page-context.
   *
   * Een card-titel is meestal `h3` (op een page met h1 hero + h2 sections).
   * Op een page zonder section-headings kan het `h2` zijn. Op een page met
   * deeper hiërarchie kan het `h4` zijn.
   *
   * Default: `'h3'`.
   *
   * **Regel:** sla nooit een heading-level over. Een h2 mag opgevolgd worden
   * door h3, niet door h4.
   */
  titleAs?: 'h2' | 'h3' | 'h4'
  /**
   * Optionele aria-label voor de hele card-link. Gebruik dit wanneer de title
   * alleen onvoldoende context geeft (bv. een puur visuele card waarbij
   * "Recycled Glass Composite" zonder verdere context te kort is).
   * Default: niet gezet (link gebruikt zijn tekst-content als label).
   */
  ariaLabel?: string
  /**
   * Pass-through naar `<Card prefetch>`. Sessie 6 (performance).
   * Default: `undefined` (Next.js standaard viewport-prefetch). Zet op
   * `false` om viewport-prefetch uit te schakelen.
   */
  prefetch?: boolean
  /**
   * Pass-through naar `<Card prefetchOn>`. Sessie 6 (performance).
   * `'hover'` + `prefetch={false}` = prefetch op user-intent
   * (mouseenter / focus / touchstart) in plaats van viewport.
   */
  prefetchOn?: 'render' | 'hover'
  className?: string
}

// ============================================================
// Component
// ============================================================

/**
 * ContentCard — universele tegel voor alle content-types.
 *
 * Sessie 3A batch 3 — layout-overhaul:
 *   - Tag is nu een overlay linksboven op de thumb (i.p.v. in de body-header)
 *   - Channel-tags (max 2) zijn een overlay linksonder op de thumb
 *   - Body-volgorde: eyebrow → titel (28px = .t-display-md) → meta
 *   - InsiderMark vóór de titel bij isInsiderOnly
 *   - Eyebrow is type-onafhankelijk: page bepaalt zelf wat er staat
 *     (brand-naam voor materials, datum voor articles, etc.)
 *
 * Sessie 6 (performance): nieuwe `prefetch` en `prefetchOn` props die
 * worden doorgegeven aan Card. Default-gedrag is ongewijzigd.
 *
 * @example Material met overlay-knoppen:
 *   <ContentCard
 *     href={`/materials/${m.slug}`}
 *     contentType="material"
 *     thumbSrc={m.heroImage}
 *     thumbAlt={m.title}
 *     eyebrow={m.brandName}
 *     title={m.title}
 *     meta={`Added ${m.daysAgo} days ago`}
 *     channelTags={m.channels.slice(0, 2)}
 *     actions={
 *       <>
 *         <ActionButton size="sm" icon={<IconSave />} ariaLabel="Save" />
 *         <ActionButton size="sm" icon={<IconCompare />} ariaLabel="Compare" />
 *       </>
 *     }
 *   />
 *
 * @example Insider-only article:
 *   <ContentCard
 *     href={`/articles/${a.slug}`}
 *     contentType="article"
 *     thumbSrc={a.heroImage}
 *     eyebrow={a.dateLabel}
 *     title={a.title}
 *     isInsiderOnly
 *   />
 */
export function ContentCard({
  href,
  contentType,
  thumbSrc,
  thumbAlt,
  thumbBackground,
  thumbRatio = 'default',
  eyebrow,
  brand,
  title,
  meta,
  channelTags,
  tags,
  actions,
  isInsiderOnly,
  insiderOnly,
  tagLabel,
  titleAs = 'h3',
  ariaLabel,
  prefetch,
  prefetchOn,
  className,
}: ContentCardProps) {
  // Thumb-ratio modifier (geen inline style)
  const thumbRatioClass = thumbRatio === 'default' ? undefined : `is-${thumbRatio}`

  // Backward-compat: oude `brand` mapt naar eyebrow als die niet expliciet gezet is
  const resolvedEyebrow = eyebrow ?? brand

  // Backward-compat: oude `insiderOnly` mapt naar nieuwe `isInsiderOnly`
  const resolvedInsider = isInsiderOnly ?? insiderOnly ?? false

  // Channel-tags: max 2 stuks (rest afkappen — geen layout-overflow op de thumb)
  const visibleChannelTags = channelTags ? channelTags.slice(0, 2) : null

  // Meta wordt array van segments — string krijgt array van 1
  const metaSegments = meta === undefined ? null : Array.isArray(meta) ? meta : [meta]

  // Render titel met dynamisch heading-element
  const TitleTag = titleAs

  return (
    <Card
      href={href}
      className={className}
      ariaLabel={ariaLabel}
      prefetch={prefetch}
      prefetchOn={prefetchOn}
    >
      <Card.Thumb
        src={thumbSrc}
        alt={thumbAlt ?? ''}
        background={thumbBackground}
        className={thumbRatioClass}
      >
        {/* Tag — linksboven overlay (sessie 3A batch 3) */}
        <div className="card-thumb-overlay is-top-left">
          <Tag contentType={contentType} label={tagLabel} />
        </div>

        {/* Action-buttons — rechtsboven (positie ongewijzigd) */}
        {actions && <div className="card-thumb-overlay">{actions}</div>}

        {/* Channel-tags — linksonder, max 2 (sessie 3A batch 3) */}
        {visibleChannelTags && visibleChannelTags.length > 0 && (
          <div className="card-thumb-overlay is-bottom-left">
            {visibleChannelTags.map((channel) => (
              <span key={channel} className="channel-tag-overlay">
                {channel}
              </span>
            ))}
          </div>
        )}
      </Card.Thumb>

      <Card.Body>
        {resolvedEyebrow && (
          <div className="content-card-eyebrow">{resolvedEyebrow}</div>
        )}

        <div className="content-card-title-row">
          {resolvedInsider && <InsiderMark size="sm" />}
          <TitleTag className="content-card-title">{title}</TitleTag>
        </div>

        {metaSegments && metaSegments.length > 0 && (
          <div className="content-card-meta">
            {metaSegments.map((segment, i) => (
              <span key={i} className="u-inline">
                {i > 0 && <span className="content-card-meta-dot" aria-hidden="true" />}
                {segment}
              </span>
            ))}
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="content-card-tags">
            {tags.map((t) => (
              <span key={t} className="t-eyebrow">
                {t}
              </span>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
