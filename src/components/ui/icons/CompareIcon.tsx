import type { SVGProps } from 'react'

interface CompareIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** Pixelmaat — wordt zowel op width als height gezet. Default 24. */
  size?: number | string
}

/**
 * CompareIcon — drie verticale staafjes oplopend, gelijke lijndikte, geen baseline.
 *
 * Sessie 3B post-fix: hardgecodeerde SVG zodat het Compare-icoon niet
 * afhangt van versie-keuzes in `lucide-react`. Lucide hernoemt periodiek
 * hun iconen (`BarChart2` → `ChartNoAxesColumn` is recent gebeurd) waardoor
 * het visuele icoon ongemerkt kan veranderen na een dependency-update.
 *
 * Dit icoon is de canonical "Compare" voor MaterialDistrict. Pas het pad
 * niet aan zonder akkoord — wijzigingen werken door op alle compare-knoppen
 * (cards, detail-headers, compare-bar).
 *
 * Geometrie: drie staafjes met `stroke-linecap: round`, posities x=5/12/19,
 * onderkanten op y=21, bovenkanten op y=15/3/9 (oplopend visueel patroon
 * dat bekend is van staafdiagram-vergelijkingen).
 */
export function CompareIcon({
  size = 24,
  strokeWidth = 2,
  stroke = 'currentColor',
  fill = 'none',
  ...rest
}: CompareIconProps) {
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
      <path d="M5 21V15" />
      <path d="M12 21V3" />
      <path d="M19 21V9" />
    </svg>
  )
}
