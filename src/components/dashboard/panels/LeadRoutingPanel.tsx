'use client'

import { useState } from 'react'
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
 * deciding who receives requests. Mutations are local until the lead-routing
 * endpoints land.
 */
export function LeadRoutingPanel({ initial }: { initial: LeadRoutingConfig }) {
  const [config, setConfig] = useState<LeadRoutingConfig>(initial)
  const [saving, setSaving] = useState(false)

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
    await new Promise((r) => setTimeout(r, 400))
    setSaving(false)
  }

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Default contact</h2>
        <p className="panel-section-desc">Receives all requests unless a country rule below matches.</p>
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
