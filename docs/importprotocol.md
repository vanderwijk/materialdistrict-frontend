# Importprotocol

Versie 1.2 — 4 september 2026. Bijgewerkt na Johans beoordeling van 14:30 en zijn
besluiten van 14:53.

Wat er in v1.1 is veranderd: de claim-bewering in §6 was feitelijk onjuist en is vervangen
door wat de code werkelijk doet, met een blokkade erbij. §7 is nieuw en gaat over de keuze
tussen twee activiteitenmodellen. De inventaris in §5 is aangevuld met de lezers die Johan
uit de plugincode noemde. De vragen in §11 zijn vervangen door zijn antwoorden.

Geldt voor elk databestand dat we importeren: exposanten, bezoekers, standbemanning,
CRM-exports, boekhouding, catalogi van andere evenementen. De bron doet er niet toe voor
het proces, alleen voor hoe zwaar hij weegt.

---

## 1. Waar het voor is

Een database van **personen, bedrijven, koppelingen, historie en gedrag**, zodat vragen
als *wie stond er drie edities* en *welke merken zijn klant* aan het systeem worden
gesteld in plaats van aan een map met Excel-bestanden.

Op de site bestaan twee soorten records en niets daartussenin:

**Een merk** heeft een algemeen e-mailadres, een algemeen telefoonnummer en een adres.
Geen mensen.

**Een persoon** is een mens. Bestaat één keer, herkenbaar aan het e-mailadres.

**Een koppeling** verbindt ze en draagt een **rol**. **Een activiteit** is een gedateerd
feit en hangt aan één kant.

---

## 2. Wat er bij een bestand wordt gevraagd

Drie dingen, en die worden gevraagd en niet afgeleid. Een bestandsdatum is wanneer iemand
exporteerde, niet wanneer de gegevens golden.

| | |
|---|---|
| **bron** | welk bestand dit is, in woorden die over een jaar nog te begrijpen zijn |
| **brondatum** | wanneer deze gegevens geldig waren |
| **wie het invulde** | het bedrijf of de persoon zelf · een openbaar register · wij |

En bij een bestand dat over een gebeurtenis gaat, twee erbij:

| | |
|---|---|
| **editie of gelegenheid** | MDU 2022, MDU 2026, een ander evenement |
| **welke activiteit, aan welke kant** | zie stap 8 |

Wie het invulde bepaalt hoe zwaar de bron weegt:

1. **het bedrijf of de persoon zelf** — registratie, catalogusaanlevering, invoer in het
   dashboard. Het sterkste over zichzelf, de naam inbegrepen
2. **een openbaar register** — KvK, VIES. Het sterkste voor btw, KvK en statutaire naam
3. **wij** — CRM, boekhouding, redactionele invoer. Nooit gezaghebbend over hoe een
   bedrijf heet
4. **opgezocht** — van een website geplukt. Het zwakste; vult alleen lege velden

Een bewuste correctie door Jeroen of de redactie wint van alle vier en zet het veld op
slot.

**Eén bestand krijgt één bron en één brondatum.** Draagt het bestand zelf per rij een
datum waarop die rij is bijgewerkt, dan wordt die gebruikt; anders geldt de opgegeven
datum voor alle rijen.

---

## 3. De stappen, in deze volgorde

De volgorde is niet vrij. Stap 3 moet vóór stap 5, anders vergelijkt het script twee
schrijfwijzen van dezelfde waarde en ziet het een verschil dat er niet is.

### Stap 1 — tellen wat erin zit
Per kolom: hoeveel rijen, hoeveel gevuld, welke kolommen leeg. Dit is de nulmeting waar
het resultaat aan het eind tegen wordt gelegd.

### Stap 2 — uit elkaar trekken
Eén bronrij is meestal drie dingen tegelijk: een bedrijf, een persoon en een activiteit.
Die worden gescheiden voordat er iets anders gebeurt, en verdeeld over de velden zoals ze
op de site bestaan — zie de veldenlijst in §9.

Een bron mag armer zijn dan wat er online staat. Dat is geen probleem: ontbrekende velden
blijven leeg en raken niets aan.

