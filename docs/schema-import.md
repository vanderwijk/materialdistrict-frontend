# Schema-uitbreiding voor imports

> **Bouwspecificatie**, geen normdocument. Het *waarom* staat in `besluitenregister.md` (B37, B41,
> B43, B44, B46–B49, B80–B87) en `importprotocol.md` v4.8; hier staat alleen wat er gebouwd moet
> worden.
>
> **Alles in één keer.** Deze velden hangen aan elkaar: herkomst zonder batch-ID is niet terug te
> draaien, e-mailstatus zonder datum veroudert stil, een relatie zonder grond is later niet te
> beoordelen. Gefragmenteerd bouwen levert drie migraties op een gevulde database op.
>
> **Vóór de eerste grote import.** Achteraf is dit een migratie op miljoenen gevulde velden.
>
> Versie 1.0 · 25-08-2026.

---

## 0. Wat er eerst gemeten wordt

Het migratiescript begint met een inventarisatie en maakt alleen aan wat ontbreekt. Vier dingen zijn
van buitenaf niet vast te stellen en worden dus door het script zelf opgezocht, niet aangenomen:

1. De `wp_postmeta`-sleutels achter `vatNumber`, `chamberNumber`, `email` en `phone` op brand.
2. De vulgraad daarvan over alle brands.
3. Of `record_status` al waarden draagt (meting 25-08-2026: leeg op alle 2.093).
4. Of `brand.primary_user_id` bestaat, of dat `_brand_email` de enige route van persoon naar merk is.

Het script draait eerst met `--dry-run` en schrijft dan niets.

---

## 1. Herkomst per veld — eigen tabel, niet in postmeta

**Waarom een tabel en geen meta.** Per veld zijn zes gegevens nodig. Als postmeta zou dat zes rijen
per veld per record kosten — bij 2.093 brands en tien importvelden al 125.000 rijen, en niet
fatsoenlijk te bevragen. Eén tabel is kleiner, indexeerbaar en direct te filteren.

**`md_field_provenance`**

| Kolom | Type | Toelichting |
|---|---|---|
| `id` | bigint, PK | |
| `entity_type` | enum `brand` · `user` | |
| `entity_id` | bigint, index | |
| `field` | varchar(64), index | naam van het veld, bijv. `address` of `vat_number` |
| `source` | varchar(32), index | zie §6 |
| `source_date` | date, **nullable** | het moment waarop de waarde géldig was, niet van aanlevering (B49) |
| `imported_at` | datetime | wanneer weggeschreven |
| `batch_id` | varchar(32), index | zie §4 |
| `locked_by` | bigint, nullable | user-ID van wie het veld bewust corrigeerde |
| `locked_at` | datetime, nullable | |

Uniek op `entity_type + entity_id + field` — één rij per veld, die wordt bijgewerkt.

**Twee regels die hierop rusten.**

- Is `locked_by` gevuld, dan raakt geen enkele import dat veld. Niet overschrijven, niet leegmaken,
  niet aanvullen (B48).
- Bij een conflict wint de sterkste bron (B42); bij gelijke sterkte de recentste `source_date`. **Een
  lege `source_date` verliest altijd op datum.**

---

## 2. Bestaande data — `source = legacy`

Alles wat nu in de database staat krijgt bij de migratie een provenance-rij per gevuld importveld:

- `source = legacy`
- `source_date = NULL` — **geen migratiedatum invullen.** Dat zou beweren dat de waarde vandaag
  geldig was, en dan wint elke bestaande waarde vanaf nu van elke bron, ook van een factuuradres
  waarop daadwerkelijk betaald wordt.
- `imported_at` = het moment van migratie
- `batch_id = legacy-migratie-2026-08`

**Plus één record-veld: `legacy_modified`.** Daarin gaat `post_modified` uit `wp_posts` (voor users:
wat de plugin bijhoudt, anders `user_registered`). Dat is een eerlijke bovengrens — *deze waarde is
hoogstens zo oud* — en bewust een ander veld dan `source_date`, zodat niemand het als
veldgeldigheid leest.

De spreiding maakt dit bruikbaar: van de 2.093 brands zijn er 48 sinds 2004 niet aangeraakt en 123
dit jaar nog gewijzigd; 1.135 zijn sinds aanmaak nooit meer gewijzigd.

Gevolg: een legacy-waarde wordt nooit door een lege cel overschreven (B37 regel 4), maar verliest bij
een botsing van een benoemde bron mét datum. Dat is de gewenste richting.

