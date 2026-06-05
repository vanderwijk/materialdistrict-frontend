import type { ProfileFieldOption, ProfileFieldOptions } from '@/types/dashboard'

/**
 * Default profession / industry option lists — mirrored from
 * materialdistrict-plugin/profile-options.php (slug values).
 * Used only when `GET /md/v2/dashboard/profile-options` is unavailable.
 */
export const DEFAULT_PROFILE_FIELD_OPTIONS: ProfileFieldOptions = {
  professions: [
    { value: 'architect', label: 'Architect' },
    { value: 'designer', label: 'Designer' },
    { value: 'furniture-designer', label: 'Furniture designer' },
    { value: 'product-developer', label: 'Product developer' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'client', label: 'Client' },
    { value: 'professor', label: 'Professor' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
    { value: 'other', label: 'Other' },
  ],
  industries: [
    {
      value: 'architecture',
      label: 'Architecture (incl Urban Planning, Landscape Architecture and Infrastucture)',
    },
    {
      value: 'interior',
      label: 'Interior (incl Furniture and Interiorproducts)',
    },
    {
      value: 'fashion',
      label: 'Fashion (incl Apparel, Sportswear and Accessoires)',
    },
    {
      value: 'mobility',
      label: 'Mobility (incl Automotive, Ships, Bicycles)',
    },
    {
      value: 'graphic',
      label: 'Graphic (incl Packaging, Print, Signing)',
    },
    {
      value: 'products',
      label: 'Products (incl. Consumerproducts, Sportsgear, Business Goods)',
    },
    { value: 'other', label: 'Other' },
  ],
}

/** WP options when present, otherwise plugin/theme defaults. */
export function mergeProfileFieldOptions(fromWp: ProfileFieldOptions): ProfileFieldOptions {
  return {
    professions:
      fromWp.professions.length > 0
        ? fromWp.professions
        : DEFAULT_PROFILE_FIELD_OPTIONS.professions,
    industries:
      fromWp.industries.length > 0
        ? fromWp.industries
        : DEFAULT_PROFILE_FIELD_OPTIONS.industries,
  }
}

/** Keep unknown stored values visible in a select (legacy / custom meta). */
export function withCurrentSelectValue(
  options: ProfileFieldOption[],
  current: string,
): ProfileFieldOption[] {
  if (!current || options.some((o) => o.value === current)) return options
  return [...options, { value: current, label: current }]
}