### Stap 3 — consistent maken
**Vóór het vergelijken, niet erna.**

| veld | vorm |
|---|---|
| telefoon | E.164: `+31612290081`. Geen spaties, haakjes of streepjes. Twee nummers in één veld: leeg met de reden |
| e-mail | kleine letters; rommel eruit (`noreply@`, voorbeeldadressen, adressen van websitebouwers) |
| website | kaal domein: zonder protocol, zonder `www.`, zonder pad |
| plaats | alleen de plaatsnaam, normaal geschreven — niet `ALBLASSERDAM`, niet `alblasserdam` |
| postcode | in de vorm van het land; NL `1234 AB` met spatie |
| land | ISO-2: `Nederland` wordt `NL` |
| naam | rechtsvorm eruit vóór het vergelijken, niet uit de weergave |
| persoonsnaam | niet in kapitalen, geen cijfers |

Zonder deze stap leest het script `+31 (0)6 22337638` en `+31622337638` als twee
verschillende waarden. Bij de ronde van 3 september ging dat om 2.047 nummers die zonder
deze stap onnodig zouden zijn overschreven.

Lukt normaliseren niet, dan blijft het veld **leeg met de reden erbij**. Nooit een gok.

### Stap 4 — herkennen wat geen bedrijfsadres is
Staat er `janderksen@moza.nl` in het veld voor het bedrijf, dan is dat een mens.

1. het adres gaat **niet** op het merk
2. Jan Derksen wordt een persoon, met een koppeling naar het merk als het domein klopt
3. het algemene adres wordt opgezocht op de site van het bedrijf
4. wordt het niet gevonden, dan blijft het veld leeg met de reden

Bij MDU 2026 gold dit voor 29 van de 122 merken. In de bestaande database staan 601 merken
met een persoonsgebonden adres en 150 op een gratis provider; die horen in dezelfde
opruimronde.

### Stap 5 — ontdubbelen binnen de bron
Op btw, KvK, domein, algemeen e-mailadres en naam zonder rechtsvorm.

**Niet op e-mailadres alleen.** Bij MDU 2026 stonden twee verschillende exposanten
ingeschreven via het adres van hetzelfde bureau; die waren bijna één merk geworden. Een
verschillende registratienaam is de scheidslijn.

### Stap 6 — tegen de database houden
Nu pas, met genormaliseerde waarden aan beide kanten.

Matchen op, in deze volgorde van bewijskracht: **btw of KvK** (hard bewijs) · **exact
domein** · **domeinkern zonder extensie** (`burnedwood.nl` = `burnedwood.com`) · **naam
mét domeinbevestiging**. Naam alleen is nooit bewijs.

Per veld drie mogelijkheden:

- **staat er al en gelijk** → niets doen
- **staat er niet** → aanvullen, met bron en brondatum
- **staat er al en anders** → alleen vervangen als de bron sterker is, of even sterk en
  met een recentere brondatum

**De volgorde waarin bestanden worden aangeleverd mag niet uitmaken.** Lever ik vandaag
een bestand van 2026 aan en morgen een van 2022, dan ziet het script dat het veld een
brondatum van 2026 draagt en laat het staan. Andersom net zo.

Is de bron dezelfde maar de datum verschillend — twee exports uit hetzelfde systeem, twee
jaar uit elkaar — dan beslist de datum. Daarom zijn `source` en `source_date` twee
kolommen en geen één.

Bestaat het record niet, dan wordt het aangemaakt als **prospect**: onzichtbaar tot een
mens het vrijgeeft. Alleen bij een aantoonbare identiteit — website, btw of KvK. Alleen
een naam levert geen record op, wel een vastgelegde afwijzing zodat een volgende import
hetzelfde bedrijf niet opnieuw voorlegt.

### Stap 7 — opzoeken wat leeg bleef, en de lus
Pas nu, en elke vondst controleren door de pagina op te halen en te kijken of de
bedrijfsnaam er werkelijk op staat. Wat zo gevonden wordt krijgt bron `opgezocht` en de
datum van vandaag — nooit de brondatum van het bestand.