---

## 3. Velden op het record

### 3a. Op brand én user

| Veld | Type | Waarden | Default |
|---|---|---|---|
| `record_status` | enum | `prospect` · `active` · `archived` · `rejected` | `active` bij bestaand, `prospect` bij import |
| `created_by_batch` | varchar(32), nullable | het batch-ID dat dit record aanmaakte | leeg bij bestaande records |
| `legacy_modified` | datetime, nullable | zie §2 | |

`verification_status` en `last_checked` bestaan al (B40) en blijven ongewijzigd.

**`created_by_batch` is niet cosmetisch.** Het is de grens waarlangs terugdraaien records mág
verwijderen (B80). Zonder dit veld valt een terugdraaiscript terug op een datumgrens of een
namenlijst — precies waar het script van augustus 2026 op stukliep.

### 3b. Alleen op user

| Veld | Type | Waarden | Default |
|---|---|---|---|
| `rol` | enum, **nullable** | `specifier` · `manufacturer` | **leeg** |
| `rol_reden` | varchar(120), nullable | vrije tekst, bijv. `site onbereikbaar` | |
| `rol_pogingen` | tinyint | aantal mislukte scanpogingen | 0 |
| `email_status` | enum | zie §5 | `unchecked` |
| `email_status_date` | date, nullable | wanneer de status is vastgesteld | |
| `besluitniveau` | enum, nullable | zie hieronder | leeg |
| `besluitniveau_date` | date, nullable | wanneer opgegeven | |
| `loopbaanfase` | enum, nullable | `student` · `starter` · `ervaren` | leeg |

**Leeg is een geldige waarde voor `rol`** (B85). Een persoon zonder rol gaat in geen enkele mailing.
Een `rol_reden` die een technische mislukking beschrijft, wordt na oplopende tussenpozen opnieuw
geprobeerd; na drie pogingen wordt het een menselijke vraag.

Mailtoestemming staat hier bewust **niet** bij: die leeft op het bestaande user-record
(`newsletter_consent`, B15) en wordt door een import nooit geschreven (B86). Status en toestemming
zijn twee dingen — `valid` zegt dat het adres bestaat, niet dat je mag mailen.

#### Besluitniveau

| Waarde | Betekenis |
|---|---|
| `beslist_zelf` | mag de materiaalkeuze zelf maken |
| `beslist_mee` | beslist in samenspraak met collega's |
| `adviseert` | adviserende rol |
| `voert_uit` | uitvoerende rol |
| `nvt` | nog niet van toepassing |

**Loopbaanfase is een aparte as, geen zesde waarde.** In de oude beursformulieren stond
"ik ben trainee/student" tússen de besluitniveaus; dat meet twee verschillende dingen en dwingt 779
mensen te kiezen tussen "ik ben student" en "ik adviseer". Een afstudeerder die materialen
voorschrijft voor een echt project is allebei. Loopbaanfase is bovendien grotendeels af te leiden uit
het e-maildomein (`student.hku.nl`).

**Niet uitvragen bij registratie.** De registratiepagina is bewust laagdrempelig — een verplichte
vraag over besluitbevoegdheid kost aanmeldingen en levert slechtere antwoorden op. Uitvragen bij de
**eerste sample-aanvraag**: daar is de vraag logisch en het antwoord eerlijker.

**Altijd met datum.** Bevoegdheid verandert; wie in 2023 uitvoerde, beslist in 2026 misschien mee.
Zonder datum is over twee jaar niet te zien of het antwoord nog klopt.

`profession` en `industry` bestaan al als keuzelijst op het profiel. Besluitniveau is de derde as en
meet iets anders: *wat je bent*, *in welke sector*, en *hoeveel invloed je hebt*. De toegestane
waarden van de eerste twee rollen uit de inventarisatie (§0).

#### Mailvelden — twee gescheiden dingen

| Veld | Type | Toelichting |
|---|---|---|
| `newsletter_consent` | bestaand | alleen door de persoon zelf gezet (B86) |
| `zakelijke_attendering` | datetime, nullable | wanneer eenmalig zakelijk geattendeerd |
| `zakelijke_attendering_voor` | varchar(64), nullable | waarvoor, bijv. `samplestore-uitnodiging` |

