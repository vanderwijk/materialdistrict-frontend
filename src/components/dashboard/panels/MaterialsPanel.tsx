'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconAdd, IconMaterial, IconEdit } from '@/components/ui/icons'
import { UNLIMITED_PUBLICATIONS } from '@/types/shared'
import type { MaterialListRow, MaterialPublicationStatus } from '@/types/dashboard'

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

/**
 * Brand materials management. Lists materials with an online/offline toggle,
 * shows publication quota usage, and links to create/edit. Status changes are
 * optimistic local state until `PATCH .../materials/{id}` lands.
 */
export function MaterialsPanel({
  slug,
  materials: initial,
  quota,
  used,
}: {
  slug: string
  materials: MaterialListRow[]
  quota: number
  used: number
}) {
  const [materials, setMaterials] = useState(initial)
  const unlimited = quota === UNLIMITED_PUBLICATIONS
  const atLimit = !unlimited && used >= quota
  const pct = unlimited || quota <= 0 ? 0 : Math.min(100, Math.round((used / quota) * 100))
  const fill = { '--progress': `${pct}%` } as CSSProperties

  function toggleStatus(id: number) {
    setMaterials((list) =>
      list.map((m) =>
        m.id === id
          ? { ...m, status: (m.status === 'online' ? 'offline' : 'online') as MaterialPublicationStatus }
          : m,
      ),
    )
  }

  return (
    <div className="dash-panel">
      <div className="panel-head-row">
        <div>
          <h2 className="panel-section-title">Materials</h2>
          <p className="field-helper">
            {unlimited ? `${used} published · unlimited` : `${used} of ${quota} published`}
          </p>
        </div>
        <Link
          href={`/dashboard/brands/${slug}/materials/new`}
          className="btn btn-primary btn-sm"
          aria-disabled={atLimit}
        >
          <IconAdd size={16} /> Add material
        </Link>
      </div>

      {!unlimited && quota > 0 && (
        <div className="progress-track memb-quota">
          <div className="progress-fill" style={fill} />
        </div>
      )}

      {materials.length === 0 ? (
        <EmptyState
          icon={<IconMaterial size={28} />}
          title="No materials yet"
          description="Add your first material to start appearing in the materials directory."
          actions={
            <Link href={`/dashboard/brands/${slug}/materials/new`} className="btn btn-primary">
              Add material
            </Link>
          }
        />
      ) : (
        <div className="table-wrap t-materials">
          <div className="t-head">
            <span>Name</span>
            <span>Category</span>
            <span>Status</span>
            <span>Updated</span>
            <span className="t-col-end">Edit</span>
          </div>
          {materials.map((m, i) => (
            <div key={m.id} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
              <span className="t-strong">{m.name}</span>
              <span>{m.category}</span>
              <span>
                <button
                  type="button"
                  className={`status-toggle ${m.status === 'online' ? 'is-online' : ''}`}
                  role="switch"
                  aria-checked={m.status === 'online'}
                  onClick={() => toggleStatus(m.id)}
                >
                  {m.status === 'online' ? 'Online' : 'Offline'}
                </button>
              </span>
              <span>{fmtDate(m.updatedAt)}</span>
              <span className="t-col-end">
                <Link
                  href={`/dashboard/brands/${slug}/materials/${m.id}/edit`}
                  className="icon-btn"
                  aria-label={`Edit ${m.name}`}
                >
                  <IconEdit size={16} />
                </Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