Daarna **stap 5 en 6 opnieuw**, want een opgezocht domein kan twee records ineens
hetzelfde maken. Herhalen tot twee ronden achter elkaar niets meer veranderen.

### Stap 8 — de activiteit vasthangen
Elke bronregel levert een gedateerd feit op. Dit is waar de hele database om draait.

`subject` (wie) · `object` (waarover) · `type` · `editie` · `datum` · `bron` ·
`brondatum` · `batch`

**Type en editie zijn twee kolommen.** `type = exposant` plus `editie = MDU 2022`, nooit
`exposant_mdu2022`. Op een samengesteld label valt niet te tellen, en *wie stond er drie
edities* is een teloefening.

| groep | types |
|---|---|
| beurs | `exposant` · `standbemanning` · `bezoeker_geregistreerd` · `bezoeker_aanwezig` · `no_show` · `spreker` |
| commercie | `boekbestelling` · `ticketbestelling` · `materiaalpublicatie` · `membership` · `advertentie` · `innovatiefonds` |
| contact | `abonnee` · `sampleaanvraag` · `brochuredownload` · `contactformulier` |
| intern | `gesprek` · `notitie` |

**Aan welke kant.** Dat een bedrijf exposant was komt uit de catalogus en hangt aan het
merk. Dat iemand standbemanning was hangt aan de persoon, met het merk als object. Een
contactpersoon op een registratieformulier krijgt géén activiteit — een formulier invullen
is geen deelname.

**Een activiteit maakt geen koppeling.** Dat iemand op een stand stond betekent niet dat
hij er werkt: bij MDU 2026 gold dat voor 111 van de 299. Andersom kan een activiteit wél
bewijs zijn voor een koppeling.

**Eén feit bestaat één keer.** Sleutel `subject + type + editie + datum`. Hetzelfde bestand
twee keer importeren levert geen tweede rij op.

### Stap 9 — de poorten
Zes. Faalt er één, dan komt het bestand er niet uit.

1. **niets verloren** — elk veld dat in de bron gevuld was, is in het resultaat even vol
2. **niets dubbel** — geen twee merken met hetzelfde btw, KvK, domein of adres
3. **geen persoonsgegevens op een merk**
4. **elk merk heeft een identiteit** — website, btw of KvK
5. **elk veld heeft de juiste vorm**
6. **elke bronregel heeft een activiteit**

Poort 6 draait op twee plekken: over het werkboek én over de database. De eerste alleen
was niet genoeg — op 3 september stonden er 411 activiteiten in het werkboek en zijn er nul
weggeschreven, omdat de doeltabel ontbrak en het script doorliep met een waarschuwing.

### Stap 10 — wegschrijven
In één transactie: alles of niets. Per veld de bron, de brondatum en een batch-ID.
Terugdraaien loopt langs dat batch-ID, nooit langs een datumgrens of een namenlijst.

Bestond het record vóór de import, dan herstelt terugdraaien de vorige veldwaarden.
Maakte de import het record zelf aan, dan mag terugdraaien het naar de prullenbak sturen.

---

## 4. Koppelingen

Een koppeling draagt een **rol**. Gesloten lijst, want een open lijst wordt binnen een
jaar een rommelbak.

`medewerker` · `contactpersoon` · `commercieel contact` · `lead routing` (met het land
erbij) · `factuurcontact` · `beheerder`

Eén persoon kan meer dan één rol hebben bij hetzelfde merk en bij meer merken horen. Van
de 1.567 mensen die nu op merkrecords staan doen 27 dat al, één bij vier merken.

**Automatisch koppelen gebeurt op domein.** Is het e-maildomein van de persoon gelijk aan
dat van het merk, dan is dat bewijs. Bij MDU 2026 gold dat voor 188 van de 299
standbemanners. Wijkt het af, dan geen koppeling — dat kan een ingehuurde standbouwer
zijn. Een gratis provider is nooit bewijs.

**Beheerderschap volgt nooit automatisch uit een koppeling.**

