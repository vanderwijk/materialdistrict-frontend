'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconMail, IconClose } from '@/components/ui/icons'
import type { MyRequest, RequestKind } from '@/types/dashboard'

const KIND_LABEL: Record<RequestKind, string> = {
  sample: 'Sample',
  info: 'Info',
  brochure: 'Brochure',
  contact: 'Contact',
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

/**
 * History of requests the visitor submitted on material/brand pages. A row
 * opens a shared slide-in detail drawer — the same pattern as the
 * manufacturer-side InteractionsPanel (review point 6, replacing the old inline
 * accordion). The detail data is already on the request (`message`), so no extra
 * fetch is needed; the `.ip-*` drawer classes are reused for consistency.
 */
export function RequestsPanel({ requests }: { requests: MyRequest[] }) {
  const [open, setOpen] = useState<MyRequest | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (requests.length === 0) {
    return (
      <div className="dash-panel">
        <EmptyState
          icon={<IconMail size={28} />}
          title="No requests yet"
          description="When you request a sample, brochure or info from a manufacturer, it shows up here."
          actions={
            <Link href="/material" className="btn btn-primary">
              Browse materials
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="dash-panel">
      <div className="table-wrap t-requests">
        <div className="t-head">
          <span>Type</span>
          <span>Subject</span>
          <span>Manufacturer</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        {requests.map((req, i) => (
          <button
            key={req.id}
            type="button"
            className={`t-row t-row-btn ${i % 2 === 1 ? 'alt' : ''}`}
            onClick={() => setOpen(req)}
          >
            <span>
              <span className="tag">{KIND_LABEL[req.kind]}</span>
            </span>
            <span>{req.subject}</span>
            <span>{req.brandName}</span>
            <span>{fmtDate(req.date)}</span>
            <span>{req.status}</span>
          </button>
        ))}
      </div>

      <div className={`ip-overlay ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="ip-backdrop" onClick={() => setOpen(null)} />
        <aside
          className="ip-panel"
          role="dialog"
          aria-modal="true"
          aria-label={open ? `Request to ${open.brandName}` : 'Request details'}
        >
          {open && (
            <>
              <header className="ip-header">
                <h2 className="ip-title">{open.subject}</h2>
                <button type="button" className="ip-close" onClick={() => setOpen(null)} aria-label="Close">
                  <IconClose size={18} />
                </button>
              </header>
              <div className="ip-body">
                <section className="ip-section">
                  <h3 className="ip-section-title">Request</h3>
                  <div className="ip-row"><span className="ip-label">Type</span><span>{KIND_LABEL[open.kind]}</span></div>
                  <div className="ip-row"><span className="ip-label">Manufacturer</span><span>{open.brandName}</span></div>
                  <div className="ip-row"><span className="ip-label">Date</span><span>{fmtDate(open.date)}</span></div>
                  <div className="ip-row"><span className="ip-label">Status</span><span>{open.status}</span></div>
                </section>

                <section className="ip-section">
                  <h3 className="ip-section-title">Your message</h3>
                  <p className="ip-message">
                    {open.message?.trim() ? open.message : 'No message was included with this request.'}
                  </p>
                </section>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
