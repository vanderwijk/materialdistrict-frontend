# MANIFEST — Homepage F2 (wit op canvas)

Datum: 10-06-2026
Batch: F2 — homepage-restyle (productie), na goedgekeurde standalone preview.

## Wat dit is
De homepage is herstijld naar het "wit op canvas"-systeem, conform de met
Jeroen afgestemde preview. Johan vervangt de bestanden en deployt. Eén aandachtspunt voor de backend: zie
"Talk-featured" onderaan (REST-expositie van meta.featured).

## Te vervangen bestanden
1. `src/styles/globals.css`
2. `src/app/(home)/page.tsx`
3. `src/app/(home)/_components/PromoHero.tsx`
4. `src/types/talk.ts`
5. `src/lib/api/wordpress.ts`
6. `src/lib/api/mappers.ts`

## Nieuw bestand
7. `src/app/(home)/_components/FeaturedTalkBand.tsx`

## Wijzigingen

### globals.css — additief blok `§HOME-F2`
- Puur toegevoegd aan het einde; de eerste 12.093 regels zijn byte-identiek
  aan de aangeleverde main (geverifieerd met `diff` op de kop → leeg).
- Overschrijft de homepage-stijlen (SESSIE-10) via cascade-volgorde naar het
  preview-ontwerp en voegt nieuwe onderdelen toe (split-hero, featured-talk-
  band, ad-containers).
- Preview-only tokennamen zijn gemapt op de echte design-tokens:
  `--material*`→`--ct-material*`, teal→`--ct-insider`,
  `--radius-card`→`--radius-lg`, `--shadow-card`→`--shadow`, `--maxw`→`1280px`.
  Alle gebruikte tokens bestaan in de main (geverifieerd).
- Gutters op 32px (site-breed, gelijk aan header/footer).
- ContentCard en EventCard houden hun eigen F2.3-styling — niet aangeraakt.

### page.tsx
- Split-hero via herstijlde `PromoHero` (zie hieronder).
- Nieuwe **Featured-talk-band** (`FeaturedTalkBand`) tussen "Latest stories" en
  "Featured materials". Selectie is **featured-eerst**:
  `talkRes.items.find((t) => t.featured) ?? talkRes.items[0]` — valt terug op de
  nieuwste talk als er niets featured is. `listTalks` toegevoegd aan de
  bestaande `Promise.all`.
- **Books eruit**: het "Events + Books"-blok is vervangen door een Events-blok
  met twee aankomende events naast elkaar (featured eerst). Geen `/books`-link,
  geen books-placeholder. Books-sidebarwidget eveneens niet toegevoegd.
- **Ad-containers (GAM)**: billboard (970×250, boven de hero), leaderboard
  (728×90, tussen Latest materials en Latest stories) en sidebar (300×250, onder
  Top stories) zijn in de markup aanwezig maar staan achter de vlag
  `ADS_ENABLED = false`, zodat er geen lege vakken op de live homepage staan.
  Eén vlag-flip + GPT-script + ad-unit-ids zet ze aan.

### PromoHero.tsx
- Herschreven naar de split-hero: één bordered blok (`.hp-hero-block`),
  50/50-verdeling. Links wit (discover-pitch), rechts ink (manufacturer-pitch),
  gelijke typografie aan beide kanten.
- Koppen: links "Where ideas meet materials.", rechts "Where materials meet
  specifiers." (keten ideas → materials → specifiers).
- Knoppen links: "Create free account" primair (ink), "Browse materials"
  secundair (outline). Rechts: "List your materials →" (wit-op-ink).
- Dismiss (×) rechtsboven op het blok; logica ongewijzigd via HomeHeroProvider.

### FeaturedTalkBand.tsx (nieuw)
- Server-component. Hele band is één `<Link>` naar de talk; de "Watch talk"-
  knop is een `<span>` (geen geneste anchor).
- Toont eyebrow "Featured talk", titel, meta (spreker · duur) en speelknop over
  een beeld-band met gradient. Rendert niets als er geen talk is.

## Niet aangeraakt
- `TopStoriesWidget.tsx` en `InsiderCtaBlock.tsx`: markup ongewijzigd; de nieuwe
  look (underline-toggle, rechts uitgelijnde footer, teal Insider-CTA met witte
  knop) komt volledig uit het `§HOME-F2`-CSS-blok.
- `FeaturedArticleHero` (ingelogd/weggeklikt) blijft functioneel zoals het was.

## Validatie
- globals.css: kop byte-identiek aan de main (additief geverifieerd).
- PromoHero.tsx, FeaturedTalkBand.tsx, page.tsx: esbuild syntax-check → OK.

## Talk-featured (inbegrepen)
Het `featured`-oormerk van de talk-CPT (checkbox in de admin) is nu in de
frontend-datalaag gezet, puur additief:
- `src/types/talk.ts` — `featured: boolean` op `TalkListItem` én `Talk`.
- `src/lib/api/wordpress.ts` — `WPTalkMetaRaw.featured` + `_featured`
  (`boolean | string | null`).
- `src/lib/api/mappers.ts` — beide talk-mappers zetten
  `featured: truthyFlag(m.featured, m._featured)` (zelfde patroon als
  materials/events).
- `src/app/(home)/page.tsx` — selectie featured-eerst.

Diff t.o.v. de aangeleverde main: uitsluitend toevoegingen (geverifieerd met
`diff`). `wpRenderedHtml` in `mappers.ts` ongewijzigd intact.

**Backend-check (Johan):** de admin-checkbox slaat de meta op, maar de band
leest `meta.featured` uit de REST. Bevestig dat `meta.featured` ook in de
REST-output van de talk-CPT staat (zoals bij materials/events). Zo niet, dan is
`meta.featured` afwezig → `truthyFlag` geeft `false` → de band valt netjes terug
op de nieuwste talk (geen breuk).