Elke koppeling draagt vast wat het bewijs was, plus bron, brondatum en batch, zodat later
te zien is of hij automatisch of met de hand is gelegd.

---

## 5. Losknippen zonder dat er iets stukgaat

De velden op merkrecords zijn geen dode data. Er hangt werkende functionaliteit aan, en
die moet blijven werken terwijl de persoonsgegevens eruit worden gehaald.

### Wat er nu op leest

| functie | leest | wat er stukgaat als het veld leeg is |
|---|---|---|
| **Lead routing** — het merk stelt zelf per land een contactpersoon in, via `LeadRoutingPanel` in het dashboard (`POST /dashboard/brands/{id}/lead-routing`) | `_brand_lead_routing` | de instelling van het merk verdwijnt; een aanvraag uit Duitsland komt niet meer bij de Duitse contactpersoon |
| **Routing van sample-aanvragen** — valt terug in drie stappen: `primary_user_id`, dan `_brand_contact_email`, dan het algemene merkadres | `_brand_contact_email` | aanvragen gaan naar het algemene adres en verdwijnen in een gedeelde inbox |
| **Claim-flow** — `GET /dashboard/brand-candidates` matcht het e-maildomein van de inloggende gebruiker | `_brand_email`, `_brand_contact_email`, `_brand_website` | iemand vindt zijn eigen merk niet meer terug |

Aangevuld door Johan uit de plugincode, 04-09-2026:

| veld | wie leest |
|---|---|
| `_brand_lead_routing` | `includes/md-lead-mail.php`, het lead-routingpaneel in het dashboard, `rest-lead-meta.php`, de admin |
| `_brand_contact_email` (plus naam en telefoon) | sample- en lead-terugval, domeinhints voor de claim, dashboard, cron-opvolging, exports |
| `_brand_email` / `_brand_website` | claim via `md_dashboard_brand_domain_hints` — ook die niet blind leegmaken |
| `_automation_email` / `_automation_commercial_email` | vooral Mailchimp-metaboxen; niet hetzelfde als de live lead-routing, wél op de lijst van niet-wissen |

Zijn de lezers hiermee compleet? Waarschijnlijk niet. Ontbrekende lezers komen bij **stap C**
aan het licht — de volledige vergelijking — en niet bij stap D, als de velden al leeg zijn.

### De volgorde, en die is niet omwisselbaar

**Stap A — aanleggen naast het bestaande.**
Personen en koppelingen worden aangemaakt terwijl de velden blijven staan. Er wordt niets
leeggemaakt en er verandert niets aan de werking. Alle drie de functies blijven doen wat
ze doen.

**Stap B — de leespaden omzetten, met de oude velden als terugval.**
Lead routing leest de koppelingen met rol `lead routing` en het land in `rol_detail`.
Sample-routing leest de koppeling met rol `contactpersoon`. De claim-flow matcht op de
e-mailadressen van de gekoppelde personen. Zolang de terugval op het oude veld erin zit,
kan er niets stukgaan: vindt het nieuwe pad niets, dan wordt het oude gebruikt.

**Stap C — vergelijken, alle regels.**
Voor elk van de 406 merken met lead routing en elk van de 1.197 met een contactadres: geeft
het nieuwe pad hetzelfde antwoord als het oude? Geen steekproef — alle regels, met een
lijst van de verschillen. Pas als die lijst leeg is, of elk verschil verklaard, gaat het
verder.

**Stap D — pas nu de velden leegmaken.**
Onder een eigen batch-ID, met de oude waarde in de herkomsttabel zodat terugdraaien de
vorige stand herstelt. En de terugval komt als **laatste** uit de code, niet als eerste.

### Wat dat betekent voor de verdeling van het werk

Stap B en D zijn code en horen bij Johan. Stap A en C lever ik: de personen, de
koppelingen, en de vergelijkingslijst.

Zolang stap B er niet is, gebeurt stap D niet — ook niet gedeeltelijk, ook niet voor "even
die paar merken". Een half omgezet leespad is erger dan geen omzetting.

