<!-- GECONSOLIDEERD 29-05-2026: alle open-issues-patches per sessie samengevoegd,
     chronologisch. Latere sessies kunnen punten uit eerdere sessies hebben opgelost —
     lees per sessie-kop. De losse patch-bestanden zijn vervallen. -->

# MaterialDistrict — Open issues (geconsolideerd)

## Sessie 6A

# open-issues — append voor sessie 6A

> **Werkwijze:** drie items hieronder invoegen in `open-issues.md`.
> - **W11** direct na W10 (regel 283), vóór de `---` en het `🟢`-blok.
> - **W12** direct na W11.
> - **G6** in het `🟢 Goed om vast te leggen — geen urgentie`-blok,
>   alfanumeriek/chronologisch achteraan.
>
> Daarna onderaan de `## Wijzigingen`-lijst de v1.7-entry toevoegen.

---

### W11. WordPress register-endpoint nog niet geïmplementeerd 🟡
**Eigenaar:** Johan (WordPress-implementatie)
**Raakt:** `/register`-pagina is live maar faalt tot Johan ship
**Bron:** sessie 6A — contract opgesteld 19-05-2026

De Next.js-frontend heeft een werkende `/register`-pagina, een
`/api/auth/register`-route, een `registerUser()` in `wordpress.ts` en
de bijbehorende types — alles klaar om aan te sluiten op
`POST /wp-json/md/v2/auth/register`. **Dat endpoint bestaat aan
WordPress-kant nog niet.** Tot Johan het implementeert faalt
register-submit met een generieke 500 voor de eindgebruiker.

Het volledige contract staat in `wordpress-instructions-register.md`
v1.0 (snake_case body, error-envelope, JWT HS256, smoke-test-checklist).
Volgt exact de conventies van `wordpress-instructions-auth.md` zodat
implementatie naast de andere vier auth-endpoints relatief kort is.

**Wat er moet:**
- Johan implementeert `POST /md/v2/auth/register` conform de instructie
- Smoke-test via de checklist in §6 van de instructie
- Bevestigen dat `md_auth_email_taken` (HTTP 409) correct werkt — code
  is nieuw t.o.v. de andere auth-endpoints

**Wanneer:** prioriteit zodra Johan tijd heeft. Zonder dit endpoint kan
niemand een nieuw account maken; de header-link "Create account" en de
"create one"-link onderaan /sign-in leiden naar een pagina die op
submit faalt. Niet acuut blokkerend (bestaande gebruikers kunnen
inloggen), wel een grote feature-gap voor groei.

---

### W12. Register rate-limiting — wel of niet voor v1? 🟡
**Eigenaar:** Jeroen + Johan
**Raakt:** WP-implementatie van `/md/v2/auth/register`
**Bron:** sessie 6A — open punt in `wordpress-instructions-register.md` §2

Login en forgot-password hebben elk een vorm van enumeration- of
abuse-bescherming. Voor register is dat moeilijker: bij een bestaand
email *moet* je `md_auth_email_taken` retourneren, anders kan de
gebruiker niet door. Daarmee is enumeration via register technisch
mogelijk.

Mitigatie-suggestie in de instructie: 5 register-pogingen per IP per
uur, of vergelijkbare anti-abuse-maatregel. Voor v1 niet als eis
opgenomen omdat register-traffic op MD naar verwachting laag is en
het niet kritiek voelt — maar wel een keuze die expliciet gemaakt
moet worden, niet stilzwijgend over te slaan.

**Wat er moet:**
- Jeroen besluit: rate-limit op register in v1 ja/nee?
- Bij ja: Johan implementeert (cookie-based of IP-based, of beide)
  en documenteert in `wordpress-instructions-register.md` §2
- Bij nee: expliciet vastleggen dat we het bewust achterwege laten
  en monitoring opzetten (logs van register-pogingen per IP) om
  retroactief bij te kunnen schakelen

**Wanneer:** vóór go-live van /register. Beslissing kan met Johan-sessie
mee waarin het register-endpoint zelf besproken wordt.

---

### G6. Terms of Service + Privacy Policy pagina's ⚪
**Eigenaar:** Jeroen (content) + Claude (pagina-implementatie)
**Raakt:** register-pagina links naar `#` tot deze klaar zijn

De register-pagina heeft een verplichte accept-terms-checkbox met links
"I agree to the Terms of Service and Privacy Policy." Beide links
wijzen op dit moment naar `#` (TODO). Pagina's `/terms` en `/privacy`
bestaan nog niet aan Next.js-kant.

**Wat er moet:**
- Content opstellen of importeren vanuit de huidige WP-site
- Twee Next.js-pagina's bouwen (eenvoudige Markdown-driven content
  is genoeg)
- Beide hrefs in `RegisterForm.tsx` updaten van `#` naar `/terms`
  resp. `/privacy`

