import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getMaterialForm, getMaterialTypes, getMaterialPropertyOptions } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { MaterialForm } from '@/components/dashboard/panels/MaterialForm'

export default async function NewMaterialPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)
  const [form, typeOptions, propertyOptions] = await Promise.all([
    getMaterialForm(brandSlug, null),
    getMaterialTypes(),
    getMaterialPropertyOptions(),
  ])

  return (
    <>
      <DashboardPageHeader
        title="Add material"
        backHref={`/dashboard/brands/${brandSlug}/materials`}
        backLabel="Back to materials"
        crumbs={[
          { label: brand.name },
          { label: 'Materials', href: `/dashboard/brands/${brandSlug}/materials` },
          { label: 'Add material' },
        ]}
      />
      <MaterialForm slug={brandSlug} brandId={brand.id} initial={form} tier={brand.tier} typeOptions={typeOptions} propertyOptions={propertyOptions} />
    </>
  )
}
