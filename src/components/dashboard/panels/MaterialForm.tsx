'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Select } from '@/components/ui/form'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { IconAdd, IconClose, IconUpload, IconDelete } from '@/components/ui/icons'
import { tierMeets } from '@/lib/dashboard/nav'
import type { ManufacturerTier } from '@/lib/config/membership'
import type {
  MaterialFormData,
  MaterialCategoryPath,
  MaterialTypeOption,
  MaterialAsset,
} from '@/types/dashboard'

const ALL_CHANNELS = ['Biobased', 'Sustainable', 'Acoustic', 'Circular', 'Recycled']

/**
 * Material create/edit form. Controlled state seeded from the data layer.
 * Assets upload to the WP media library via `/api/dashboard/media`. Downloads
 * require Basis+, keywords require Plus+ (gated inline and enforced by WP).
 * Save = POST (create) / PATCH (edit); Delete = DELETE.
 */
export function MaterialForm({
  slug,
  brandId,
  initial,
  tier,
  categoryOptions,
  typeOptions,
}: {
  slug: string
  brandId: number
  initial: MaterialFormData
  tier: ManufacturerTier
  /** Assignable categories (with real WP term ids) from the taxonomy endpoint. */
  categoryOptions: MaterialCategoryPath[]
  /** Material types from the material_category taxonomy endpoint. */
  typeOptions: MaterialTypeOption[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<MaterialFormData>(initial)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [videoDraft, setVideoDraft] = useState('')

  /** Upload one file to the WP media library via the proxy → MaterialAsset. */
  async function uploadFile(file: File): Promise<MaterialAsset | null> {
    setSaveError(null)
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/dashboard/media', { method: 'POST', body: data })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(err?.message ?? 'Upload failed. Please try again.')
        return null
      }
      return (await res.json()) as MaterialAsset
    } catch {
      setSaveError('Upload failed. Please try again.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const canDownloads = tierMeets(tier, 'basis')
  const canKeywords = tierMeets(tier, 'plus')
  const isEdit = form.mode === 'edit'

  const set = <K extends keyof MaterialFormData>(key: K, value: MaterialFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleChannel = (channel: string) =>
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(channel)
        ? f.channels.filter((c) => c !== channel)
        : [...f.channels, channel],
    }))

  // Cascading l1/l2/l3 option lists derived from the leaf-only catalogue.
  const l1Options = useMemo(
    () => Array.from(new Set(categoryOptions.map((o) => o.l1).filter(Boolean))),
    [categoryOptions],
  )
  function l2OptionsFor(l1: string) {
    return Array.from(new Set(categoryOptions.filter((o) => o.l1 === l1 && o.l2).map((o) => o.l2)))
  }
  function l3OptionsFor(l1: string, l2: string) {
    return Array.from(
      new Set(categoryOptions.filter((o) => o.l1 === l1 && o.l2 === l2 && o.l3).map((o) => o.l3)),
    )
  }
  /** Resolve the real WP leaf term id for an exact (l1,l2,l3) selection, else ''. */
  function resolveCategoryId(l1: string, l2: string, l3: string): string {
    const match = categoryOptions.find((o) => o.l1 === l1 && o.l2 === l2 && o.l3 === l3)
    return match ? match.id : ''
  }

  function addCategory() {
    setForm((f) => ({
      ...f,
      categories: [...f.categories, { id: '', l1: '', l2: '', l3: '' }],
    }))
  }
  function removeCategory(index: number) {
    setForm((f) => ({
      ...f,
      categories: f.categories.filter((_, i) => i !== index),
    }))
  }
  function updateCategory(index: number, level: 'l1' | 'l2' | 'l3', value: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.map((c, i) => {
        if (i !== index) return c
        const next =
          level === 'l1'
            ? { l1: value, l2: '', l3: '' }
            : level === 'l2'
              ? { l1: c.l1, l2: value, l3: '' }
              : { l1: c.l1, l2: c.l2, l3: value }
        // Stamp the real term id once the path matches a catalogue leaf.
        return { ...next, id: resolveCategoryId(next.l1, next.l2, next.l3) }
      }),
    }))
  }

  /** Only bind Select to a value that exists in the catalogue (avoids controlled-select warnings). */
  const typeSelectValue = typeOptions.some((t) => t.id === form.type) ? form.type : ''

  function addKeyword() {
    const kw = keywordDraft.trim()
    if (!kw || form.keywords.includes(kw)) return
    set('keywords', [...form.keywords, kw])
    setKeywordDraft('')
  }

  function addVideo() {
    const url = videoDraft.trim()
    if (!url || form.videos.includes(url)) return
    set('videos', [...form.videos, url])
    setVideoDraft('')
  }

  const progress = useMemo(() => {
    const checks = [form.name.trim() !== '', form.description.trim() !== '', form.type !== '', form.featuredImage !== null]
    return (checks.filter(Boolean).length / checks.length) * 100
  }, [form])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const isCreate = form.mode === 'create' || form.id === null
      const url = isCreate
        ? `/api/dashboard/brands/${brandId}/materials`
        : `/api/dashboard/brands/${brandId}/materials/${form.id}`
      const res = await fetch(url, {
        method: isCreate ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(
          err?.code === 'md_dashboard_forbidden'
            ? 'Your membership tier does not allow one of these fields (videos/downloads need Basis+, keywords need Plus+).'
            : err?.message ?? 'Could not save the material. Please try again.',
        )
        return
      }
      router.push(`/dashboard/brands/${slug}/materials`)
      router.refresh()
    } catch {
      setSaveError('Could not save the material. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (form.id === null) return
    if (!window.confirm('Delete this material? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/dashboard/brands/${brandId}/materials/${form.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(err?.message ?? 'Could not delete the material. Please try again.')
        return
      }
      router.push(`/dashboard/brands/${slug}/materials`)
      router.refresh()
    } catch {
      setSaveError('Could not delete the material. Please try again.')
    }
  }

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Basics</h2>
        <Input label="Material name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
        <Select
          label="Material type"
          value={typeSelectValue}
          onChange={(e) => set('type', e.target.value)}
          placeholder={typeOptions.length > 0 ? 'Select a type' : 'Material types not available yet'}
          options={typeOptions.map((t) => ({ value: t.id, label: t.name }))}
        />
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Featured image</h2>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <div className="upload-box">
          <IconUpload size={22} />
          <span className="upload-name">
            {form.featuredImage ? form.featuredImage.name : 'Upload a featured image (JPG/PNG)'}
          </span>
          <label className="btn btn-outline btn-sm">
            {uploading ? 'Uploading…' : 'Choose file'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                const asset = await uploadFile(file)
                if (asset) set('featuredImage', asset)
              }}
            />
          </label>
        </div>
      </div>

      <div className="dash-panel">
        <div className="panel-head-row">
          <h2 className="panel-section-title">Categories</h2>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addCategory}
            disabled={categoryOptions.length === 0}
          >
            <IconAdd size={16} /> Add category
          </button>
        </div>
        {categoryOptions.length === 0 && (
          <p className="field-helper">The category list isn&apos;t available right now.</p>
        )}
        {categoryOptions.length > 0 && form.categories.length === 0 && (
          <p className="field-helper">No categories yet.</p>
        )}
        {form.categories.map((cat, i) => {
          const l2opts = cat.l1 ? l2OptionsFor(cat.l1) : []
          const l3opts = cat.l1 && cat.l2 ? l3OptionsFor(cat.l1, cat.l2) : []
          return (
            <div key={i} className="cat-row">
              <Select
                label="Level 1"
                value={cat.l1}
                onChange={(e) => updateCategory(i, 'l1', e.target.value)}
                placeholder="—"
                options={l1Options.map((v) => ({ value: v, label: v }))}
              />
              <Select
                label="Level 2"
                value={cat.l2}
                onChange={(e) => updateCategory(i, 'l2', e.target.value)}
                placeholder="—"
                options={l2opts.map((v) => ({ value: v, label: v }))}
                disabled={l2opts.length === 0}
              />
              <Select
                label="Level 3"
                value={cat.l3}
                onChange={(e) => updateCategory(i, 'l3', e.target.value)}
                placeholder="—"
                options={l3opts.map((v) => ({ value: v, label: v }))}
                disabled={l3opts.length === 0}
              />
              <button
                type="button"
                className="icon-btn cat-remove"
                onClick={() => removeCategory(i)}
                aria-label="Remove category"
              >
                <IconClose size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Channels</h2>
        <div className="chip-group">
          {ALL_CHANNELS.map((channel) => (
            <button
              key={channel}
              type="button"
              className={`chip ${form.channels.includes(channel) ? 'is-on' : ''}`}
              aria-pressed={form.channels.includes(channel) ? 'true' : 'false'}
              onClick={() => toggleChannel(channel)}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-panel">
        <div className="panel-head-row">
          <h2 className="panel-section-title">Gallery</h2>
          <label className="btn btn-outline btn-sm">
            <IconAdd size={16} /> {uploading ? 'Uploading…' : 'Add image'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                const asset = await uploadFile(file)
                if (asset) set('gallery', [...form.gallery, asset])
              }}
            />
          </label>
        </div>
        {form.gallery.length === 0 ? (
          <p className="field-helper">No gallery images yet.</p>
        ) : (
          <ul className="asset-list">
            {form.gallery.map((g) => (
              <li key={g.id} className="asset-row">
                <span>{g.name}</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => set('gallery', form.gallery.filter((x) => x.id !== g.id))}
                  aria-label={`Remove ${g.name}`}
                >
                  <IconDelete size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Videos</h2>
        <div className="kw-input-row">
          <Input
            label="Video URL (YouTube/Vimeo)"
            value={videoDraft}
            onChange={(e) => setVideoDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addVideo()
              }
            }}
          />
          <button type="button" className="btn btn-outline" onClick={addVideo}>
            <IconAdd size={16} /> Add
          </button>
        </div>
        {form.videos.length > 0 && (
          <ul className="asset-list">
            {form.videos.map((v) => (
              <li key={v} className="asset-row">
                <span>{v}</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => set('videos', form.videos.filter((x) => x !== v))}
                  aria-label={`Remove ${v}`}
                >
                  <IconDelete size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Downloads (PDF &amp; EPD)</h2>
        {canDownloads ? (
          <>
            <div className="panel-head-row">
              <p className="field-helper">Datasheets, brochures, EPDs.</p>
              <label className="btn btn-outline btn-sm">
                <IconAdd size={16} /> {uploading ? 'Uploading…' : 'Add file'}
                <input
                  type="file"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    const asset = await uploadFile(file)
                    if (asset) set('downloads', [...form.downloads, asset])
                  }}
                />
              </label>
            </div>
            {form.downloads.length === 0 ? (
              <p className="field-helper">No documents yet.</p>
            ) : (
              <ul className="asset-list">
                {form.downloads.map((d) => (
                  <li key={d.id} className="asset-row">
                    <span>{d.name}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => set('downloads', form.downloads.filter((x) => x.id !== d.id))}
                      aria-label={`Remove ${d.name}`}
                    >
                      <IconDelete size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <BrandTierGate
            variant="page"
            required="basis"
            title="Downloads"
            description="Offer datasheets, brochures and EPDs on your material pages. Available from the Basis tier."
            upgradeHref="../membership"
          />
        )}
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Keywords</h2>
        {canKeywords ? (
          <>
            <div className="kw-input-row">
              <Input
                label="Add keyword"
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
              />
              <button type="button" className="btn btn-outline" onClick={addKeyword}>
                <IconAdd size={16} /> Add
              </button>
            </div>
            <div className="chip-group">
              {form.keywords.map((kw) => (
                <span key={kw} className="chip is-on">
                  {kw}
                  <button
                    type="button"
                    className="chip-x"
                    onClick={() => set('keywords', form.keywords.filter((k) => k !== kw))}
                    aria-label={`Remove keyword ${kw}`}
                  >
                    <IconClose size={12} />
                  </button>
                </span>
              ))}
            </div>
          </>
        ) : (
          <BrandTierGate
            variant="page"
            required="plus"
            title="Keywords"
            description="Add discovery keywords so buyers find this material faster. Available from the Plus tier."
            upgradeHref="../membership"
          />
        )}
      </div>

      {isEdit && (
        <div className="dash-panel danger-panel">
          <h2 className="panel-section-title">Danger zone</h2>
          <p className="field-helper">Permanently delete this material.</p>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            <IconDelete size={16} /> Delete material
          </button>
        </div>
      )}

      <DashboardStickyFooter
        progress={progress}
        saving={saving}
        onSave={handleSave}
        saveLabel={isEdit ? 'Save changes' : 'Publish material'}
      />
    </>
  )
}
