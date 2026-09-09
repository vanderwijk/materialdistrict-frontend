# Datamodel

> **Normdocument.** Welke velden er bestaan, waar ze wonen, en — het belangrijkste — **via welke
> endpoint ze zichtbaar zijn**.
>
> **Waarom dit bestaat.** Twee keer op één dag is dezelfde fout gemaakt: een veld gemeten tegen de
> publieke API, niets gevonden, en daaruit geconcludeerd dat het veld niet bestaat. Eerst met
> `vimeo_id` op talks (die wordt gestript, besluitenregister B51), daarna met `email`, `phone`,
> `vat_number` en `chamber_number` op brands (die zitten achter het dashboard-endpoint). Beide keren
> was de conclusie fout en beide keren zat er een levering aan vast.
>
> **De regel die eruit volgt:** een veld dat niet in `wp/v2` staat, bestaat níét niet. De publieke
> API is een uitsnede, geen inventaris. Meet altijd tegen de laag waar het veld hoort.
>
> Versie 1.1 · 09-09-2026 · hermeten tegen de live API; §3b herzien. Zie §Status.

---

## 1. Drie lagen, drie zichtbaarheden

Elk veld hoort in precies één van deze drie kolommen. Wie in de verkeerde kolom meet, meet niets.

| Laag | Endpoint | Wat je ziet | Auth |
|---|---|---|---|
| **Publiek** | `wp/v2/{type}` · `md/v2/…` | Wat een bezoeker mag zien | nee |
| **Gated** | `md/v2/talks/{id}/embed` e.d. | Publiek verborgen, member-zichtbaar | JWT |
| **Dashboard** | `md/v2/dashboard/…` | Bedrijfs- en persoonsgegevens | JWT + eigenaarschap |

**Onder alle drie ligt de WordPress-database.** Een veld in `wp_postmeta` of `wp_usermeta` bestaat
ook als geen enkele endpoint het teruggeeft. Alleen Johan kan die laag direct lezen.

---

## 2. Brand

### 2a. Publiek — `GET /wp/v2/brand`

Gemeten 25-08-2026; dit is de volledige `meta`-uitsnede:

`_brand_country` · `_brand_facebook` · `_brand_instagram` · `_brand_linkedin` · `_brand_twitter` ·
`_brand_website` · `_brand_youtube` · `_featured` · `_partner` · `address` · `applications` ·
`channels` · `city` · `country` · `country_detail` · `downloads` · `downloads_insiders_only` ·
`employees` · `featured` · `followable` · `founded` · `last_checked` · `material_count` ·
`membership` · `partner` · `record_status` · `socials` · `verification_status` · `video_url` ·
`website`

### 2b. Dashboard — `GET/POST /md/v2/dashboard/brands/{brandId}/profile`

Het bewerkbare brandprofiel (`BrandProfile` in `src/types/dashboard.ts`). **Hier zitten de velden
die niet publiek zijn:**

| Veld | Publiek zichtbaar? |
|---|---|
| `brandName` · `description` · `website` · `country` · `city` | ja |
| `email` | **nee — alleen dashboard** |
| `phone` | **nee — alleen dashboard** |
| `vatNumber` | **nee — alleen dashboard** |
| `chamberNumber` (KvK) | **nee — alleen dashboard** |
| `addressLine1` · `addressLine2` · `postcode` | deels — publiek alleen als samengesteld `address` |
| `social` · `logoUrl` · `channels` · `keywords` · `applications` | ja |

> **Dit is de fout die twee sessies maakten.** `email`, `phone`, `vatNumber` en `chamberNumber`
> bestaan wél. Ze horen niet in een publieke respons — een btw-nummer en een telefoonnummer van
> een bedrijfscontact zijn geen publieke gegevens — dus `wp/v2/brand` levert ze niet. Wie daar
> meet en "leeg" vindt, heeft de verkeerde laag bevraagd.
>
> In de plugindocumentatie staat `_brand_email` bovendien expliciet genoemd als bestaand veld dat
> als fallback blijft bestaan naast `brand.primary_user_id` (`docs/cms-plugin/database.md` §B7).

