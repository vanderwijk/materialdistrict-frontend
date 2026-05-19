'use client'

/**
 * MaterialGallery — hero + filmstrip voor de material-detailpagina.
 *
 * Gedrag (sessie 5):
 *  - Hero in 4/3 aspect-ratio. Klik = opent lightbox bij actieve index.
 *  - Filmstrip toont eerste N thumbs (default 5). Klik op thumb wisselt
 *    de hero (geen lightbox tenzij apart geklikt op die hero).
 *  - Bij meer dan N images:
 *      - default: laatste thumb krijgt "+N"-overlay. Klik daarop klapt
 *        de filmstrip UIT zodat alle thumbs zichtbaar worden.
 *      - uitgeklapt: laatste tegel is een "− Show less"-knop om weer
 *        in te klappen.
 *  - Klik op een specifieke thumb maakt die de actieve hero. Klik op de
 *    hero daarna opent de lightbox bij die index.
 */

import { useMemo, useState } from 'react'
import { ImageLightbox, type LightboxImage } from '@/components/ui/ImageLightbox'
import type { Gallery, MediaImage } from '@/types/media'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialGalleryProps {
  gallery: Gallery
  /** Material-titel — gebruikt als alt-fallback wanneer attachment.alt leeg is. */
  title: string
  /** Max aantal thumbs zichtbaar in compacte filmstrip. Default 5. */
  maxThumbsVisible?: number
  className?: string
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function MaterialGallery({
  gallery,
  title,
  maxThumbsVisible = 5,
  className,
}: MaterialGalleryProps) {
  // Hero + thumbs gecombineerd, hero = index 0
  const allImages = useMemo(() => {
    const list: MediaImage[] = []
    if (gallery.hero) list.push(gallery.hero)
    list.push(...gallery.thumbs)
    return list
  }, [gallery])

  const [activeIndex, setActiveIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Lightbox-images: grootste beschikbare variant + alt
  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      allImages.map((img) => ({
        src:
          img.sizes?.full?.url ??
          img.sizes?.['1536x1536']?.url ??
          img.sizes?.large?.url ??
          img.sourceUrl,
        alt: altFor(img, title),
      })),
    [allImages, title],
  )

  // Empty state
  if (allImages.length === 0) {
    return (
      <div
        className={['mat-gallery', className].filter(Boolean).join(' ')}
        aria-label="No images available"
      >
        <div
          className="mat-gallery-hero"
          role="img"
          aria-label={`${title} — no images available`}
        />
      </div>
    )
  }

  const activeImage = allImages[activeIndex] ?? allImages[0]
  const heroSrc =
    activeImage.sizes?.large?.url ??
    activeImage.sizes?.medium_large?.url ??
    activeImage.sourceUrl
  const heroAlt = altFor(activeImage, title)

  const hasOverflow = allImages.length > maxThumbsVisible
  const visibleCount = expanded || !hasOverflow ? allImages.length : maxThumbsVisible
  const overflowCount = hasOverflow && !expanded ? allImages.length - maxThumbsVisible : 0

  const handleHeroClick = () => {
    setLightboxIndex(activeIndex)
    setLightboxOpen(true)
  }

  const handleThumbClick = (index: number) => {
    setActiveIndex(index)
  }

  const handleOverflowClick = () => {
    // "+N"-tile → uitklappen. Activeer ook meteen de eerste niet-zichtbare image
    // zodat de gebruiker visueel feedback krijgt.
    setExpanded(true)
  }

  const handleCollapseClick = () => {
    setExpanded(false)
    // Reset active naar binnen-zichtbaar-bereik indien actief was in overflow
    if (activeIndex >= maxThumbsVisible) {
      setActiveIndex(0)
    }
  }

  return (
    <>
      <div className={['mat-gallery', expanded && 'is-expanded', className].filter(Boolean).join(' ')}>
        {/* Hero — klikbaar → lightbox bij active-index */}
        <button
          type="button"
          className="mat-gallery-hero"
          onClick={handleHeroClick}
          aria-label={`Open ${heroAlt} in fullscreen viewer`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroSrc} alt={heroAlt} />
        </button>

        {allImages.length > 1 && (
          <div className="mat-gallery-thumbs" role="list">
            {allImages.slice(0, visibleCount).map((image, index) => {
              const isActive = index === activeIndex
              const isLastVisible = index === visibleCount - 1
              const showOverflow = overflowCount > 0 && isLastVisible
              const thumbSrc =
                image.sizes?.thumbnail?.url ??
                image.sizes?.medium?.url ??
                image.sourceUrl

              return (
                <button
                  key={image.id}
                  type="button"
                  className={['mat-gallery-thumb', isActive && 'active'].filter(Boolean).join(' ')}
                  onClick={() => {
                    if (showOverflow) {
                      // Klik op +N is uitklap-trigger; activeer image niet meteen
                      handleOverflowClick()
                    } else {
                      handleThumbClick(index)
                    }
                  }}
                  aria-label={
                    showOverflow
                      ? `Show ${overflowCount} more image${overflowCount === 1 ? '' : 's'}`
                      : `Image ${index + 1} of ${allImages.length}`
                  }
                  aria-current={isActive && !showOverflow ? 'true' : undefined}
                  role="listitem"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbSrc} alt={altFor(image, title)} />
                  {showOverflow && (
                    <span className="mat-gallery-thumb-more" aria-hidden="true">
                      +{overflowCount}
                    </span>
                  )}
                </button>
              )
            })}

            {/* "− Show less"-tile als laatste positie wanneer uitgeklapt */}
            {expanded && hasOverflow && (
              <button
                type="button"
                className="mat-gallery-thumb is-collapse"
                onClick={handleCollapseClick}
                aria-label="Show fewer images"
              >
                <span className="mat-gallery-thumb-collapse-label" aria-hidden="true">
                  − Less
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={lightboxIndex}
      />
    </>
  )
}

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

function altFor(image: MediaImage, title: string): string {
  const fromAttachment = image.alt?.trim()
  if (fromAttachment) return fromAttachment
  const fromTitle = title?.trim()
  if (fromTitle) return fromTitle
  return 'Material image'
}
