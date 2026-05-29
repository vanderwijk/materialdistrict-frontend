# Session-log — patch sessie 10 (Homepage) — revisie 2

> Append-only entry voor `session-log.md`. Build-order stap 10 = Sessie 10.
> Revisie 2: Johan-instructie (route-group + CSS-comment) verwerkt en twee
> homepage-uitbreidingen toegevoegd.

## Sessie 10 — Homepage (29-05-2026) ✅ (rev 2)

### Aangemaakte / gewijzigde bestanden

> De homepage staat nu in route-group `src/app/(home)/` (URL blijft `/`).

- `src/app/(home)/page.tsx` — **vervangt** de vorige (root-)homepage.
  Server-component: `Promise.all` (materials/articles/events), featured-
  resolutie met terugval, `generateMetadata`, WebSite+Organization JSON-LD,
  verborgen canonieke `<h1>`, hero-bovenkant via provider, statische quotes +
  partners, sidebar met Top stories + manufacturer-promo, books-placeholder.
- `src/app/(home)/loading.tsx` — loading-skeleton (verplaatst naar `(home)`).
- `src/app/(home)/_components/HomeHeroProvider.tsx` — **nieuw**. Gedeelde
  client-state `showPromo`; promo en article-hero zijn elkaars tegenpool.
- `src/app/(home)/_components/PromoHero.tsx` — **nieuw** (verving HomeHero).
  Gast-promoband; zichtbaarheid + dismiss via de provider.
- `src/app/(home)/_components/FeaturedArticleHero.tsx` — **nieuw**. Groot
  "Featured article"-blok bovenaan de contentkolom; toont wanneer de promo
  weg is (uitgelogd-weggeklikt of ingelogd). Titel hergebruikt
  `.ed-featured-title`.
- `src/app/(home)/_components/TopStoriesWidget.tsx` — verplaatst (ongewijzigd).
- `src/app/(home)/_components/InsiderCtaBlock.tsx` — verplaatst (ongewijzigd).
- **Verwijderen:** `_components/HomeHero.tsx` (vervangen door PromoHero +
  HomeHeroProvider + FeaturedArticleHero).
- `src/styles/globals.css` — **gewijzigd**. (1) Sessie-10-comment herschreven
  zonder `*/` (build-fix). (2) Nieuwe regels toegevoegd: `.hp-hero-article*`
  (featured-article-hero) en de `.sidebar-cta`-kaart + `-eyebrow`/`-desc`
  (manufacturer-promo). Niets bestaands gewijzigd buiten de comment.

### Beslissingen (Sessie 10 — nummering doorzetten bij invoegen)

1–9. (Zie revisie 1.) Featured data-driven met terugval; één materials-fetch;
   live hero-telling; material-kaarten via ContentCard; auth-UI als client-
   eilanden; verborgen canonieke h1; Insider-CTA verborgen voor members +
   geen hardcoded prijs; quotes/partners statisch; design-system leidend
   (section-title 44px, gradient via tokens).
10. **Promo-hero en featured-article-hero zijn elkaars tegenpool** via een
    gedeelde client-context (HomeHeroProvider): gast ziet de promo, wegklikken
    toont direct de article-hero; ingelogde users zien meteen de article-hero.
11. **Featured-article-hero = het nieuwste/eerste artikel** (= top story).
    Geen aparte `featured`-flag-afhankelijkheid → geen leeg blok.
12. **Manufacturer-promo in de sidebar** ("Show your material to architects &
    specifiers") — statisch, altijd zichtbaar, knop naar `/register`.
13. **Route-group `(home)`** voor de homepage (Johan-instructie issue 2):
    loading-boundary alleen voor de homepage, geen app-brede soft-404.
14. **CSS-comments bevatten nooit `*/`** (Johan-instructie issue 1):
    selector-opsommingen met komma's/"en", niet met slashes.

### Werkwijze-noot

- `globals.css` is een gedeeld bestand. Deze levering gaat uit van een `main`
  waarvan de sessie-10-CSS-sectie gelijk is aan de eerder geleverde (met door
  de andere agent gefixte comment). Reconcileer bij twijfel tegen de actuele
  `main` vóór merge.

### Openstaande issues (zie open-issues-patch-sessie10.md rev 2)

- S10.1 — Books-blok + Insider-prijzen (wacht op Books-domeinlaag + membership).
- S10.2 — Volledige categorie-carousel.
- S10.3 — Echte partners-bron.
- Gesloten: `contentType="material"`-verificatie (build groen op main).

### Volgende sessie / definition-of-done

`npm run build` + `next start` + de 404-curl-checks uit de Johan-instructie;
Lighthouse/axe-steekproef; drie-viewport-walkthrough. Books + `membership.ts`
aanhaken zodra beschikbaar (S10.1).
