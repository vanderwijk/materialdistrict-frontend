# MANIFEST — F2 catalog-styling, batch 1 + 2 + 3 (gecombineerd)

**Zip:** `md-f2-chrome-batch1-2-3-2026-06-09.zip`
**Datum:** 09-06-2026
**Eén deploy** — alle drie de batches samen, zodat de testserver in één keer de volledige F2-look toont.

Alle bestanden zijn **complete bestanden** in moedermap-structuur (pad = positie in de repo). `session-log.md` en `design-tokens.md` staan in de root.

## Toevoegen / overschrijven

| Bestand | Batch | Wat |
|---|---|---|
| `session-log.md` | — | Volledige bijgewerkte log (root), t/m F2.3 |
| `design-tokens.md` | — | Bijgewerkt (root), F2.1–F2.3 |
| `src/styles/globals.css` | 1+2+3 | Additieve blokken §F2.1, §F2.2, §F2.3 (+ `--ink`/`--on-ink` tokens) |
| `src/components/layout/Header.tsx` | 1 | Nav normale schrijfwijze + zwart-actief, icoon-sign-out, icoon-knoppen |
| `src/components/ui/FilterSidebar.tsx` | 2 | Filters op paper, "Filters: N" + ronde save/prullenbak, zwarte selectie |
| `src/components/ui/ContentCard.tsx` | 3 | Props `featured` (navy pill), `showTypeBadge`, `sustainabilityBadges` |
| `src/components/ui/MaterialCard.tsx` | 3 | Geeft featured + duurzaamheids-badges door (uit `getActiveSustainabilityFacets`) |
| `src/components/ui/ChannelBar.tsx` | 3 | Rendert de `ViewToggle` rechts in de bar |
| `src/components/ui/ViewToggle.tsx` | 3 | **NIEUW** — kolomkeuze 2/3/4, werkt op alle overzichten |
| `src/app/materials/page.tsx` | 2 | Compacte top (telling in zoekbox), channelbar |
| `src/app/brands/page.tsx` | 2 | Compacte top, channelbar |
| `src/app/events/page.tsx` | 2 | Compacte top (telling i.p.v. tagline), channelbar |
| `src/app/talks/page.tsx` | 2+3 | Compacte top + `showTypeBadge={false}` op de cards |
| `src/app/articles/page.tsx` | 2+3 | Standaard-shell + channelbar + `showTypeBadge={false}` op de cards |

## Verwijderen
Geen.

## Aandachtspunt — data (Johan)
De **environmental-property-velden** in WP zijn grotendeels nog leeg (alleen `renewable` bestond). De duurzaamheids-badges op de material-cards renderen pas volledig zodra die velden gevuld zijn. Frontend is klaar — het licht vanzelf op.

## Verifiëren na deploy
- Header: nav in normale schrijfwijze, actief item zwart + onderstreept, icoon-sign-out.
- Channelbar/filter/footer op paper-look; "Filters: N" met ronde save (teal) + prullenbak.
- Compacte bovenkant (geen grote titel; telling in de zoekbox).
- Cards: kleiner titel-font, FEATURED-pill (navy) op featured materials, duurzaamheids-badges (wit/groen) waar data bestaat, geen groene "MATERIAL"-badge meer.
- View-toggle rechts in de channelbar schakelt 2/3/4 koloms op **materials, stories, brands, events, talks**.
