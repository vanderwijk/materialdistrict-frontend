# Mailsysteem — besluiten en bouwspec

> Versie 7, 24-07-2026. Vervangt v1 t/m v6.
>
> Verwerkt `mailvoorkeur-datamodel.md` en `terugkoppeling-naar-mailsessie.md` uit de
> datasessie. Sinds v2: het importgat van 8.148, de huiseditie vervalt (iedereen gaat op alle
> channels), en de bounce-historie moet uit Sendy geoogst worden vóór uitfasering. Nieuw in v4:
> de servicemail naar de 33.188 is besloten (§7.6), met een eigen re-engagement-subdomein dat
> zelf opgewarmd moet worden vóór gebruik. In v5: "New in [Channel]" geschrapt, §5 vervangen
> door de site-kant. In v6: §4.4, de intro gegenereerd per unieke itemlijst.
>
> **Nieuw in v7** — na Johans antwoord over de huidige verzendopzet en de ontwerpronde van
> 24-07: geen apart marketing-subdomein meer (§7.2), afzender wordt `news@` (§7.2), opwarmen
> geldt alleen nog voor het re-engagement-subdomein (§7.4), distributie-goedkeuring geldt
> alleen voor merkuploads (§3.5), de insider-zone is redactioneel in plaats van commercieel
> (§4.5), en de drie sjablonen zijn af (§11a).
>
> Vervangt de toolafweging in `blauwdruk-email-nieuwsbriefsysteem.md` en de mailtool-
> suggestie in `backend-spec-datalaag-follow.md` §7.

---

## 0. De besluiten

**1 — Send-knoop: wij assembleren, SES verstuurt.** De mail wordt per ontvanger samengesteld
in WordPress en als kant-en-klare HTML aan SES aangeboden. Geen lijsttool in het verzendpad.

**2 — Mailtool: geen.** Sendy wordt uitgefaseerd, niet vervangen. WordPress is de lijst, SES
de verzender, met een dunne eigen laag in de `md`-plugin.

**3 — Het mailsysteem bezit geen contactgegevens.** Wie gemaild mag worden komt uit de
datasessie, op het user-record. Het mailsysteem leest dat en berekent er niets bij.

**4 — Bestaande abonnees gaan op álle channels en alle contenttypes.** Geen aparte
huiseditie; de bestaande nieuwsbrief is simpelweg de digest van iemand die alles volgt.

---

## 1. Waarom — kort

**Waarom geen lijsttool in het verzendpad.** "Your update" is per ontvanger anders: de inhoud
volgt uit zijn follows, zijn frequentie en wat er nieuw is sinds zijn vorige mail. Een
lijsttool werkt met segmenten; bij vrij combineerbare channels is het aantal onderscheiden
follow-sets in de praktijk gelijk aan het aantal ontvangers. De personalisatie móét dus aan
onze kant gebeuren. Zodra dat vaststaat, verstuurt de tool alleen nog kant-en-klare HTML — en
dat kan SES rechtstreeks.

**Waarom dan helemaal geen tool.**

- *Lijst en consent* liggen al bij de datasessie, op het user-record. Een tool ernaast maakt
  daar een tweede waarheid van — precies bij het gegeven dat er maar één mag hebben.
- *Rapportage* hebben we beter. SES levert open-, klik-, bounce- en klachtevents via een
  configuration set naar SNS, en die keten (API Gateway → Lambda → SQS → Lambda → RDS) draait
  live. Mailgedrag landt in dezelfde eventlaag als `material_viewed` en `channel_followed`.
  Een externe tool zou dat uit elkaar trekken: openrates daar, gedrag hier, nooit te koppelen.
  Dit is het doorslaggevende argument.
- *Composer* is minder nodig dan het lijkt. De maatwerkmails zijn twee terugkerende
  productvormen (campagne/beurs en de betaalde thema-editie), geen vrije ontwerpopdrachten.
  Een formulier dat materialen uit de eigen database kiest geeft een consistenter resultaat
  dan een drag-and-drop-editor, en is minder werk dan een tool koppelen en synchroon houden.

**Volume en kosten.** 69.873 actieve abonnees (61.725 met WP-record + 8.148 zonder) op weekly
≈ 303.000 mails per maand. Op SES à-la-carte ($0,10 per 1.000) ~$30 per maand. Kosten zijn
niet het argument — de datakoppeling is dat.

**Wat we opgeven.** Geen drag-and-drop-editor, geen ingebouwde A/B-testing, geen
kant-en-klaar rapportagescherm. A/B-testing is fase 3; rapportage komt uit de analytics-laag;
de editor vervangen we door formulieren.

---

## 2. Architectuur

```
datasessie (user-record)          mailsysteem (md-plugin)              AWS
────────────────────────          ───────────────────────              ───
mail_suppressed    ──┐
newsletter_consent ──┼──►  doelgroepvraag ─► assembler ─► render ─► queue ─► worker ─► SES
digest_frequency   ──┤                                                                 │
follows            ──┘                                                                 │
                                                                                       ▼
eventlaag  ◄──── mailevents (sent/opened/clicked/bounced/complained) ◄──── SNS ◄────────┘
```

