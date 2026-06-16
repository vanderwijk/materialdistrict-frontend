import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconMail } from '@/components/ui/icons'
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

/** Read-only history of requests the visitor submitted on material/brand pages. */
export function RequestsPanel({ requests }: { requests: MyRequest[] }) {
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
          <div key={req.id} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
            <span><span className="tag">{KIND_LABEL[req.kind]}</span></span>
            <span>{req.subject}</span>
            <span>{req.brandName}</span>
            <span>{fmtDate(req.date)}</span>
            <span>{req.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
