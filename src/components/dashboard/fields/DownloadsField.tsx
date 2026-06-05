'use client'

/**
 * DownloadsField — shared "downloads & brochures" / "documents & downloads"
 * field. A document title + file picker + Add button, then a list of uploaded
 * documents (each carrying its title). Used by both the brand profile form and
 * the material form. The parent supplies `onUpload` (the media-proxy upload).
 */

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/form'
import { IconAdd, IconDelete, IconBook } from '@/components/ui/icons'
import type { MaterialAsset } from '@/types/dashboard'

export interface DownloadsFieldProps {
  value: MaterialAsset[]
  onChange: (next: MaterialAsset[]) => void
  /** Uploads a file to the media library and returns the stored asset. */
  onUpload: (file: File) => Promise<MaterialAsset | null>
  uploading?: boolean
  /** Accept attribute for the file input (default PDF + common docs). */
  accept?: string
}

export function DownloadsField({
  value,
  onChange,
  onUpload,
  uploading = false,
  accept = '.pdf,.doc,.docx,application/pdf',
}: DownloadsFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const canAdd = Boolean(file) && !uploading

  async function add() {
    if (!file) return
    const asset = await onUpload(file)
    if (!asset) return
    onChange([...value, { ...asset, title: title.trim() || asset.name }])
    setTitle('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function remove(id: string) {
    onChange(value.filter((d) => d.id !== id))
  }

  return (
    <div className="docs-field">
      <div className="doc-add-row">
        <Input
          aria-label="Document title"
          placeholder="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className="btn btn-outline file-choose"
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? file.name : 'Choose file…'}
        </button>
        <button type="button" className="btn btn-primary" onClick={add} disabled={!canAdd}>
          <IconAdd size={16} /> Add
        </button>
      </div>

      {value.length === 0 ? (
        <p className="field-helper">No documents added yet.</p>
      ) : (
        <ul className="asset-list">
          {value.map((d) => (
            <li key={d.id} className="asset-row">
              <span className="asset-row-main">
                <IconBook size={16} className="asset-row-icon" />
                <span className="asset-row-label">{d.title || d.name}</span>
              </span>
              <button
                type="button"
                className="icon-btn is-sm is-ghost"
                onClick={() => remove(d.id)}
                aria-label={`Remove ${d.title || d.name}`}
              >
                <IconDelete size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