Vier lagen aan onze kant: doelgroepvraag, assembler, renderer + wachtrij, worker + SES.
Laag 3 en 4 zijn gedeeld door alle maaltypen én door de saved-search-alerts. Één keer bouwen.

---

## 3. De grens met de datasessie

**Regel: de datasessie bezit *wie iemand is*, het mailsysteem bezit *wat er verstuurd wordt*.**
Geen van beide bouwt het model van de ander. Er lopen precies drie verbindingen over de grens.

### 3.1 Naar binnen — mag ik deze persoon mailen

Drie velden op het user-record, vastgesteld in `mailvoorkeur-datamodel.md`:

| veld | betekenis |
|---|---|
| `mail_suppressed` | hard blok na spamklacht of hard bounce |
| `newsletter_consent` | mág je mailen (ja/nee + datum + bron) |
| `digest_frequency` | `daily` / `weekly` / `monthly` / `none` |

Volgorde is hard: `mail_suppressed` → `newsletter_consent` → `digest_frequency`. De worker
controleert de eerste twee vóór élke verzending, ongeacht maaltype. `mail_suppressed`
blokkeert marketing, nooit transactioneel.

**Hard bounce suppresst, verwijdert niet.** Een dood mailadres betekent niet dat de relatie
waardeloos is — bij de opschoning van 22-07 moesten drie accounts uitgezonderd worden omdat er
een `connected_brand_id` aan hing. Iemand kan van baan zijn gewisseld terwijl het account nog
aan een brand of aan orders vastzit. Die opschoning was eenmalig en is geen precedent.

**Naamgeving — één actiepunt.** `digest_frequency` (datasessie) en `md_mail_frequency`
(Johans bestaande user meta, default `weekly`, met `PATCH /md/v2/follows/mail-frequency`) zijn
hetzelfde gegeven onder twee namen. Voorstel: `md_mail_frequency` blijft de opslagnaam,
`digest_frequency` wordt de naam in API en UI. Dan hoeft er niets gemigreerd te worden. De
waarde `none` moet erbij.

### 3.2 Naar binnen — wie moet deze mail hebben

Een doelgroepvraag, beantwoord door de datalaag. Vier vormen:

- alle mailbare gebruikers met `digest_frequency = X` (Your update)
- alle mailbare gebruikers die channel Y volgen (campagne gericht op één channel)
- een opgeslagen segment (campagne — bijv. A1–A4 uit de contactverrijking)
- één gebruiker (saved-search-alert)

### 3.3 Naar buiten — wat er gebeurd is

Het mailsysteem is vooral een *producent* van events, via de bestaande
`md_analytics_submit_event()` naar dezelfde eventlaag als het sitegedrag:

`mail_sent` · `mail_delivered` · `mail_opened` · `mail_clicked` · `mail_bounced` ·
`mail_complained` · `mail_unsubscribed`

**Suppressie loopt hier doorheen, niet eromheen.** Komt er via SNS een hard bounce of klacht
binnen, dan schrijft het mailsysteem het event weg; de datalaag zet daarop `mail_suppressed`.
Het mailsysteem zet die vlag niet zelf — het levert de aanleiding. Zo blijft er één plek waar
besloten wordt of iemand mailbaar is.

### 3.4 Event versus stand

`digest_frequency_changed` is een event: een moment. `digest_frequency = weekly` is een stand.
Beide horen in de datalaag, maar de assembler moet op verzendmoment de **stand** kunnen lezen —
anders moet hij per verzending voor tienduizenden mensen de eventgeschiedenis teruglezen.
Events zijn de bron, de stand wordt eruit afgeleid en apart bijgehouden. Zelfde patroon als de
bestaande ruwe events en rollups.

### 3.5 Wat het mailsysteem wél zelf bezit

| tabel | inhoud |
|---|---|
| `wp_md_mail_queue` | `id`, `user_id`, `mail_type`, `campaign_id`, `payload` (JSON), `scheduled_for`, `status`, `attempts`, `ses_message_id`, `error`. Index op `(status, scheduled_for)`. |
| `wp_md_mail_campaigns` | de samengestelde editie: titel, intro, gekozen items, lead-pin, banner, accentkleur, doelgroep, verzendmoment, status `draft`/`scheduled`/`sent`. |
| `wp_md_mail_banners` | banner-flights: afbeelding, klik-URL, alt, periode, optionele channel-targeting. |
| `wp_md_mail_suppression` | e-mailadressen zonder user-record die nooit gemaild mogen worden (zie §9, fase 0). |

Drie uitbreidingen op bestaande content:

- **`_md_first_approved_at`** — write-once postmeta, gezet bij de eerste redactionele
  goedkeuring, daarna nooit overschreven. Anti-gaming: herpubliceren maakt iets niet opnieuw
  nieuw.
