# Database-uitbreidingen — instructie voor Johan

**Datum:** 19 mei 2026
**Opsteller:** Claude (in afstemming met opdrachtgever)
**Status:** Voorstel ter bespreking
**Doel:** Alle WordPress-data-uitbreidingen die nodig zijn vóór de productiepagina's gebouwd worden, op één plek.

---

## Waarom database-first

Korte onderbouwing voor de volgordekeuze, zodat we niet alleen het *wat*
maar ook het *waarom* delen:

- **Het databaseschema is het contract.** Frontend-types, API-mappers,
  filters, formuliervalidatie, listing-pagina's en zoekindex hangen er
  allemaal aan. Als het contract halverwege verandert, propageert die
  verandering door elke laag heen.
- **Geen YAGNI hier.** De velden in dit document zijn geen speculatieve
  features — ze zijn al vastgelegd in eerdere sessies en komen één-op-één
  terug in de mockup en de productiepagina's die nu op de planning staan.
- **Migratiepijn schaalt met data.** Een kolom toevoegen aan een lege of
  bijna-lege tabel is triviaal. Diezelfde kolom toevoegen aan een
  productie-tabel met duizenden records vereist defaults, backfills en
  zorgvuldige deployment. Hoe eerder, hoe goedkoper.
- **Voorkomt dubbel werk aan frontend-zijde.** Pagina's bouwen rond gaten
  (placeholders, dummy-data, TODO's) betekent dat alles later opnieuw
  langs moet — types, mappers, components, tests.

---

## Voorgestelde volgorde

Vijf batches, in deze volgorde te implementeren in WordPress:

1. **Batch A — Membership en publicatie-statussen** (brand + material + user)
2. **Batch B — Brand-uitbreidingen** (bedrijfsgegevens voor de brand-info card)
3. **Batch C — Content-entiteit uitbreidingen** (material + talks, datacontract richting mockup)
4. **Batch D — Content-segmentatie** (article/story types)
5. **Batch E — Personal account billing** (bedrijfsadres + BTW/KvK voor personal memberships)

Batch A is het meest fundamenteel — alle andere batches en de hele
frontend leunen erop. Daarna kunnen B, C, D en E parallel of in
willekeurige volgorde.

---

## Batch A — Membership en publicatie-statussen

### A1. `brand.tier` (verplicht)

Membership-tier op brand-niveau. Bepaalt welke functionaliteit in het
brand-dashboard beschikbaar is en welke materiaal-statussen toegestaan
zijn.

**Type:** ENUM / string-veld
**Toegestane waarden:**

| Waarde | Betekenis |
|---|---|
| `free` | Geen actieve betalende relatie (default voor legacy brands) |
| `basic` | Basic-tier — €750/jaar |
| `plus` | Plus-tier — €1.500/jaar |
| `partner` | Partner-tier — €3.000/jaar |

**Default voor bestaande brands:** `free`
**Verplicht veld:** ja

### A2. `brand.tier_grandfathered` (optioneel)

Markeert brands op een afwijkend grandfathered-tarief (PRO 5 / PRO 10).

**Type:** ENUM / string-veld of nullable
**Toegestane waarden:** `null`, `pro_5` (€995/jaar), `pro_10` (€1.245/jaar)
**Default:** `null`

### A3. `brand.period_end_date` (optioneel)

Wanneer de huidige tier-periode afloopt. Alleen relevant voor
`member*`-statussen.

**Type:** datum
**Nullable:** ja (null voor `free`-brands)

### A4. `material.publication_status` (verplicht)

Statussen op materiaal-niveau. Bepaalt zichtbaarheid op listing-pagina's,
filtering, badges op detailpagina's en sortering. **Raakt overal door de
frontend.**

**Type:** ENUM / string-veld
**Toegestane waarden:**

| Waarde | Betekenis |
|---|---|
| `member` | Onder een tier-membership van de brand |
| `standalone_regular` | Losse publicatie — €250/jaar |
| `standalone_grandfathered` | Losse publicatie tegen grandfathered-tarief — €100/jaar |
| `legacy` | Historisch gepubliceerd materiaal, geen actieve betaling |
| `former_member` | Was lid, lidmaatschap beëindigd, materiaal blijft (re)activeerbaar |
| `former_standalone` | Was standalone, niet verlengd, materiaal blijft (re)activeerbaar |

**Default voor bestaande materialen:** `legacy`
**Verplicht veld:** ja

### A5. `material.period_end_date` (optioneel)

Wanneer status afloopt:
- Bij `legacy`: offline-datum
- Bij `standalone_*`: jaarperiode-einde
- Bij `member`: niet relevant (volgt `brand.period_end_date`)

**Type:** datum
**Nullable:** ja

### A6. Mutual exclusion-regel (constraint of UI-niveau)

Een brand kan **óf** een tier-membership hebben (`basic`/`plus`/`partner`,
alle materialen onder dat membership-quota), **óf** `free`-status met
standalone-publicaties — nooit beide tegelijk.

| `brand.tier` | Toegestane `material.publication_status` |
|---|---|
| `free` | `legacy`, `standalone_*`, `former_*` |
| `basic` / `plus` / `partner` | alleen `member` |

**Beslissing nodig (Johan):** dwingen we dit als harde constraint af in
WordPress (bv. via `save_post`-hook), of vertrouwen we op de UI om dit te
voorkomen?

### A7. `user.membership_status` (Insider)

Reader-tier op user-niveau, parallel aan brand-tier maar volledig
gescheiden.

**Type:** ENUM / string-veld
**Toegestane waarden:** Stripe-conforme statussen — `inactive`, `active`,
`trialing`, `past_due`, `canceled`
**Default voor bestaande users:** `inactive`
**Opmerking:** `legacy` is hier *geen* geldige waarde — `legacy` slaat alleen
op brand-membership (historische publicatie-relatie), niet op Insider.

### A8. `user.connected_brands`

Een user kan aan meerdere brands gekoppeld zijn, en elk met eigen
membership-status. Dit moet in de login-respons en `/me`-respons als array
worden meegegeven (per brand: `id`, `name`, `slug`, `tier`,
`tier_grandfathered`, `period_end_date`).

**Vorm in API-output:**

```json
{
  "user": {
    "membership": { "status": "active", ... },
    "connected_brands": [
      { "id": 123, "name": "...", "tier": "plus", ... }
    ]
  }
}
```

### A9. WordPress-rollen (parkeren — niet voor v1)

`user.roles: string[]` zit al in de auth-respons. Voor v1 doen we daar
nog niks mee in de frontend. Wel alvast bedenken welke rollen Johan in WP
gaat definiëren (`subscriber`, `brand_manager`, `editor`,
`administrator`), zodat we straks niet vastlopen op naamgeving.

---

## Batch B — Brand-uitbreidingen

Deze velden zijn nodig voor:
- De brand-info card in de material-detail-sidebar
- De brand-detail-pagina zelf
- De brand-listing met aantallen en metadata

### B1. `brand.country`

ISO-landcode of landnaam. Gebruikt op brand-cards, material-cards
(`m.country` regel onder brand-naam) en brand-info card.

**Type:** string
**Verplicht:** aanbevolen (default fallback in mapper als leeg)

### B2. `brand.city`

Vestigingsplaats. Getoond in brand-info card op material-detail en op
brand-detail-pagina.

**Type:** string
**Nullable:** ja

### B3. `brand.address`

Volledig vestigingsadres. Getoond op brand-detail-pagina.

**Type:** string of long-text
**Nullable:** ja

### B4. `brand.website`

URL naar de brand-website. Getoond als klikbare link op brand-info card
en brand-detail.

**Type:** URL
**Nullable:** ja

### B5. `brand.founded`

Oprichtingsjaar.

**Type:** integer (4 cijfers, bv. 1923) of datum
**Nullable:** ja

### B6. `brand.employees`

Aantal werknemers, óf een banded waarde (bv. `1-10`, `11-50`, `51-200`,
`201-500`, `500+`).

**Beslissing nodig (Johan + opdrachtgever):** exact getal of bands? Bands
zijn praktischer (privacy, makkelijker invulbaar door brands zelf),
exacte getallen zijn flexibeler voor sortering/filtering. Mijn voorstel:
**bands**.

**Type:** ENUM / string-veld (bij keuze bands) of integer

### B7. `brand.contact_email` versus `brand.primary_user_id`

In een eerdere sessie is besloten dat het persoonlijke contactpersoon-
mailadres óf een tekstveld op de brand blijft (huidige situatie), óf een
echte user-relatie wordt. Voor de claim-flow (zie legacy-conversie
strategie) hebben we de user-relatie nodig.

**Voorstel:**
- `brand.contact_email` blijft bestaan als fallback (string, voor brands
  zonder gekoppelde user).
- `brand.primary_user_id` wordt een nieuwe relatie naar `wp_users` —
  null als er geen primary user is.
- Routing van sample-aanvragen: als `primary_user_id` gezet, gebruik de
  user-email; anders fallback op `contact_email`; anders het generieke
  brand-email.

### B8. `brand.material_count` (afgeleid, geen kolom)

Op brand-cards en de brand-info card willen we het aantal gepubliceerde
materialen tonen. Dit hoeft géén kolom te zijn — kan als `COUNT(*)` in de
API-mapper.

**Geen actie nodig, alleen documenteren** dat dit in de brand-mapper
gerendered moet worden.

---

## Batch C — Content-entiteit uitbreidingen (material + talks)

### Sub-batch C-MAT: Material

Deze velden zijn afkomstig uit de pre-flight-analyse van de material-
detail-pagina. De mockup veronderstelt rijkere data dan momenteel
beschikbaar is.

### C1. `material.material_code`

Productcode (bv. `WOO1234`, `TEX4421`). Getoond op material-cards naast
de brand+country-regel, en op de detail-header.

**Type:** string
**Verplicht:** aanbevolen
**Opmerking:** mogelijk al aanwezig — verifiëren.

### C2. Property-groepen (Sensorial / Technical / Environmental / Content)

De huidige `MaterialProperties` is een platte structuur. De mockup groepeert
in 4 categorieën met in totaal ~27 velden:

| Groep | Aantal velden | Voorbeelden |
|---|---|---|
| Sensorial | 8 | Color, Texture, Translucency, etc. |
| Technical | 7 | Hardness, Density, Fire resistance, etc. |
| Environmental | 9 | Biobased %, Recycled %, Renewable, Climate neutral, etc. |
| Content | 3 | Main material, Composition, etc. |

**Beslissing nodig (Johan + opdrachtgever):**
- Eén ronde tabel met definitieve groep-toewijzing per veld
- Welke 9 environmental-velden krijgen we exact?
- Hoe modelleren we dit in WP — apart meta-veld per property of een groep-
  prefix in de meta-key?

**Mijn voorstel:** per property een meta-veld met een vaste prefix
(`prop_sensorial_color`, `prop_environmental_biobased`, etc.) zodat de
mapper ze deterministisch kan groeperen.

### C3. `material.videos[]`

Nu één URL (`videoUrl`). Mockup verwacht een array van objecten met
`url`, `title`, optioneel `thumbnail`.

**Voorstel:** repeater-veld in WP met velden `url` (verplicht), `title`
(optioneel), `thumbnail` (optioneel).

### C4. `material.brochures[]`

Nu losse velden (`datasheetUrl`, `epdUrl`, `productUrl`). Mockup
verwacht een array met type-aanduiding en optionele Insider-flag.

**Voorstel:** repeater-veld in WP met:
- `type` (ENUM: `datasheet`, `epd`, `brochure`, `product_sheet`, `other`)
- `url` (verplicht)
- `title` (optioneel)
- `file_size` (optioneel — voor UI)
- `insider_only` (boolean, default false)

### C5. `material.tags[]` (keywords) — exposure

`taxonomies.tags` bestaat al als array van ID's. Wat ontbreekt: de mapper
levert nog geen leesbare labels door. Dit is een **API-mapper-uitbreiding**,
geen nieuwe DB-kolom. Johan moet de tags-resolve toevoegen aan de
material-response zodat slug+label samen meekomen.

### C6. `material.channels[]`

Channel-tags die ook op listings en cards getoond worden. Bestaat als
taxonomy maar wordt nog niet als expliciet veld geretourneerd in de
material-response.

**Voorstel:** als `taxonomies.channels` met `{id, slug, label}`-objects in
de API-output.

### C7. Sustainability-flags (voor card-badges)

Voor de groene badges op material-cards ("Biobased", "Recycled", "Toxin
free", "Climate neutral", "Sustainably produced", "Reduces energy use").

**Voorstel:** boolean-meta-velden op material:
- `prop_biobased` (bool)
- `prop_recycled` (bool)
- `prop_climate_neutral` (bool)
- `prop_toxin_free` (bool)
- `prop_sustainably_produced` (bool)
- `prop_reduces_energy_use` (bool)
- `prop_renewable` (bool, bestaat al)

Numerieke percentages mogen aanvullend (`prop_biobased_content` als
integer 0-100) voor verdere filtering.

### C8. `prev`/`next` mechanisme

De detail-pagina toont vorige/volgende material. Hiervoor is een
deterministische volgorde nodig.

**Voorstel:** geen DB-kolom — wel een API-endpoint dat op basis van een
referentie-material (en optioneel filter-context) het vorige en volgende
ID retourneert. Bv.:
`GET /wp-json/md/v2/materials/{slug}/neighbors?context={filterhash}`

---

### Sub-batch C-TALK: Talks

Talks krijgt drie nieuwe velden en één relatie-uitbreiding.

#### C9. `talk.date`

Datum waarop de talk heeft plaatsgevonden (of plaatsvindt). Nodig op
listings (sortering, "Latest talks"-secties), op de detail-meta-regel en
voor archief-filtering ("Past talks" versus "Upcoming talks").

**Type:** datum (DATETIME als ook tijd relevant is voor live-talks; anders
DATE)
**Verplicht:** ja
**Default voor bestaande talks:** publicatiedatum als backfill, te
corrigeren door redactie waar nodig.

#### C10. `talk.duration_seconds`

Duur van de talk in seconden. Getoond op cards en in de detail-header
(geformatteerd als `42 min` of `1u 12min`).

**Type:** integer (seconden)
**Nullable:** ja (mag leeg blijven voor talks zonder vastgelegde duur)

**Bron-strategie — voorstel:**
1. **Primaire bron: handmatig veld in WP**, zodat het altijd werkt en
   redactie controle heeft.
2. **Optionele auto-fill via Vimeo-metadata.** Als de talk een
   `talk.vimeo_id` of `talk.video_url` heeft, kan een
   WP-cron of save-hook de duur ophalen via de Vimeo-API en het veld
   vullen. Bij conflict: handmatige waarde wint.

**Beslissing nodig (Johan):**
- Bestaat er al een gestructureerd Vimeo-veld op talk, of zit de URL in
  een vrije tekstveld? Voor auto-fill is een aparte `vimeo_id` of een
  gevalideerd `video_url` praktischer.
- Is auto-fill in v1 reëel of leveren we eerst alleen het handmatige
  veld op en houden we Vimeo-koppeling als follow-up?

**Mijn voorstel voor v1:** handmatig veld toevoegen. Vimeo-auto-fill
parkeren als latere optimalisatie (eigen open issue).

#### C11. `talk.speakers[]` (relatie — bestaat al, verifiëren)

Een talk kan al gekoppeld worden aan personen/speakers. Verifiëren dat
deze relatie ook in de API-output zit met `{id, name, slug, role,
photo}` per speaker — niet alleen als ID's.

**Beslissing nodig (Johan):** is de huidige speaker-relatie 1:1 of N:N?
Mockup gaat uit van meerdere speakers per talk (panel-discussions). Als
het nu 1:1 is, breiden we uit naar N:N.

#### C12. `talk.company` of `talk.companies[]` (nieuw)

Naast speakers willen we ook een bedrijf aan een talk kunnen koppelen.
**Hier ligt een ontwerpkeuze die we expliciet moeten maken voordat Johan
implementeert.**

**Optie 1 — Hergebruik bestaande `brand`-entiteit**
- Voordeel: één bron van waarheid. Brands hebben al logo, beschrijving,
  website, materialen. Een talk kan dan natuurlijk doorlinken naar de
  brand-pagina en omgekeerd.
- Nadeel: niet elk bedrijf dat een talk geeft is een brand op
  MaterialDistrict. Sommige sprekers komen van architectenbureaus,
  onderzoeksinstellingen, universiteiten — die hebben geen plek in de
  brand-database. We zouden óf alle bedrijven als "brand" moeten
  bestempelen (vervuilt brand-listings), óf alleen koppelen waar mogelijk
  en de rest als vrij tekstveld laten (inconsistente data).

**Optie 2 — Nieuwe bredere `company`-entiteit**
- Voordeel: kan elke organisatie modelleren (brand, bureau, instelling).
  Brands kunnen dan een sub-type van company worden, of een 1:1-koppeling
  hebben (`brand.company_id`). Talks koppelen aan `company`, niet aan
  `brand`.
- Nadeel: schema-uitbreiding met meer impact. Bestaande brand-data moet
  óf gemigreerd worden, óf de twee entiteiten blijven naast elkaar
  bestaan (wat eigen complexiteit oplevert).

**Optie 3 — Pragmatische tussenoplossing (mijn voorstel voor v1)**
- Voeg `talk.company_name` (string) toe als verplicht veld voor de
  bedrijfsnaam.
- Voeg `talk.company_brand_id` (nullable foreign key naar brand) toe
  voor het geval het bedrijf óók een brand op MD is. Als gevuld, linkt
  de UI door naar de brand-pagina; als leeg, toont alleen de naam.
- Geen schema-uitbreiding nu, geen vervuiling van brand-listings, en
  later kan deze structuur evolueren naar Optie 2 zonder breaking
  changes.

**Beslissing nodig (opdrachtgever + Johan):** Optie 1, 2 of 3?

#### C13. `talk.channels[]` — exposure

Net als bij material en article: channels bestaan als taxonomy, maar
moeten expliciet in de API-output verschijnen als `{id, slug, label}`
objects.

#### C14. `talk.insider_only`

Gating-flag die bepaalt of de talk alleen toegankelijk is voor Insider-
members. Analoog aan `article.insider_only` (zie D2), maar met
afwijkende default: voor talks geldt insider-only als regel, niet als
uitzondering.

**Type:** boolean
**Default:** `true`
**Verplicht:** ja (default vult automatisch in)

**Migratie van bestaande talks:** alle bestaande talks krijgen
`insider_only = true` als backfill. Redactie kan handmatig openen waar
gewenst (bv. promotionele talks die juist breed bereikt moeten worden).

**Frontend-gedrag (al gespecificeerd, ter referentie):**
- Niet-ingelogde users: zien card/listing-item met Insider-mark, klik
  toont InsiderGate met teaser + upgrade-CTA.
- Ingelogde non-Insider users: zien teaser, gate toont upgrade-CTA met
  optie "Already an Insider? Sign in".
- Insider-members: volledige toegang.

**Opmerking:** dit veld én `article.insider_only` (D2) moeten beide
betrouwbaar door de API geleverd worden. Mocht D2 nog niet ontsloten
zijn (zie open vraag bij D2), pak ze dan in één keer mee — zelfde patroon,
zelfde mapper-aanpassing.

---

## Batch D — Content-segmentatie

### D1. `article.type` (story-types)

Articles/stories worden gesegmenteerd in subtypen. Op de listing wordt
hierop gefilterd, en op de detail-pagina krijgen ze een category-pill in
eigen kleur.

**Type:** ENUM / string-veld (of WP-taxonomy `story_type`)
**Toegestane waarden:**

| Waarde | Betekenis |
|---|---|
| `news` | Algemeen nieuws |
| `process` | Procesverhaal |
| `people` | Persoonsverhaal / interview |
| `projects` | Projectverhaal |
| `collaborations` | Samenwerkingsverhaal |

**Beslissing nodig (Johan + opdrachtgever):** zijn dit de definitieve 5
types, of komen er nog bij? Kunnen we dit als taxonomy modelleren zodat
het uitbreidbaar blijft zonder code-deploy?

**Default voor bestaande articles:** `news` (als migratie-default)

### D2. `article.insider_only` — exposure

Insider-flag bestaat al maar wordt nog niet betrouwbaar door de API
geleverd. Sessie 6 was hierop geblokkeerd.

**Vraag aan Johan:** is dit meta-veld nu wel/niet ontsloten? Zo nee, dit
moet door de mapper meekomen.

### D3. `article.channels[]`

Channel-tags op articles (witte pills onderaan de thumb). Bestaat als
taxonomy maar moet expliciet in de API-output.

**Voorstel:** zelfde aanpak als bij C6 — `taxonomies.channels` met
`{id, slug, label}`-objects.

### D4. `article.reading_time_minutes` (optioneel)

Getoond op cards en in de detail-meta-regel ("4 min read"). Kan ook
afgeleid worden uit body-lengte, maar een expliciet veld geeft redactie
controle.

**Voorstel:** optioneel integer-veld; als leeg, frontend rekent uit op
basis van 200 wpm.

### D5. `article.related[]`

Mockup toont gerelateerde artikelen, materialen en talks. Bestaat dit al
als veld op article-niveau, of moeten we het via taxonomie-overlap
inferren?

**Beslissing nodig (Johan):** expliciete relatie of inferentie?

---

## Batch E — Personal account billing

Naast brand-memberships komen er ook personal memberships voor
individuele professionals. Deze users moeten hun factuuradres kunnen
markeren als bedrijfsadres met bijbehorende fiscale velden — zodat
WooCommerce de BTW-afhandeling correct doet.

Adresinformatie bestaat al op personal accounts; we breiden alleen uit
met een paar extra velden.

### E1. `user.billing_is_company` (verplicht)

Checkbox die aangeeft of het factuuradres een bedrijfsadres is. Bepaalt
of de overige E-velden zichtbaar/verplicht worden in de UI.

**Type:** boolean
**Default:** `false`

### E2. `user.billing_company_name`

Bedrijfsnaam voor de factuur.

**Type:** string
**Verplicht:** ja als `billing_is_company` = `true`, anders null
**Nullable:** ja

### E3. `user.billing_vat_number`

BTW-nummer (Europees formaat, bv. `NL123456789B01`).

**Type:** string
**Verplicht:** ja als `billing_is_company` = `true`, anders null
**Nullable:** ja

**Validatie in v1:** alleen format-validatie (regex per EU-land). Géén
live-validatie tegen externe databases — zie E5.

### E4. `user.billing_coc_number`

CoC-nummer (Chamber of Commerce-registratie).

**Type:** string
**Verplicht:** nee — altijd optioneel
**Nullable:** ja

**Opmerking:** alleen relevant voor Nederlandse bedrijven. Voor
buitenlandse bedrijven blijft dit veld leeg. Geen aparte logica nodig in
v1.

### E5. VIES-validatie (latere release — niet v1)

Idealiter wordt het BTW-nummer gevalideerd tegen de Europese
VIES-database, zodat WooCommerce kan beslissen of BTW in rekening
gebracht moet worden (intracommunautaire levering).

**Voor v1:** alleen het veld opslaan, geen live-validatie.
**Voor latere release:**
- Server-side validatie via VIES-SOAP-endpoint
  (`http://ec.europa.eu/taxation_customs/vies/services/checkVatService`)
- Cache van validatie-resultaat met TTL (24-48u)
- Bij geldig BTW-nummer + ander EU-land dan NL: WooCommerce
  BTW-afhandeling op "reverse charge" zetten

**Voorstel:** in deze fase alleen de velden + checkbox toevoegen, en
een open issue noteren voor VIES-integratie. Wanneer die release gepland
wordt, valt het meeste werk aan Johan's kant (WP-plugin of custom
endpoint).

### E6. Integratie met WooCommerce billing-fields

WooCommerce heeft eigen billing-velden (`billing_first_name`,
`billing_company`, `billing_address_1`, etc.). Twee paden:

**Pad A — Eigen MD-velden naast WC-billing.**
Onze velden (`billing_is_company`, `billing_vat_number`, etc.) staan los
van WooCommerce. Bij checkout mappen we ze naar WC-velden via een hook.

**Pad B — Direct in WC-billing-meta integreren.**
We gebruiken `billing_company` (bestaat al in WC), en voegen alleen
`billing_vat_number`, `billing_coc_number` en `billing_is_company` toe
als WC-meta. Geen aparte MD-namespace.

**Voorstel:** Pad B. Vermijdt dubbele opslag en houdt de checkout-flow
consistent met standaard WooCommerce.

**Beslissing nodig (Johan):** akkoord met Pad B?

---

## Wat *niet* in deze batches zit

Bewust niet meegenomen, om scope-creep te voorkomen:

- **Stripe-prijzen.** Blijven in code-config
  (`src/lib/config/membership.ts`). Database verwijst alleen naar *welke*
  prijs van toepassing is (via de status-velden), niet naar de waarde
  zelf.
- **Pre-aangemaakte user-accounts voor claim-flow.** Aparte sessie,
  aparte instructie. Geen DB-werk vandaag.
- **Webhook-event-log-tabel.** Aanbevolen voor productie-monitoring,
  maar later.
- **Audit-log van tier-wijzigingen.** Mooi-om-te-hebben, niet
  v1-blocker.
- **VIES-validatie van BTW-nummers.** Veld komt er nu wel; live-validatie
  tegen de Europese database is een latere release (zie E5).
- **Vimeo-auto-fill van talk-duur.** Handmatig veld is v1-werk;
  auto-ophalen via Vimeo-API is follow-up (zie C10).

---

## Volgorde van implementatie (suggestie)

1. **Batch A eerst** — alles hangt eraan, en de mutual-exclusion-regel
   moet vroeg getest worden.
2. **Daarna B, C, D en E parallel.** Geen onderlinge afhankelijkheden.
3. **Per batch:** Johan implementeert → levert testdata van minstens 5
   records met variatie → ik valideer in de mapper en types → akkoord
   voor productiepagina's.

---

## Vragen die ik nog terug verwacht

**Aan Johan:**
1. Welke environmental/sustainability-velden bestaan al in WP-meta? Datatype? Vulgraad?
2. Bestaat er een "Application" facet (naast Material Category)?
3. Property-groepen — is er een canonieke mapping per veld of bouwen we die nu?
4. Story-types: definitieve 5 of meer? Taxonomy of ENUM?
5. `article.related[]`: expliciet of inferentie?
6. `brand.employees`: bands of exact?
7. Mutual exclusion-regel (A6): harde constraint of UI-niveau?
8. Talks-Vimeo (C10): bestaat er al een gestructureerd `vimeo_id`/`video_url`-veld? Auto-fill in v1 of follow-up?
9. Talks-speakers (C11): is de huidige speaker-relatie 1:1 of N:N?
10. Personal billing — WooCommerce-integratie (E6): akkoord met Pad B (in WC-meta-namespace)?

**Aan opdrachtgever:**
1. Akkoord op de vijf-batch-volgorde?
2. Akkoord op de keuze `brand.employees` als bands?
3. Akkoord op `story_type` als WP-taxonomy (uitbreidbaar) vs ENUM?
4. Talks-company-koppeling (C12): Optie 1 (hergebruik brand), Optie 2 (nieuwe company-entiteit) of Optie 3 (pragmatische tussenoplossing — mijn voorstel)?

---

*Einde document.*