### Wat er met de notities gebeurt

De 542 gespreksverslagen in `_brand_contact_notes` zijn geen veld maar gedateerde feiten,
en ze zijn intern: nooit zichtbaar voor een member. Die worden activiteiten van het type
`notitie`, met de datum uit `_brand_contact_date` waar die er is — 87 keer — en anders
zonder datum. Dat kan pas als het logboek er is, en tot die tijd blijven ze staan waar ze
staan. Er wordt niets weggegooid voordat er een plek is.

## 6. Personen: wat er nu kan en wat niet

Dit bestaat al en is gemeten, niet bedacht. In een steekproef van 1.500 users dragen er
100 deze velden:

| veld | waarde |
|---|---|
| `md_account_kind` | `contact` |
| `md_contact_no_login` | `1` |
| `md_contact_source` | `sendy-migratie` |
| `md_contact_imported_at` | `2026-07-24T14:53:34+00:00` |

Daarnaast draagt `source` bij vijf users de waarde `moneybird`. Een import gebruikt die
velden en verzint er geen nieuwe. **Geen tweede tabel voor mensen** — dan kan dezelfde
persoon op twee plekken bestaan, en dat is precies wat we opruimen.

### Wat er over claimen is beweerd, en wat er werkelijk staat

In v1.0 stond dat iemand die zich later aanmeldt met dat e-mailadres het bestaande record
claimt. **Dat doet de code niet.** `POST /md/v2/auth/register` geeft bij een bestaand adres
`409 md_auth_email_taken`. Er is geen pad van `md_account_kind = contact` naar een inlogbaar
account.

Er staan al ongeveer **12.790 contact-users** op het CMS. Die dragen een willekeurig
wachtwoord en een lege rol, maar de vlag `md_contact_no_login` wordt in de auth-routes niet
als slot gehandhaafd. Gevolg:

- registreren met dat adres wordt geblokkeerd
- een wachtwoordherstel op dat adres levert mogelijk wél een werkend account op, zonder dat
  iemand bewust iets geclaimd heeft
- geschiedenis en koppelingen hangen dan aan een half account

**Blokkade.** Zolang er geen expliciet pad is van contact naar account — wachtwoord zetten,
`md_contact_no_login` uit, rol `subscriber`, geschiedenis behouden — **worden er geen
personen in bulk geïmporteerd.** Niet uit exposantencontacten, niet uit standbemanning, niet
uit CRM, niet uit bezoekerslijsten. De bestaande contacten mogen blijven; er komt niets bij.

**Harde eis: het aanmaken van een contact is stil.** Geen welkomstmail, geen
bevestigingsmail, geen `md_user_registered`-keten, geen Sendy. `md_mail_create_contact_user`
doet dat nu goed — alleen `wp_insert_user`, en de bevestigingsmail zit uitsluitend in
`/auth/register`. Dat blijft zo.

**Zonder e-mailadres wordt niemand aangemaakt.** En **mailtoestemming reist nooit mee uit
een import**: geïmporteerde mensen komen binnen met een lege mailstatus.

---

## 7. Waar het logboek komt te staan

In v1.0 stond: uitbreiding van het bestaande `Interaction`-model, géén nieuwe tabel. Dat was
op de verkeerde aanname gebaseerd.

**Wat er werkelijk is**, volgens Johan: er bestaat geen `wp_md_interaction` en geen
`wp_md_activity`. Wat het dashboard "Interactions" noemt is een API-vorm over het CPT `lead`
— ongeveer 44.000 records. Hoogvolume gedrag zit apart in `wp_md_analytics_events`.

"Geen nieuwe tabel" zou dus betekenen: beursfeiten en commerciële feiten in het lead-CPT
stoppen. Dat is fout. Een lead is een **contactintentie** met een inbox eromheen — status,
verzending, zichtbaarheid voor de member. Dat een bedrijf in 2022 exposant was, is geen
intentie en hoort niet in die inbox.

Er zijn twee mogelijkheden en er moet één gekozen worden.