- **`_md_distribution_approved`** — boolean, **alleen van toepassing op materialen die merken
  zelf uploaden.** Alles wat MaterialDistrict zelf publiceert (artikelen, eigen materialen,
  talks, events, books) staat automatisch op `true`; daar vinkt niemand iets aan. Merkuploads
  worden sowieso al redactioneel beoordeeld voordat ze live gaan, en dát moment zet beide
  vlaggen tegelijk: live op het platform én mag mee in de mail. Alleen als de redactie iets wél
  wil publiceren maar níét wil meesturen, vinkt ze het uit. Er ontstaat dus geen nieuwe
  dagelijkse handeling.

Het eerder voorgestelde veld `_md_market_launch_date` is hier vervallen: het hing aan
"New in [Channel]" (zie §5). Als redactionele metadata of filter kan het alsnog zinvol zijn,
maar dat is een taxonomie-besluit en geen mailveld.

---

## 4. Your update — de assembler

### 4.1 Eén machine, geen uitzonderingen

Bij de migratie krijgt iedere bestaande abonnee follows op **alle channels en alle
contenttypes** — dus inclusief books en events, die in de standaard follow-defaults uit staan
maar nu wél in de nieuwsbrief zitten. Daarmee is de bestaande nieuwsbrief gewoon de digest van
iemand die alles volgt, en is er geen tweede mechanisme nodig. Wie zijn selectie versmalt,
krijgt vanzelf een persoonlijker mail. Elke editie nodigt daartoe uit.

De regel "geen lege digest" blijft: minder dan 3 items → niet versturen.

### 4.2 Selectie

1. Bepaal de scope uit `wp_md_follows`: channels/brands + de gekozen `types`.
2. Haal items op met `_md_distribution_approved = true` én `_md_first_approved_at` na de
   vorige verzending aan deze ontvanger (eerste keer: binnen 7 / 1 / 30 dagen naar frequentie).
3. Filter op contenttype met `md_follows_includes_post_type()` /
   `md_follows_includes_content_type()`.
4. Ontdubbel: een item in twee gevolgde channels verschijnt één keer, met het label van het
   hoogst gerangschikte channel.

### 4.3 Volgorde en caps

- **Lead** — de redactie kan het lead-item per editie pinnen. Dit is een wijziging t.o.v. v1
  en v2, die het lead automatisch lieten kiezen. Reden: nu iedereen op alle channels start,
  krijgt de grote meerderheid dezelfde mail, en dan bepaalt een algoritme wekelijks het
  openingsverhaal van de nieuwsbrief. Eén veld op de editie; zonder pin valt het terug op
  automatisch (meest recente item met beeld, voorrang voor `article` en `material`).
- **Daarna gegroepeerd per type**, vaste volgorde: Materials, Stories, Talks, Books, Events.
  Vaste volgorde, niet op relevantie — gedrag-ranking is fase 3.
- **Caps:** maximaal 12 items, maximaal 5 per type. De rest telt op in `more_items_count` en
  linkt naar "New in your channels".

### 4.4 De intro — gegenereerd per unieke itemlijst

Elke Your update opent met een korte intro die de items van die editie samenvat en er verband
tussen legt. Geen handwerk: de redactie schrijft en keurt niets.

**Genereren gebeurt per unieke itemlijst, niet per ontvanger.** Dat is het hele punt. Twee
mensen met dezelfde twaalf items krijgen dezelfde intro, dus de sleutel is de inhoud en niet de
persoon. Het aantal unieke lijsten is een fractie van het aantal ontvangers: bij twintig
channels en enkele tientallen items per week ontstaan er honderden tot hooguit enkele duizenden
combinaties, en veel volgers lopen samen.

Vooraf uitrekenen hoeveel het er zijn hoeft niet. De engine bouwt eerst alle itemlijsten voor
die cyclus, hasht de lijst van item-id's, groepeert de identieke en genereert één keer per
groep. Je betaalt precies het aantal unieke lijsten. Ter vergelijking: per ontvanger genereren
kost bij deze lijstomvang enkele honderden euro's per maand en schaalt mee met de lijst; per
unieke set blijft het in de orde van enkele euro's.

**Invoer voor het model:** uitsluitend titel, samenvatting, type en channel van de goedgekeurde
items in díé lijst. Geen volledige artikelteksten, geen gebruikersgegevens.

**Controle, mechanisch:**

- Elke merk-, materiaal- of eigennaam in de intro moet letterlijk voorkomen in de invoer.
  Zo niet → intro vervalt.
- Lengtegrens (richtlijn 200–320 tekens) en één alinea.
- Faalt de generatie of de controle, dan gaat de mail zonder intro de deur uit. Een mislukte
  generatie mag nooit een verzending blokkeren.

De redactie leest niets vooraf. Achteraf kan Sigrid desgewenst de vijf grootste sets nakijken;
die dekken samen het overgrote deel van de ontvangers.

