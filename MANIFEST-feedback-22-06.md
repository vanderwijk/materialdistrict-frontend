# MANIFEST — live-feedbackronde 22-06-2026 (9 punten)

Negen punten uit Jeroens live-review van de gedeployde site, in één set.
Complete bestanden (geen patches), gebouwd op de actuele main, syntax-
gevalideerd (esbuild). `globals.css` is append-only: alle nieuwe regels staan in
vier nieuwe blokken aan het einde (`§FEEDBACK-22-06`, `-B`, `-C`, `-D`); eerdere
blokken zijn ongemoeid. De `mappers.ts`-crashfix is niet geraakt.

## De negen punten

1. **Channel-bar-label uitgelijnd** — het "CHANNEL"-label stond te hoog t.o.v. de tabs; nu verticaal gecentreerd (alleen homepage, `.is-nav`).
2. **Compare-knop op material-tegels** — de homepage rendert material-tegels via `ContentCard` (alleen bookmark); nu staat de Compare-knop ernaast, met de homepage in een `CompareProvider` + `CompareBar`.
3. **"Get tickets" ín de event-tegel** — nieuwe `home`-variant van de EventCard: beeld + tekst linken naar het event, "Get tickets" is een aparte knop binnen dezelfde tegel (geen geneste links), net als "View book".
4. **F5 — "Follow the Transition" als knop** — de footer toont één knop die een full-width paneel laat openschuiven met het volledige volgblok erin (chips, frequentie, Start following). Escape / klik-buiten / kruisje sluiten.
5. **Volgblok als echte card + "+12"-bolletje** — de card kreeg `background: var(--bg)` (= paginakleur) en viel weg; nu `--surface2`. De blauwe "Show all"-tekstlink is vervangen door een "+N"-bolletje in chip-stijl dat de rest open-/dichtklapt.
6. **Volgblok consistent op álle detailpagina's** — de detailpagina's riepen het blok zónder channels aan en leunden op een client-fetch die leeg terugkwam (kale, chip-loze versie). Nu krijgt het blok overal de channels server-side mee (nieuwe `getDigestChannels`-helper), net als de footer.
7. **"Add to board" + "Compare" in Insider-kleur** — stonden grijs / voor leden standaard gevuld. Nu: ongeacht inlog/lidstatus standaard Insider-outline + Insider-tekst, en gevuld + wit alleen wanneer actief.
8. **Renewable-pil: kringloop-icoon** — het vinkje op de sustainability-pill is vervangen door een cirkel-met-twee-pijltjes (icoon A). Andere vinkjes (feature-lijsten) blijven.
9. **Channeloverzicht → follow-hub** — het vlakke grid wordt een hub: featured-hero, sorteren (Most materials / A–Z), "Channels you follow" voor ingelogde gebruikers, en rijke kaarten met een follow-toggle per kaart. **Dynamische data later via Johan** (zie onder).

## Gewijzigde / nieuwe bestanden

**Nieuw**
- `src/components/ui/CardCompareButton.tsx` (P2)
- `src/app/(home)/layout.tsx` (P2 — CompareProvider + CompareBar)
- `src/components/layout/FollowTransitionPanel.tsx` (P4)
- `src/lib/api/digest-channels.ts` (P6)
- `src/app/channel/_components/ChannelsHub.tsx` (P9)

**Gewijzigd**
- `src/styles/globals.css` — §FEEDBACK-22-06 (P1,3,4), -B (P5), -C (P7), -D (P9)
- `src/components/ui/index.ts` (P2)
- `src/app/(home)/page.tsx` (P2,3)
- `src/app/event/_components/EventCard.tsx` (P3)
- `src/components/layout/Footer.tsx` (P4)
- `src/components/layout/FollowDigestBlock.tsx` (P5)
- `src/app/material/[slug]/page.tsx` (P6,8)
- `src/app/brand/[slug]/page.tsx` (P6)
- `src/app/event/[slug]/page.tsx` (P6)
- `src/app/article/[slug]/page.tsx` (P6)
- `src/app/article/[slug]/_components/ArticleDetailSidebar.tsx` (P6)
- `src/app/talk/[slug]/page.tsx` (P6)
- `src/app/talk/[slug]/_components/TalkDetailSidebar.tsx` (P6)
- `src/app/channel/page.tsx` (P9)

## Voor de session-log (toe te voegen aan de live `session-log.md`)

> **Sessie — live-feedbackronde (22-06-2026).** Negen punten uit Jeroens review
> van de gedeployde site, in één set: (1) channel-bar-label uitgelijnd; (2)
> Compare-knop op homepage-material-tegels (+ `(home)`-CompareProvider/Bar,
> nieuw `CardCompareButton`); (3) "Get tickets" ín de event-tegel (EventCard
> `home`-variant); (4) **F5** — footer-knop + full-width slide-up paneel
> (`FollowTransitionPanel`); (5) volgblok-card-achtergrond (`--surface2`) +
> "+N"-bolletje i.p.v. blauwe link; (6) volgblok consistent op álle
> detailpagina's via server-side channels (`getDigestChannels`); (7) Add to
> board + Compare in Insider-kleur (outline standaard, gevuld+wit actief); (8)
> renewable-pil kringloop-icoon i.p.v. vinkje; (9) channeloverzicht → follow-hub
> (`ChannelsHub`: hero + sort + you-follow + rijke kaarten met follow-toggle).
> `globals.css` append-only (§FEEDBACK-22-06 / -B / -C / -D); mappers-fix
> ongemoeid.

## Voor Johan — backend (P9 follow-hub, vervolg)
De visuele hub staat. Wat nog backend-data vraagt en later volgt:
- gemengde content-thumbnails per channel (nieuwste materials/stories/talks/…),
- "new this week"-tellingen/badges,
- sortering "Most active" / "Recently updated" (nu: Most materials + A–Z).
Los content-werk: de lege channel-coverafbeeldingen (Recycling, Acoustic, Biodegradable) — launch-taak 1.

## Shared-file-noot
`globals.css` is het enige gedeelde bestand; de enige wijziging zijn de vier nieuwe blokken aan het einde — `comm -13` (main minus dit) moet leeg zijn.
