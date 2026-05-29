# MaterialDistrict — Sessie 8 (Events) — integrale oplevering

Build-order stap 8. Volledige Events-feature: datalaag, listing, video-util en
detailpagina, gebouwd tegen Johan's REST-contract (plugin-commit `b64c8de`,
incl. venue-denormalisatie).

**Deze versie is gebouwd op de verse main van 29-05 (ná de story-type-counts-
fix).** De gedeelde api-bestanden zijn dus géén losse reconcile meer — de
event-wijzigingen zijn rechtstreeks op de actuele main-versies toegepast. Geen
`_RECONCILE/`-map: alles is drop-in.

## Installatie
Plaats de `src/`-bestanden uit dit pakket in de repo (overschrijft de
gewijzigde gedeelde bestanden, die al op de verse main zijn gebaseerd).
Daarna `tsc --noEmit` → groen.

## Bestanden

### Nieuw (events-eigen)
```
src/lib/config/event-types.ts                 6 types + helpers (labels-only)
src/lib/utils/video-embed.ts                  parser YouTube/Vimeo (+unlisted)
src/components/ui/VideoEmbed.tsx              responsive iframe-player + fallback
src/types/event.ts                            domain-types (Event, EventVenue, …)
src/app/events/page.tsx                       listing (server)
src/app/events/loading.tsx
src/app/events/_lib/events-order.ts           gedeelde sort (upcoming-first)
src/app/events/_components/EventsBrowser.tsx  client: channel/search-filter
src/app/events/_components/EventCard.tsx       card met datum-badge
src/app/events/[slug]/page.tsx                detail (server)
src/app/events/[slug]/loading.tsx
src/app/events/[slug]/_components/EventMediaViewer.tsx   gallery + video-viewer
src/app/events/[slug]/_components/EventPrevNext.tsx
```

### Gewijzigd (op verse main toegepast — drop-in)
```
src/lib/api/wordpress.ts     + WPEventVenueRaw/WPEventVideoRaw/WPEventMeta;
                               WPEventRawResponse.meta → WPEventMeta
src/lib/api/mappers.ts       + mapEventVenue/mapEventVideos; mapEvent/
                               mapEventListItem herschreven (wpRenderedHtml
                               hergebruikt, NIET opnieuw gedeclareerd)
src/lib/api/content.ts       + getEvent resolve't meta.gallery → Gallery
src/lib/api/index.ts         ongewijzigd t.o.v. main (meegeleverd voor een
                               intacte basis)
src/components/ui/index.ts   + export { VideoEmbed } from './VideoEmbed'
src/styles/globals.css       + sessie-8-sectie "Events overzicht + detail"
```

> Niet meegeleverd en niet aangeraakt: `types/talk.ts`, `facetwp.ts`,
> `woocommerce.ts` e.a. — die blijven zoals op main.

## Belangrijkste beslissingen
- **Venue als N:1-relatie**, gedenormaliseerd op `meta.venue` (zoals brand op
  material). `EventVenue { id, slug, name, street, postcode, city, country:{code,label} }`,
  `venue: null` bij online events.
- **Listing-ordering client-side.** WP kan niet `orderby` op `date_start`; de
  set is bescheiden → één ruime fetch, server-side sorteren (aankomend eerst,
  dan voorbij), channel/tekst client-side filteren. Gedeelde logica in
  `_lib/events-order.ts`.
- **CTA via één veld.** `is_md_event` → label "Register" vs "Visit website",
  beide naar `external_website`.
- **Video-util los & herbruikbaar.** YouTube + Vimeo (incl. unlisted).
- **Bewust niet in v1:** "What to expect"-highlights, "Reading for this event"
  (Books = sessie 9), themes (komt integraal over alle entiteiten).

## Verificatie
- Gebouwd op de verse main van 29-05; de v2-fixes blijven intact en onaangeraakt:
  `getStoryTypeCounts` (wordpress), `getArticleStoryTypeOptions` +
  `getArticleTotalCount` (content), `wpRenderedHtml` (mappers), talk-types
  (`WPTalkSpeakerRaw`) en de brand-country-facets-route.
- Geïsoleerde `tsc` op de datalaag → exit 0.
- `tsc` op alle 9 events-route-bestanden + `VideoEmbed`, met de echte datalaag
  meegetypecheckt → exit 0. (UI-componenten getypeerd gestubt op hun echte
  signatures; volledige app-graph-typecheck landt bij integratie.)
- Controleer na integratie: `/articles` blijft People 1 · rest 0 · All 3.211;
  `/brands` country-counts ongewijzigd; `/talks` ongewijzigd; `/events`
  overzicht + detail werken.

Zie `docs/` voor de session-log- en open-issues-aanvullingen.