**(a) Eén activiteitentabel waar leads naartoe migreren of dubbel geschreven worden.**
Alles op één plek. Maar het verplaatst een inbox met een werkende workflow, en dubbel
schrijven is onderhoud dat blijft.

**(b) Leads blijven wat ze zijn; het logboek is de bredere tabel, met lead als subtype.**

**Mijn voorstel is (b).** Redenen:

- de lead-inbox werkt en heeft eigenschappen die een beursfeit niet heeft en niet moet
  erven: een status, een verzendspoor, zichtbaarheid voor de member
- 44.000 records verplaatsen is een groot en onomkeerbaar eerste werk voor iets dat ook
  stap voor stap kan groeien
- het logboek kan meteen beginnen met wat er nu nergens staat — exposant, standbemanning,
  bezoeker, no-show — zonder dat er iets bestaands verhuist

Praktisch: het logboek krijgt een `lead_id` die leeg mag zijn, zodat een activiteit die uit
een lead voortkomt ernaar kan verwijzen. Of de 44.000 bestaande leads met terugwerkende
kracht een activiteitregel krijgen, is een aparte beslissing die niets blokkeert.

**Wat er hoe dan ook bij moet**, en dat is Johans eigen correctie: sample-aanvragen hángen
al aan `user`, `brand` en `material` — dat is niet het gat. Wat ontbreekt is **editie, bron,
batch, en een subject en object waarop te filteren valt**.

---

## 8. De status van een e-mailadres

Er lopen drie dingen door elkaar zodra iemand "geverifieerd" zegt. Ze horen naast elkaar
te staan, niet op één as.

Een algemeen adres als `info@abet.nl` is beter afleverbaar dan `m.bouwens@abet.nl` — het
wordt door meer mensen gelezen en overleeft het vertrek van een medewerker. Maar het is
juist slechter bevestigbaar: een postbus klikt niet op een link, geeft geen toestemming en
wordt geen insider. Dezelfde eigenschap die het betrouwbaar maakt om post naartoe te
sturen, maakt het ongeschikt om iets aan te bevestigen.

### As 1 — soort adres

Meetbaar uit het adres zelf, zonder iets te versturen.

| soort | merken |
|---|---|
| algemeen (`info@`, `sales@`, `contact@`) | 1.808 |
| persoonsgebonden | 601 |
| vrije provider (gmail, hotmail) | 150 |
| geen adres | 90 |

Een persoonsgebonden adres hoort niet op een merk — dat is poort 3. Die 601 zijn dus geen
status maar werk.

### As 2 — afleverstatus

Blijft **onbekend** tot er iets is gebeurd. Twee dingen zijn wél vast te stellen:

- **vooraf, meetbaar**: een domein zonder MX-record kan geen post ontvangen. Dat is een
  feit en kan bij elke import worden gecontroleerd
- **achteraf, gedateerd**: `bounce`, `spam_klacht`, `complaint`. Nu bij 1.638 mensen
  vastgelegd, met `mail_suppressed_reason` en `mail_suppressed_at`

Een bounce is een gedateerd feit, geen eigenschap. Een bounce uit 2019 zegt iets anders dan
een bounce van vorige maand, en het adres kan er intussen weer zijn.

**Wat we niet doen: een algemeen adres op voorhand als geverifieerd markeren.** Dat is een
gok die eruitziet als een meting.

### As 3 — bevestiging

Heeft de persoon zelf iets gedaan: op een bevestigingslink geklikt, ingelogd, geantwoord.
Dit is het enige dat "geverifieerd" mag heten, en het geldt **alleen voor personen** — een
merk kan niets bevestigen. Bestaat al als `email_confirmed`, bij een handvol mensen.

### En daarnaast: de grondslag

`mail_basis` staat bij 108 merken op `relationship`. Dat is een vierde ding en geen status
van het adres: het gaat niet over of je kúnt mailen maar of je mág mailen. Dat blijft
apart, en **mailtoestemming reist nooit mee uit een import**.

### Wat er nu staat

`_brand_email_status` is gevuld bij 108 van de 2.600 merken, met `unverified` (80),
`missing` (27) en `invalid` (1). Op personen bij vijf. Het veld bestaat dus, is ooit
aangezet en nooit doorgezet.

