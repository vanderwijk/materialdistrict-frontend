# Roadmap & ideeën — MaterialDistrict frontend

> **Levend document.** Tegenhanger van `session-log.md`: dat kijkt terug, dit kijkt
> vooruit. Bron van waarheid blijft de moedermap; dit bestand woont in `docs/`.
>
> **Status gekalibreerd tegen de code (moedermap-scan 18-06-2026).** Labels:
> **[live]** = staat in de codebase · **[deels]** = deel af, rest open ·
> **[open]** = nog niet gebouwd.

---

## 1. Inbox — ongesorteerd

*Leeg. Net geconsolideerd op 18-06-2026 (drie pitches ingesorteerd: upload agent,
het Atlas-cluster, account-by-default). Hier komt je volgende idee.*

---

## 2. De rode draad: fasering

**Fase 1 — het fundament = de data-moat.** Loggen moet nú, want data is niet
backfillbaar. Loggen, relateren, volgen. Dit is geen analytics, het is bedrijfswaarde.

**Fase 2/3 — intelligentie bovenop.** Aanbevelingen, AI-agent, slimme dashboards —
waardevol, maar waardeloos zonder opgebouwde historie. Bouwt op de data die er dan ligt.

**Volgorde-advies:** quick wins los → fundament verbreden (events, follow, datamodel) →
hefbomen die erop leunen (digest, alerts, SEO-landingspagina's) → parallel: social login →
later & groot: bilingual + eigen admin → fase 2/3: intelligentie (incl. het Atlas-cluster).

---

## 3. Fase 1 — fundament & directe hefbomen

### Eventlaag verbreden  ·  **[deels]**  ·  hoogste prioriteit
Live: `website_click`, `brochure_download`, `search_materials`, `preferred_source_click`
via `/api/interactions/events`. Open: `material_view / saved / shared / channel_followed`
toevoegen. Niet-backfillbaar — daarom prioriteit. Analytics in aparte DB (besloten).
Afhankelijk van: Johan-spec · Eigenaar: beide

### Follow-systeem  ·  **[deels]**
Live (frontend): `FollowToggle`, `FollowDigestBlock` (nieuwsbrief-voordeur), `useFollow`,
`/api/follows`-proxy, `followable`-flag op brands. Open: de backend-relaties/endpoints
volledig afmaken + elke follow als event wegschrijven.
Eigenaar: vooral backend nog

### Datamodel-haakjes  ·  **[deels]**
Live: `insiderOnly`-vlag wordt al gelezen op materials/articles/reports; related content
+ channels leggen relaties. Open: bredere content-relaties waar nodig.
Eigenaar: vooral backend

### Segmented newsletter / digest  ·  **[deels]**
Live: de follow-voordeur (`FollowDigestBlock`) die de oude e-mailbox vervangt. Open: de
digest-engine zelf — drie blokken (persoonlijke content / commerciële slots / insider-
trigger), "nieuw sinds vorige cyclus", marketing-consent, en de **mailtool-keuze**
(Sendy-op-SES vs MailPoet vs managed). Voorwaarde: materiaal goedgekeurd vóór opname
(+ write-once eerste-goedkeurdatum). Begin segment-gericht, niet per individu.
Afhankelijk van: tooltkeuze + backend · Eigenaar: beide

### "New in your channels"-pagina  ·  **[open]**
De pagina achter de "+24 more"-link: persoonlijke cross-channel listing op de FacetWP-
infra, ingelogd. Groeit later door naar de volledige persoonlijke feed (fase 2).
Afhankelijk van: follow-systeem · Eigenaar: vooral frontend

### Saved-search e-mailalerts  ·  **[deels]**
Live: toggle/voorkeur (`alertsEnabled`) in de saved-searches. Open: de alert-engine
(cron + matching + mail). Deelt infra met de digest.
Afhankelijk van: Johan · Eigenaar: vooral backend

---

## 4. Op de horizon

### Upload agent  ·  **[open]**  ·  NIEUW (18-06)
Klant voedt een agent met bronnen (brochures, EPD's, persberichten, company info, links);
de agent extraheert daaruit het brand-profiel én materiaalvelden, getraind op jullie
kwaliteitsnorm (bv. thumbnail = materiaalfoto, geen toepassing). Tweeledig: brands
ontzorgen + grip op contentkwaliteit (→ betere SEO/discovery). Mens-in-de-loop: agent
stelt voor, klant/redactie keurt goed. Bouwt op het bestaande material-form-datamodel —
hangt níét op de data-moat, kan dus eerder dan fase-2-intelligentie. Familie van de
brand-scan in §6.
Eigenaar: beide

### Social login (Google + LinkedIn)  ·  **[open]**
Gescoped, nog niet gebouwd (geen knoppen/callback in de code). OAuth → WP user → dezelfde
JWT-cookie. Frontend klein. Kan parallel — lage kost, hoge conversiewaarde.
*Open keuzes:* linking op geverifieerd e-mail; "complete your profile" na eerste login.
Afhankelijk van: Johan (OAuth) · Eigenaar: vooral backend

### SEO long-tail facet-landingspagina's  ·  **[open]**  ·  ná het fundament
Echte pagina's per zinvolle facet-combinatie ("Acoustic biobased materials"): intro +
gecureerde materialen + stories + structured data. Selectiviteit ís de strategie: wees
dé bron voor de query, geen dunne commodity-content.
Afhankelijk van: fundament · Eigenaar: frontend + curatie

### Rich results / structured data  ·  **[live]**, uit te breiden
structured-data.ts dekt al Article, Event, VideoObject, Product, Book, Breadcrumb,
CollectionPage e.a. Resterend: dekking checken/uitbreiden waar pagina's nog ontbreken.
Eigenaar: vooral frontend

### Named authors op artikelen  ·  **[deels]**
Footer-UI staat; toont nu "Story by MaterialDistrict". Open: echte auteur-resolve
(bio + foto vanuit redactie). Niet retroactief.
Eigenaar: beide

### Ontdek-laag — "het moet leuker"  ·  **[open]**
Serendipiteit-modus ("verras me"), curated trails (redactionele routes), verzamel-
momentum (boards belonender maken). Voedt ontdekking én interne SEO-linking.
Eigenaar: vooral frontend

### Cookie-consent tool  ·  **[open]**
Footer-link staat uitgecommentarieerd, wacht op een consent-tool.
Eigenaar: beide

### Terms als content-pagina  ·  **[open]**
Nu PDF-link; kan een WP-pagina worden via het page-template (`PAGE_SLUG_MAP`).
Eigenaar: beide

---

## 5. Smart dashboard / "Atlas" — datapool → CRM → sales  ·  NIEUW (18-06)

De sales-bovenkant van dezelfde data-moat. Werknaam "Atlas" komt uit de v4-mockup
(`crm-v4.html`, bronstuk). Eén systeem, gated bovenop MD.com (geen los systeem, want de
data overlapt). Al ver **ontworpen** (vier werkende tabs, data-model), **niet gebouwd**.
Leunt op het fundament + verweven met het commerciële spoor → fase 2.

**Kerngedachte — account als ruggengraat (account-by-default).** Elk waardevol
contactmoment maakt automatisch een identiteit aan op het platform: boek besteld, ticket
geregistreerd, beurs bezocht, of no-show. Opt-out i.p.v. opt-in, transparant gemeld + makkelijk
te verwijderen. Lost dedupe op aan de bron en verbindt publieke groei (follows/digests)
met de sales-datapool onder één identiteit. (Johans eerdere "nee" gold een account voor
één losse boekbestelling; als toegangspoort tot de hele datastrategie kantelt die afweging.)

**De trechter:**
- **Datapool** — alle bronnen samen. Entiteiten (bedrijven, contacten, brands) in WP
  (overlapt met bestaande data); gedrags-events in de aparte analytics-DB; gejoind voor
  kwalificatie. Slimme **import met dedupe**: identity-matching (e-mail/KvK) + bron-tag op
  het bestaande record (#MDU2026_VISITOR) i.p.v. duplicaat.
- **AI-verrijking & kwalificatie** — verrijken, actueel houden, en identificeren wie
  interessant is (prospect-brand, potentiële Insider/architect, spreker).
- **CRM** — gekwalificeerde partijen, met stage/rating/rol.
- **Projects** — concrete deals per project (beurs/campagne), prospect-lists,
  accountmanagers met doelstellingen, weighted pipeline.
- **Dashboard** — overzicht voor sales-persoon én manager.

**Brand-scan / monitoring-agent** — draait periodiek (maandelijks) over de CRM-brands:
nog actief? iets nieuws gelanceerd? Signaal werkt twee kanten op: sales (tijd om te bellen)
én content (nieuwe launch = nieuw materiaal om te listen). Familie van de upload agent.

**Open beslissing:** houdt Atlas zijn eigen brutalist-identiteit (intern tool) of trekt
'ie de MD.com-huisstijl aan? Lean: als intern tool eigen + strak houden.

---

## 6. Internationaal & content-beheer (later, groot)

### Bilingual (NL + EN)  ·  **[open]**
EN op ongeprefixte paden, NL onder `/nl`. WPML boven Polylang. Twee lagen: UI-chrome
(frontend) vs. redactionele content (plugin + vertaalwerk).
Afhankelijk van: Johans haalbaarheid + contentlaag · Eigenaar: beide

### AI-ondersteunde vertaling  ·  **[open]**  ·  fase 2/3
Bezoeker-toggle voor onvertaalde content; gecached, als unreviewed draft teruggeschreven,
gebadged, buiten geïndexeerde HTML tot review. Onderdeel van bilingual.

### Eigen admin-dashboard  ·  **[open]**  ·  fase 2/3, grote visie
Standaard WP-admin vervangen voor het dagelijkse content-werk (eigen formulier-UI, per-veld
taalvlaggen). Diepe config blijft in WP Admin. Bouwt voort op het member-dashboard.

---

## 7. Fase 2/3 — intelligentie op de opgebouwde data

Bewust later; pas zinvol als de data-moat gevuld is.
- **Aanbevelingen / "materialen zoals dit"** — personalisatie uit gedrag.
- **Volledige persoonlijke feed** (doorgroei van "New in your channels").
- **AI-agent / crawler / slimme dashboards** — incl. het Atlas-cluster (§5).

---

## 8. Geparkeerd

Bewust uitgesteld. **Niet voorstellen als actieve volgende stap.**
- **Upsell shop** incl. beurs-configurator (complex: varianten, contracten, capaciteit).
- **WooCommerce self-service checkout** als volledige zelfbediening + tier-vergelijking.
  *(NB: de gewone checkout/cart/iDEAL/insider-korting is wél live — zie §9.)*
- **Homepage books-sidebar-widget** — bewust geparkeerd.
- **Books filter-sidebar overhaul** — geblokkeerd op category-taxonomy van Johan + sign-off.
- **Publieke insider-reports-detailpagina** (`/insider-reports/{slug}`) — niet gebouwd.
- **VIES reverse-charge volledige afhandeling** — basis-VAT-validatie in checkout is live;
  de volledige reverse-charge-uitwerking schuift door.

---

## 9. Live / recent afgerond

Bevestigd in de moedermap-scan (18-06-2026):
- **Dashboard** (S13.x): brand/material-forms, profiel, Insider insights (gated download),
  tier-preview, statistieken, lead-routing, event-logging, 15-punts review.
- **Homepage** (S10.x): volledige productie-build.
- **Books/webshop**: index + detail (sheet-and-rail, BookBuyCard), cart, checkout, iDEAL,
  insider-korting, featured-book, books-filtersidebar.
- **Follow-systeem** (frontend): toggle, digest-voordeur, hook, proxy.
- **Structured data**: brede schema-dekking incl. VideoObject/Event/Product.
- **VAT in checkout**: validatie + `vat-status`-endpoint.
- **Google Preferred Sources-knop** (SEO/Google News-lijn).
- **Overzichtsfilters**: events Costs, brands Application area, stories Insider-only.
- **WCAG-audit**: P1-fixes klaar (wachten op `globals.css`).
- **Strategie-docs**: traffic/SEO, e-mailsysteem-blueprint, mailautomation-plan.
