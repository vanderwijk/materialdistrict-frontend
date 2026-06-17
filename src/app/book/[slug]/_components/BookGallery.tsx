'use client'

/**
 * BookGallery — cover + binnenwerk-spreads voor de book-detailpagina.
 *
 * Spiegelt `MaterialGallery` (zelfde `mat-gallery*`-klassen, hero + filmstrip +
 * lightbox), zodat de book-detail één familie is met de material-detail. Gevoed
 * door `cover` (hero, index 0) + `gallery` (spreads). De boek-cover-shape
 * (`BookCover`) is lichter dan `MediaImage`, daarom een eigen — maar
 * markup-identieke — component i.p.v. een geforceerde adapter.
 */

import { useMemo, useState } from 'react'
import { ImageLightbox, type LightboxImage } from '@/components/ui/ImageLightbox'
import type { BookCover } from '@/types/book'

export interface BookGalleryProps {
  cover: BookCover | null
  gallery: BookCover[]
  title: string
  maxThumbsVisible?: number
}

export function BookGallery({
  cover,
  gallery,
  title,
  maxThumbsVisible = 5,
}: BookGalleryProps) {
  const allImages = useMemo(() => {
    const list: BookCover[] = []
    if (cover) list.push(cover)
    list.push(...gallery)
    return list
  }, [cover, gallery])

  const [activeIndex, setActiveIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const lightboxImages: LightboxImage[] = useMemo(
    () => allImages.map((img) => ({ src: img.url, alt: img.alt || title })),
    [allImages, title],
  )

  if (allImages.length === 0) {
    return (
      <div className="mat-gallery is-book" aria-label="No images available">
        <div
          className="mat-gallery-hero"
          role="img"
          aria-label={`${title} — no cover available`}
        />
      </div>
    )
  }

  const activeImage = allImages[activeIndex] ?? allImages[0]
  const heroSrc = activeImage.url
  const heroAlt = activeImage.alt || title

  const hasOverflow = allImages.length > maxThumbsVisible
  const visibleCount = expanded || !hasOverflow ? allImages.length : maxThumbsVisible
  const overflowCount =
    hasOverflow && !expanded ? allImages.length - maxThumbsVisible : 0

  return (
    <>
      <div className={['mat-gallery', 'is-book', expanded && 'is-expanded'].filter(Boolean).join(' ')}>
        <button
          type="button"
          className="mat-gallery-hero"
          onClick={() => {
            setLightboxIndex(activeIndex)
            setLightboxOpen(true)
          }}
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
              const thumbSrc = image.thumbnailUrl ?? image.url

              return (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  className={['mat-gallery-thumb', isActive && 'active'].filter(Boolean).join(' ')}
                  onClick={() => {
                    if (showOverflow) setExpanded(true)
                    else setActiveIndex(index)
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
                  <img src={thumbSrc} alt={image.alt || title} />
                  {showOverflow && (
                    <span className="mat-gallery-thumb-more" aria-hidden="true">
                      +{overflowCount}
                    </span>
                  )}
                </button>
              )
            })}

            {expanded && hasOverflow && (
              <button
                type="button"
                className="mat-gallery-thumb is-collapse"
                onClick={() => {
                  setExpanded(false)
                  if (activeIndex >= maxThumbsVisible) setActiveIndex(0)
                }}
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
