import { getUserInvoices } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { InvoicesTable } from '@/components/dashboard/panels/InvoicesTable'

export default async function UserInvoicesPage() {
  const invoices = await getUserInvoices()
  return (
    <>
      <DashboardPageHeader title="Invoices" crumbs={[{ label: 'Account' }, { label: 'Invoices' }]} />
      <div className="dash-panel">
        <InvoicesTable invoices={invoices} />
      </div>
    </>
  )
}
