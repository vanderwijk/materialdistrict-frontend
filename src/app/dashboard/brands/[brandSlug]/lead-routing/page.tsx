import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getLeadRouting } from '@/lib/dashboard/data'
import { canManufacturerAccess } from '@/lib/config/membership'
import { DashboardPageHeader } from '@/components/dashboard'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { LeadRoutingPanel } from '@/components/dashboard/panels/LeadRoutingPanel'

export default async function BrandLeadRoutingPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)

  const header = (
    <DashboardPageHeader title="Lead routing" crumbs={[{ label: brand.name }, { label: 'Lead routing' }]} />
  )

  if (!canManufacturerAccess(brand.tier, 'Geo-based Lead Routing')) {
    return (
      <>
        {header}
        <BrandTierGate
          variant="page"
          required="plus"
          title="Lead routing"
          description="Route requests to the right colleague per country. Available from the Plus tier."
          upgradeHref={`/dashboard/brands/${brandSlug}/membership`}
        />
      </>
    )
  }

  const config = await getLeadRouting(brandSlug)
  return (
    <>
      {header}
      <LeadRoutingPanel brandId={brand.id} initial={config} />
    </>
  )
}