Voorstel: die drie waarden houden en er niets bij verzinnen. `unverified` is de startwaarde
en betekent onbekend, niet slecht. `invalid` alleen bij aantoonbaar bewijs — een domein
zonder MX, of een harde bounce. Een import zet nooit iets op `verified`; dat kan alleen uit
as 3 komen.

---

## 9. De velden, gemeten

Zodat na te kijken is of er niets ontbreekt of dubbel gaat.

### Merk — 81 sleutels, geteld over alle 2.600 merken

**Wat een import aanraakt:** `_brand_website` 2.552 · `_brand_email` 2.510 ·
`_brand_address` 2.320 · `_brand_city` 2.278 · `_brand_postcode` 2.261 · `_brand_phone`
2.159 · `_brand_country` 2.586 · `_brand_vat_number` 92 · `_brand_chamber_number` 72 ·
`_brand_address_2` 11 · `_brand_alias` 82 · de socials · `record_status`

**Personen op het merk — moet weg:** `_brand_contact_name` 1.205 · `_brand_contact_email`
1.197 · `_brand_contact_phone` 939 · `_brand_contact_notes` 542 · `_brand_contact_date` 87 ·
`_brand_lead_routing` 406 · `_automation_email` 546 · `_automation_commercial_email` 525 ·
`_brand_primary_user_id` 5 · `_connected_user_ids` 2

**Nooit aanraken:** redactionele velden en taxonomieën (`theme` = de channels, `sector`,
`location`), alle `_yoast_wpseo_*`, `_thumbnail_id`, `_oembed_*`, `_subscription_*`,
`searchwp_related`.

### Persoon — 165 sleutels in een steekproef van 1.500

Dit is een steekproef, geen telling; het schema meldde 297 sleutels over alle 118.996
users. De volledige lijst komt uit `wp md import-schema-refresh`.

**Wat een import aanraakt:** `first_name` 1.386 · `last_name` 1.277 · `telephone` 68 ·
`city` 765 · `country` 965 · `postcode` 80 · `address` 75 · `profession` 1.068 ·
`sector` 202 (heet in de API `industry`) · `company` 707 · `account_type` 100

**Nooit aanraken:** alle `billing_*` (van WooCommerce, de kassa schrijft ze),
`newsletter_consent*`, `md_mail_frequency`, `mail_suppressed*`, en alle
WordPress-instellingen.

---

## 10. Wat elke ronde oplevert

Eén zip met:

- een **werkboek** — per merk en per persoon wat er gaat gebeuren en waarom, plus een blad
  met de gevallen waar geen bewijs voor is
- een **besluitenlog** — élk veld dat níét is geschreven, met de reden
- het **schrijfscript**, met dry-run als standaard en terugdraaien op batch-ID
- de **poortcontrole**, die los van dat script draait en er niets aan kan veranderen
- de **testgevallen** — fouten die eerder zijn gemaakt, met hun juiste antwoord

Jeroen vult één kolom in: de gevallen waar geen bewijs voor is. Bij MDU 2026 waren dat er
vijf op 126 merken. Al het meetbare wordt zonder hem beslist.

---

## 11. Beantwoorde vragen

Beantwoord door Johan, 04-09-2026.

**Statusvelden op een merk — beslist.** De canonieke opslagsleutel is
**`_brand_record_status`**. Het API-veld blijft `record_status` en leest die sleutel. De
kale meta-sleutel `record_status` is niet leidend en **wordt door een import niet meer
geschreven**.

`_brand_member_status` is legacy en niet leidend voor betaald lidmaatschap.
`_brand_membership_status` komt van Stripe en is dát wél. Leidend voor "mag dit op de site"
is het record-statusspoor; leidend voor "betaald lid" is `_brand_membership_status`.

**Gevolg voor wat er staat:** de 49 merken die de import van 3 september aanmaakte dragen
de kale `record_status = prospect` en géén `_brand_record_status`. De REST ziet ze dus niet
als prospect. Ze staan wél op `draft`, dus ze zijn niet publiek. Johan doet de backfill van
de kale naar de canonieke sleutel.

