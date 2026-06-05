import type { ProfileFieldOptions } from '@/types/dashboard'

/**
 * Default profession / industry option lists — mirrored from
 * materialdistrict-theme/page-edit-profile.php (and page-register.php).
 * Used until `GET /md/v2/dashboard/profile-options` is live on WordPress.
 */
export const DEFAULT_PROFILE_FIELD_OPTIONS: ProfileFieldOptions = {
  professions: [
    { value: 'Architect', label: 'Architect' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Furniture designer', label: 'Furniture designer' },
    { value: 'Product developer', label: 'Product developer' },
    { value: 'Manufacturer', label: 'Manufacturer' },
    { value: 'Contractor', label: 'Contractor' },
    { value: 'Client', label: 'Client' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Student', label: 'Student' },
    { value: 'Other', label: 'Other' },
  ],
  industries: [
    {
      value: 'Architecture',
      label: 'Architecture (incl Urban Planning, Landscape Architecture and Infrastucture)',
    },
    {
      value: 'Interior',
      label: 'Interior (incl Furniture and Interiorproducts)',
    },
    {
      value: 'Fashion',
      label: 'Fashion (incl Apparel, Sportswear and Accessoires)',
    },
    {
      value: 'Mobility',
      label: 'Mobility (incl Automotive, Ships, Bicycles)',
    },
    {
      value: 'Graphic',
      label: 'Graphic (incl Packaging, Print, Signing)',
    },
    {
      value: 'Products',
      label: 'Products (incl. Consumerproducts, Sportsgear, Business Goods)',
    },
    { value: 'Other', label: 'Other' },
  ],
}

/** WP options when present, otherwise theme defaults. */
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
