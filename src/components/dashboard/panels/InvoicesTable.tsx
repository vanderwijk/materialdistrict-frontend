import { EmptyState } from '@/components/ui/EmptyState'
import { IconDownload, IconBook } from '@/components/ui/icons'
import type { Invoice, InvoiceStatus } from '@/types/dashboard'

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  paid: 'b-green',
  open: 'b-blue',
  overdue: 'b-red',
  refunded: 'b-gray',
}

function fmtAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

/**
 * Invoice list table — shared by the personal account and per-brand invoice
 * panels (DRY). Column layout via the `.t-invoices` modifier in globals.css.
 */
export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<IconBook size={28} />}
        title="No invoices yet"
        description="Invoices appear here once a payment has been processed."
      />
    )
  }

  return (
    <div className="table-wrap t-invoices">
      <div className="t-head">
        <span>Date</span>
        <span>Description</span>
        <span>Amount</span>
        <span>Status</span>
        <span className="t-col-end">Invoice</span>
      </div>
      {invoices.map((inv, i) => (
        <div key={inv.id} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
          <span>{fmtDate(inv.date)}</span>
          <span>{inv.description}</span>
          <span>{fmtAmount(inv.amount, inv.currency)}</span>
          <span>
            <span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span>
          </span>
          <span className="t-col-end">
            {inv.pdfUrl ? (
              <a href={inv.pdfUrl} className="icon-btn" aria-label={`Download invoice ${inv.id}`}>
                <IconDownload size={16} />
              </a>
            ) : (
              <span className="field-helper">Pending</span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
