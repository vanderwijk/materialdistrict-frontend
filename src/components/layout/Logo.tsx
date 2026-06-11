import type { SVGProps } from 'react'

/**
 * Logo — het officiële MaterialDistrict-logo als inline SVG.
 *
 * Inline (geen <img>) zodat de globals.css de onderdelen kan stylen:
 *  - `.wordmark`  → de donkere lettertekst. Wordt op smalle viewports
 *    verborgen (alleen de mark blijft staan) en in dark mode wit gekleurd.
 *  - de mark zelf (groen) blijft in elk thema behouden.
 *
 * De fill van het woordmerk staat op de <g class="wordmark"> zodat álle
 * onderdelen (path, rect én polygon) meekleuren — de letters bestaan uit
 * gemengde shape-types, dus een fill per element zou de dark-mode-omkleur
 * laten missen.
 *
 * Bron: MaterialDistrict_logo_Horizontaal.svg (Illustrator-export),
 * opgeschoond naar twee logische groepen (wordmark + mark) met expliciete
 * fills i.p.v. een <style>-block met classes.
 */
export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 281.8 73.7"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* Woordmerk — donkere lettertekst. Fill op de groep zodat alle
          shape-types meekleuren (dark mode → wit via globals.css). */}
      <g className="wordmark" fill="#1d1d1b">
        <rect x="275.6" y="67.2" width="6.2" height="6.2" />
        <polygon points="251 44.6 251 51 257.3 51 257.3 67.2 263.8 67.2 263.8 51 270 51 270 44.6 251 44.6" />
        <path d="M99.4,67.5c4.8,0,8.1-3.9,8.1-8.5s-3.3-8.5-8.1-8.5h-3.6v17h3.6ZM89.3,44.6h10.1c8.1,0,14.6,6.4,14.6,14.4s-6.5,14.4-14.6,14.4h-10.1v-28.8Z" />
        <rect x="120" y="44.6" width="6.5" height="28.8" />
        <path d="M131.9,68.1l4.9-4c1.3,2,3.3,3.6,5.3,3.6s2.8-.7,2.8-2.1-.9-2.1-3.4-3.2l-1.6-.7c-4.3-1.9-6.7-5.2-6.7-9s4.2-8.3,8.8-8.3,5.6.8,8.1,3.6l-4.4,4.6c-1.5-1.8-2.4-2.2-3.7-2.2s-2.2.7-2.2,2,1.3,2.3,3.9,3.5l1.5.7c4,1.8,6.3,4.7,6.3,8.6s-3.8,8.6-9.2,8.6-8.4-1.9-10.3-5.6" />
        <path d="M191.1,56.3c1.7,0,3-1.3,3-2.8s-1.3-2.9-3-2.9h-3.6v5.7h3.6ZM187.5,61.7h0v11.7h-6.5v-28.8h10.9c4.7,0,8.6,3.9,8.6,8.6s-2.2,6.7-5.6,8l9.4,12.2h-7.7l-8.9-11.7Z" />
        <rect x="208.3" y="44.6" width="6.5" height="28.8" />
        <path d="M220.2,59c0-8.1,6.6-14.7,14.7-14.7s9.4,2.5,12,6.2l-4.9,4c-1.5-2.4-4.1-4-7.1-4-4.7,0-8.2,3.9-8.2,8.5s3.5,8.5,8.2,8.5,5.7-1.7,7.1-4l4.9,4c-2.7,3.8-7.1,6.2-12,6.2-8.1,0-14.7-6.6-14.7-14.7" />
        <polygon points="89.3 0 103.6 14.4 118 0 118 29.1 111.5 29.1 111.5 15 103.6 22.9 95.8 15 95.8 29.1 89.3 29.1 89.3 0" />
        <path d="M208,12c1.7,0,3-1.3,3-2.8s-1.3-2.9-3-2.9h-3.6v5.7h3.6ZM204.5,17.4h0v11.7h-6.5V.3h10.9c4.7,0,8.6,3.9,8.6,8.6s-2.2,6.7-5.6,8l9.4,12.2h-7.7l-8.9-11.7Z" />
        <rect x="225.3" y=".3" width="6.5" height="28.8" />
        <polygon points="281.8 22.7 275.3 22.7 275.3 .3 268.8 .3 268.8 29.1 281.8 29.1 281.8 22.7" />
        <polygon points="180.2 17.8 186.4 17.8 186.4 11.6 180.2 11.6 180.2 6.7 191.5 6.7 191.5 .3 173.7 .3 173.7 29.1 191.5 29.1 191.5 22.7 180.2 22.7 180.2 17.8" />
        <path d="M132.2,19.7l3.2-7,3.2,7h-6.3ZM135.3,0l-14.2,29.1h6.8l2.1-4.5h10.6l2.1,4.5h6.8L135.3,0Z" />
        <path d="M247.1,19.7l3.2-7,3.2,7h-6.3ZM250.3,0l-14.2,29.1h6.8l2.1-4.5h10.6l2.1,4.5h6.8L250.3,0Z" />
        <polygon points="155.8 44.6 155.8 51 162 51 162 73.4 168.5 73.4 168.5 51 174.7 51 174.7 44.6 155.8 44.6" />
        <polygon points="148.5 .3 148.5 6.7 154.8 6.7 154.8 29.1 161.3 29.1 161.3 6.7 167.5 6.7 167.5 .3 148.5 .3" />
      </g>

      {/* Beeldmerk — groene mark. Blijft in elk thema behouden. */}
      <g fill="#90be22">
        <polygon points="16.1 36.9 26.5 26.6 16.1 16.2 0 16.2 0 57.6 16.1 57.6 16.1 36.9" />
        <polygon points="36.8 36.9 47.2 47.3 57.5 36.9 57.5 36.9 57.5 57.6 73.6 73.7 73.6 .1 36.8 36.9 36.8 36.9" />
      </g>
      <g fill="#5faf30">
        <rect x="24.3" y="27.5" width="14.6" height="29.3" transform="translate(-20.5 34.7) rotate(-45)" />
        <polygon points="0 .1 0 .1 0 16.2 16.1 16.2 0 .1" />
        <polygon points="57.5 73.7 73.6 73.7 73.6 73.7 57.5 57.6 57.5 73.7" />
        <polygon points="0 57.6 0 73.7 0 73.7 0 73.7 16.1 73.7 16.1 57.6 0 57.6" />
      </g>
      <g fill="#c1d682">
        <polygon points="47.2 47.3 36.8 57.6 16.1 57.6 16.1 73.7 57.5 73.7 57.5 57.6 47.2 47.3" />
        <polygon points="36.8 16.2 36.8 16.2 26.5 26.6 36.8 36.9 36.8 36.9 73.6 .1 0 .1 16.1 16.2 36.8 16.2" />
      </g>
    </svg>
  )
}