**Onderwerpregel: geen generatie.** Die wordt mechanisch samengesteld uit variabelen in een
vast patroon — aantal items, channelnamen, de titel van het leaditem. Eén keer goedkeuren,
daarna altijd correct, geen kosten en niets om na te kijken.

### 4.5 Banner, insider-zone en fabrikantenblok

**Banner** komt uit een geplande flight (afbeelding, klik-URL, alt, periode). Redactie plant
dit één keer per periode. Is er geen flight verkocht, dan valt de plek terug op het
fabrikantenblok hieronder — er staat dus nooit een gat.

**Insider-zone.** Geen reclamekader maar een redactionele groep: dezelfde kaarten als
materials en articles, in een licht getinte zone (`#ddf2f5`) met een teal kopregel, een ster
voor de titel en "Insider only" waar anders "Read more" staat. Onderaan de zone één
bescheiden balk met het aanbod en de prijs.

De volgorde is het mechanisme: eerst wil je het item, dán merk je dat het achter de poort zit.
Een gekleurd promokader draait die volgorde om en zet de verdediging van de lezer aan vóórdat
hij de titel heeft gelezen.

Wat verkoopt zit in de metadata — *64 pages*, *38 min* — niet in verkooptekst. Dat betekent
wel dat de zin onder de titel redactioneel werk is: nieuwsgierig maken zonder het antwoord te
geven. Dat is het enige deel van dit blok waar de redactie invloed op heeft.

Vulling: automatisch het nieuwste insider-item dat deze ontvanger nog niet zag, per periode te
pinnen. Voor bestaande Insiders vervalt de onderste balk en wordt "Insider only" gewoon
"Read more". Het blok moet zowel staande covers (reports) als liggend beeld (talks, articles)
aankunnen.

**Fabrikantenblok.** Onderaan de mail, ná "+N more": "Do you make a material that belongs
here?" met een groene knop naar de listing-pagina. De mail gaat naar architecten én naar
fabrikanten, en voor die tweede groep stond er anders niets in. Bewust helemaal onderaan —
wie daar komt heeft de mail gelezen, en dan is die vraag logisch in plaats van een
onderbreking. Dit blok is tevens de vulling voor een onverkochte bannerplek.

### 4.6 Batching

| tier | moment |
|---|---|
| daily | elke dag 07:00 CET |
| weekly | dinsdag 07:00 CET |
| monthly | eerste dinsdag van de maand 07:00 CET |

`digest_frequency = none` krijgt geen Your update, wel campagnemail (mits consent).

De cron vult alleen de wachtrij; de worker verstuurt in batches. Draai via de systeem-cron van
WP Engine, niet via WP-cron — die hangt aan paginabezoek en is hiervoor te wisselvallig.

---

## 5. De site-kant — "nieuw sinds je vorige bezoek"

**"New in [Channel]" als maandelijkse mail is geschrapt** (besluit Jeroen, 24-07). Hij stond
alleen in sessie X7.2 van 18-06 en nergens in de moedermap, en is vrijwel zeker ontstaan uit
naamsverwarring met de site-functie hieronder. Twee argumenten om hem te laten vallen: de
ontvangers hebben die inhoud al in hun Your update gehad, en met zeventien à twintig channels
zou het twintig redactionele edities per maand betekenen — het grootste nieuwe terugkerende
werk in een systeem dat het redactiewerk juist moest vermínderen.

Wat er wél is, en wat de andere helft vormt van het antwoord op "wat als er dertig updates
zijn":

**Eén feed-component, twee gezichten.** Vastgelegd in X7.2:

| | mail | site |
|---|---|---|
| richting | push | pull |
| ijkpunt | `last_sent` | `last_seen` |
| gedrag | gecapt op 12 items | toont alles sinds je vorige bezoek |

De mail cap't bewust en linkt met "+N more" door; de site vangt de rest op. Model is "sinds
datum", niet per-item-ongelezen — dus geen leesstatus per artikel bijhouden.

Hieruit volgen twee dingen die nog niet gebouwd zijn:

- **`last_seen` per gebruiker** — staat al als open punt bij Johan in `roadmap.md`, niet
  blokkerend voor de mail.
- **De "New in your channels"-listing** — de cross-channel pagina achter "+N more", ingelogd,
  op de bestaande FacetWP-infra. Frontend, staat in `roadmap.md` §3.

De commerciële plek voor merken verdwijnt hiermee niet: die zit al in het bannerslot van Your
update en in featured op de channelpagina's.

---

## 6. Campagne / maatwerk

Loopt niet door de assembler. Redactie vult een formulier: kop, intro, accentkleur, hero,
secties, optioneel materiaalkeuzes uit de database, partnerlogo's, CTA. Doelgroep = een
opgeslagen segment.

Dit is het enige maaltype dat de commerciële start in september nodig heeft.

---

## 7. Verzendfundament en deliverability

### 7.1 De huidige situatie (beantwoord door Johan, 24-07)

Sendy is de huidige verzender, geen kandidaat. De stand van zaken:

