/**
 * GridAdRow — leaderboard als volle-breedte-rij binnen een overzichtsraster.
 *
 * §BETA-FIX-24-08 (L1). De banner staat onder de eerste rij tegels op elk
 * overzicht (materials, stories, events, brands, books, talks).
 *
 * Waarom een aparte component en geen losse <AdSlot/> per pagina:
 *
 *  1. Plaatsing. De rasters tellen 3 kolommen op desktop, 2 op tablet en 1 op
 *     telefoon. Een banner die in de DOM na de derde tegel staat, zou op tablet
 *     midden in de tweede rij belanden en een gat achterlaten. De CSS pint deze
 *     rij daarom expliciet op rij 2 (`grid-row: 2`, volle kolombreedte); de
 *     tegels vullen automatisch eerst rij 1 met zoveel items als er passen en
 *     lopen daarna ónder de banner door. Dat klopt bij elke kolombreedte.
 *
 *  2. Leesvolgorde. Hij wordt na de eerste paar tegels in de DOM gezet, zodat
 *     een schermlezer 'm ook ná de eerste tegels tegenkomt en niet vooraan.
 *
 * Een onverkochte positie verdwijnt volledig (zie `data-ad-filled` in AdSlot),
 * dus er blijft nooit een lege rij in het raster staan.
 *
 * `theme` geeft het actieve channel mee als GAM-targeting, zodat inventaris
 * later per channel verkocht kan worden zonder frontend-wijziging.
 */

import { AdSlot } from './AdSlot'

/** Na hoeveel tegels de banner in de DOM wordt gezet (leesvolgorde). */
export const GRID_AD_AFTER = 3

export function GridAdRow({ theme }: { theme?: string }) {
  return (
    <div className="ad-holder ad-holder--grid">
      <AdSlot name="leaderboard" theme={theme} />
    </div>
  )
}