**Wanneer:** geen blocker zolang /register niet publiek gepromoot wordt.
Wel een vereiste bij echte go-live — accept-terms-checkbox zonder
werkende links is juridisch zwak en lelijke UX.

---

## Wijzigingen — append onderaan de lijst

- **v1.7 (19-05-2026)** — Sessie 6A: vier auth-pagina's gebouwd
  (`/sign-in`, `/register`, `/forgot-password`, `/reset-password`)
  tegen het auth-backend uit B1/B2 deel 2. Drie nieuwe items
  toegevoegd: W11 (WP register-endpoint pending Johan), W12
  (rate-limiting register-beslissing open), G6 (terms/privacy
  pagina's). Geen items afgesloten — alle drie zijn open punten die
  uit deze sessie voortkomen. `wordpress-instructions-register.md`
  v1.0 nieuw als contract voor W11. `auth-strategy.md` ongewijzigd,
  blijft de bron-van-waarheid voor de login-flow.


---

## Sessie 7 (Talks)

# Open issues — patch sessie 7 (Talks)

> Append-only patch voor `open-issues.md`. Build-order stap 7 (Talks).

## Dicht (afgehandeld in stap 7 — Talks)

- **Talk-meta-blocker** (sessie-7-blocker uit de build-order-tabel) — gesloten.
  Johan leverde de C-TALK-shapes; datalaag + UI gebouwd. Zie
  `session-log-patch-sessie7-talks.md`.
- **C14** (talk.insider_only) — aangesloten in de talk-mappers (talk-default
  true).
- **S6.7** (related-talks-route) — `ArticleRelated.hrefFor` routeert de
  talk-case nu naar `/talks/${slug}` i.p.v. de WP-permalink, nu de route
  bestaat.

## Open — WP-deploy (blocker voor live talks-data)

- **W-TALK.1 (🔴)** — `speakers` `register_rest_field` op de talk-response
  (persons-taxonomy → `{id,name,slug}[]`). Tot deploy levert de frontend lege
  speakers (sidebar laat de rij dan weg — geen UI-rommel). Snippet:
  `wordpress-instructions-talks.md`.
- **W-TALK.2 (🟡)** — `show_in_rest` voor `talk_duration`, `vimeo_id`,
  `company_name`, zodat ze in `meta` landen (zoals `insider_only` al doet).
  Zonder deze: geen video-embed/duur/company tot het erop staat.
- **W-TALK.3 (🟡)** — `meta.channels`-exposure op de talk-endpoint
  (`{id,slug,label}[]`). Shape akkoord; mapper is faalbestendig (lege lijst tot
  exposure). Zichtbare channel-UI volgt sowieso pas in de channel-sessie.

## Follow-ups (niet-blokkerend)

- **S7.1 (🟢)** — Generaliseer de `detail-*`/`article-*`-CSS-klassen die nu
  door talks worden hergebruikt (`article-prevnext`, `article-side-*`,
  `article-detail-sidebar`, `article-paywall-*`) naar contenttype-neutrale
  namen (`detail-prevnext`, `detail-side-*`). Raakt live article-CSS + -
  componenten; aparte opruimsessie. Tot dan: bewuste, gedocumenteerde
  cross-naming.
- **S7.2 (🟢)** — Eigen `'talk'`-preset in `InsiderGate` (eigen titel/icoon)
  i.p.v. `feature="article"` + overschreven copy. Kleine shared-component-
  uitbreiding.
- **S7.3 (🟢)** — Talks-related-endpoint (`/md/v2/talks/{slug}/related`,
  analoog aan D5 voor articles). Nu valt de detailpagina terug op "More talks"
  (laatste talks via listTalks). Pas oppakken als redactie echte relaties wil.
- **S7.4 (🟢)** — Vimeo-auto-fill van `talk_duration` (C10-follow-up). Nu
  handmatig veld; auto-ophalen via Vimeo-API parkeren.

## Bevestigd deze sessie

- Duration-formaat: talks > 60 min worden `h:mm:ss` (bv. "1:12:00"), niet
  "72:00". Parser dekt beide (2 segmenten = mm:ss, 3 = h:mm:ss).


---

## Sessie 8 (Events)

# Open issues — patch sessie 8 (Events)

> Voeg toe aan `docs/open-issues.md`. Datum: 29-05-2026.
> (De eerdere S8.1 "reconcile tegen main" is vervallen: de oplevering is
> rechtstreeks op de verse main van 29-05 gebouwd — geen reconcile meer nodig.)

## 🟡 Voor specifieke sessies / later

### S8.2 — Admin-UI voor `videos`/`gallery` op events (Johan)
**Eigenaar:** Johan
Per Johan's handoff ontbreekt nog de redacteur-UI voor de `videos`- en
`gallery`-repeaters; ze worden nu via script/WP-CLI gevuld. Eigen edit-UI is
een aparte WP-sessie. Frontend is er klaar voor.

### S8.3 — Events-paginatie / meta-orderby-endpoint
**Eigenaar:** Johan (endpoint) + Claude (UI-koppeling)
WP kan niet `orderby` op de meta-datum `date_start`. v1 haalt alle events in
één ruime fetch op en sorteert/filtert client-side (bescheiden set). Groeit de
set, dan is een meta-orderby- of date-range-endpoint nodig voor echte
server-paginatie + correcte chronologische volgorde. De UI
(`_lib/events-order.ts`) kan dan zonder herbouw overschakelen.

### S8.4 — `themes` integraal over alle entiteiten
**Eigenaar:** Jeroen + Claude
`meta.themes` komt al binnen op events (en articles) maar wordt nog niet
gerenderd. Bewust geparkeerd: themes-taxonomy in één keer integraal aanpakken
over alle entiteiten ná v1.

### S8.5 — Legacy `location`-taxonomy
**Eigenaar:** Johan (opruimen, laag-prioriteit)
De oude gecombineerde `location`-labelstring blijft naast `meta.venue` bestaan.
Frontend gebruikt uitsluitend `meta.venue`. Kan later opgeruimd worden.

### S8.6 — Validatie tegen echte testdata
**Eigenaar:** Claude (korte vervolgcheck) zodra Johan testrecords klaarzet
Graag minstens één online event (`venue = null`) en twee events met dezelfde
venue, zodat de venue-denormalisatie en de "Online"-afhandeling tegen echte
data gevalideerd worden.

## Bewust uit v1-scope (geen blocker)
- **"What to expect"-highlights** op de detailpagina — geen WP-veld; kan later
  als los meta-veld terugkomen.
- **"Reading for this event"** (gerelateerde boeken) — wacht op Books (sessie 9).
- **"Insiders get free entry"-regel** — statische marketingtekst zonder
  per-event-veld; weggelaten om geen onterechte gratis-toegang te impliceren.


---

## Sessie 10 (Homepage, revisie 2)

# Open issues — patch sessie 10 (Homepage) — revisie 2

> Append-only patch voor `open-issues.md`. Build-order stap 10 (Homepage).
> Datum: 29-05-2026. Revisie 2 verwerkt de Johan-instructie (route-group +
> CSS-comment) en twee homepage-uitbreidingen.

## Opgelost in deze revisie

- **CSS-build-bug (`*/` in comment)** — de sessie-10-comment bevatte via
  `.grid-*/.btn*` de tekens `*/`, wat de build brak. Comment herschreven
  zonder `*/`. (Johan-instructie issue 1.)
- **Soft-404-regressie door root-`loading.tsx`** — homepage + loading +
  components verplaatst naar route-group `src/app/(home)/`, zodat de
  loading-boundary alleen voor de homepage geldt. URL blijft `/`.
  (Johan-instructie issue 2.)
- **`contentType="material"`-verificatie** — gesloten: de productie-build
  op `main` slaagt met de homepage, dus `"material"` zit in de
  `ContentType`-union.

## Open — wacht op andere lagen / data-bron

### S10.1 — Books-blok + Insider-prijzen op de homepage 🟡
**Eigenaar:** Johan (Books-data) + Claude (frontend-koppeling)
Books-plek + Books-sidebarwidget + concrete Insider-prijs (€x/maand, x%
korting) wachten op `src/types/book.ts`, `listBooks` (`woocommerce.ts`) en
`src/lib/config/membership.ts`. Nu nette placeholder; Insider-CTA verkoopt
op waarde zonder hardcoded prijs. Niet blokkerend.

### S10.2 — Volledige categorie-carousel op de homepage 🟢
**Eigenaar:** Claude (+ databron-beslissing)
v1 levert een minimale categoriestrip (één "All materials"-link). Geen
kant-en-klare "alle material-categorieën"-bron in de API-laag. Carousel kan
later als client-eiland toegevoegd worden.

### S10.3 — Echte "Featured partners"-bron 🟢
**Eigenaar:** Jeroen + Claude
Partners-grid toont nu zes placeholders. Echte bron (brands met partner-tier
of gecureerde lijst) vereist een endpoint/veld dat nog niet bestaat.

## Wijzigingen — append onderaan de lijst

- **v1.x (29-05-2026, rev 2)** — Sessie 10 homepage: route-group `(home)`
  + CSS-comment-fix verwerkt (Johan-instructie). Twee uitbreidingen gebouwd:
  featured-article-hero (verschijnt als de promo-hero weg is) en het
  manufacturer-promoblok in de sidebar. `contentType="material"`-item
  gesloten. S10.1–S10.3 blijven open.


---

## Sessie 11 (Footer)

# Open issues — addendum sessie 11 (Footer-links)

> Voeg toe aan `docs/open-issues.md`. Datum: 29-05-2026.

## Footer — wat nu werkt vs. wat nog volgt

`Footer.tsx` in-place gepatcht — alleen het legal-blok gewijzigd, rest
byte-identiek.

- **Discover** (Materials/Stories→/articles/Events/Talks/Books/Brands): wees al
  correct naar live routes. Ongewijzigd.
- **Legal** (gefixt):
  - Privacy policy → `/privacy-statement` (live, Batch A).
  - Terms of use → directe externe link naar de stabiele PDF op
    materiahost.nl (besluit 29-05) — zie S11.5 (opgelost).
  - Cookie settings → VERBORGEN (uitgecommentd) tot er een consent-tool is — zie S11.6.

### S11.5 — Terms-link — OPGELOST (29-05)
**Besluit (29-05):** voorlopig als PDF houden (optie 2) — versievast juridisch
document. Er bestaat géén WP-`page` met terms-content. Footer-link “Terms of use”
wijst nu direct naar de canonieke, stabiele asset-URL:
`https://materiahost.nl/assets/MaterialDistrict_TermsConditions_V20-01.pdf`
(HTTP 200, application/pdf, geen redirect, buiten de WAF). Gewone externe link
in nieuw tabblad; geen CSP-aanpassing nodig (we embedden niet). Versie V20.01
(april 2020) is voorlopig actueel. Willen we later een echte content-pagina,
dan via dezelfde page-template (één regel in `PAGE_SLUG_MAP` + link naar intern).

### S11.6 — "Cookie settings" heeft een consent-tool nodig
**Eigenaar:** Jeroen + Claude
**Besluit (29-05):** link nu VERBORGEN (uitgecommentd in `LEGAL_LINKS`) tot er een
consent-tool is. "Cookie settings" hoort een knop te zijn die een consent-manager
opent, geen pagina. Te beslissen welke tool (Cookiebot / Usercentrics / eigen
banner); daarna wordt het een knop die de manager opent. Eén regel terugzetten.

### S11.7 — Vooruit-lopende footer-links
**Eigenaar:** Claude (lost vanzelf op per sessie)
**Besluit (29-05):** ongewijzigd laten. For specifiers / For manufacturers wijzen naar nog-niet-gebouwde routes
(`/register`, `/membership`, `/compare`, `/dashboard/boards`, `/changemakers`,
`/transitioners`). Bewust ongewijzigd gelaten: ze zijn vooruit-correct en gaan
werken zodra die sessies landen; verbergen zou twee grid-kolommen leeg trekken.
Geen actie.


---

## Sessie 11 (Pages)

# Open issues — patch sessie 11 (Standaard contentpagina's, deel 1)

> Voeg toe aan `docs/open-issues.md`. Datum: 29-05-2026.

## 🔴 Blocker — wacht op Johan

### S11.1 — Contact-route geblokkeerd op Gravity Forms REST-info
**Eigenaar:** Johan (info) → Claude (Batch B-bouw)
De contact-pagina krijgt een eigen React-form dat server-side naar de Gravity
Forms REST-submission post (secret blijft server-side, geen CORS). Voor de bouw
nodig van Johan:
1. Is de Gravity Forms REST API (v2) aan, en welke auth voor submissions
   (consumer key/secret)? We posten server-side, dus een secret is prima.
2. Form-ID van het contactformulier (`/gf/v2/forms/<id>/submissions`).
3. Veld-mapping: welke GF-input-ID's horen bij naam / e-mail / onderwerp /
   bericht (+ overige verplichte velden)?
4. Verplichte velden + validatieregels.
5. Spambescherming (reCAPTCHA / honeypot)? reCAPTCHA maakt een headless submit
   lastig → dan een token-flow nodig.
6. Bevestiging dat een REST-submission nog steeds een entry aanmaakt én de
   notificatie-mails verstuurt zoals nu.

Batch B (bestanden `gravity-forms.ts`, `api/contact/route.ts`, `contact/page.tsx`,
`contact/components/ContactForm.tsx`) staat klaar zodra deze 6 antwoorden er zijn.

## 🟡 Voor deze sessie / verify

### S11.2 — `MaterialBody`: prose-breedte + static/dynamic-verificatie
**Eigenaar:** Claude (verify on build)
De gedeelde `MaterialBody` was niet in de geüploade set; hergebruikt op de
aanname dat-ie z'n breedte aan de parent ontleent. Twee dingen op de eerste
build checken: (a) leest de prose op `.ov-wrap-single` (1280px) niet té breed —
zo nodig één `max-width`-regel (`.content-page`) in `globals.css` (complete file);
(b) als `MaterialBody` `useSearchParams` (?q-highlighting) gebruikt, kan dat de
`[pageSlug]`-pagina dynamisch maken ondanks `generateStaticParams`. Acceptabel,
of anders een ?q-loze prose-variant. Pas aan zodra de build het uitwijst.

### S11.3 — Oude thema-CSS-klassen in WP-content
**Eigenaar:** Jeroen (beslissing) — laag-prioriteit
Sommige pagina's bevatten klassen als `col one-third` / `two-thirds` van het oude
thema; die styling bestaat in de frontend niet. v1 rendert dat als enkele kolom.
Indien een multi-kolom-layout gewenst is: lichte `columns`-styling in `globals.css`.

## 🟢 Resterend in build-order stap 11 (na deel 1)

### S11.4 — Overige stap-11-deliverables
**Eigenaar:** Claude (volgende sessies)
Nog te bouwen binnen stap 11: `/contact` (Batch B, zie S11.1); auth/account-
pagina's `/login`, `/register`, `/membership`; en de infra `not-found.tsx`,
`error.tsx`, `sitemap.ts`, `robots.ts`. Daarna rest alleen de homepage (stap 10).


---

## Featured & Channels (planning, 03-06-2026)

> Append-only patch voor `open-issues.md`. Planningsessie met Jeroen.
> Raakt en verfijnt bestaande items S10.3, S8.4 en W-TALK.3.

### WF-1 — Featured-velden WP-implementatie 🟡
**Eigenaar:** Johan (WordPress) → Claude (frontend-koppeling)
**Bron:** planningsessie 03-06; contract in `wordpress-instructions-featured.md`
Nodig WP-zijde: (a) materials — featured-slot-mechaniek (4/jaar/brand, per week,
reset op `period_end_date`) + per materiaal "featured deze week" in de response;
(b) `featured`-boolean op story/article, book, talk (event heeft 'm al — graag
bevestigen dat-ie in de response zit); (c) `featured`-boolean op brand
(modelniveau, voorlopig ongebruikt). Volledige specificatie + afvink-checklist
in de instructie. Sluit aan op / vervangt de "echte bron"-vraag uit S10.3.

### WF-2 — Featured-slot rollover-beslissing ✅
**Eigenaar:** Jeroen
Resetten op `period_end_date` is besloten (zie session-log 03-06, beslissing 3).
**Bevestigd (04-06):** ongebruikte slots vervallen bij verlenging (use-it-or-lose-it).

### WF-3 — Channels (`theme`-taxonomie): REST-exposure gelijktrekken 🟡
**Eigenaar:** Johan (WP) → Jeroen/Claude (frontend-check na deploy)
**Bron:** planningsessie 03-06 + follow-up 04-06
Admin bevestigt: de `theme`-taxonomie (zelfde 20 termen + counts als
`material-channels.ts`) hangt al aan álle content-types — Materials, Articles,
Talks, Events én Brands hebben elk een "Themes"-submenu. "Themes" (backend) =
"channels" (frontend).

**Beslissingen (04-06, Jeroen):**
1. **Eén taxonomie** — bevestigd (`theme`, geregistreerd op alle post-types).
2. **REST:** overal `meta.channels` = `theme`-termen, shape `{ id, slug, label }[]`,
   incl. brands. Verwijder de huidige sector-mapping op `meta.channels` en drop
   `meta.themes` waar die dubbel is (talk/event). **Geen `meta.sectors`** — sector
   wordt niet op de frontend gebruikt en hoeft niet in REST.
3. **Partner channel-coupling** — brand krijgt (max 3) theme-termen; max-3 is
   frontend-regel, geen WP-limiet.

Absorbeert S8.4 (themes integraal) en W-TALK.3 (channels-exposure talk). Pas hierna
volgt een channels-instructie + de channel-pagina's.

### WF-6 — Term-niveau "Featured" op themes (observatie) 🟢
**Eigenaar:** Jeroen/Claude (parkeren)
De `theme`-taxonomie heeft per term een eigen "Featured"-checkbox (+ description +
thumbnail). Dat is *featured channels* — een ander concept dan de featured *content*
uit WF-1. Voorlopig geen gebruik; description + thumbnail zijn wél bruikbaar voor de
latere channel-pagina's. Niet door elkaar halen met WF-1.

### WF-4 — Talk-plek op de homepage 🟢
**Eigenaar:** Claude (+ responsive-voorstel ter goedkeuring Jeroen)
Talks krijgen een `featured`-vlag, maar er is nog geen plek voor een talk op de
homepage (er staat er nu geen). UI-ontwerp + responsive-voorstel: puntje voor
later, geen blocker.

### WF-5 — Mockup-deviatie: featured-reset 🟢
**Eigenaar:** Claude (FeaturedPanel-copy) + mockup-notitie
De mockup toont "New slots become available on 1 January 2027". Per beslissing 3
klopt dat niet meer: reset = `period_end_date`. De FeaturedPanel-UI toont voortaan
de dynamische reset-datum; mockup-copy is op dit punt verouderd.

### Raakt bestaande items
- **S10.3 (Featured partners-bron)** — beslist in richting: carrousel afgeleid uit
  Partner-tier + roulerende subset; geen gecureerde lijst nodig. WF-1 levert het veld.
- **S8.4 (themes integraal)** — WF-3 is de concrete vervolgvraag; integrale
  themes-uitrol hangt aan de uitkomst van het Johan-gesprek.
- **W-TALK.3 (channels-exposure talk)** — valt onder de bredere WF-3-vraag.

## Wijzigingen — append onderaan de lijst
- **v1.x (03-06-2026)** — Planningsessie Featured & Channels. Zes nieuwe punten
  (WF-1 t/m WF-6). WP-admin-screenshots bevestigen dat `theme` (= channels) al aan
  alle content-types hangt; WF-3 daarop aangescherpt (REST-exposure gelijktrekken).
  S10.3 beslist in richting (tier-afgeleide carrousel + rotatie). S8.4/W-TALK.3
  geabsorbeerd onder WF-3. WF-6 noteert het term-niveau "Featured" op themes.
  `wordpress-instructions-featured.md` nieuw.
- **v1.x (04-06-2026)** — Jeroen follow-up channels/featured: WF-2 bevestigd
  (use-it-or-lose-it slots). WF-3: `meta.channels` = theme; **geen** `meta.sectors`
  (sector niet in REST). Talk featured + article `_featured`-alias live (plugin
  `c708bc5`).

## Sessie — Featured/offline + ChannelBar-rollout + Channels-hub (04-06-2026)

> Append-only. Voortgang op WF-1 (featured) en WF-3 (channels) + de
> channels-hub-beslissing.

### Featured + offline — WF-1 deels live
Backend live (plugin `3e9d10f`): `is_featured_now` online-bewust (actieve week én
online); geen blokkade op offline/draft/verwijderen; quota ongewijzigd. Per rij
op `…/dashboard/brands/{brandId}/materials`: `featured_state`
(`'active'`|`'scheduled'`|`null`) + `featured_week_start` (ISO-maandag|`null`).
Frontend heads-up live op test (main `070d489`); E2E heads-up geverifieerd op
Partner-brand.

### ChannelBar-rollout
- **Talks/brands/events** — live + geverifieerd (main `84322bf`).
- **Materials — live ✅:** FacetWP-facet **`theme`** (plugin `facetwp-theme-facet.php`,
  bron `theme`-taxonomie, **term-SLUG**); re-index in WP admin. Frontend
  `channelbar-materials` (main `76dd5c4`); filter geverifieerd (curious 33,
  biobased 719 via FacetWP fetch).

### Channel-contract (vastgelegd)
- `GET /wp/v2/theme/{id}` → `name` + `description` (HTML).
- `theme_thumbnail` term-meta op `/wp/v2/theme` (plugin `b766803`).
- Collectie-filtering: `?theme=<term_id INTEGER>` voor talk/article/brand/event;
  materials via de FacetWP `theme`-facet (slug). **Gotcha:** FacetWP = slug,
  WP-REST = term-id.

### Channels-hubs — beslissing (WF-3-vervolg)
Gemengde cross-entity hub + `/channels`-index; topmenu-volgorde; bar blijft
in-place filteren. Details in `openingsprompt-channels-sessie.md`. Dit is de
volgende sessie (build-order: nieuwe Stap 12).

## Sessie — Bookmarks + saved-search create (04-06-2026)

> Zip `md-bookmarks-savedsearch-2026-06-04-FINAL.zip` → frontend `824d3b3` op
> Vercel test. WP plugin `2aedda2` op productie.

### Opgelost ✅
- **BM-1** — `POST /md/v2/dashboard/bookmarks` + `item_id` in GET/POST-response.
- **BM-2** — `POST /md/v2/dashboard/saved-searches` live (Insider); frontend
  "Save this search" op `/materials` werkend.
- **Bookmarks create-flow (frontend)** — `BookmarksProvider`, Save op
  materials/articles/talks/events + material-cards; API-proxy GET/POST/DELETE.
- **WP BD-1 (backend)** — `POST /md/v2/dashboard/boards/{id}/items` live.

### Geverifieerd
- API-smoke Vercel test (bookmarks + saved-search gating).
- Handmatig Johan: Save op **event**- en **article**-detail.

### Opgelost (board picker, 04-06-2026) ✅
- **BD-1 UI** — `md-board-picker-2026-06-04.zip` op test; modal + GET boards + POST items.

### Opgelost (board detail, 04-06-2026) ✅
- **Board detail** — `GET /boards/{id}` + `/dashboard/boards/[id]` (zip FINAL).
- Geen Save op book-/brand-detail (bewust buiten scope).
- Item uit board verwijderen (endpoint nog niet).

Zie `MANIFEST-bookmarks-savedsearch-2026-06-04.md`, `handoff-claude.md` § Bookmarks.

## Wijzigingen — append onderaan de lijst
- **v1.x (04-06-2026, bookmarks)** — BM-1/BM-2 live; zip FINAL op test;
  event/article Save handmatig OK; board-items POST WP live, picker UI open.
- **v1.x (04-06-2026, 2e patch)** — Featured/offline heads-up live (`070d489`).
  ChannelBar op alle overzichten live (`84322bf` + `76dd5c4`, FacetWP `theme`-
  facet + index). Channel-contract + slug-vs-id-gotcha vastgelegd. Channels-hub-
  richting beslist (Stap 12).

## Sessie — Compare/save fix op /materials (05-06-2026)

> Zijstap buiten de build-order, gestart vanuit een bugmelding (compare deed
> niets op `/materials`). Frontend-diagnose + fix; Johan merge + drie
> vervolgfixes op main (`56bb8c1` → `d4c89e8`), getest op productie met
> Insider-account.

### Opgelost ✅
- **Click-bubbling** — Save/Compare op de cards liggen als overlay binnen de
  card-Link (`HoverPrefetchLink`); een klik bubbelde door en navigeerde direct
  naar `/materials/[slug]`. `toggleCompare` draaide technisch wel, maar grid +
  CompareBar werden door die navigatie ge-unmount voordat er iets zichtbaar
  werd. Fix: `handleSave`/`handleCompare` in `MaterialCard.tsx` typen nu
  `MouseEvent<HTMLButtonElement>` en roepen `preventDefault()` +
  `stopPropagation()` aan vóór gating/toggle. Geen wijzigingen aan
  `ActionButton`, `ContentCard`, `Card`, `useCompare` of layout. Johan `56bb8c1`.
- **CompareBar flitste/verdween** — twee `.compare-bar`-blokken in `globals.css`
  (legacy mockup met `translateY(100%)` + ongebruikte `.visible`, vs. het
  sessie-4 slide-up-blok) werkten elkaar tegen. Legacy-blok verwijderd +
  `animation-fill-mode: forwards` toegevoegd. Johan `6fa3362`.
- **CompareBar ontbrak op detail + metadata-verlies** — bar zat alleen in
  `MaterialsGrid`, niet op `/materials/[slug]`; en de slot-metadata leefde per
  page (lokale `materialsById`-map), waardoor eerdere selecties op detail als
  "Material #<id>" toonden. Bar toegevoegd op detail
  (`MaterialDetailCompareBar`); compare-metadata nu centraal in `useCompare`
  via een snapshot-map (`registerCompareMaterial` / `getCompareMaterial`,
  `toggleCompare(id, material?)`). Johan `6fa3362` + `d4c89e8`.

### Follow-up 🟢
- **CMP-1 — CompareBar op brand-detail (`BrandMaterialsGrid`)**
  **Eigenaar:** Claude (volgende sessie, lage urgentie)
  De `CompareProvider` hangt al op de brands-layout, maar de CompareBar zelf nog
  niet op layout-niveau — zelfde situatie als materials vóór deze fix. Bouwen via
  hetzelfde patroon. **Aandachtspunt:** compare-state leeft nu per sectie
  (materials apart van brands); als we de bar op brands tonen, expliciet kiezen
  of dat één gedeelde lijst moet worden of bewust gescheiden blijft.
- **CMP-2 — Snapshot-fetch voor materials buiten grid/detail (optioneel)**
  Voor edge cases (material in compare dat noch in de huidige grid noch op het
  huidige detail staat) valt de bar terug op "Material #<id>". Optioneel later
  een API-fetch voor ontbrekende snapshots; nu niet gebouwd.
- **`/compare?ids=…`-pagina** — nog placeholder-href; valt onder bestaande
  stap-4-scope, ongewijzigd.

### NB
Compare-items die vóór `d4c89e8` al in de lijst stonden missen metadata in de
snapshot-map; één keer Clear + opnieuw toevoegen lost dat op. Niet relevant na
de deploy.

## Wijzigingen — append onderaan de lijst
- **v1.x (05-06-2026, compare-fix)** — Compare/save op `/materials` deed niets
  zichtbaars (click-bubbling). Frontend-fix `MaterialCard.tsx` geleverd; Johan
  merge `56bb8c1` + drie vervolgfixes (`6fa3362` CSS-dubbeling/zichtbaarheid,
  `d4c89e8` metadata-persistentie + bar op detail). Getest op productie. Twee
  nieuwe 🟢 follow-ups: CMP-1 (bar op brand-detail) en CMP-2 (snapshot-fetch).

## Sessie 10 — Homepage afronding (S10.2 + S10.3) (05-06-2026)

### Opgelost ✅
- **S10.2 (material-type-carrousel)** — categorierij gevuld uit de
  `material_category`-taxonomie (`getTerms`, hide_empty, alfabetisch), deeplink
  `/materials?material_category=<slug>`. Nieuwe component `MaterialCategoryStrip`;
  hergebruik bestaande `.hp-cats`-strip (nul nieuwe CSS); defensieve fallback naar
  "All materials". Beslissing: alle top-level material-types in taxonomie-volgorde.
- **S10.3 (partners-bron)** — placeholder vervangen door Partner-tier brands
  (`listBrands` -> filter `partner`), roterende subset van max 8 per revalidate,
  hergebruik `BrandTile`. Nieuwe component `FeaturedPartners`. Dode
  `.partner-grid`/`.partner-card`-CSS opgeruimd.

### Te verifieren op test-deploy 🟡
- **HP-V1** — partners-blok vereist dat de `partner`-vlag op brands gevuld is;
  anders blijft het blok (graceful) leeg.
- **HP-V2** — bevestigen dat de `material_category`-facet/taxonomie echte
  material-types teruggeeft en `?material_category=<slug>` correct filtert (docs
  hadden een dubbelzinnig slug-voorbeeld dat type- en thema-slugs mengde).

### Status
S10.1 (boeken) blijft geparkeerd. Homepage daarmee functioneel compleet op
boeken na.

## Wijzigingen — append onderaan de lijst
- **v1.x (05-06-2026, homepage-afronding)** — S10.2 + S10.3 gesloten (carrousel +
  partners). Twee deploy-verificatiepunten HP-V1/HP-V2. `globals.css` alleen dode
  partner-CSS verwijderd.

---

## §S10.2 — Homepage-feedbackronde (16-06-2026)

> Lopende ronde. Drop 1 (categorie-strip + onder-witruimte) is geleverd.

**🟡 Open / nog te bouwen in deze ronde**
- **H1 — Tegel-/badge-fundament (site-wide):** geen content-type-badge op
  per-type opgedeelde pagina's; channel als herkenbare detail-stijl body-pill
  (huidig kanaal weggelaten, max 1 + "+N"); duurzaamheids-pills op materialen
  (theme-ID's → labels resolven); story-type in één kleur; sterke Insider-pill,
  óók op talks. Eén canonieke tegel per type, hergebruikt op homepage, hubs én
  catalogus-overzichten.
- **H2 — Gedeelde sectiekop + "View all"-link:** channel-hub-stijl is leidend;
  homepage neemt die over (gewone tekstlink, geen hoofdletter-variant).
- **H3 — Featured article → grote tegel** in standaard kaart-stijl; de hover-naar-
  blauw vervalt.
- **H4 — Partner-carrousel:** Partner-tier eerst, aangevuld met merken ≥3
  materialen, 6 tegels, kop "Featured brands". Lichter tegel-uiterlijk volgt als
  voorstel.
- **H5 — Channels in de hoofdnavigatie** (`/channel`-overzicht bestaat al, is niet
  gelinkt).
- **H6 — Featured boek op de homepage** (`/book`; WC-`featured`-vlag + terugval op
  nieuwste). *Pending Johan:* kan een boek als "featured" gemarkeerd worden?
- **H7 — Featured channel-blok** (leest de channel met de "featured"-vlag; geen
  rotatie-logica — handmatig via de checkbox).
- **H8 — Fonts site-wide groter:** eigen drop. ~450 font-sizes staan als vaste px
  in `globals.css` (niet in pagina's — jouw regel staat overeind); migreren naar
  de `--text-*`-schaal en dan de schaal optikken, met visuele controle.
- **H9 — Responsive-pass** over alles wat verschuift (laatste).

**🟢 Correctheid**
- **H10 — Offline-materialen:** controleren of de homepage-fetches geen materialen
  met `publication.isOnline:false` tonen (frontend filtert daar nu niet op).

**🔵 Eigen track (geparkeerd, los van deze ronde)**
- **H11 — Insider-only materiaal = hele pagina gaten** (teaser + join-prompt,
  zoals artikelen). `insider_only`-vlag wordt al gelezen; gate-bouwstenen van de
  artikelen herbruikbaar. *Pending Johan:* WP-veld op materialen zetten/ontsluiten.

**ℹ️ Opgemerkt**
- Eén los CSS-bestand `src/styles/globals-additions-auth.css` naast `globals.css`;
  kan desgewenst in `globals.css` worden opgenomen (één-bestand-regel).

## §S10.2 voortgang (16-06-2026)
Afgerond: categorie-snelmenu, onder-witruimte, featured-article-tile, Channels in nav,
story-type één kleur, sterke Insider-pill (incl. talks), content-type-badge uit op
type-gesectioneerde pagina's (homepage + channel-hub), offline-materialen uitgefilterd,
font-schaal ~10% groter, channel-bodypill + huidig-kanaal-onderdrukking, partner-
carrousel "Featured brands", featured channel "In the spotlight".
Open: duurzaamheids-/channel-pills OP materiaaltegels (theme-ID→label-resolve in de
datalaag); featured boek blijft geparkeerd (bookshop-scope); responsive + half-cent-
afronding = deploy-checks Johan; insider-material-gate (H11) blijft geparkeerd (WP-veld).