- Sendy verstuurt **al via ons eigen SES-account**, vanaf `materialdistrict.com`, met
  `noreply@materialdistrict.com` als afzender en `info@materialdistrict.com` als reply-to.
- **SPF, DKIM en DMARC staan ingericht** op `materialdistrict.com`.
- Bounce- en klachtcijfers van de afgelopen jaren zitten **ruimschoots onder de limieten**.
- Het domein is **geregistreerd in Google Postmaster Tools**.

Dit verandert het plan wezenlijk. **Er is geen volumesprong maar een volumedaling:** de
huidige nieuwsbrief gaat twee keer per week naar bijna 70.000 mensen, ruim 600.000 mails per
maand. Het nieuwe systeem op weekly komt op ongeveer de helft. Opwarmen is daarmee niet nodig
zolang we vanaf hetzelfde SES-account en domein versturen.

Sendy blijft draaien tot het nieuwe pad live is. Uitfaseren pas ná de import én de
suppressie-oogst uit §9.

### 7.2 Afzender en scheiding van stromen

**Geen apart marketing-subdomein.** Dit was in v1–v4 het advies en het is nu ingetrokken.
Marketing en transactioneel draaien al jaren samen vanaf `materialdistrict.com` met cijfers
ruim onder de grenzen. Een nieuw subdomein zou die opgebouwde domeinreputatie weggooien en
vanaf neutraal beginnen, voor een probleem dat zich in de praktijk niet voordoet.

**Wel gescheiden configuration sets.** Dat is geen aparte afzender maar een aparte meetlat:
eigen bounce-, klacht- en klikstatistiek per stroom, en de haak waarmee de mailevents naar RDS
gaan. Kost niets, verandert niets aan de bezorging. SNS-topic per configuration set voor
bounces, klachten, deliveries, opens en clicks.

**Afzender (besluit 24-07):**

| | |
|---|---|
| From | `MaterialDistrict <news@materialdistrict.com>` |
| Reply-to | `info@materialdistrict.com` |

`noreply@` vervalt. Het hield in de praktijk niets tegen — de reply-to stond al op `info@`,
en mailclients volgen reply-to. Bovendien gaan jullie vanaf september merken benaderen: een
merk dat op de nieuwsbrief reageert met "wij hebben ook zoiets" is een lead, en die verdween
op een noreply-adres. Een apart `news@` houdt nieuwsbriefreacties bij elkaar zodat `info@`
niet vervuilt. Filterregel op auto-replies (`Auto-Submitted`-header), rest wekelijks
doorkijken.

**Wel een apart subdomein voor re-engagement** (§7.6). Dat is de enige stroom waarvoor
afscherming zin heeft, en het is ook de enige die opgewarmd moet worden.

### 7.3 Wat de grote mailproviders verplicht stellen

Met bijna 70.000 ontvangers zitten we ruim boven de bulkdrempel van 5.000 mails per dag per
domein. Google, Yahoo en Microsoft weigeren non-conforme bulkmail **op SMTP-niveau** — die
komt niet in de spambox maar bounct. Vereist:

