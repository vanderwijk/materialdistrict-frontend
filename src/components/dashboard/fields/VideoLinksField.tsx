'use client'

/**
 * VideoLinksField — shared "video links" field (YouTube / Vimeo URLs). Used by
 * the brand profile form (Media) and the material form (Media). Paste a URL +
 * Add, then a list with remove and an empty state.
 */

import { useState } from 'react'
import { Input } from '@/components/ui/form'
import { IconAdd, IconDelete } from '@/components/ui/icons'

export interface VideoLinksFieldProps {
  value: string[]
  onChange: (next: string[]) => void
}

export function VideoLinksField({ value, onChange }: VideoLinksFieldProps) {
  const [draft, setDraft] = useState('')

  function add() {
    const url = draft.trim()
    if (!url || value.includes(url)) {
      setDraft('')
      return
    }
    onChange([...value, url])
    setDraft('')
  }

  function remove(url: string) {
    onChange(value.filter((v) => v !== url))
  }

  return (
    <div className="video-links-field">
      <div className="video-add-row">
        <Input
          aria-label="Video link"
          placeholder="Paste YouTube or Vimeo URL"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <button type="button" className="btn btn-primary" onClick={add} disabled={!draft.trim()}>
          <IconAdd size={16} /> Add
        </button>
      </div>

      {value.length === 0 ? (
        <p className="field-helper">No video links added yet.</p>
      ) : (
        <ul className="asset-list">
          {value.map((url) => (
            <li key={url} className="asset-row">
              <span className="asset-row-main">
                <span className="asset-row-label asset-row-url">{url}</span>
              </span>
              <button
                type="button"
                className="icon-btn is-sm is-ghost is-delete"
                onClick={() => remove(url)}
                aria-label={`Remove ${url}`}
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
