# Open issues — patch Sessie 12 (Channels) — 04-06-2026

> Append-only patch voor `open-issues.md`. Build-order Stap 12.

## Dicht (afgehandeld in stap 12)
- **Channels-hubs — beslissing → gebouwd.** De `/channels`-index en de
  `/channels/[slug]`-hubs zijn opgeleverd (datalaag + pagina's + SEO). De
  hub-richting uit de patch van 04-06 is hiermee geïmplementeerd. WF-3
  (channels-exposure `meta.channels` = theme) was de voorwaarde en is live.

## Open — WP/Johan
- **C-CH.1 (🟡)** — **Term-niveau "Featured"-vlag (WF-6) niet in REST.** De
  `/channels`-index sorteert featured-vooraan en toont een "Featured"-eyebrow,
  maar de featured-checkbox op de `theme`-term staat (nog) niet in de
  `/wp/v2/theme`-respons. `getChannelsIndex` parseert defensief op
  `theme_featured` / `featured` / `is_featured` en valt anders terug op
  telling-sortering (geen lege sectie). Zodra Johan de vlag exposed (welke
  meta-key?) werkt featured-vooraan automatisch. Mail verstuurd:
  `email-johan-channels-featured-flag.txt`. Niet blokkerend voor v1.

## Verify (op eerste echte data)
- **`theme_thumbnail`-vorm** — code accepteert zowel directe URL als
  attachment-id (batch-resolved). Bevestigen welke vorm de REST levert.
- **`?theme=<term_id>` op article + event** — staat als "bevestigd" in het
  channel-contract; nu de hub het echt gebruikt even verifiëren dat beide
  collecties server-side filteren (anders valt de strip terug op de laatste
  items zonder channel-filter).

## Follow-ups (niet-blokkerend)
- **C-CH.2 (🟢)** — **Books-strip** toevoegen aan de hub (tussen Events en
  Talks) zodra het book-CPT + `theme` op books live is. Datalaag-aggregator
  `getChannelHub` krijgt dan een `books`-slice; de pagina een extra
  `ChannelStrip`.
- **C-CH.3 (🟢)** — **Events-strip-ordening.** De hub haalt 8 events op
  post-datum (desc) en toont ze; perfecte upcoming-eerst-ordening leeft op de
  "View all events"-deeplink (`/events?channel=…`). Voor de strip volstaat dit;
  later eventueel `sortEventsByDate` over een ruimere fetch.
- **Bar→hub-bruggetje** — bewust niet in v1 (keuze 3). Klein later toe te voegen
  in `ChannelBarNav` ("Explore the {channel} channel →") bij een actief channel.

## Open — channel-herstructurering fase 1 (24-07-2026) 🔴 SEO
Fase 1 (termen) is op CMS toegepast via `md-channels-phase1-apply.php`: merges,
renames, nieuwe lege channels, descriptions. Content ophangen = fase 2 — **nog
niet gedaan**. Tot die tijd is de site in een SEO-kwetsbaar tussenstadium.

Nog te doen:
- **C-CH.4 (🔴)** — **Fase 2: content ophangen** aan de nieuwe lege channels
  (`timber`, `net-zero-carbon`, `energy-resilience`, `regenerative`). Die staan
  nu op `/channel` met 0 materials; hub-detail geeft terecht `notFound()`, maar
  de index adverteert ze wél (inclusief CollectionPage ItemList).
- **C-CH.5 (🔴)** — **301-redirects** van alle retired theme/channel-slugs naar
  de nieuwe canonieke slugs (o.a. `ecology`, `biodegradable`, `recycling` →
  `circular`; `biobased` → `bio-based-living-materials`; `sense-sensibility` →
  `biophilic-human-centred`; `smart-materials` → `smart-responsive`;
  `manufacture` / `technology-transfer` / `process` → `new-making`;
  `innovation` / `trend` / `concept` / `curious` → `material-futures`;
  `healing-environment` → `biophilic-human-centred`; `high-tech` →
  `smart-responsive`). Zonder permanente redirects verliest inbound equity.
- **C-CH.6 (🟡)** — **Lege channels verbergen** op de publieke `/channel`-index
  (en uit de JSON-LD ItemList) tot ze content hebben — of pas publiceren ná
  fase 2. Voorkomt thin/404-doelen vanuit de index.

Zie live: https://materialdistrict-frontend.vercel.app/channel/

## Wijzigingen — append onderaan de lijst
- **v1.x (04-06-2026, Sessie 12)** — Channel-hubs gebouwd (`/channels` +
  `/channels/[slug]`). Hub-beslissing afgesloten. Nieuw: C-CH.1 (featured-vlag-
  exposure, Johan), C-CH.2 (books-strip later), C-CH.3 (events-ordening). Verify-
  punten: `theme_thumbnail`-vorm + `?theme` op article/event.
- **v1.y (24-07-2026)** — Na CMS fase-1 channel-herstructurering: C-CH.4
  (content ophangen), C-CH.5 (301s retired slugs), C-CH.6 (lege channels
  verbergen tot fase 2) als open SEO-follow-ups genoteerd.
