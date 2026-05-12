import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  IconMaterial,
  IconArticle,
  IconEvent,
  IconBook,
  IconBrand,
  IconTalk,
} from '@/components/ui/icons'

/**
 * Content-types van de Tag-component.
 *
 * Sessie 3B correctie 3: `'member'` is hernoemd naar `'insider'`. De oude
 * waarde `'member'` blijft technisch werken als alias om bestaande pages
 * niet te breken, maar nieuwe code moet `'insider'` gebruiken. In een
 * latere sessie wordt `'member'` verwijderd.
 */
export type ContentType =
  | 'material'
  | 'article'
  | 'event'
  | 'book'
  | 'brand'
  | 'talk'
  | 'insider'
  /** @deprecated Sessie 3B — gebruik `'insider'`. */
  | 'member'

interface TagProps {
  contentType: ContentType
  /**
   * Custom label. Overschrijft de default. Alternatief voor `children`
   * voor wanneer je het label als string wil meegeven.
   */
  label?: string
  children?: ReactNode
  /**
   * Toon icoon links van het label. Default: `true` voor content-types
   * waarvoor een icoon-default bestaat (zie ICON_BY_TYPE), `false` voor
   * `insider` (heeft eigen InsiderBadge/InsiderMark).
   *
   * Zet `false` om geen icoon te tonen, of geef een eigen ReactNode mee
   * om de default te overschrijven (bv. featured-variant met een
   * ster-icoon).
   */
  icon?: boolean | ReactNode
  className?: string
}

/**
 * Default labels per content-type. Worden gebruikt als er geen children zijn.
 */
const DEFAULT_LABELS: Record<ContentType, string> = {
  material: 'Material',
  article: 'Article',
  event: 'Event',
  book: 'Book',
  brand: 'Brand',
  talk: 'Talk',
  insider: 'Insider',
  member: 'Insider', // alias
}

/**
 * Default icoon per content-type. Sessie 3A batch 3 — Tag krijgt voor
 * elke content-type een visueel symbool, behalve `insider` (die heeft
 * al een eigen InsiderBadge/InsiderMark).
 *
 * Iconen komen uit de centrale registry (`@/components/ui/icons`):
 * één plek voor onderhoud, geen directe lucide-imports.
 */
const ICON_BY_TYPE: Partial<Record<ContentType, ReactNode>> = {
  material: <IconMaterial size={11} strokeWidth={2.25} />,
  article: <IconArticle size={11} strokeWidth={2.25} />,
  event: <IconEvent size={11} strokeWidth={2.25} />,
  book: <IconBook size={11} strokeWidth={2.25} />,
  brand: <IconBrand size={11} strokeWidth={2.25} />,
  talk: <IconTalk size={11} strokeWidth={2.25} />,
  // insider/member: geen icoon — die heeft InsiderMark/InsiderBadge
}

/**
 * Content-type tag — uit globals.css §10.
 * Pale background + dark text per content-type. Optioneel een icoon links
 * van het label; voor de meeste content-types staat dat default aan.
 *
 * @example
 *   <Tag contentType="material" />              // toont icoon + "Material"
 *   <Tag contentType="event">Featured event</Tag>
 *   <Tag contentType="talk" label="Live talk" />
 *   <Tag contentType="material" icon={false} /> // geen icoon
 *   <Tag contentType="article" icon={<IconFeatured size={11} />} /> // custom
 */
export function Tag({
  contentType,
  label,
  children,
  icon = true,
  className,
}: TagProps) {
  // Resolve icoon: explicit ReactNode > true => default voor type > false => geen
  const iconNode =
    typeof icon === 'boolean'
      ? icon
        ? ICON_BY_TYPE[contentType]
        : null
      : icon

  return (
    <span className={cn('ct-tag', `ct-${contentType}`, className)}>
      {iconNode && <span className="ct-tag-icon" aria-hidden="true">{iconNode}</span>}
      <span className="ct-tag-label">
        {children ?? label ?? DEFAULT_LABELS[contentType]}
      </span>
    </span>
  )
}
