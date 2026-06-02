'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/ui/form'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { IconAdd, IconDelete } from '@/components/ui/icons'
import type { LeadRoutingConfig, LeadRoute } from '@/types/dashboard'

const COUNTRIES = [
  'Netherlands', 'Belgium', 'Germany', 'France', 'United Kingdom',
  'Spain', 'Italy', 'Denmark', 'Sweden', 'Other',
]

/**
 * Geo-based lead routing (Plus+). A default contact plus per-country overrides
 * deciding who receives requests. Saves via `POST .../lead-routing`.
 */
export function LeadRoutingPanel({
  brandId,
  initial,
}: {
  brandId: number
  initial: LeadRoutingConfig
}) {
  const router = useRouter()
  const [config, setConfig] = useState<LeadRoutingConfig>(initial)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function addRoute() {
    const route: LeadRoute = { id: Date.now(), country: '', name: '', email: '' }
    setConfig((c) => ({ ...c, routes: [...c.routes, route] }))
  }

  function updateRoute(id: number, key: keyof LeadRoute, value: string) {
    setConfig((c) => ({
      ...c,
      routes: c.routes.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    }))
  }

  function removeRoute(id: number) {
    setConfig((c) => ({ ...c, routes: c.routes.filter((r) => r.id !== id) }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/dashboard/brands/${brandId}/lead-routing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(
          err?.code === 'md_dashboard_forbidden'
            ? 'Lead routing requires a Plus or Partner membership.'
            : err?.message ?? 'Could not save lead routing. Please try again.',
        )
        return
      }
      // WP reassigns route ids — re-read so the UI has the canonical config.
      const saved = (await res.json()) as LeadRoutingConfig
      setConfig(saved)
      router.refresh()
    } catch {
      setSaveError('Could not save lead routing. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Default contact</h2>
        <p className="panel-section-desc">Receives all requests unless a country rule below matches.</p>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <div className="g2">
          <Input
            label="Name"
            value={config.defaultName}
            onChange={(e) => setConfig((c) => ({ ...c, defaultName: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={config.defaultEmail}
            onChange={(e) => setConfig((c) => ({ ...c, defaultEmail: e.target.value }))}
          />
        </div>
      </div>

      <div className="dash-panel">
        <div className="panel-head-row">
          <h2 className="panel-section-title">Country rules</h2>
          <button type="button" className="btn btn-outline btn-sm" onClick={addRoute}>
            <IconAdd size={16} /> Add rule
          </button>
        </div>
        {config.routes.length === 0 && <p className="field-helper">No country rules yet.</p>}
        {config.routes.map((route) => (
          <div key={route.id} className="route-row">
            <Select
              label="Country"
              value={route.country}
              onChange={(e) => updateRoute(route.id, 'country', e.target.value)}
              placeholder="Select"
              options={COUNTRIES.map((c) => ({ value: c, label: c }))}
            />
            <Input label="Name" value={route.name} onChange={(e) => updateRoute(route.id, 'name', e.target.value)} />
            <Input label="Email" type="email" value={route.email} onChange={(e) => updateRoute(route.id, 'email', e.target.value)} />
            <button
              type="button"
              className="icon-btn route-remove"
              onClick={() => removeRoute(route.id)}
              aria-label="Remove rule"
            >
              <IconDelete size={16} />
            </button>
          </div>
        ))}
      </div>

      <DashboardStickyFooter progress={100} saving={saving} showPreview={false} onSave={handleSave} />
    </>
  )
}