Een eenmalige zakelijke attendering is iets anders dan iemand abonnee maken. Het systeem moet die
twee uit elkaar kunnen houden, anders glijdt het ene in het andere. **Eén harde regel: wie zich ooit
heeft afgemeld (`email_status = unsubscribed`) krijgt ook de eenmalige mail niet.**

### 3c. Alleen op brand

| Veld | Type | Waarden |
|---|---|---|
| `brand_type` | enum, nullable | `fabrikant` · `producent` · `merkeigenaar` · `importeur` · `agent` · `handelaar` |
| `bewijssoort` | enum, nullable | `bestaand_merk` · `beursdeelname` · `koopbewijs` · `zelfgerapporteerd` · `sitescan` |

`brand_type` is een etiket en nooit een toelatingsdrempel (B82). `bewijssoort` legt vast waaróp een
prospect is aangemaakt en wordt nooit weggemiddeld, zodat later te filteren is op "alleen de merken
die uit een beursdeelname komen".

---

## 3d. Bevindingen, geen oordelen

**Dit is de belangrijkste ontwerpkeuze in dit document.** De sitescan schrijft nu een *conclusie* weg
(`manufacturer` of `specifier`). Daarmee is de onderliggende waarneming verdwenen, en dan is elke
volgende vraag — verlegt Jeroen de duurzaamheidslat, of komt er een tweede platform bij — alleen te
beantwoorden door 331 sites opnieuw op te halen.

Dus: sla op **wat de scan zag**, en leid het oordeel daaruit af.

**`md_brand_finding`** — één rij per beoordeling, met het batch-ID erbij zodat een herbeoordeling de
oude niet overschrijft maar ernaast komt.

| Kolom | Type | Waarden |
|---|---|---|
| `brand_id` | bigint, index | |
| `laag` | enum | `grondstof` · `materiaal` · `product` · `dienst` |
| `ruimtelijk_domein` | bool | |
| `duurzaam_argument` | bool | |
| `duurzaam_bewijs` | text, nullable | de zin uit de site waarop het steunt |
| `materiaal_is_koopargument` | bool, nullable | alleen relevant bij `laag = product` |
| `bron_url` | varchar(255) | welke pagina is gelezen |
| `gescand_op` | datetime | |
| `scan_status` | enum | `gelezen` · `onbereikbaar` · `leeg` |
| `batch_id` | varchar(32) | |

**Kwalificatie wordt afgeleid, niet opgeslagen.**

- **MaterialDistrict:** `laag ∈ (grondstof, materiaal)` én `ruimtelijk_domein` én
  `duurzaam_argument` — of `laag = product` mét `materiaal_is_koopargument` (B83).
- **Sample.Store:** `laag = materiaal` én `ruimtelijk_domein`. **Zonder de
  duurzaamheidsclausule**, en zonder de grondstof- en productlaag: daar wordt de grondstof nooit als
  sample aangeboden, en het gaat om sampleerbaar materiaal dat tot een productkeuze leidt.

Dat is letterlijk één regel verschil tussen de twee platforms. Uit één bezoekersbestand leverde dat
34 bedrijven op die MaterialDistrict afwijst en die voor Sample.Store kandidaat zijn — De Beer Verf,
Harinck (aluminium gevelbekleding), Mill Panel, Cross Trade (hout).

**`scan_status` is geen oordeel.** Een timeout of lege pagina is een toestand die opnieuw wordt
geprobeerd (B85), niet een bevinding dat het bedrijf niet kwalificeert.

## 3e. Accreditatiesignalen op de user

Sample.Store accrediteert samplers; MaterialDistrict doet dat niet — daar kan iedereen een account
maken. De accreditatie leunt op zes beslisregels, en de signalen die daarvoor nodig zijn worden bij
een import toch al verzameld. Sla ze op als **signaal**, niet als uitkomst.

| Signaal | Waar het vandaan komt |
|---|---|
| `domeinsoort` | `bedrijf` · `vrij` · `onderwijs` · `platform`, afgeleid uit het e-maildomein |
| `sector` | bestaand veld / bronbestand — antwoordt op "actief in de gebouwde omgeving" |
| `besluitniveau` | §3b — antwoordt direct op "invloed op materiaalbeslissingen" |
| `organisatie` · `functie` | bestaand profiel |

De accreditatie-uitkomst is een **afleiding met drie waarden**: `accrediteren` · `verifiëren` ·
`handmatig`. Nooit handmatig gezet, altijd herleidbaar, en opnieuw af te leiden als de regels wijzigen.

