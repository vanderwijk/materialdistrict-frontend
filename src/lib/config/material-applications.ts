/**
 * Material applications — the single, shared option source for the 3-level
 * application/sector picker used in BOTH the brand profile form ("Sectors &
 * applications") and the material add/edit form ("Material applications").
 *
 * Tree shape: Main application → Sub application → Type. Mirrored 1:1 from the
 * MaterialDistrict mockup (`APPLICATIONS`). This is the authoritative client
 * source; the `/md/v2/dashboard/material-categories` endpoint may later hydrate
 * real WP term ids onto the same shape (see mappers `mapMaterialCategoryOptions`),
 * but the picker renders from this tree so it works regardless of endpoint state.
 *
 * DRY: one source, one picker (`ApplicationPicker`), reused in both forms.
 */

/** Main application → Sub application → list of Types. */
export type ApplicationTree = Record<string, Record<string, readonly string[]>>

export const MATERIAL_APPLICATIONS: ApplicationTree = {
  'Building Elements': {
    'Construction Materials': ['External Masonry Blocks', 'Lightweight Blocks', 'Lime / Mortar / Cement', 'Load-Bearing Blocks', 'MDF - Medium-density fibreboard', 'HDF - High-density fibreboard', 'OSB - Oriented Strand Board', 'Chipboard', 'Plasterboards', 'Plywood', 'Sound Insulating Blocks', 'Sound-Absorbing Blocks', 'Thermal Insulating Blocks', 'Timber', 'Other Construction Materials'],
    'Facades': ['Facade Bricks', 'Facade Glazing', 'Facade Media & Signing', 'Facade Panels', 'Facade Screens & Textiles', 'Facade Shingles', 'Facade Slates', 'Facade Structures', 'Facade Systems', 'Facade Tiles', 'Other Facade Materials'],
    'Roofs': ['Roof Glazing', 'Roof Panels', 'Roof Shingles', 'Roof Slates', 'Roof Structures', 'Roof Systems', 'Roof Tiles', 'Waterproofing', 'Other Roof Materials'],
    'Thermal Insulation': ['Thermal Ceiling Insulation', 'Thermal Facade Insulation', 'Thermal Floor Insulation', 'Thermal Inner Wall Insulation', 'Thermal Roof Insulation', 'Other Thermal Insulation Materials'],
    'Doors / Windows': ['Architectural Glazing', 'External Blinds / Sunblinds', 'Door Panels', 'Door Stickers', 'Doors', 'Glass Foils', 'Sills / Windowsills', 'Window Profiles', 'Other Door / Window Materials'],
    'Ceilings': ['Acoustic Ceilings', 'Ceiling Panels', 'Decorative Ceiling Elements', 'Fire-Resistant Ceilings', 'Hanging Acoustic Panels', 'Illuminated Ceilings', 'Stretch Ceilings', 'Suspended Ceilings', 'Other Ceiling Materials'],
    'Partitions': ['Glass Blocks', 'Glass Walls', 'Movable Walls', 'Partition Walls', 'Room Dividers', 'Walls For Stands & Fairs', 'Other Partition Materials'],
    'Staircases': ['Balustrades / Stair Gates', 'Handrails', 'Staircase Systems', 'Other Staircase Materials'],
    'Structures': ['Composite Structures', 'Metal Structures', 'Prefabricated Reinforced Concrete Structures', 'Textile Structures', 'NLT / DLT - Nail / Dowel Laminated Timber', 'PSL - Parallel Strand Lumber', 'LSL - Laminated Strand Lumber', 'GLULAM - Glue Laminated Timber', 'CLT - Cross Laminated Timber', 'LVL - Laminated Veneer Lumber', 'Other Structures'],
    'Energy Systems': ['Photovoltaic Energy Systems', 'Renewable Energy Systems', 'Solar Heating Systems', 'Other Energy System Materials'],
  },
  'Floor- & Wall Coverings': {
    'Floor Coverings': ['Antibacterial Flooring', 'Carpet Tiles', 'Continious Flooring', 'Floor Mosaics', 'Floor Tiles', 'Laminates', 'Mats', 'Parquets', 'Rugs', 'Sports Flooring', 'Wall-To-Wall Carpets', 'Other Floor Covering Materials'],
    'Wall Coverings': ['Acoustic Wall Panels', 'Decorative Wall Elements', 'Stretch Walls', 'Veneered Wall Panels', 'Wall Fabrics', 'Wall Mosaics', 'Wall Panels', 'Wall Papers', 'Wall Stickers', 'Wall Tiles', 'Other Wall Covering Materials'],
  },
  'Paints / Plasters': {
    'Plasters': ['Cement Plaster', 'Dehumidifying Plasters', 'Fibre-Reinforced / Special Plasters', 'Fire-Resistant Plasters', 'Gypsum Plasters', 'Hydraulic / Hydrated Plasters', 'Natural Plasters', 'Sound-Absorbent Plasters', 'Thermal Insulating Plasters', 'Other Plasters'],
    'Paints': ['Anti-Bacterial Paints', 'Anti-Corrosive Paints', 'Breathable Paints', 'Decorative Paints', 'Ecological Paints', 'Enamels', 'Fire-Resistant Paints', 'Fireproof Paints', 'Insulating Paints', 'Metal Treatments', 'Protective Paints', 'Sanitising Paints', 'Solar & Heat Reflective Paints', 'Transparent Paints', 'Washable Paints', 'Water-Repellent Paints', 'Waxes / Polishes', 'Wood Treatments', 'Other Paints'],
  },
  'Furniture': {
    'Furniture Components': ['Cabinet Doors', 'Countertops', 'Decorative Panels', 'Furniture Foils', 'Kitchen Tops', 'Table Tops', 'Veneered Panels', 'Other Furniture Components Materials'],
    'Fabrics': ['Antibacterial Fabrics', 'Upholstery Fabrics', 'Other Fabrics'],
  },
  'Decoration': {
    'Vegetation': ['Artificial Plants', 'Indoor Vertical Gardens', 'Vegetal Frames', 'Other Vegetation Materials'],
    'Curtains / Blinds': ['Blinds', 'Curtains', 'Mosquito Nets', 'Other Curtain / Blind Materials'],
    'Textiles': ['Bath Linens & Textiles', 'Kitchen Linens & Textiles', 'Shower Curtains', 'Other Textiles'],
    'Wall Decoration': ['Mirrors', 'Paintings / Prints', 'Tapestries', 'Whiteboards', 'Other Wall Decoration Materials'],
  },
  'Outdoor': {
    'Outdoor Flooring': ['Artificial Grass', 'Continuous Flooring', 'Decking', 'Decorative Chippings', 'Decorative Pebbles', 'Floor Tiles', 'Grilles', 'Lawn Edging', 'Outdoor Mats', 'Outdoor Rugs', 'Paving Blocks', 'Other Outdoor Flooring Materials'],
    'Outdoor Furniture': ['Outdoor Upholstery Fabrics', 'Shade Panels & Sails', 'Other Outdoor Furniture Materials'],
    'Garden': ['Artificial Hedges', 'Garden & Plant Netting', 'Outdoor Greenwalls', 'Other Garden Materials'],
    'Fences / Enclosures': ['Fences', 'Garden Partitions', 'Gates', 'Railings', 'Other Fences / Enclosures Materials'],
  },
}

// --------------------------------------------------------------------
// Lookup helpers — used by the shared ApplicationPicker
// --------------------------------------------------------------------

/** All main-application keys, in tree order. */
export function applicationMains(): string[] {
  return Object.keys(MATERIAL_APPLICATIONS)
}

/** Sub-application keys for a given main (empty if main unknown). */
export function applicationSubs(main: string): string[] {
  const node = MATERIAL_APPLICATIONS[main]
  return node ? Object.keys(node) : []
}

/** Type keys for a given main + sub (empty if unknown). */
export function applicationTypes(main: string, sub: string): string[] {
  const node = MATERIAL_APPLICATIONS[main]
  const list = node ? node[sub] : undefined
  return list ? [...list] : []
}

/** True when the full main › sub › type path exists in the tree. */
export function isValidApplicationPath(
  main: string,
  sub: string,
  type: string,
): boolean {
  return applicationTypes(main, sub).includes(type)
}

/** Stable id for a selected path, used as the MaterialCategoryPath.id until a real WP term id is assigned. */
export function applicationPathId(main: string, sub: string, type: string): string {
  return `app:${main}|${sub}|${type}`
}
