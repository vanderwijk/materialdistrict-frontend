'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input, Select } from '@/components/ui/form'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconMail, IconClose } from '@/components/ui/icons'
import type { Interaction } from '@/types/dashboard'

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

const STATUS_BADGE: Record<string, string> = {
  Request: 'b-green',
  Download: 'b-blue',
  Info: 'b-amber',
  Contact: 'b-gray',
}

const ALL = '' // sentinel: dropdown "all" option

/** Distinct, sorted values for a dropdown, preserving first-seen-then-alpha. */
function distinct(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

/**
 * Incoming interactions (leads) with a client-side filter bar (search + page +
 * type) and a slide-in detail drawer. The list and drawer are unchanged; the
 * filter bar narrows which rows render. Data is fetched server-side; this
 * component handles only the filter + open/close UI state.
 */
export function InteractionsPanel({ interactions }: { interactions: Interaction[] }) {
  const [open, setOpen] = useState<Interaction | null>(null)
  const [query, setQuery] = useState('')
  const [pageFilter, setPageFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pageOptions = useMemo(() => distinct(interactions.map((it) => it.page)), [interactions])
  const statusOptions = useMemo(() => distinct(interactions.map((it) => it.status)), [interactions])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return interactions.filter((it) => {
      if (pageFilter !== ALL && it.page !== pageFilter) return false
      if (statusFilter !== ALL && it.status !== statusFilter) return false
      if (!q) return true
      return [it.person, it.company, it.page, it.email, it.role]
        .some((field) => field.toLowerCase().includes(q))
    })
  }, [interactions, query, pageFilter, statusFilter])

  // No interactions at all — nothing to filter, show the empty state only.
  if (interactions.length === 0) {
    return (
      <div className="dash-panel">
        <EmptyState
          icon={<IconMail size={28} />}
          title="No interactions yet"
          description="Sample requests, info requests and downloads on your pages will appear here."
        />
      </div>
    )
  }

  return (
    <div className="dash-panel">
      <div className="dash-filterbar">
        <Input
          type="search"
          placeholder="Search interactions…"
          aria-label="Search interactions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          aria-label="Filter by page"
          value={pageFilter}
          onChange={(e) => setPageFilter(e.target.value)}
          options={[
            { value: ALL, label: 'All pages' },
            ...pageOptions.map((p) => ({ value: p, label: p })),
          ]}
        />
        <Select
          aria-label="Filter by interaction type"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: ALL, label: 'All interactions' },
            ...statusOptions.map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconMail size={28} />}
          title="No matching interactions"
          description="Try a different search term or clear the filters."
        />
      ) : (
        <div className="table-wrap t-interactions">
          <div className="t-head">
            <span>Page</span>
            <span>Contact</span>
            <span>Company</span>
            <span>Type</span>
            <span>When</span>
          </div>
          {filtered.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className={`t-row t-row-btn ${i % 2 === 1 ? 'alt' : ''}`}
              onClick={() => setOpen(it)}
            >
              <span className="t-strong">{it.page}</span>
              <span>{it.person}</span>
              <span>{it.company}</span>
              <span>
                <span className={`badge ${STATUS_BADGE[it.status] ?? 'b-gray'}`}>{it.status}</span>
              </span>
              <span>{it.timeAgo}</span>
            </button>
          ))}
        </div>
      )}

      <div className={`ip-overlay ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="ip-backdrop" onClick={() => setOpen(null)} />
        <aside
          className="ip-panel"
          role="dialog"
          aria-modal="true"
          aria-label={open ? `Interaction from ${open.person}` : 'Interaction details'}
        >
          {open && (
            <>
              <header className="ip-header">
                <h2 className="ip-title">{open.person}</h2>
                <button type="button" className="ip-close" onClick={() => setOpen(null)} aria-label="Close">
                  <IconClose size={18} />
                </button>
              </header>
              <div className="ip-body">
                <section className="ip-section">
                  <h3 className="ip-section-title">Request</h3>
                  <div className="ip-row"><span className="ip-label">Page</span><span>{open.page}</span></div>
                  <div className="ip-row"><span className="ip-label">Type</span><span>{open.status}</span></div>
                  <div className="ip-row"><span className="ip-label">Date</span><span>{fmtDate(open.date)}</span></div>
                  {open.requestOptions.length > 0 && (
                    <div className="ip-row">
                      <span className="ip-label">Options</span>
                      <span>{open.requestOptions.join(', ')}</span>
                    </div>
                  )}
                </section>

                <section className="ip-section">
                  <h3 className="ip-section-title">Contact</h3>
                  <div className="ip-row"><span className="ip-label">Name</span><span>{open.person}</span></div>
                  <div className="ip-row"><span className="ip-label">Role</span><span>{open.role}</span></div>
                  <div className="ip-row"><span className="ip-label">Industry</span><span>{open.industry}</span></div>
                  <div className="ip-row"><span className="ip-label">Company</span><span>{open.company}</span></div>
                  <div className="ip-row">
                    <span className="ip-label">Email</span>
                    <span><a href={`mailto:${open.email}`}>{open.email}</a></span>
                  </div>
                  {open.phone && (
                    <div className="ip-row"><span className="ip-label">Phone</span><span>{open.phone}</span></div>
                  )}
                </section>

                {(open.address || open.city) && (
                  <section className="ip-section">
                    <h3 className="ip-section-title">Address</h3>
                    {open.address && <div className="ip-row"><span className="ip-label">Street</span><span>{open.address}</span></div>}
                    <div className="ip-row"><span className="ip-label">City</span><span>{[open.postcode, open.city].filter(Boolean).join(' ')}</span></div>
                    <div className="ip-row"><span className="ip-label">Country</span><span>{open.country}</span></div>
                  </section>
                )}

                {open.message && (
                  <section className="ip-section">
                    <h3 className="ip-section-title">Message</h3>
                    <p className="ip-message">{open.message}</p>
                  </section>
                )}

                <a href={`mailto:${open.email}`} className="btn btn-primary ip-reply">
                  Reply by email
                </a>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
