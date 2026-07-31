import { Suspense } from 'react'
import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { DashboardPageHeader } from '@/components/dashboard'
import { BrandMembershipPanel } from '@/components/dashboard/panels/BrandMembershipPanel'
import { BrandMembershipCheckoutNotice } from './_components/BrandMembershipCheckoutNotice'

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
      <Suspense fallback={null}>
        <BrandMembershipCheckoutNotice brandId={brand.id} brandSlug={brand.slug} />
      </Suspense>
      <BrandMembershipPanel brand={brand} />
    </>
  )
}
