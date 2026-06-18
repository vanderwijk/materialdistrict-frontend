'use client'

/**
 * CropModal — dependency-free image cropper used before upload.
 *
 * The user picks a file; instead of uploading the raw image we open this modal,
 * let them pan (drag) and zoom within a fixed-aspect viewport, and on confirm
 * we render the visible crop to a canvas and hand back a NEW, already-cropped
 * `File`. The existing upload handler stores that file — so no backend change is
 * needed; the stored image simply arrives at the right aspect ratio.
 *
 * Dynamic geometry (image size + pan offset + viewport aspect) is injected via
 * CSS custom properties; all visual styling lives in globals.css (§DASH-REVIEW-
 * CROP), per the architecture rules.
 *
 * SVG is not raster-croppable and should be routed around this modal by the
 * caller (upload directly).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const VIEWPORT_W = 320

interface CropModalProps {
  file: File
  /** width / height, e.g. 1 for square, 16/9 for landscape. */
  aspect: number
  title?: string
  onCancel: () => void
  onConfirm: (file: File) => void
}

export function CropModal({
  file,
  aspect,
  title = 'Crop image',
  onCancel,
  onConfirm,
}: CropModalProps) {
  const viewportH = Math.round(VIEWPORT_W / aspect)

  const [src, setSrc] = useState('')
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const baseScale = img
    ? Math.max(VIEWPORT_W / img.naturalWidth, viewportH / img.naturalHeight)
    : 1
  const scale = baseScale * zoom

  const clamp = useCallback(
    (o: { x: number; y: number }) => {
      if (!img) return o
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      return {
        x: Math.min(0, Math.max(VIEWPORT_W - w, o.x)),
        y: Math.min(0, Math.max(viewportH - h, o.y)),
      }
    },
    [img, scale, viewportH],
  )

  // Load the picked file.
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    const image = new window.Image()
    image.onload = () => setImg(image)
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Center once the image is known.
  useEffect(() => {
    if (!img) return
    const w = img.naturalWidth * baseScale
    const h = img.naturalHeight * baseScale
    setOffset(clamp({ x: (VIEWPORT_W - w) / 2, y: (viewportH - h) / 2 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img])

  // Keep the image covering the viewport when zoom changes.
  useEffect(() => {
    setOffset((o) => clamp(o))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current
    if (!d) return
    setOffset(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }))
  }
  function onPointerUp() {
    dragRef.current = null
  }

  function handleConfirm() {
    if (!img) return
    const targetW = aspect >= 1 ? 1280 : 800
    const targetH = Math.round(targetW / aspect)
    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sx = -offset.x / scale
    const sy = -offset.y / scale
    const sW = VIEWPORT_W / scale
    const sH = viewportH / scale
    ctx.drawImage(img, sx, sy, sW, sH, 0, 0, targetW, targetH)
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const ext = type === 'image/png' ? 'png' : 'jpg'
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const base = file.name.replace(/\.[^.]+$/, '')
        onConfirm(new File([blob], `${base}-cropped.${ext}`, { type }))
      },
      type,
      0.92,
    )
  }

  const viewportStyle = {
    '--crop-w': `${VIEWPORT_W}px`,
    '--crop-aspect': String(aspect),
  } as CSSProperties

  const imgStyle = {
    '--cx': `${offset.x}px`,
    '--cy': `${offset.y}px`,
    '--cw': img ? `${img.naturalWidth * scale}px` : '0px',
    '--ch': img ? `${img.naturalHeight * scale}px` : '0px',
  } as CSSProperties

  return (
    <div className="crop-modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="crop-modal">
        <h3 className="crop-modal-title">{title}</h3>
        <p className="crop-modal-hint">Drag to reposition, slide to zoom.</p>
        <div
          className="crop-viewport"
          style={viewportStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="crop-img" draggable={false} style={imgStyle} />
          ) : null}
        </div>
        <label className="crop-zoom">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
        </label>
        <div className="crop-modal-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm} disabled={!img}>
            Use image
          </button>
        </div>
      </div>
    </div>
  )
}
