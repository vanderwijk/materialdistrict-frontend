# Session-log patch — S13.2 (Dashboard: Persoonlijk account) — 05-06-2026

> Append-only. Fase 2 / **S13.2** — `My profile` uitgebreid naar de demo en
> `Insider insights` herschreven. Volgt op S13.1 (bookmarks & boards).
> Nummering deze dag herschoond: publieke build eindigt bij **S12 = Channel-
> hubs**; dashboards = **S13** met substappen (zie `build-order.md`).

## Gebouwd

**Datalaag (batch A)**
- `UserProfile` (`types/dashboard.ts`) uitgebreid: `phone`, `industry`,
  `address`, `postcode`, `city`, `invoiceToCompany`, `vatNumber`. Bestaande
  `company` hergebruikt als factuur-/bedrijfsnaam onder "Invoice to a company"
  (geen tweede bijna-identiek veld). Niets verwijderd → bestaande consumers
  blijven compileren.
- Nieuw `ProfileFieldOptions` (`{ professions, industries }`, elk
  `{ value, label }[]`) voor de profession/industry-dropdowns.
- `InsightReport` uitgebreid: `pages`, `format`, `gradient`, `pdfUrl` en
  `insiderOnly` (leest `meta.insider_only`, exact zoals articles/stories).
- Mappers (`dashboard/mappers.ts`): `mapUserProfile` + `toWpUserProfile` +
  `RawUserProfile` bijgewerkt; nieuw `mapProfileFieldOptions`; `mapInsight` +
  `RawInsight` uitgebreid. Alles defensief met lege/false-defaults zolang
  Johan de velden nog niet levert.
- Datalaag (`dashboard/data.ts`): nieuw `getProfileFieldOptions()` →
  `GET /md/v2/dashboard/profile-options`, 404 → lege lijsten (form valt terug
  op vrij tekstveld).
- Mock (`dashboard/mock.ts`): `MOCK_PROFILE` + `MOCK_INSIGHTS` naar nieuwe
  vorm; insights-rijen gelijk aan de demo (3 Insider-only, 1 gratis).

**My profile (batch B)**
- `ProfileForm.tsx` herschreven: één kaart met **Personal details** →
  `section-sep` → **Billing & address details**, plus het "Invoice to a
  company"-blok (`ip-bg`) dat company name + VAT onthult bij aanvinken.
- Groene vinkjes op gevulde velden via `showFilledState` (geen verplichte
  velden — gevuld = `valid`, leeg = neutraal, conform demo).
- Profession & industry: `Select` zodra `options` gevuld is, anders `Input`
  (vrij tekst). Avatar-upload verwijderd (demo-structuur).
- `dashboard/profile/page.tsx`: `getProfile` + `getProfileFieldOptions`
  parallel; opties doorgegeven. Save-route gebruikte al `toWpUserProfile`,
  dus nieuwe velden stromen vanzelf in snake_case door.
- `globals.css`: één regel toegevoegd — `.profile-invoice-fields{margin-top:14px}`.

**Insider insights (batch C)**
- `InsightsPanel.tsx` herschreven (blijft server component): upsell-banner
  voor niet-Insiders (`InsiderBadge` + kop + prijs uit `INSIDER_PRICING` +
  "Become an Insider →") en altijd de rapportlijst eronder.
- Rijen: thumbnail via `--cover`-pattern, titel-link, meta "Mmm yyyy · N pages
  · PDF". Per rij: downloadbaar (`!insiderOnly` óf Insider) → "Download PDF";
  anders teal "Insider only"-badge.
- `dashboard/insider-insights/page.tsx`: geeft nu `isInsider` door i.p.v. de
  oude volledige `locked`-gate.
- `globals.css`: alleen-hier-gebruikte `.insight-*`-regels vervangen door
  `.insights-banner*` + `.insight-row*`-layout; kleuren via bestaande tokens
  (`--ct-member`, `--ct-member-pale`, `--navy`), dark-mode-safe.

## Beslissingen
- "Invoice to a company": company name + BTW-nummer; billing-adres hergebruikt
  het adresblok op het profiel (niet dubbel uitvragen).
- Profession/industry: WP-gevoede dropdowns (Johan levert de lijsten van de
  oude registratie), met vrij-tekst-fallback bij lege lijsten.
- Insights gating per rapport via de bestaande `meta.insider_only`-checkbox
  (zoals articles); rapporten zonder vlag zijn gratis downloadbaar.
- Preview-knop = dashboard-brede upsell-modus → **S13.5**, hier bewust
  weggelaten (geen dode knop).

## Openstaand (naar Johan — zie e-mail)
- `profile`-endpoint uitbreiden met de nieuwe velden (lees + schrijf).
- Nieuw `profile-options`-endpoint (professions + industries).
- `insider-insights`-endpoint uitbreiden met `pages`, `format`, `insider_only`
  (hergebruik), `pdf_url`. `gradient` optioneel/cosmetisch (frontend-default).