*Meting op het MDU2023-bezoekersbestand: 2.873 van de 4.317 personen hebben een zakelijk
e-maildomein, `sector` is op elke rij gevuld, en `Bevoegdheid` is op alle 4.327 rijen ingevuld —
1.999 beslissen zelf, 931 in samenspraak, 400 adviseren. Ruwweg drieduizend mensen kunnen daarmee op
signalen alleen door de AI-poort.*

**Personen zijn geen bedrijfsgegevens.** Bedrijfsdata is openbaar en kan zonder meer beide platforms
voeden. Contactpersonen hebben hun gegevens bij MaterialDistrict achtergelaten; doorgifte naar een
andere rechtspersoon is een aparte afweging en geen technische kwestie.

---

## 4. Batches en rijen

**`md_import_batch`**

| Kolom | Type | Toelichting |
|---|---|---|
| `batch_id` | varchar(32), PK | bijv. `visitor-mdu2023-20260825-01` |
| `bron` | varchar(32) | zie §6 |
| `brondatum` | date | door Jeroen opgegeven (B73) |
| `editie` | varchar(32), nullable | bijv. `MDU2023` |
| `bestandsnaam` | varchar(255) | |
| `gedraaid_op` | datetime | |
| `gedraaid_door` | bigint | |
| `rijen` | int | aantal bronregels |
| `status` | enum | `dry_run` · `uitgevoerd` · `teruggedraaid` |

**`md_import_row`** — één rij per bronregel, met het besluit en de reden. Dit is wat een terugdraai-
actie leest en wat achteraf verantwoordt waarom een regel wél of niet is verwerkt.

| Kolom | Type |
|---|---|
| `id` · `batch_id` · `rij_nr` | |
| `besluit` | enum `nieuw` · `bijgewerkt` · `gekoppeld` · `niet` · `ongewijzigd` |
| `reden` | varchar(255) |
| `entity_type` · `entity_id` | nullable, wat er is aangemaakt of geraakt |

Het importscript draait in een **transactie**: alles of niets (B48).

---

## 5. E-mailstatus

Zes waarden (B43). De eerste vier komen van een betaalde validatiedienst, de laatste twee uit de
praktijk.

| Status | Betekenis | Mailbaar |
|---|---|---|
| `unchecked` | staat er, nooit gecontroleerd. Default bij import. | nee |
| `valid` | dienst bevestigt dat het adres bestaat | ja |
| `risky` | dienst kan het niet zeggen — meestal een catch-all-server | alleen na handmatig besluit |
| `invalid` | bestaat aantoonbaar niet | nee |
| `bounced` | er is gemaild en het kwam terug | nee |
| `unsubscribed` | de persoon heeft zich afgemeld | nee |

**`bounced` overschrijft `valid`** — praktijk is harder bewijs dan een voorspelling.
**`unsubscribed` wint van elke bron**; een import heft nooit een afmelding op.

**Een bounce verwijdert de user niet.** Het record draagt beursbezoeken, sample-aanvragen en
relaties; dat is de waarde. Alleen de mailkant gaat dicht.

SMTP-ping is uitgesloten (B39): catch-all-servers zeggen overal ja en het IP belandt op zwarte
lijsten. Boven 5% bounce zet AWS het hele SES-account op review, inclusief de transactionele mail.

---

## 6. Bronlabels

Vaste lijst. De **editie is een aparte kolom**, nooit onderdeel van de labelnaam — anders is er niet
op te filteren en maakt elke schrijfvariant een nieuwe categorie (B70).

`legacy` · `moneybird` · `exhibitor` · `crew` · `visitor` · `crm` · `dashboard` · `research` ·
`editorial` · `registratie`

`research` is de zwakste: dat is wat Claude zelf heeft opgezocht. Die vult alleen lege velden en
overschrijft nooit (B58).

---

## 7. De relatie user ↔ brand

Nu bestaat er geen relatierecord; de koppeling loopt via `_brand_email` of `connected_brands[]`. Dat
kan de grond van de koppeling niet vasthouden, en die is nodig (B84).

**`md_user_brand`**

| Kolom | Type | Toelichting |
|---|---|---|
| `user_id` · `brand_id` | bigint, uniek samen | |
| `grond` | enum | `domein` · `domeinstam` · `naam` · `handmatig` · `registratie` |
| `bewijs` | varchar(255) | bijv. `e-maildomein forbo.com` |
| `mag_beheren` | bool | **default false** |
| `created_by_batch` · `created_at` | | |