### 2c. Membership & status

| Veld | Waarden | Stand 25-08-2026 |
|---|---|---|
| `tier` | `free` · `basic` · `plus` · `partner` (B31) | `free` op alle 2.102 (hermeten 09-09-2026) |
| `tier_grandfathered` | `null` · `pro_5` (€995) · `pro_10` (€1.245) | — |
| `period_end_date` | datum | — |
| `record_status` | waardenlijst **nog niet vastgelegd**; import wil `prospect` (B47) | leeg op alle 2.102 (hermeten 09-09-2026) |
| `verification_status` | `unknown` · `checked` · `confirmed` · `archived` (B40) | 110 `checked`, 1.983 `unknown` |
| `last_checked` | datum | 110 gevuld |
| `partner` | boolean, erfenis | 130 brands |
| `featured` | boolean | 3 brands |

**De publieke laag geeft `membership` als samengesteld object terug**, niet als losse velden:
`{ "tier": "free", "is_member": false }`. Meet daarop, niet op een veld `tier`.

**Waarom `tier` overal `free` staat, is sinds 04-09-2026 bekend.** De webhook schrijft de tier
correct op brand-meta — bewezen in de e2e-ronde over basic, plus en partner. De bestaande betalende
merken hebben echter geen Stripe-abonnement; die zijn via de administratie afgerekend. Hun tier is
dus geen databasemutatie maar een eenmalige aanvulling waarvan de bron in Moneybird ligt.

**`material_count` is afgeleid**, geen opgeslagen kolom — het wordt in de brand-mapper geteld
(`docs/cms-plugin/database.md` §B8).

**`partner` versus `tier`.** De homepage leest `partner`, niet `featured`. `partner` is een oude
commerciële relatie-indicator en niet betrouwbaar: circa 22 partners hebben geen betaalde
materialen, 34 brands mét betaalde materialen missen de vlag. Zolang `tier` leeg is, is dit het
enige member-signaal dat er is.

---

## 3. Material

### 3a. Publiek — `GET /wp/v2/material`

Volledige `meta`-uitsnede, gemeten 25-08-2026. Let op de twee vormen: `_material_*` en
`_prop_*` zijn de opslagsleutels, de namen zonder underscore zijn de uitgelezen varianten.

**Identiteit en inhoud:** `_material_code` / `material_code` · `_material_short_description` /
`short_description` · `_material_brand` / `brand_id` · `brand_name` · `brand_slug` ·
`brand_website` · `brand_country` · `brand_public` · `channels` · `properties` · `tags` ·
`footnotes` · `publication`

**Media:** `gallery` · `videos` · `video_url` · `brochures` · `downloads` · `datasheet_url` ·
`epd_url` · `product_url` · `inline_featured_image`

**Vlaggen:** `featured` · `_featured` · `is_featured_now` · `featured_week_start` ·
`commercial_material` / `_commercial_material` · `not_available` / `_material_not_available` ·
`disable_sample_request` / `_material_disable_sample_request`

**Duurzaamheid:** `sustainability_flags` en de losse `_prop_*`-vlaggen — `biobased` ·
`climate_neutral` · `recycled` · `reduces_energy_use` · `renewable` · `sustainably_produced` ·
`toxin_free`

**Zoekeigenschappen (`_material_*_important`):** acoustics · chemical_resistance · fire_resistance ·
glossiness · hardness · odeur · renewable · scratch_resistance · structure · temperature · texture ·
translucence · uv_resistance · weather_resistance · weight

**Status en herkomst:** `verification_status` / `_material_verification_status` · `last_checked` /
`_material_last_checked` · `_md_distribution_approved` · `_md_first_approved_at` ·
`_material_transport_weight` / `transport_weight` · `_material_colour`

**China-velden:** `_material_china_brand` · `_material_china_name` · `_material_china_label_text`

### 3b. Wat ontbreekt

