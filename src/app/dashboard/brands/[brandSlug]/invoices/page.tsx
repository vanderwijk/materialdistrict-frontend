import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getBrandInvoices } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { InvoicesTable } from '@/components/dashboard/panels/InvoicesTable'

export default async function BrandInvoicesPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)
  const invoices = await getBrandInvoices(brandSlug)

  return (
    <>
      <DashboardPageHeader
        title="Invoices"
        crumbs={[{ label: brand.name }, { label: 'Invoices' }]}
      />
      <div className="dash-panel">
        <InvoicesTable invoices={invoices} />
      </div>
    </>
  )
}