**Postcode en straat op een persoon.** Voor het MD-profiel en voor imports: `postcode` en
`address`. De `billing_`-velden zijn van WooCommerce en worden niet overschreven.
`zip`, `zipcode` en `address_street` zijn legacy en niet leidend.

**Toestemming.** `newsletter_consent` met `_at` en `_source` is de canonieke mailtoestemming
en een import schrijft die nooit. `email_confirmed` betekent dat het adres bewezen is via
een klik, en is géén marketingtoestemming. `newsletter`, `consent` en `permission` zijn
legacy en worden niet aangeraakt tot ze gemapt of afgeschaft zijn.

**Legacy zonder brondatum.** Een lege `source_date` mag verliezen van een gedateerde bron.
Liever expliciet vastleggen dat `legacy` de zwakste bron is, of er een vaste
overgangsdatum aan geven, dan het stil laten verliezen.

**Herkomsttabel en personen.** Technisch kan het, het volume is serieus. Eerst alleen de
velden die imports werkelijk schrijven — niet alles dubbel.

**`rol` op `wp_md_user_brand`.** De tabel heeft nu `grond`, `bewijs`, `mag_beheren` en
`created_by_batch`, en geen `rol`. De unieke sleutel `user_id + brand_id + rol` vereist dat
`rol` eerst bestaat. De tabel is leeg: een goed moment om het model goed te zetten, een
slecht moment om half te migreren. Eerst het rolmodel en de herkomst ontwerpen, inclusief
hoe `rol` zich verhoudt tot het bestaande `grond` en `bewijs`; dan pas de migratie.

**`_brand_email_status`.** Akkoord met `unverified` en `invalid`; een import zet nooit
`verified`.

**Het slot op `/import/schema`.** Akkoord, een nachtelijke refresh via de systeem-cron.
Apart ticket, los van het datamodel.

## 12. Volgorde van bouwen

Niet: eerst de kolommen en het logboek, dan importeren. Johans volgorde, en die is beter:

1. ~~Besluit over de canonieke record-statussleutel~~ — **genomen 04-09-2026:
   `_brand_record_status`**
2. **Ontwerp en bouw van het claimpad**: contact wordt account. Verplicht vóór er personen
   in bulk bij komen
3. **Expliciete keuze voor het activiteitenmodel** — (a) of (b) uit §7
4. **Dan pas de migratie** op `wp_md_user_brand`: rol, herkomst, unieke sleutel
5. **Dan leespad B** met terugval, en daarna C en D uit §5
6. **Het logboek** volgens de gekozen vorm — geen tweede keten ernaast

**Wat intussen wél door kan**, bevestigd door Johan: imports die alleen merken raken en
geen personen in bulk aanmaken. Dat geldt voor de merkenkant van MDU 2025 en de oudere
edities. Twee voorwaarden: het script schrijft `_brand_record_status` en niet de kale
sleutel, en er worden geen personen aangemaakt tot het claimpad er is. Personen,
koppelingen en activiteiten van die edities blijven klaarliggen.

**Johans planning, indicatief, van 04-09-2026:**

| wanneer | wat |
|---|---|
| deze of begin volgende week | de canonieke sleutel plus backfill en scripts, en de zes duplicaten |
| daarna | het claimpad — dat blokkeert de persoonsimport |
| parallel daarna | `wp_md_user_brand` → leespad B → het logboek → de schema-cron |

## Status

Versie 1.1, opgesteld 04-09-2026, bijgewerkt na Johans beoordeling van dezelfde dag. Aanleiding: drie importsessies waarin de merkenkant is
afgemaakt terwijl er nul activiteiten zijn vastgelegd, en waarin persoonsgegevens op
merkrecords wel zijn gemeten maar niet als op te ruimen rommel zijn benoemd. Dit stuk legt
vast wat er gebeurt en in welke volgorde, zodat dat niet elke sessie opnieuw hoeft te
blijken.
