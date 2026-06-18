'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconMail, IconChevronDown, IconChevronRight } from '@/components/ui/icons'
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
 * History of requests the visitor submitted on material/brand pages. Each row
 * is clickable and expands to show the full message + details (mirrors the
 * manufacturer-side detail view). The detail data is already present on the
 * request (`message`), so no extra fetch is needed.
 */
export function RequestsPanel({ requests }: { requests: MyRequest[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

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
        {requests.map((req, i) => {
          const isOpen = openId === req.id
          return (
            <div key={req.id} className="t-req-group">
              <div
                className={`t-row is-clickable ${i % 2 === 1 ? 'alt' : ''}`}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : req.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpenId(isOpen ? null : req.id)
                  }
                }}
              >
                <span>
                  <span className="t-row-caret" aria-hidden="true">
                    {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                  <span className="tag">{KIND_LABEL[req.kind]}</span>
                </span>
                <span>{req.subject}</span>
                <span>{req.brandName}</span>
                <span>{fmtDate(req.date)}</span>
                <span>{req.status}</span>
              </div>
              {isOpen && (
                <div className="t-req-detail">
                  <dl className="t-req-detail-meta">
                    <div><dt>Type</dt><dd>{KIND_LABEL[req.kind]}</dd></div>
                    <div><dt>Manufacturer</dt><dd>{req.brandName}</dd></div>
                    <div><dt>Date</dt><dd>{fmtDate(req.date)}</dd></div>
                    <div><dt>Status</dt><dd>{req.status}</dd></div>
                  </dl>
                  <div className="t-req-detail-message">
                    <span className="field-subhead">Your message</span>
                    <p>{req.message?.trim() ? req.message : 'No message was included with this request.'}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
