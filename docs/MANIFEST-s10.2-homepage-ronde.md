# MANIFEST — §S10.2 Homepage-feedbackronde (complete levering)

**Datum:** 16-06-2026 · **Base:** main `188a543` (gerebased op Johans laatste; routes enkelvoud) · **Aard:** additief.

## Gewijzigde / nieuwe bestanden
| Bestand | Wijziging |
|---|---|
| `src/app/(home)/page.tsx` | categorie-snelmenu; offline-materialen uitgefilterd; content-type-badge uit op tegels; story-type als één-kleurige badge; talk-VM `insiderOnly`; brands + channels-index in de parallelle fetch; Featured brands- en Featured channel-blok bedraad; placeholder-partners verwijderd. |
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
- **Homepage:** categorie-pillen met aantallen → filtert; géén offline materialen; géén "Material/Article"-type-badge op de tegels; story-type één kleur; Insider-pill duidelijk (ook op de talk-band); featured article = grote tegel; **Featured brands**-carrousel (Partner-tier eerst); **In the spotlight**-kanaalblok met beeld + omschrijving + materiaalrij; "Channels" in de nav; ruimere bodem; alles iets groter.
- **Channel-hub:** geen type-badge op de strips; het eigen kanaal niet als pill op de eigen tegels; channel-pill in detail-stijl onder de titel.
- **Let op (deploy-checks):** font-vergroting op krappe plekken (knoppen/tabellen); half-cent-afronding op prijzen eindigend op `.95`/`.99`.

## Bewust niet meegeleverd
- **Featured boek** — valt onder de geparkeerde bookshop-scope; pas bouwen op expliciet verzoek.
- **Duurzaamheids-/channel-pills OP materiaaltegels** — vereist theme-ID→label-resolve in de datalaag (losse follow-up); duurzaamheid is nu zichtbaar via `MaterialCard` op `/material`.
- **Insider-material-gate (H11)** — geparkeerd; wacht op WP-veld `insider_only` op materials.

## Reconciliatie met Johans tussentijdse commits (61e6f75 → 188a543)
Johan deed 5 commits (books/VAT-pricing, SEO-plan, robots/preview-indexing, canonical + JSON-LD trailing-slash). Twee bestanden uit deze levering raakten die wijzigingen: `src/app/(home)/page.tsx` en `src/app/channel/[slug]/page.tsx`. Beide zijn via een 3-way merge op Johans versie gerebased — zijn `canonicalPath`/canonical-aanpassingen blijven intact, mijn tegel-/blok-werk staat eroverheen, 0 conflicten. De overige 9 bestanden (incl. `globals.css`) heeft Johan niet aangeraakt, dus die gaan ongewijzigd mee — de volledige `globals.css` verliest niets van hem.
