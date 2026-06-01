import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { DashboardPageHeader } from '@/components/dashboard'
import { BrandMembershipPanel } from '@/components/dashboard/panels/BrandMembershipPanel'

export default async function BrandMembershipPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)

  return (
    <>
      <DashboardPageHeader
        title="Membership"
        crumbs={[{ label: brand.name }, { label: 'Membership' }]}
      />
      <BrandMembershipPanel brand={brand} />
    </>
  )
}
