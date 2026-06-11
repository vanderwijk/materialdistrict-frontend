import type { SVGProps } from 'react'

interface SaveSearchIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** Pixelmaat — wordt zowel op width als height gezet. Default 24. */
  size?: number | string
}

/**
 * SaveSearchIcon — klassieke diskette/floppy ("save").
 *
 * Hardgecodeerde SVG zodat het Save-search-icoon niet afhangt van versie-
 * keuzes in `lucide-react`. Net als bij `CompareIcon`: lucide hertekent
 * periodiek hun iconen, en hun `Save`-glyph is in een recente versie
 * (≥ ~0.471) hertekend, waardoor het automatisch het verkeerde icoon werd.
 *
 * Geometrie is 1-op-1 overgenomen uit de catalogus-demo (filter-header
 * save-knop): de klassieke diskette met label-vlak en bovennotch. Pas het
 * pad niet aan zonder akkoord — dit is de canonical "Save search" voor de
 * filter-header (materials + de generieke FilterSidebar).
 */
export function SaveSearchIcon({
  size = 24,
  strokeWidth = 2,
  stroke = 'currentColor',
  fill = 'none',
  ...rest
}: SaveSearchIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  )
}
