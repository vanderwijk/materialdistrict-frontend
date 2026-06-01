import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getInteractions } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { InteractionsPanel } from '@/components/dashboard/panels/InteractionsPanel'

export default async function BrandInteractionsPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)
  const interactions = await getInteractions(brandSlug)

  return (
    <>
      <DashboardPageHeader
        title="Interactions"
        crumbs={[{ label: brand.name }, { label: 'Interactions' }]}
      />
      <InteractionsPanel interactions={interactions} />
    </>
  )
}
