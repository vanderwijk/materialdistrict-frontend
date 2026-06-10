/**
 * BrandTile
 * ----------------------------------------------------------------------
 * Overzicht-kaart voor het brand-overzicht (`/brands`). Volgt de mockup
 * `renderBrandsOverview()`:
 *
 *  ┌──────────────────────────────┐
 *  │  [banner — 72px, gradient]   │
 *  │  ┌──┐                        │   logo-vierkant overlapt de banner
 *  │  │LG│                        │   linksonder (half eroverheen)
 *  ├──┴──┴────────────────────────┤
 *  │  Brand name                  │
 *  │  City, Country               │
 *  │  Two-line description…       │
 *  │  ───────────────────────     │
 *  │  N materials                 │
 *  └──────────────────────────────┘
 *
 * Fundamenteel ander layout-patroon dan <ContentCard> (banner met
 * overlappend logo, geen overlay-actions, geen content-type Tag, geen
 * channel-tags) — daarom een eigen component i.p.v. ContentCard
 * oprekken (DRY-regel: één naam per patroon, maar dit IS een ander
 * patroon).
 *
 * Hele kaart is een link naar `/brands/[slug]`. Gebruikt
 * <HoverPrefetchLink> (sessie 6 performance): prefetch op hover/focus
 * i.p.v. viewport — bespaart RSC-fetches op een overzicht met veel
 * tiles.
 *
 * Graceful fallbacks (mockup-conform):
 *  - geen logo  → placeholder-icoon in het logo-vierkant
 *  - geen banner → neutrale `--surface2` met image-placeholder-icoon
 *  - geen city  → toont alleen country (of niets)
 */

import { HoverPrefetchLink } from './HoverPrefetchLink'
import { CardBookmarkButton } from './CardBookmarkButton'
import type { BrandListItem } from '@/types/brand'

export interface BrandTileProps {
  brand: BrandListItem
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function locationLine(city: string | null, country: string | null): string | null {
  if (city && country) return `${city}, ${country}`
  return city || country || null
}

const PlaceholderIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
)

export function BrandTile({ brand }: BrandTileProps) {
  const location = locationLine(brand.city, brand.country)
  const hasLogo = Boolean(brand.logo)
  const logoUrl =
    brand.logo?.sizes?.thumbnail?.url ??
    brand.logo?.sizes?.medium?.url ??
    brand.logo?.sourceUrl ??
    null
  const logoAlt = brand.logo?.alt?.trim() || `${brand.name} logo`

  const materialLabel = `${brand.materialCount} material${brand.materialCount === 1 ? '' : 's'}`

  return (
    <HoverPrefetchLink
      href={`/brands/${brand.slug}`}
      className="brand-tile"
      ariaLabel={brand.name}
    >
      <div className="brand-tile-banner">
        <CardBookmarkButton type="brands" itemId={brand.id} withOverlay />
        {!hasLogo && (
          <span className="brand-tile-banner-placeholder">
            <PlaceholderIcon size={24} />
          </span>
        )}
        <span className="brand-tile-logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={logoAlt} className="brand-tile-logo-img" />
          ) : (
            <span className="brand-tile-logo-initials">
              {getInitials(brand.name)}
            </span>
          )}
        </span>
      </div>

      <div className="brand-tile-body">
        <span className="brand-tile-name">{brand.name}</span>
        {location && <span className="brand-tile-location">{location}</span>}
        {brand.excerptHtml && (
          <span
            className="brand-tile-excerpt"
            // Excerpt is server-side WP-HTML; veilig in een gecontroleerde
            // container. Lijn-clamp gebeurt in CSS (2 regels).
            dangerouslySetInnerHTML={{ __html: brand.excerptHtml }}
          />
        )}
        <span className="brand-tile-footer">{materialLabel}</span>
      </div>
    </HoverPrefetchLink>
  )
}
