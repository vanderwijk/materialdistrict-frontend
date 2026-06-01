import { notFound } from 'next/navigation'
import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getBrandProfile } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { BrandProfileForm } from '@/components/dashboard/panels/BrandProfileForm'

export default async function BrandProfilePage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)
  const profile = await getBrandProfile(brandSlug)
  if (!profile) notFound()

  return (
    <>
      <DashboardPageHeader
        title="Brand profile"
        crumbs={[{ label: brand.name }, { label: 'Brand profile' }]}
      />
      <BrandProfileForm initial={profile} tier={brand.tier} />
    </>
  )
}
