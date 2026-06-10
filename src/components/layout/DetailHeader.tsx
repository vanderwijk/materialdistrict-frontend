'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DetailReadingTools } from '@/components/ui/DetailReadingTools'
import { IconChevronLeft } from '@/components/ui/icons'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Tag } from '@/components/ui/Tag'
import { InsiderBadge } from '@/components/ui/InsiderBadge'

// ============================================================
// Types
// ============================================================

type ContentType =
  | 'material'
  | 'article'
  | 'event'
  | 'book'
  | 'brand'
  | 'talk'
  | 'member'

interface DetailHeaderTag {
  /**
   * Welk soort tag. 'content' = standaard content-type pill (Material/Article/...).
   * 'insider' = Insider-badge. Meerdere tags is OK.
   */
  type: 'content' | 'insider'
  /** Voor type='content': het content-type. */
  contentType?: ContentType
  /** Voor type='content': optioneel custom label. Default = nette versie van contentType. */
  label?: string
}

// ============================================================
// Component
// ============================================================

interface DetailHeaderProps {
  /**
   * Back-link configuratie. Bij click navigeert naar `back.href`.
   * Geen `back` = geen terug-knop.
   */
  back?: {
    label: string
    href: string
  }
  /**
   * Drop-in alternatief voor `back` als je een eigen back-knop wilt
   * leveren (bv. een client-component die filter-context uit
   * sessionStorage leest om back-URL dynamisch te bepalen). Heeft
   * voorrang op `back` als beide gegeven zijn.
   */
  backNode?: ReactNode
  /** Content-type tags / insider-badges boven de titel. */
  tags?: DetailHeaderTag[]
  /** Page title (h1). */
  title: ReactNode
  /** Optionele meta-regel onder de titel (bv. brand · datum · categorie). */
  meta?: ReactNode
  /** Action-knoppen rechts (Save, Compare, Share, etc.) — typisch via <DetailActions />. */
  actions?: ReactNode
  /** §F2.8 punt 8: channel-pills boven de titel; linken naar /channels/<slug>. */
  channels?: Array<{ slug: string; label: string }>
  className?: string
}

/**
 * DetailHeader — universele header voor alle detail-pagina's.
 *
 * Bevat: back-knop → content-type tags → h1 title → optionele meta → action-row.
 *
 * Gemodelleerd op `detailHeader()` uit MaterialDistrict_MockUp_DEF.html
 * (regel 4840-4859). De mockup gebruikt inline styling; deze component
 * gebruikt `.detail-header*` klassen die in globals.css staan, plus
 * bestaande `.ct-tag`, `.insider-badge`, etc.
 *
 * @example
 *   <DetailHeader
 *     back={{ label: 'Materials', href: '/materials' }}
 *     tags={[{ type: 'content', contentType: 'material' }]}
 *     title="Recycled Glass Composite"
 *     meta={<>By <strong>Eternit</strong> · Added 12 days ago</>}
 *     actions={<DetailActions type="material" itemId={123} includeCompare />}
 *   />
 */
export function DetailHeader({
  back,
  backNode,
  tags,
  title,
  meta,
  actions,
  channels,
  className,
}: DetailHeaderProps) {
  const router = useRouter()

  return (
    <div className={cn('detail-header', className)}>
      <div className="detail-header-inner">
        <DetailReadingTools />
        {backNode
          ? backNode
          : back && (
              <button
                type="button"
                className="detail-header-back"
                onClick={() => router.push(back.href)}
              >
                <IconChevronLeft size={14} strokeWidth={2.5} />
                Back to {back.label}
              </button>
            )}

        <div className="detail-header-row">
          <div className="detail-header-main">
            {((tags && tags.length > 0) ||
              (channels && channels.length > 0)) && (
              <div className="detail-header-tags">
                {channels?.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/channels/${c.slug}`}
                    className="detail-header-channel"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    {c.label}
                  </Link>
                ))}
                {tags?.map((t, i) =>
                  t.type === 'insider' ? (
                    <InsiderBadge key={i} />
                  ) : t.contentType ? (
                    <Tag key={i} contentType={t.contentType} label={t.label} />
                  ) : null,
                )}
              </div>
            )}

            <h1 className="detail-header-title">{title}</h1>

            {meta && <div className="detail-header-meta">{meta}</div>}
          </div>

          {actions && <div className="detail-header-actions">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