- **Er is geen los veld `publication_status`.** ⚠ **Herzien 09-09-2026.** B32 spreekt over
  `publication_status`, maar de publieke laag geeft een samengesteld object terug:

  ```
  publication = { "isOnline": true, "source": "standalone", "validUntil": null, "isPlaceholder": false }
  ```

  De status zit in `source`. Wie op `publication_status` meet, meet niets — en dat is precies wat
  hier tot 09-09 stond ("leeg op alle 3.246 gepubliceerde materialen").

  **Hermeting 09-09-2026 over alle 3.257 gepubliceerde materialen:** `source` = `standalone` op
  100%, `isOnline` = `true` op 100%, `validUntil` = `2027-12-31` op 3.245 en leeg op 12. Die twaalf
  zijn alle gepubliceerd vanaf 24-08-2026.

  **Wat daaruit volgt.** De backfill ís gedraaid, rond 23-08-2026, en niet "nooit" zoals hier stond.
  Wat ontbreekt is een standaardwaarde bij het aanmaken van nieuw materiaal: alles van na de mutatie
  valt erbuiten, en dat aantal groeit. Voor `source` is onbeslist of `standalone` een opgeslagen
  waarde is of een invulling door de plugin — bij 100% dezelfde waarde is dat van buitenaf niet te
  zien (zie §7 regel 9). Een telling op `wp_postmeta` beantwoordt het.

- **Sample in huis** — er is **geen veld** dat vastlegt of MaterialDistrict fysiek een sample
  bezit. `disable_sample_request` en `not_available` bestaan wel maar betekenen iets anders:
  of een bezoeker mág aanvragen. Zie `content-taken.md` taak 9.

### 3c. Dashboard — `MaterialFormData`

`GET/POST /md/v2/dashboard/brands/{brandId}/materials/{id}`. Bewerkbaar: `name` · `description` ·
`type` (material_category term-id) · `indoorOutdoor` · `featuredImage` · `applications` ·
`channels` · `gallery` · `videos` · `downloads` · `keywords` · `properties` (24 velden in 4
groepen).

**`_material_code` verandert nooit mee bij een typewijziging** (B25). Een script mag hem niet
herschrijven.

---

## 4. Talk

Publiek: `speakers` · `date` · `duration_seconds` · `talk_duration` · `company_name` ·
`company_brand` · `company_brand_id` · `channels` · `featured` / `_featured` · `insider_only` /
`_insider_only` · **`has_video`**

**`vimeo_id` wordt gestript** uit de publieke respons bij Insider-only talks (B51). Ingelogde
members laden hem via `GET /md/v2/talks/{id}/embed`. **`has_video` is de publieke vlag** — die
staat op alle 102 gepubliceerde talks op `true`.

Stand 25-08-2026: 102 gepubliceerd van 254 in het archief. Sprekers 102/102, duur 32/102, bedrijf
31/102.

---

## 5. User

### 5a. Dashboard — `GET/POST /md/v2/dashboard/profile`

`firstName` · `lastName` · `email` · `phone` · `profession` (keuzelijst) · `industry`
(keuzelijst) · `address` · `address2` · `postcode` · `city` · `country` · `invoiceToCompany` ·
`company` · `vatNumber` · `avatarUrl`

**`profession` en `industry` zijn keuzelijsten**, geen vrije tekst. Opties komen uit
`GET /md/v2/dashboard/profile-options`. Een import die een onbekende waarde aanlevert, gaat naar
de review-lijst (`importprotocol.md` §2).

### 5b. Facturatie (batch E)

`billing_is_company` · `billing_company_name` · `billing_vat_number` · `billing_coc_number`.
Staan los van de WooCommerce `billing_*`-velden maar worden er wel naartoe doorgezet. VIES-validatie
is geparkeerd.

### 5c. Membership en koppeling

- `membership_status` — Insider-status. **`legacy` is hier geen geldige waarde**; dat is
  uitsluitend een brand-/materiaalbegrip (B30).
