# MANIFEST — §S10.2 Homepage-feedbackronde (complete levering)

**Datum:** 16-06-2026 · **Base:** main `f8dc13a` (live; featured-boek + perf-fix er bovenop) · **Aard:** additief.

## Gewijzigde / nieuwe bestanden
| Bestand | Wijziging |
|---|---|
| `src/app/(home)/page.tsx` | categorie-snelmenu; offline-materialen uitgefilterd; content-type-badge uit op tegels; story-type als één-kleurige badge; talk-VM `insiderOnly`; brands + channels-index in de parallelle fetch; Featured brands-, Featured channel-blok + featured-boek-tegel (naast featured event) bedraad; placeholder-partners verwijderd. |
| `src/lib/api/books.ts` | `featured` op `WCStoreProduct` + beide mappers; `featured`-param op `listBooks`; nieuwe `listFeaturedBooks()`-helper (`featured=true`). Additief op Johans 188a543. |
| `src/types/book.ts` | `featured` op `BookListItem`/`Book` + `featured`-param op `BooksListParams`. Additief. |
| `src/app/(home)/_components/MaterialCategoryStrip.tsx` | `count` + aantal-badge per pill. |
| `src/app/(home)/_components/FeaturedArticleHero.tsx` | herbouwd op `<ContentCard>` (grote standaard-tegel). |
| `src/app/(home)/_components/FeaturedTalkBand.tsx` | actie-rij + Insider-pill bij `insiderOnly`. |
| `src/app/(home)/_components/FeaturedPartners.tsx` | herschreven: lichter tegel-uiterlijk (ContentCard) in een horizontale carrousel. |
| `src/app/(home)/_components/FeaturedChannel.tsx` | **nieuw** — "In the spotlight": uitgelicht kanaal (header-beeld + omschrijving) + materiaal-rij. |
| `src/components/ui/ContentCard.tsx` | story-type-badge één kleur; sterke `.card-insider-pill` i.p.v. `InsiderMark`; channel als detail-stijl body-pill met `currentChannel`-onderdrukking + max 1 "+N". |
| `src/components/layout/Header.tsx` + `HeaderShell.tsx` | "Channels" in de nav (`/channel`) + actieve-sectie-mapping. |
| `src/app/channel/[slug]/page.tsx` | hub-strips: content-type-badge uit (kop noemt het type al) + huidig kanaal onderdrukt op stories/events. |
| `src/styles/globals.css` | §-blokken: categorie-count, onder-witruimte, Insider-pill, channel-bodypill, partner-carrousel, channel-spotlight; font-schaal ~10% groter (13 rem-tokens + 449 px-waarden). |

## Smoke-test op de deploy
- **Homepage:** categorie-pillen met aantallen → filtert; géén offline materialen; géén "Material/Article"-type-badge op de tegels; story-type één kleur; Insider-pill duidelijk (ook op de talk-band); featured article = grote tegel; **Featured brands**-carrousel (Partner-tier eerst); **In the spotlight**-kanaalblok met beeld + omschrijving + materiaalrij; **featured boek** als tegel naast de featured event (native WC featured-vlag); "Channels" in de nav; ruimere bodem; alles iets groter.
- **Channel-hub:** geen type-badge op de strips; het eigen kanaal niet als pill op de eigen tegels; channel-pill in detail-stijl onder de titel.
- **Let op (deploy-checks):** font-vergroting op krappe plekken (knoppen/tabellen); half-cent-afronding op prijzen eindigend op `.95`/`.99`.

## Bewust niet meegeleverd
- **Duurzaamheids-/channel-pills OP materiaaltegels** — vereist theme-ID→label-resolve in de datalaag (losse follow-up); duurzaamheid is nu zichtbaar via `MaterialCard` op `/material`.
- **Insider-material-gate (H11)** — geparkeerd; wacht op WP-veld `insider_only` op materials.

## Reconciliatie met Johans tussentijdse commits (61e6f75 → 188a543)
Johan deed 5 commits (books/VAT-pricing, SEO-plan, robots/preview-indexing, canonical + JSON-LD trailing-slash). Twee bestanden uit deze levering raakten die wijzigingen: `src/app/(home)/page.tsx` en `src/app/channel/[slug]/page.tsx`. Beide zijn via een 3-way merge op Johans versie gerebased — zijn `canonicalPath`/canonical-aanpassingen blijven intact, mijn tegel-/blok-werk staat eroverheen, 0 conflicten. De overige 9 bestanden (incl. `globals.css`) heeft Johan niet aangeraakt, dus die gaan ongewijzigd mee — de volledige `globals.css` verliest niets van hem.

## Update na deploy f8dc13a
De live ronde (f8dc13a) was de 14-bestandsversie **zonder** featured boek. Deze zip voegt toe: featured boek (`books.ts`+`book.ts` additief + featured-boek-tegel naast de featured event in `page.tsx`). Plus een **perf-fix**: het featured-channel-blok haalt nu alleen de kanaal-materialen op (`listMaterialsWithFacets` met theme-selectie) i.p.v. de volledige `getChannelHub` — dit adresseert de static-generation-timeout (>60s) die Johan bij de eerste build zag. Toepassen bovenop f8dc13a; echte delta = `page.tsx`, `books.ts`, `book.ts`. Overige bestanden identiek aan live → veilig re-applyen.

## Feedbackronde-2 (op live homepage)
Verwerkt: categorie-pillen (channelbar-maat, 1 rij, beige); featured-article grote kop; sectiekoppen niet-vet + 'All'-links niet-hoofdletters (hub-stijl); channel-bodypill mét detail-icoon; **Insider = ster-icoon vóór de titel + hover-tooltip** (geen tekst-pill, site-breed incl. talk-band, Watch-knop links); spotlight met hogere hero + vierkante thumbnail-rij + hover-tooltip; featured brands **logo-only** grid (6); materiaalcode van het overzicht af (`MaterialCard`, blijft op detail).

Extra bestand t.o.v. vorige set: `src/components/ui/MaterialCard.tsx` (materiaalcode eraf; Johan raakte 'm niet aan sinds 61e6f75 → veilig). 

**Johan-actie:** material-REST moet `meta.publication.isOnline` blootleggen, anders blijft offline-materiaal zichtbaar (frontend-filter staat klaar).