**`mag_beheren` volgt nooit automatisch uit een koppeling** (B38). De eerste persoon per merk wordt
handmatig goedgekeurd en laat daarna zelf collega's toe. Anders kan elke stagiair met een
bedrijfsadres het merkprofiel wijzigen.

Een naamtreffer legt **nooit** een relatie: die stelt alleen vast dat het merk al bestaat, zodat er
geen duplicaat komt. Een schooladres of vrije provider legt evenmin een dienstverband vast.

---

## 8. Activity — uitbreiding van het bestaande model

Het `Interaction`-model bestaat live en bewaart de gegevens van de aanvrager **inline**; daardoor is
een sampleaanvraag van een ingelogde gebruiker niet aan die gebruiker gekoppeld. Uitbreiden, niet
dupliceren (B74).

Toe te voegen: `subject_type` / `subject_id` (wie deed het) · `object_type` / `object_id` (waar
gebeurde het — nu is `page` een tekstveld en dus niet te filteren) · `editie` · `source` ·
`batch_id`. De inline-velden blijven bestaan als terugval voor anonieme aanvragers.

**Zichtbaarheid ligt vast op het type, nooit per record** (B87). Drie klassen:

| Klasse | Wanneer | Wat de member ziet |
|---|---|---|
| Met naam | de persoon zocht zelf contact — sampleaanvraag, contactformulier, brochuredownload | naam en contactgegevens |
| Geteld zonder naam | gedrag zonder contactintentie — websiteklik, bekeken, bookmark, follow | aantallen |
| **Intern commentaar** | aantekeningen *óver* een relatie, zoals verkoopnotities | niets, ook niet geteld |

**Een nieuw type begint dicht** en wordt alleen zichtbaar door een bewust besluit. Ligt zichtbaarheid
per record vast, dan volstaat één verkeerd vinkje om een verkoopnotitie naar buiten te brengen.

*Aanleiding: van de 24.266 echte notities in de Insightly-export bevatten er 5.369 persoonlijke
opmerkingen over met naam genoemde mensen.*

---

## 9. Volgorde van bouwen

1. Inventarisatie (§0) — meten wat er al is.
2. `md_field_provenance`, `md_import_batch`, `md_import_row`, `md_user_brand`,
   `md_brand_finding` aanmaken.
3. Recordvelden registreren (§3), inclusief `show_in_rest` waar de frontend ze nodig heeft.
4. Legacy-backfill (§2) — per gevuld importveld één provenance-rij, `source_date` leeg.
5. Activity-uitbreiding (§8).
6. Verificatie: opnieuw meten en vergelijken met wat de dry-run voorspelde
   (`mutatieprotocol.md` poort 6).

Stap 4 is de enige die veel rijen schrijft. Idempotent: twee keer draaien mag geen tweede rij
opleveren.

---

## Status

**v1.1 · 25-08-2026** — §3d (bevindingen in plaats van oordelen), §3e (accreditatiesignalen),
besluitniveau en loopbaanfase als twee assen (§3b), en het onderscheid tussen een eenmalige zakelijke
attendering en mailtoestemming. Aanleiding: Sample.Store wordt als tweede platform op dezelfde data
bediend, en dat kan alleen als de scan waarnemingen bewaart in plaats van conclusies.

**v1.0 · 25-08-2026** — eerste vastlegging, na de sessie waarin het importprotocol tegen vijf echte
bestanden is gehouden. Aanleiding: vijf besluiten droegen de regel "schema-uitbreiding bij Johan"
zonder dat ergens stond wélke velden dat zijn, verspreid over acht besluitnummers.

**Vijf velden staan hier zonder besluitnummer** omdat ze in deze sessie zijn bedacht en nog niet als
besluit zijn vastgelegd: `email_status_date` en `besluitniveau` met zijn datum (§3b),
`created_by_batch` (§3a), de bevindingentabel (§3d) en de zakelijke attendering (§3b). Ze horen als
B88 en verder in het register zodra Jeroen ze bekrachtigt. `created_by_batch` is nodig om B80
uitvoerbaar te maken.

Vier punten uit `importprotocol.md` §Status blijven open en worden door het migratiescript zelf
opgezocht in plaats van aangenomen.

*Opgesteld door Claude, namens Jeroen.*