- `connected_brands` — de brands die deze user beheert.
- `md_account_kind = contact` — een geïmporteerd contact, géén inlogbaar account (B38).
- Mailvoorkeur: `newsletter_consent` · `mail_suppressed` · `digest_frequency` · `mail_basis`.
  `digest_frequency` = `daily` · `weekly` · `monthly` · `none`, default `weekly` (B18a).

---

## 6. Taxonomieën

| Mensentaal | Systeemnaam | Aantal (25-08-2026) |
|---|---|---|
| channel | `theme` | 18 |
| type | `material_category` | 11 |
| story-type | story-types | — |
| event-type | event-types | — |

Slug en label lopen op vier types uiteen — zie `begrippenlijst.md` §2. Een material draagt precies
één type en **maximaal drie channels**; vijf records overtreden die limiet op dit moment (vier met
vier channels, één met vijf).

---

## 7. Meetregels

**Voor elke sessie die iets telt of controleert.**

1. **Meet in de juiste laag.** Publiek veld → `wp/v2`. Bedrijfsgegevens → `md/v2/dashboard`.
   Gated content → de specifieke gated route. Niet gevonden in `wp/v2` betekent níét "bestaat niet".
2. **Controleer eerst of het veld gestript wordt** voordat je "leeg" concludeert. `vimeo_id` en de
   contactvelden op brand zijn de bekende gevallen; er kunnen er meer zijn.
3. **`User-Agent`-header is verplicht** — zonder wordt het verzoek geblokkeerd.
4. **Pagineren** met `per_page=100` en `page=`; `X-WP-Total` geeft het totaal. De API cap't op 100
   per pagina.
5. **Gebruik `cms.materialdistrict.com`.** Het frontend-domein `materialdistrict.com` geeft 503 op
   geautomatiseerde verzoeken (bot-blokkering).
6. **Filteren op meta-waarde via queryparameters werkt niet.** Volledig ophalen en client-side
   filteren.
7. **Slug-lookups (`?slug=…`) geven een lege array bij een ontbrekend record**, geen 404.
8. **Kun je een veld niet bereiken, zeg dat dan** — "niet meetbaar via de publieke API" is een
   geldige uitkomst. "Leeg" is dat niet, tenzij je in de juiste laag hebt gekeken.
9. **Honderd procent dezelfde waarde is verdacht.** Een veld dat op élk record identiek is, is even
   waarschijnlijk een samengestelde standaardwaarde als een gemeten feit. De uitzonderingen zijn het
   bewijs dat er echt iets is opgeslagen: `validUntil` ontbreekt op 12 van 3.257 en is dus opgeslagen;
   `source` kent geen enkele uitzondering en is daarmee onbeslist. Toegevoegd 09-09-2026.
10. **Onderscheid opslagvorm van uitleesvorm.** Onderstreepte sleutels (`_material_code`,
    `_brand_website`) zijn opslag; dezelfde naam zonder streepje is door de plugin samengesteld.
    Schrijf nooit naar de samengestelde vorm. Bij material staan beide vormen naast elkaar in de
    77 meta-sleutels. Toegevoegd 09-09-2026.
11. **Meet samengestelde velden op hun onderdeel, niet op hun naam.** `publication` en `membership`
    zijn objecten; `publication_status` en `tier` bestaan niet als losse sleutel. Toegevoegd
    09-09-2026.
12. **Een pagina voorbij de laatste geeft `400`.** Dat is het einde van de lijst, geen fout — laat
    een pagineerscript daar stoppen in plaats van afbreken. Toegevoegd 09-09-2026.

---

## Status

**v1.0 · 25-08-2026** — eerste vastlegging. Aanleiding: twee keer op één dag werd een bestaand veld
als ontbrekend gerapporteerd omdat er tegen de publieke API was gemeten. Eerst `vimeo_id` op talks,
daarna de contactvelden op brand. In beide gevallen ging er een levering of een mail aan een
teamlid mee de deur uit.

**Wat geverifieerd is:** alle publieke veldenlijsten (§2a, §3a, §4) zijn op 25-08-2026 uitgelezen
uit de live API. De dashboardvelden (§2b, §3c, §5a) komen uit `src/types/dashboard.ts` in de
frontend-repo — dat is het contract dat de frontend hanteert, dus het is betrouwbaar over wat de
endpoint teruggeeft. De membership- en statusvelden komen uit `docs/cms-plugin/database.md`.

