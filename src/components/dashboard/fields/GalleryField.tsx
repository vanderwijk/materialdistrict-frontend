'use client'

/**
 * GalleryField — shared gallery-images field with reorder. Used by the brand
 * profile form (Media) and the material form (Gallery). Upload one or more
 * images, reorder with up/down (keyboard-accessible), and remove. The parent
 * supplies `onUpload` (the media-proxy upload).
 *
 * Reorder is by explicit up/down buttons rather than drag — accessible without
 * a pointer, and the stored order is the array order (persisted server-side).
 */

import { useRef } from 'react'
import {
  IconUpload,
  IconDelete,
  IconImage,
  IconChevronUp,
  IconChevronDown,
} from '@/components/ui/icons'
import type { MaterialAsset } from '@/types/dashboard'

export interface GalleryFieldProps {
  value: MaterialAsset[]
  onChange: (next: MaterialAsset[]) => void
  /** Uploads a file to the media library and returns the stored asset. */
  onUpload: (file: File) => Promise<MaterialAsset | null>
  uploading?: boolean
  accept?: string
}

export function GalleryField({
  value,
  onChange,
  onUpload,
  uploading = false,
  accept = 'image/*',
}: GalleryFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const uploaded: MaterialAsset[] = []
    for (const file of Array.from(files)) {
      const asset = await onUpload(file)
      if (asset) uploaded.push(asset)
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function remove(id: string) {
    onChange(value.filter((g) => g.id !== id))
  }

  return (
    <div className="gallery-field">
      {value.length > 0 && (
        <ul className="asset-list">
          {value.map((g, i) => (
            <li key={g.id} className="asset-row gallery-row">
              <span className="asset-row-main">
                {g.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.url} alt="" className="gallery-thumb" />
                ) : (
                  <span className="gallery-thumb gallery-thumb-empty" aria-hidden="true">
                    <IconImage size={16} />
                  </span>
                )}
                <span className="asset-row-text">
                  <span className="asset-row-label">{g.name}</span>
                  <span className="asset-row-hint">Use the arrows to reorder</span>
                </span>
              </span>
              <span className="gallery-actions">
                <button
                  type="button"
                  className="icon-btn is-sm is-ghost"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${g.name} up`}
                >
                  <IconChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn is-sm is-ghost"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label={`Move ${g.name} down`}
                >
                  <IconChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn is-sm is-ghost"
                  onClick={() => remove(g.id)}
                  aria-label={`Remove ${g.name}`}
                >
                  <IconDelete size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        className="btn btn-outline gallery-upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <IconUpload size={16} /> {uploading ? 'Uploading…' : 'Upload gallery images'}
      </button>
    </div>
  )
}