1. **SPF én DKIM**, minstens één uitgelijnd met het `From:`-domein.
2. **DMARC** gepubliceerd, minimaal `p=none`; `p=quarantine` is sterker en aan te raden.
3. **One-click unsubscribe** volgens RFC 8058: headers `List-Unsubscribe` én
   `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, plus een zichtbare uitschrijflink in
   de body. Werkt zonder inloggen; verwerking binnen twee dagen (bij ons direct).
4. **Klachtpercentage onder 0,3%**, met 0,1% als praktijkdoel.
5. Geldige PTR-records en TLS — dat regelt SES.

Registreer het afzenddomein in **Google Postmaster Tools** en **Yahoo Sender Hub**, zodat het
klachtpercentage zichtbaar is vóór het een probleem wordt.

### 7.4 Opwarmen — alleen voor het re-engagement-subdomein

Voor de hoofdstroom is opwarmen **niet nodig** (§7.1): zelfde account, zelfde domein, dalend
volume. Dit geldt uitsluitend voor het verse re-engagement-subdomein:

- **Geen dedicated IP.** Bij dit volume is een eigen IP juist slechter — te weinig verkeer om
  warm te blijven. Blijf op de gedeelde SES-pool.
- **Bouw eerst reputatie op met goede mail.** Route drie tot vier weken een deel van de gezonde
  wekelijkse digest via dat subdomein. Een gloednieuw subdomein waarvan de eerste verzending
  33.188 mails naar de meest klachtgevoelige groep is, wordt afgeknepen of geblokkeerd — ook in
  batches. Reputatie hangt aan IP én afzenddomein; het account is warm, het subdomein niet.

### 7.5 Verzendplafond per persoon

Harde regel in de worker: maximaal **één marketingmail per persoon per dag** en **drie per
week**, ongeacht maaltype. Beschermt tegen de dag waarop iemand een Your update, een New in
[Channel] én een campagne krijgt. Transactionele mail valt hierbuiten.

### 7.6 De servicemail naar de 33.188 uitschrijvers — besloten

**Besluit Jeroen, 24-07: de servicemail gaat door.** Eenmalig servicebericht met een echte
keuze. Niet schrappen, niet uitstellen tot onbepaalde tijd, wel onder strikte condities.

De achtergrond van die condities: de klachtdrempel is 0,3% over het afzenddomein — op 33.188
mails is dat ongeveer 100 klachten, en een uitgeschreven cohort haalt daar in de praktijk meer.
Daarom niet vanaf het hoofddomein, en daarom met een afbreekmogelijkheid.

**Condities bij verzending:**

- **Apart subdomein**, los van zowel het transactionele als het marketing-subdomein. Een klap
  op de reputatie raakt dan niet de bijna 70.000 die de mail wél willen, en niet de
  wachtwoord-resets.
- **Ná de volledige opwarming** van het marketing-subdomein — niet ervoor, niet tegelijk.
- **In batches van 2.500**, met een klachtmeting per batch: boven **0,1%** pauzeren en
  beoordelen, boven **0,3%** de rest van de verzending afbreken. Wacht minimaal 24 uur tussen
  batches, want klachten komen met vertraging binnen — meteen doorsturen betekent meten op
  cijfers die er nog niet zijn.
- **Eén keer.** Geen reactie is het antwoord; geen tweede poging.
- **Opt-in, niet opt-out.** Terug op de lijst alleen bij een actieve keuze; stilte betekent
  afgemeld blijven. "Blijf afgemeld" even prominent als "weer aanmelden".
- **Nooit naar de 1.496 spamklachten.**
- Tekst vooraf langs een privacyjurist.

**Het derde subdomein moet zélf opgewarmd worden — dit staat in geen van de bronstukken.**
Een gloednieuw subdomein heeft geen reputatie, en de eerste mail die eruit gaat zou dan
meteen 33.188 stuks naar de meest klachtgevoelige groep zijn. Dat is precies het profiel dat
providers afknijpen of blokkeren, ook in batches van 2.500.

De enige veilige route: **route een deel van de gezonde wekelijkse digest drie tot vier weken
via het re-engagement-subdomein**, zodat het reputatie opbouwt met mail die mensen wél willen
en openen. Daarna pas de servicemail. Dat verlengt het traject, maar zonder die stap is de
kans groot dat de verzending op de eigen afbreekdrempel strandt en het subdomein daarna
onbruikbaar is.

### 7.7 Validatie

De 33.188 worden gemaild, dus ze moeten gevalideerd worden. De validatiegroep blijft ~42.000:

- de **33.188 uitgeschrevenen** — juist bij deze groep is valideren belangrijk: een bounce
  bovenop een klacht is dubbel schadelijk voor een vers subdomein;
- de **~8.900 onbekenden** (niet in Sendy, plus de uitgeschrevenen zonder WP-record);
- de **8.148** actieve abonnees zonder WP-record, die sowieso volume gaan ontvangen;
- een **steekproef van enkele duizenden** uit de 61.725 actieve abonnees mét record. Dat er al
  bijna 38.000 bounces uit de database zijn gehaald laat zien dat de lijst geschiedenis heeft;
  de tweewekelijkse nieuwsbrief houdt de actieve groep waarschijnlijk redelijk schoon, maar een
  steekproef kost bijna niets en vertelt of dat klopt vóórdat de ramp begint.

Valideren gebeurt **vóór** verzending, niet erna.

---

## 8. Consent — wat hier nog van over is

Het consentmodel is eigendom van de datasessie. Aan mailkant resteren drie dingen:

- **Uitschrijven schrijft door naar `newsletter_consent`**, niet naar een eigen veld. Account,
  follows en opgeslagen materialen blijven staan.
- **Frequentiewijziging is geen uitschrijving.** De UI mag die twee nooit op één knop zetten.
- **`anonymous_id`-cookie** hoort onder de analytics-consentcategorie van de cookiebanner.
  Blokkeert de mail niet.

---

## 9. Fasering

De commerciële start in september vraagt niet de personalisatie-engine, maar het
verzendfundament.

### Fase 0 — verzendfundament (augustus) · kritieke pad

1. Uitzoeken wat Sendy nu via SES doet (§7.1).
2. **Suppressie-oogst uit Sendy — tijdgevoelig.** De 38.074 verwijderde bounce-accounts zijn
   weg, en daarmee het feit dát die adressen gebounced hebben. De adressen staan nog wél in de
   Sendy-export. Komt zo'n adres later via contactverrijking of een beurslijst opnieuw binnen,
   dan is het weer mailbaar en bouncet het opnieuw. Oogst dus alle bounce- en klachtadressen
   uit Sendy naar `wp_md_mail_suppression` **vóórdat Sendy uitgaat** — inclusief de 1.820
   bounced en 200 spamklachten zonder WP-record. Daarna is die kennis definitief verloren.
3. **Import van de 8.148 actieve abonnees zonder WP-record** als user met status `contact`
   (geen wachtwoord, geen rol, telt niet mee als gebruiker), `newsletter_consent = ja`,
   `digest_frequency = weekly`, bron-tag `sendy-migratie`. Plus de 3.821 uitgeschrevenen als
   `contact` met consent nee, zodat die uitschrijving bewaard blijft.
4. Configuration sets `md-marketing` en `md-transactional` op het bestaande domein. Géén nieuw
   marketing-subdomein (§7.2). Afzender omzetten naar `news@materialdistrict.com`.
5. **Re-engagement-subdomein** met eigen DKIM en configuration set. Nu aanmaken, want het
   moet weken vóór gebruik beginnen met opwarmen (§7.4, §7.6).
6. SNS-topic → mailevents naar RDS via `md_analytics_submit_event()`.
7. `wp_md_mail_queue` + `wp_md_mail_suppression` + worker + suppressie-check + verzendplafond.
8. Voorkeurcentrum met tokenlink + one-click unsubscribe.
9. Campagne-verzending: `campaign.html` + doelgroepselectie + planning.
10. Naamconsolidatie `digest_frequency` / `md_mail_frequency` (§3.1).
11. Validatie (§7.7) + opwarmschema marketing-subdomein.

### Fase 1 — Your update (september/oktober)

12. `_md_first_approved_at` + `_md_distribution_approved` op de contenttypen.
13. Migratie: alle bestaande abonnees follows op alle channels en alle types (§4.1).
14. De assembler (§4), inclusief de lead-pin.
15. Drie crontiers.
16. "New in your channels"-listing als bestemming van "+N more" (frontend).
17. Sendy uitfaseren.

### Fase 1b — de servicemail naar de 33.188 (parallel, eigen tempo)

18. Opwarmen van het re-engagement-subdomein: drie tot vier weken een deel van de gezonde
    wekelijkse digest erlangs routeren (§7.6).
19. De servicemail zelf, in batches van 2.500 met de drempels uit §7.6.

Loopt naast fase 1 en mag die niet ophouden. Begint pas als het marketing-subdomein volledig
is opgewarmd.

### Fase 2 — alerts en de site-kant

20. Saved-search-alerts op dezelfde wachtrij.
21. `last_seen` + de "New in your channels"-listing (§5). Kan ook eerder; hangt niet aan de
    mailengine.

### Fase 3 — verfijning

Gedrag-ranking in blok 1, A/B-testen op onderwerpregel, sample-conversie-CTA's, gerichte
betaalde plaatsing.

---

## 10. Werkverdeling

**Johan:** §3.5, §4, §7 en de endpoints in §11, plus fase 0 punt 2 en 3.

**Claude:** de drie sjablonen (geleverd, `docs/mail-templates/`), het voorkeurcentrum, de
frequency-UI, het banner- en curatiescherm inclusief lead-pin, het veld markt-lanceerdatum op
het materiaalformulier, en de "New in your channels"-listing.

**Redactie:** per periode de banner inplannen, per editie de lead pinnen, en de maatwerkedities
vullen.

---

## 11. Endpoints (nieuw)

Namespace `/md/v2/…`, snake_case in WP, camelCase in de proxy, foutvorm `{ code, message }`.

| Endpoint | Auth | Doel |
|---|---|---|
| `GET /md/v2/mail/preferences?token=` | token of JWT | voorkeuren ophalen |
| `PATCH /md/v2/mail/preferences` | token of JWT | voorkeuren wijzigen (schrijft door naar het user-record) |
| `POST /md/v2/mail/unsubscribe` | token | `newsletter_consent` op nee; ondersteunt de one-click POST |
| `POST /md/v2/mail/subscribe` | publiek | aanmelden |
| `GET/POST /md/v2/mail/campaigns` | editor | edities beheren (incl. lead-pin) |
| `POST /md/v2/mail/campaigns/{id}/test` | editor | testverzending |
| `POST /md/v2/mail/campaigns/{id}/schedule` | editor | inplannen |
| `GET/POST /md/v2/mail/banners` | editor | flights beheren |
| `GET /md/v2/mail/preview/{queue_id}` | token | "view in browser" |
| `POST /md/v2/mail/audience` | intern | doelgroepvraag (§3.2) |

---

## 11a. Sjablonen — af

Drie productieklare sjablonen in `docs/mail-templates/`, in de huisstijl van de nieuwe site
(tokens uit `src/styles/globals.css`):

| bestand | maaltype |
|---|---|
| `your-update.html` | persoonlijke digest, volautomatisch |
| `theme-edition.html` | thema-editie, tien materialen rond één thema |
| `campaign.html` | campagne / beursuitnodiging |

**Uitgangspunt: de mail hergebruikt de materiaalkaart van de site**, niet een eigen
mailontwerp. Warme achtergrond `#fbfaf7`, witte kaarten met afgeronde hoeken, eigenschapspills,
merknaam in grijze kapitalen boven de titel, en de sitevoettekst met de groene
"Follow the Transition"-knop en het contactblok.

