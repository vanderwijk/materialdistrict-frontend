/**
 * Insider-ster (4-puntig, "compass star").
 * Letterlijk overgenomen uit MaterialDistrict_MockUp_DEF.html.
 * Niet in Lucide-react beschikbaar, dus eigen component.
 */
interface InsiderIconProps {
  size?: number
  className?: string
  /** Of de ster gevuld is (binnenkant) of als omgekeerd masker (buitenkant). */
  filled?: boolean
}

export function InsiderIcon({ size = 14, className, filled = false }: InsiderIconProps) {
  if (filled) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path d="M12 5.25C12.85 9.05 14.95 11.15 18.75 12C14.95 12.85 12.85 14.95 12 18.75C11.15 14.95 9.05 12.85 5.25 12C9.05 11.15 11.15 9.05 12 5.25Z" />
      </svg>
    )
  }

  // Mask-variant: cirkel met de ster eruit gemaskeerd (zoals in header member button)
  const maskId = `insider-mask-${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M12 5.25C12.85 9.05 14.95 11.15 18.75 12C14.95 12.85 12.85 14.95 12 18.75C11.15 14.95 9.05 12.85 5.25 12C9.05 11.15 11.15 9.05 12 5.25Z"
            fill="black"
          />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="10" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  )
}