**Wat níét geverifieerd is en door Johan bevestigd moet worden:**

1. **De exacte meta-sleutels achter de dashboardvelden.** Ik ken de namen in het API-contract
   (`vatNumber`, `chamberNumber`) maar niet met zekerheid de onderliggende `wp_postmeta`-sleutels.
   Voor een import is dat het verschil tussen werken en niet werken.
2. **Of er velden in de database staan die door géén enkele endpoint worden teruggegeven.** Dat kan
   ik principieel niet zien. Alleen een blik op `wp_postmeta` beantwoordt dat.
3. **De waardenlijst van `record_status`.** Het veld bestaat en is leeg; het importprotocol wil er
   `prospect` in schrijven (B47).
4. **Of `brand.primary_user_id` is gebouwd** of dat `_brand_email` nog de enige route is (§B7 stond
   als voorstel in `database.md`).

Deze vier gaten zijn expliciet gemarkeerd in plaats van ingevuld met een aanname. Zolang ze
openstaan, mag een importscript niet naar die velden schrijven.

**v1.1 · 09-09-2026** — hermeten tegen de live API, met één inhoudelijke herziening.

**§3b is gecorrigeerd, en dat was de belangrijkste.** Hier stond dat `publication_status` leeg was op
alle 3.246 materialen en dat de backfill nooit was gedraaid. Beide kloppen niet. Er bestaat geen los
veld `publication_status` — de status zit in `publication.source` — en de backfill ís gedraaid, rond
23-08-2026: `validUntil` staat op 3.245 van de 3.257 records, en de twaalf uitzonderingen zijn
allemaal ná die datum aangemaakt. Het werkelijke probleem is een ontbrekende standaardwaarde bij
publicatie, wat een ander en kleiner probleem is dan een niet-uitgevoerde bulkmutatie.

Deze fout heeft twee weken in het register en in dit document gestaan en is in drie sessies
aangehaald als de laatste blokkade vóór de septembercampagne, zonder dat iemand haar opnieuw had
gemeten. Vandaar §7 regel 9: honderd procent dezelfde waarde is een reden om door te vragen, niet om
te concluderen.

**Vier meetregels toegevoegd** (9 t/m 12), alle vier uit de metingen van deze week. De acht
oorspronkelijke zijn ongewijzigd.

**Aantallen bijgewerkt:** 3.257 materialen en 2.102 merken, tegen 3.246 en 2.093 op 25-08. Bij §2c
staat nu ook waaróm `tier` overal `free` is — dat was op 25-08 nog niet bekend en volgt uit de
e2e-ronde van 04-09.

**Openstaande vraag, nieuw:** de endpoint in §2b — `md/v2/dashboard/brands/{brandId}/profile` —
staat niet in de md/v2-routelijst zoals die op 09-09-2026 wordt teruggegeven. Onder `dashboard`
bestaat daar alleen `email-change/*`. De strekking van §2b verandert daar niet door (die velden
zitten niet in de publieke laag), maar het pad is onbevestigd. Niet stil gecorrigeerd, want van
buitenaf is niet te zien of de route hernoemd, verplaatst of nooit onder `md/v2` geregistreerd is
geweest.

**Waarom dit bestand bijna opnieuw was geschreven.** Op 09-09 bleek `datamodel.md` niet in de
moedermap te staan: de v9-zip van 25-08 is destijds aangehouden tot na de importtest en daarna
blijven liggen. Er lag al een volledig nieuw opgebouwde versie klaar toen het origineel alsnog werd
teruggevonden. Die is weggegooid — het origineel bevatte de dashboardvelden, de user-sectie, de
taxonomieën en drie meetregels (6, 7 en de cap op 100 per pagina) die in een hermeting niet zichtbaar
zijn. Een hermeting vervangt geen document dat ook contractkennis draagt.

Opgesteld door Claude, namens Jeroen.