De engine levert kaarten **per rij gegroepeerd** aan (`rows[].left` / `rows[].right`), zodat er
geen plaatsingslogica in het sjabloon hoeft. Volledige placeholder-documentatie staat in
`docs/mail-templates/README.md`.

Bekende afwijkingen t.o.v. de site: Schibsted Grotesk laadt niet in Gmail en Outlook (valt
terug op Arial), Outlook op Windows maakt de hoeken vierkant, en de eigenschapspills staan
onder de foto in plaats van erover omdat tekst over beeld in Outlook niet betrouwbaar is.

De thema-editie volgt het skelet van de bestaande nieuwsbrief: tien materialen alfabetisch —
alle merken betalen hetzelfde, dus geen rangorde — met halverwege een breed artikel als
rustpunt en een bannerplek. Dat brede artikel is tevens de sterkste commerciële plek, mits
voorzien van een "in samenwerking met"-vermelding.

---

## 12. Afgehandelde open punten

| # uit de openingsprompt | besluit |
|---|---|
| 1. Send-knoop | Wij assembleren, SES verstuurt (§0) |
| 2. Mailtool | Geen; Sendy uitfaseren (§0, §7.1) |
| 3. Curatie banner/insider | Licht eigen scherm in het redactiedashboard (§4.4) |
| 4. Assemblage blok 1 | Selectie, volgorde, caps, batching (§4) |
| 5. Consent + `anonymous_id` | Eigendom datasessie; mailkant in §8 |
| 6. Frequency-UI | Eén globale knop, schrijft naar het user-record (§3.1, §11) |
| 7. Dubbele follow-events | **Afgerond, geen actie.** De frontend-wijziging in `follows.ts` is bewust nooit overgenomen; WordPress vuurt server-side af in `rest-follows.php`. `saved` en `shared` komen wél van de frontend (`DetailActions`) en bestaan nergens anders — geen dubbeltelling. |
| 8. Markt-lanceerdatum | **Vervallen** — hing aan "New in [Channel]", dat geschrapt is (§5). Eventueel alsnog als taxonomie-veld, buiten deze spec. |
| 9. Lijst- en voorkeurbeheer | Eén voorkeurcentrum op tokenlink (§8, §11) |
| 10. Deliverability + AVG | §7 en §8 |
| 11. Sjabloon en branding | Geleverd in `docs/mail-templates/` |

