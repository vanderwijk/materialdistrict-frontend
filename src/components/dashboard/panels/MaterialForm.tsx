'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Select } from '@/components/ui/form'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { FormStateProvider } from '@/components/ui/form/FormStateContext'
import {
  ApplicationPicker,
  ChannelPicker,
  DownloadsField,
  VideoLinksField,
  GalleryField,
} from '../fields'
import { CropModal } from '../fields/CropModal'
import { IconAdd, IconClose, IconUpload, IconDelete, IconImage, IconCheck } from '@/components/ui/icons'
import { MATERIAL_CHANNEL_LABELS } from '@/lib/config/material-channels'
import { tierMeets } from '@/lib/dashboard/nav'
import { canManufacturerAccess, type ManufacturerTier } from '@/lib/config/membership'
import {
  PROPERTY_GROUP_LABELS,
  getAllPropertyGroups,
  humanizeFacet,
} from '@/lib/utils/material-properties'
import type { MaterialPropertyOptions } from '@/lib/dashboard/material-property-options'
import type { MaterialPropertyKey } from '@/types/material'
import type {
  MaterialFormData,
  MaterialTypeOption,
  MaterialAsset,
} from '@/types/dashboard'

const MAX_CHANNELS = 3
const INDOOR_OUTDOOR: Array<{ value: 'indoor' | 'outdoor'; label: string }> = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
]

/**
 * Material create/edit form, aligned to the demo. Controlled state seeded from
 * the data layer. Tier-gated sections (video links, downloads, keywords =
 * Plus+; channel coupling = Partner) use BrandTierGate; gates are also enforced
 * by WordPress. Save = POST (create) / PATCH (edit); Delete = DELETE.
 */