---

## 13. Open — voor Jeroen

Vastgelegd op 24-07 en dus niet meer open: afzender `news@materialdistrict.com` met reply-to
`info@`, postadres Amsterdamsestraatweg 43-A2 Naarden, wekelijkse verzending op dinsdag,
Insider-prijs €10 per maand in de mail, en de drie sjablonen.

Wat resteert:

1. **Het bereikgetal naar buiten.** De homepage noemt 80.000 abonnees; het werkelijke actieve
   bestand is 69.873. Voorlopig blijft het huidige getal staan (besluit 24-07). Vóór de eerste
   bannerverkoop is dit alsnog een keuze: geleverd bereik is voor een adverteerder het
   eerlijker en sterkere argument dan lijstomvang.
2. **Bannerprijzen en het aantal flights per periode.** Drie bannertags — één in Your update,
   één in de thema-editie, één in de campagnemails. Hoeveel je er per periode verkoopt en
   tegen welke prijs is een verkoopvraag, niet een ontwerpvraag; hoort bij Vincent en Dave.
3. **Bevestiging van de Insider-prijs.** €10 per maand staat nu in het sjabloon.
4. **Prijs en vorm van de partner-plek** in het brede artikel van de thema-editie.

---

## 14. Nog niet gebouwd

Deze spec beschrijft besluiten en levert sjablonen. In werkende software staat er nog vrijwel
niets. Ruwe inschatting, door Johan te bevestigen:

| onderdeel | omvang |
|---|---|
| Configuration sets + SNS → RDS | klein |
| Wachtrij, worker, retries, suppressie, verzendplafond | het hart van fase 0, enkele dagen |
| Import 8.148 + suppressie-oogst uit Sendy | klein, maar tijdgevoelig |
| Afmeldlink met token + one-click | klein |
| Campagneverzending naar een doelgroep | middel |
| **Fase 0 totaal** | **~2–3 weken Johan** |
| Assembler (scope, selectie, dedupe, caps, groeperen, rijen) | grootste losse stuk |
| Intro-generatie met hashen en cachen per unieke set | middel |
| Drie crontiers + renderer | middel |
| **Fase 1 totaal** | **~3–4 weken Johan** |
| Frequentieknop in het dashboard (frontend) | klein |
| "+N more"-pagina (frontend) | middel |

Fase 0 kan in september staan als er binnenkort begonnen wordt. De persoonlijke digest wordt
realistisch oktober. Dat is precies waarom de fasering zo ligt: de commerciële start hangt aan
fase 0, niet aan de engine.