export function MaterialForm({
  slug,
  brandId,
  initial,
  tier,
  typeOptions,
  propertyOptions,
}: {
  slug: string
  brandId: number
  initial: MaterialFormData
  tier: ManufacturerTier
  /** Material types from the material_category taxonomy endpoint. */
  typeOptions: MaterialTypeOption[]
  /** Per-property select options (FacetWP baseline for filterable facets, static otherwise). */
  propertyOptions: MaterialPropertyOptions
}) {
  const router = useRouter()
  const [form, setForm] = useState<MaterialFormData>(initial)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [featuredCropFile, setFeaturedCropFile] = useState<File | null>(null)
  const [keywordDraft, setKeywordDraft] = useState('')
  const featuredInputRef = useRef<HTMLInputElement>(null)

  const canVideos = canManufacturerAccess(tier, 'Video uploads')
  const canDownloads = canManufacturerAccess(tier, 'PDF & EPD downloads')
  const canKeywords = tierMeets(tier, 'plus')
  const canChannels = tierMeets(tier, 'partner')
  const isEdit = form.mode === 'edit'

  const set = <K extends keyof MaterialFormData>(key: K, value: MaterialFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setProperty = (facet: MaterialPropertyKey, value: string) =>
    setForm((f) => ({ ...f, properties: { ...f.properties, [facet]: value } }))

  const toggleIndoorOutdoor = (value: 'indoor' | 'outdoor') =>
    setForm((f) => ({
      ...f,
      indoorOutdoor: f.indoorOutdoor.includes(value)
        ? f.indoorOutdoor.filter((v) => v !== value)
        : [...f.indoorOutdoor, value],
    }))

  /** Upload one file via the scoped dashboard media endpoint → MaterialAsset. */
  async function uploadFile(
    file: File,
    context: 'image' | 'document' = 'image',
  ): Promise<MaterialAsset | null> {
    setSaveError(null)
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('brand_id', String(brandId))
      data.append('context', context)
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

  async function handleFeaturedChange(file: File | null) {
    if (!file) return
    const asset = await uploadFile(file)
    if (asset) set('featuredImage', asset)
    if (featuredInputRef.current) featuredInputRef.current.value = ''
  }

  // Featured image wordt 16:9 bijgesneden vóór upload. SVG gaat ongecropt door.
  function onFeaturedPick(file: File | null) {
    if (featuredInputRef.current) featuredInputRef.current.value = ''
    if (!file) return
    if (file.type === 'image/svg+xml') {
      void handleFeaturedChange(file)
      return
    }
    setFeaturedCropFile(file)
  }

  /** Only bind Select to a value that exists in the catalogue (avoids controlled-select warnings). */
  const typeSelectValue = typeOptions.some((t) => t.id === form.type) ? form.type : ''

  function addKeyword() {
    const kw = keywordDraft.trim()
    if (!kw || form.keywords.includes(kw)) return
    set('keywords', [...form.keywords, kw])
    setKeywordDraft('')
  }

  const propertyGroups = useMemo(() => getAllPropertyGroups(form.properties), [form.properties])

  const progress = useMemo(() => {
    const checks = [form.name.trim() !== '', form.description.trim() !== '', form.type !== '', form.featuredImage !== null]
    return (checks.filter(Boolean).length / checks.length) * 100
  }, [form])

  // Hard verplicht: naam, omschrijving, type, featured image, ten minste één
  // indoor/outdoor en ten minste één applicatie (minimaal hoofdniveau).
  const requiredComplete =
    form.name.trim() !== '' &&
    form.description.trim() !== '' &&
    form.type !== '' &&
    form.featuredImage !== null &&
    form.indoorOutdoor.length > 0 &&
    form.applications.length > 0

  // Zacht: filter-eigenschappen zijn niet verplicht, maar bij leeg vragen we
  // op opslaan om bevestiging (een materiaal zonder filters is slecht vindbaar).
  const hasAnyProperty = useMemo(
    () =>
      Object.values(form.properties).some((v) =>
        Array.isArray(v) ? v.length > 0 : String(v ?? '').trim() !== '',
      ),
    [form.properties],
  )

  async function handleSave() {
    if (!hasAnyProperty) {
      const proceed = window.confirm(
        "You haven't set any filter properties yet. Without them this material is harder to find and compare. Save anyway?",
      )
      if (!proceed) return
    }
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
            ? (err?.message ??
                'One of these fields needs a higher membership tier.')
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
    <FormStateProvider>
      {/* 1. Basic information */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Basic information</h2>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <div className="material-basics-grid">
          <div className="material-basics-main">
            <Input label="Material name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
            <Textarea label="Material description" required minChars={500} value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} />
          </div>
          <div className="material-featured-field">
            <span className="field-label">Featured image <span className="field-required" aria-hidden="true">*</span></span>
            <div className="material-featured-box">
              {form.featuredImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.featuredImage.url} alt="" className="material-featured-img" />
              ) : (
                <span className="material-featured-empty">
                  <IconImage size={18} />
                  <span className="material-featured-name">
                    {form.featuredImage?.name ?? 'No image yet'}
                  </span>
                </span>
              )}
            </div>
            <input
              ref={featuredInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFeaturedChange(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={() => featuredInputRef.current?.click()}
              disabled={uploading}
            >
              <IconUpload size={16} /> {uploading ? 'Uploading…' : 'Choose image'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Classification */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Classification</h2>
        <p className="panel-section-desc">Material type, indoor/outdoor use and application categories.</p>
        <div className="g2">
          <Select
            label="Material type"
            required
            value={typeSelectValue}
            placeholder="Select material type"
            onChange={(e) => set('type', e.target.value)}
            options={typeOptions.map((t) => ({ value: t.id, label: t.name }))}
            disabled={typeOptions.length === 0}
          />
          <div className="field-group">
            <span className="field-label">Indoor / Outdoor use <span className="field-required" aria-hidden="true">*</span></span>
            <div className="toggle-group">
              {INDOOR_OUTDOOR.map((o) => {
                const on = form.indoorOutdoor.includes(o.value)
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={`toggle-btn ${on ? 'is-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggleIndoorOutdoor(o.value)}
                  >
                    {o.label}
                    {on && <IconCheck size={15} className="toggle-check" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="field-block">
          <span className="field-label">Material applications <span className="field-required" aria-hidden="true">*</span></span>
          <p className="field-helper">Select up to three levels: main application, sub application, and type.</p>
          <ApplicationPicker value={form.applications} onChange={(next) => set('applications', next)} />
        </div>
      </div>

      {/* 3. Media */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Media</h2>
        <p className="panel-section-desc">Gallery images and video links displayed on your material page.</p>
        <div className="media-grid">
          <div>
            <span className="field-subhead">Gallery images</span>
            <GalleryField
              value={form.gallery}
              onChange={(next) => set('gallery', next)}
              onUpload={(file) => uploadFile(file, 'image')}
              uploading={uploading}
            />
          </div>
          <div>
            <span className="field-subhead">Video links</span>
            {canVideos ? (
              <VideoLinksField value={form.videos} onChange={(next) => set('videos', next)} />
            ) : (
              <BrandTierGate
                variant="section"
                required="plus"
                title="Video links"
                description="Add product videos, showreels and installation films to your material pages. Available from the Plus tier."
                upgradeHref="../../membership"
              >
                <div className="asset-list" aria-hidden="true">
                  <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">https://youtube.com/watch?v=…</span></span></div>
                  <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">https://vimeo.com/…</span></span></div>
                </div>
              </BrandTierGate>
            )}
          </div>
        </div>
      </div>

      {/* 4. Documents & downloads */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Documents &amp; downloads</h2>
        <p className="panel-section-desc">Upload brochures, technical datasheets, EPDs or installation guides.</p>
        {canDownloads ? (
          <DownloadsField
            value={form.downloads}
            onChange={(next) => set('downloads', next)}
            onUpload={(file) => uploadFile(file, 'document')}
            uploading={uploading}
          />
        ) : (
          <BrandTierGate
            variant="section"
            required="plus"
            title="Documents & downloads"
            description="Upload brochures, catalogues and sustainability reports. Available from the Plus tier."
            upgradeHref="../../membership"
          >
            <div className="asset-list" aria-hidden="true">
              <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">Technical datasheet.pdf</span></span></div>
              <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">EPD certificate.pdf</span></span></div>
            </div>
          </BrandTierGate>
        )}
      </div>

      {/* 5. Search & filtering */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Search &amp; filtering</h2>
        <p className="panel-section-desc">These properties determine how this material is found and compared.</p>
        {propertyGroups.map((group) => (
          <div key={group.group} className="property-group">
            <span className="field-subhead">{PROPERTY_GROUP_LABELS[group.group]}</span>
            <div className="property-grid">
              {group.entries.map((entry) => (
                <Select
                  key={entry.facet}
                  label={humanizeFacet(entry.facet)}
                  value={form.properties[entry.facet]}
                  placeholder={`Select ${humanizeFacet(entry.facet).toLowerCase()}`}
                  onChange={(e) => setProperty(entry.facet, e.target.value)}
                  options={propertyOptions[entry.facet].map((o) => ({ value: o.value, label: o.label }))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 6. Keywords */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Keywords</h2>
        {canKeywords ? (
          <>
            <p className="panel-section-desc">Add keywords to improve findability. Think of material properties, applications or certifications.</p>
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
              <button type="button" className="btn btn-primary" onClick={addKeyword} disabled={!keywordDraft.trim()}>
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
            variant="section"
            required="plus"
            title="Keywords"
            description="Add discovery keywords so buyers find this material faster. Available from the Plus tier."
            upgradeHref="../../membership"
          >
            <div className="chip-group" aria-hidden="true">
              <span className="chip is-on">acoustic</span>
              <span className="chip is-on">recycled</span>
              <span className="chip">fire-rated</span>
              <span className="chip">bio-based</span>
            </div>
          </BrandTierGate>
        )}
      </div>

      {/* 7. Channel coupling — Partner only */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Channel coupling</h2>
        <p className="panel-section-desc">
          Link this material to up to {MAX_CHANNELS} editorial channels. It will appear on those channel pages
          alongside curated articles, talks and brands.
        </p>
        {canChannels ? (
          <ChannelPicker
            options={MATERIAL_CHANNEL_LABELS}
            value={form.channels}
            onChange={(next) => set('channels', next)}
            max={MAX_CHANNELS}
            note="This material will appear on these channel pages within 24 hours of saving."
          />
        ) : (
          <BrandTierGate
            variant="section"
            required="partner"
            title="Channel coupling"
            description="Link this material to editorial channels so it appears on channel pages alongside relevant articles, talks and brands. Available on the Partner tier."
            upgradeHref="../../membership"
          >
            <div className="chip-group" aria-hidden="true">
              <span className="chip is-on">Biobased</span>
              <span className="chip">Acoustic</span>
              <span className="chip is-on">Sustainability</span>
              <span className="chip">Lighting</span>
              <span className="chip">Surfaces</span>
            </div>
          </BrandTierGate>
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
        invalid={!requiredComplete}
        onSave={handleSave}
        saveLabel={isEdit ? 'Save changes' : 'Publish material'}
      />
    </FormStateProvider>
  )
}
