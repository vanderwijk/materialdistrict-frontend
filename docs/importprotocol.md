# Importprotocol

> **Normdocument.** De norm voor elke data-import en -verrijking op MaterialDistrict:
> beursbezoekers, exposanten, standbemanning, sprekers, boekkopers, nieuwsbriefabonnees,
> Moneybird-exports, externe verrijkingsbestanden.
>
> **Te delen aan het begin van elke importsessie.** Volg dit protocol; wijkt een opdracht ervan
> af, vraag dan door in plaats van te gokken.
>
> **De rode draad: naam is nooit een identiteit. Werk met bewijs, en bij twijfel beslis je niet
> zelf — je legt voor.**
>
> **Waarom dit bestaat.** De website is de ruggengraat van het bedrijf en de basis van het CRM.
> Data die verloren gaat of fout wordt gekoppeld is bedrijfswaarde die verdampt. In augustus 2026
> landde een import van 287 brands vrijwel leeg: nul adressen terwijl het exposantenbestand er 111
> gevuld had, geen btw, geen KvK, geen websites. Circa 193 bestaande brands misten hun
> Moneybird-verrijking. Eén persoon ging verloren doordat een bronbestand geen kopregel had. Het
> aantal geïmporteerde records klópte — daarom viel het niet meteen op.
>
> **Verhouding tot `mutatieprotocol.md`.** Dat gaat over het wijzigen van records waarvan je al
> weet welke het zijn. Dit gaat over vreemde data binnenbrengen, waar identiteit een tweede
> probleem is. De poorten uit het mutatieprotocol gelden hier onverkort; dit komt erbovenop.
>
> Versie 3.0 · 25-08-2026 · samenvoeging van twee onafhankelijk geschreven versies. Zie §Status.

---

## 1. Twee entiteiten, meer niet

De website kent exact twee soorten records:

- **brand** — een bedrijf of merk. Identiteit hard vast te stellen via KvK, btw of domein.
- **user** — een persoon. Identiteit via het e-mailadres.

Een bron die brand- en persoonsgegevens in één rij zet (zoals een exposantenlijst) wordt
**gesplitst** in twee records. Een persoonsnaam hoort nooit in een brand-veld. Een user wordt aan
een brand gekoppeld via het e-maildomein of expliciet uit de bron, met een functie erbij.

**Concernstructuur vraagt geen derde entiteit.** Dat Tarkett NL en Tarkett DE bij één concern
horen blijkt uit hun verschillende btw-nummers — een veld op de brand. Twee brands met
verschillend btw zijn twee aparte brands.

**Deelname aan een beurs is een gedateerd feit, geen entiteit** — een logregel bij een brand of
user. "Exposant editie 2016" blijft waar ook als het bedrijf niet meer bestaat; alleen de
contactgegevens verouderen. Zie §10.

---

## 2. Welke velden een import wél en niet mag vullen

### Brand — import-velden
`brand_name` · `website` · `email` · `phone` · `address_line_1` · `address_line_2` · `postcode` ·
`city` · `country` · `chamber_number` (KvK) · `vat_number` (btw) · socials (`linkedin`,
`instagram`, `facebook`, `youtube`, `twitter`, `pinterest`).

### Brand — NOOIT via import
`slug` · `description` · `logo` · `channels` · `keywords` · `applications` · `videos` ·
`gallery` · `downloads`.

Deze liggen buiten de importscope en worden ook niet "aangevuld". Het is redactie- en merkwerk
dat niet uit een bronbestand terug te halen is.

### User — import-velden
`first_name` · `last_name` · `email` · `phone` · `profession` · `industry` · `address` ·
`address_2` · `postcode` · `city` · `country` · `invoice_to_company` · `company` · `vat_number`.

- `profession` en `industry` zijn **keuzelijsten** — kies een bestaande waarde, geen vrije tekst.
  Onbekende waarde → review-lijst.
- `avatar_url` wordt niet via import gezet.

### Technische velden op een geïmporteerde user
- `md_account_kind = contact` → een geïmporteerd contact, **geen actief inlog-account**, telt niet
  als geregistreerde gebruiker. "Bestaat in de database" en "mag als profiel op de site" zijn twee
  verschillende dingen.
- `md_company_brand_id` → de gekoppelde brand.

---

## 3. Toelatingstoets — hoort deze partij er überhaupt in?

Niet alles wat in een bronbestand staat, hoort in de database. Beursbezoekerslijsten bevatten
studenten, journalisten, leveranciers van de organisatie en mensen die er één keer waren.

**Voor een brand — alle drie moeten kloppen:**

1. Het is een bedrijf, geen persoon of onderwijsinstelling zonder commerciële rol.
2. Er is een aantoonbare identiteit: KvK, btw of een eigen domein.
3. Het past bij MaterialDistrict: het maakt, levert of verwerkt materialen, of is een afnemer die
   relevant is voor de propositie.

**Voor een user — twee vragen:**

1. Is er een naam én een e-mailadres?
2. Wat is de rol? Vastgelegd, niet geraden — zie de woordenlijst in §10.

**Wat `AFGEWEZEN` krijgt:** studenten en onderwijs zonder commerciële rol · persoonlijke adressen
zonder bedrijfsrelatie · eigen medewerkers en leveranciers van de beursorganisatie · testrecords ·
rijen zonder naam of zonder identiteit.

**`AFGEWEZEN` is een uitkomst, geen weglating.** De rij blijft in de uitdraai staan mét reden,
zodat achteraf zichtbaar is wat er níét is geïmporteerd. Een stilzwijgend gefilterde bron is niet
controleerbaar.

**Twijfel gaat naar de review-lijst, niet naar `AFGEWEZEN`.** De fout is asymmetrisch: een
oninteressant bedrijf importeren kost een regel in de database, een interessant bedrijf weggooien
kost een klant.

---

## 4. Identiteit & ontdubbelen — op bewijs, nooit op naam

Matchsterkte per signaal:

| Sterkte | Signaal | Wat mag ermee |
|---|---|---|
| **Hard bewijs** | zelfde KvK of btw · zelfde e-mailadres · zelfde intern/bron-ID | samenvoegen mag |
| **Sterk signaal** | exact domein inclusief extensie | kandidaat — **eerst verifiëren** tegen KvK/btw |
| **Zwak signaal** | gelijkende naam · zelfde adres of telefoon | nooit alleen samenvoegen → review-lijst |

Regels:

- Zelfde btw/KvK bewijst dezelfde rechtspersoon, niet automatisch hetzelfde merk.
- Verschillende btw-nummers = aparte rechtspersonen (mogelijk één concern) → niet samenvoegen.
- **Eén domein kan bij meerdere merken horen** → verifiëren vóór samenvoegen. Een domein is een
  sterk signaal, geen bewijs.
- Generieke domeinen (gmail.com, outlook.com, hotmail.com) tellen nooit als identiteit.
- Bij twijfel: niet samenvoegen, maar naar de review-lijst.

**Bron-tag in plaats van duplicaat.** Bestaat het record al, dan krijgt het bestaande record een
herkomsttag — er komt geen tweede record bij.

---

## 5. Elke bronrij krijgt één expliciet besluit

Zodat achteraf reconstrueerbaar is wat er gebeurde:

`NIEUW` · `BIJWERKEN` · `KOPPELEN` · `MOGELIJK_DUBBEL` · `CONFLICT` · `AFGEWEZEN` · `ONGEWIJZIGD` ·
`ONGELDIGE_RIJ`

| Besluit | Betekenis |
|---|---|
| `NIEUW` | Nieuwe entiteit aanmaken als concept (§11) |
| `BIJWERKEN` | Bestaand record aanvullen — alleen bij hard bewijs |
| `KOPPELEN` | Alleen een relatie leggen (user aan brand) |
| `MOGELIJK_DUBBEL` | Lijkt op bestaand → review-lijst |
| `CONFLICT` | Spreekt bestaande of vergrendelde waarde tegen → review-lijst |
| `AFGEWEZEN` | Hoort niet op het platform (§3) |
| `ONGEWIJZIGD` | Bron voegt niets toe |
| `ONGELDIGE_RIJ` | Mist verplichte gegevens |

**De review-lijst is het hart van de veiligheid.** Alles waar geen zekerheid over is, wordt
voorgelegd aan een mens (Jeroen commercieel, Sigrid redactioneel). Liever tien dingen voorleggen
dan één fout samenvoegen.

---

## 6. Herkomst per veld: bron + datum reizen mee

Elk geïmporteerd gegeven draagt zijn herkomst. Niet alleen "Plesmanstraat 4", maar
"Plesmanstraat 4 — bron: `exhibitor-mdu26`, datum 2026-07-24".

- **Vaste bron-labels:** `exhibitor-mdu26` · `crew-mdu26` · `moneybird` · `research`
  (zelf afgeleid) · `editorial` (redactionele correctie).
- **Datumformaat ISO** (`2026-07-24`). Onduidelijke brondatum → vragen, niet verzinnen.
- Intern altijd aanwezig; publiek waar het vertrouwen wekt.
- Elke import krijgt een **batch-ID**, elke rij een **rij-ID**, zodat elk record herleidbaar is en
  een hele import op batch-ID terugdraaibaar.

**Waarom per veld en niet per record.** De conflictregel in §7 is niet uitvoerbaar met één stempel
per record: je weet dan alleen wanneer je voor het laatst naar het bedrijf keek, niet waar welk
veld vandaan komt. `last_checked` blijft bestaan als controledatum, maar volstaat niet.

---

## 7. Bij een conflict: autoriteit vóór datum

Wanneer twee bronnen iets anders zeggen:

1. **Menselijke veldvergrendeling wint altijd.** Wat redactie of Jeroen bewust corrigeerde staat
   op slot (`locked_by`, `locked_at`) en wordt door geen import geraakt.
2. **Hoogste bronautoriteit — per veld, niet globaal.** btw/KvK → officiële registers boven een
   beursformulier. Factuuradres → Moneybird boven een nieuwsbrieflijst. Opt-in → alleen de
   juridisch geldige toestemmingsbron.
3. **Bij gelijke autoriteit: de recentste bevestigde waarde.** "Recent" = wanneer de waarde geldig
   of geverifieerd was, **niet** wanneer het bestand toevallig werd aangeleverd. Een oud bestand
   dat je vandaag stuurt is geen actuele data.
4. **Een lege waarde overschrijft nooit een gevulde.**

**Standaardrangorde bij twijfel over autoriteit**, als vertrekpunt wanneer een veld niet in de
lijst hierboven staat — van sterk naar zwak: handmatige correctie → Moneybird → eigen
dashboardinvoer door het merk → exposantenregistratie → bezoekers-/ticketregistratie → externe
verrijking. Is de rang gelijk én de datum onbekend, dan gaat het veld naar de review-lijst.

---

## 8. Leeg is niet hetzelfde als verwijderd

| Waarde in de bron | Betekenis |
|---|---|
| lege cel | geen informatie — bestaande waarde blijft staan |
| expliciet `VERWIJDERD` of een einddatum | bewust weghalen |
| ongeldig (bijv. e-mailbounce) | markeren als ongeldig, niet stil wissen |
| verlopen | archiveren met einddatum |

Wissen gebeurt alleen op expliciete opdracht, nooit door een lege cel.

---

## 9. Mailadressen en toestemming

Sluit aan op het bestaande mailvoorkeur-model: `newsletter_consent` · `mail_suppressed` ·
`digest_frequency` · `mail_basis`.

- **Valideren vóór de eerste mailing.** Syntax én verifieerbaarheid. Onverifieerbare adressen
  worden gemarkeerd, niet gebruikt. Betaalde dienst (ZeroBounce, Kickbox, Bouncer) — circa €11 per
  2.200 adressen. **SMTP-ping is uitgesloten:** catch-all-servers zeggen overal ja, andere
  blokkeren je, en je IP belandt op zwarte lijsten.
- **Waarom dit geen optimalisatie is maar een verzekering.** Gaat de bounce rate boven 5%, dan zet
  AWS het SES-account op review. Dan werkt ook de transactionele mail niet meer —
  wachtwoord-resets, orderbevestigingen, alles. Eén slechte campagne kan de hele
  mailinfrastructuur meeslepen.
- **`newsletter_consent` komt uitsluitend uit een aantoonbaar geldige toestemmingsbron.** Een
  import zet niemand automatisch op de nieuwsbrief.
- **`mail_suppressed` (uitschrijving, spamklacht, hard bounce) is een harde blokkade** en wordt
  door een import **nooit** overschreven. Staat iemand in een bronbestand die zich eerder heeft
  afgemeld, dan blijft hij afgemeld.
- **De eigen bouncehistorie is een gratis eerste zeef** en moet uit Sendy geoogst worden vóór dat
  wordt uitgefaseerd (besluitenregister B14).

---

## 10. Deelnamefeiten — vaste woordenlijst

Elke bronrij levert minstens één gedateerd feit op. Gesloten lijst, geen vrije tekst — anders is
er over drie jaar niet meer op te filteren.

| Feit | Bij | Betekenis |
|---|---|---|
| `exposant` | brand | Had een stand op deze editie |
| `standbemanning` | user | Stond op de stand van een exposant |
| `bezoeker_geregistreerd` | user | Heeft zich aangemeld |
| `bezoeker_aanwezig` | user | Is daadwerkelijk geweest (badge gescand) |
| `no_show` | user | Aangemeld, niet gekomen |
| `spreker` | user | Heeft een lezing gegeven |
| `boekkoper` | user | Heeft een boek besteld |
| `abonnee` | user | Stond op de nieuwsbrieflijst |

Elk feit draagt **editie of datum**, **bron-label** en **batch-ID**.

Het onderscheid tussen `bezoeker_geregistreerd`, `bezoeker_aanwezig` en `no_show` is commercieel
het interessantst en verdwijnt zodra je ze samenvoegt tot "bezoeker". Wie zich drie keer aanmeldde
en nooit kwam is een ander verhaal dan wie er drie edities stond. Deze feiten zijn de basis onder
de prospectlijsten: "was exposant in 2016 en 2018, staat nog niet op het platform" is een
openingszin.

---

## 11. Nieuwe records komen binnen als concept

Een nieuw geïmporteerd record is niet zomaar "niet publiek", maar een concept:

- onzichtbaar op de site, niet in zoekresultaten, niet in nieuwsbrieven of exports;
- gemarkeerd als geïmporteerd, met zichtbaar waarom en welke velden onzeker zijn;
- een brand komt binnen als `record_status = prospect`, `visible = false`;
- pas publiceerbaar na een minimale controle door een mens.

*Het veld `record_status` bestaat al op brand maar is leeg op alle 2.093 gepubliceerde brands
(meting 25-08-2026). De waardenlijst moet worden vastgelegd vóór de eerste ronde.*

---

## 12. Externe verrijking — apart en gelogd

Ontbrekende data aanvullen via externe bronnen is géén gewone import en wordt apart gelogd.

**Afleidingsvolgorde bij een leeg verplicht veld:** andere bron in dezelfde levering →
e-maildomein van de eigen mensen → VIES-btw-register → eigen website → twee zoekmachines.

Per aanvulling loggen: bron, zoekopdracht, resultaat, datum, en waarom het aan dít record hangt.
Levert niets op → veld blijft leeg, mét reden. **Een zoekresultaat wordt nooit automatisch als
waarheid opgeslagen**; bij twijfel → review-lijst.

---

## 13. Twee verplichte controles per import

Deze maken fouten zichtbaar vóór er data wordt weggeschreven. Ze zijn niet optioneel.

**Vooraf — bronvalidatie en kolom-kwitantie.**

Eerst het bestand zelf: **heeft het een kopregel?** In augustus ging een persoon verloren omdat
een crew-bestand er geen had en de eerste regel als kop werd gelezen. Daarna het aantal rijen —
dat is later de controlesom.

Dan de kolom-kwitantie: een tabel met elke kolom uit de bron en waar hij landt. Een overgeslagen
kolom staat erin **mét reden**. Wordt geleverd en goedgekeurd vóór er iets gebouwd wordt. Zo is
een "vergeten" kolom een zichtbaar gat.

**Achteraf — vulling-telling.**

Per veld: hoeveel had de bron, hoeveel vult de import. Bron 111 adressen, import 0 → rode regel,
gaat niet de deur uit. Dit is precies wat in augustus niet gemeten werd: het recordaantal klopte,
de velden waren leeg.

Plus tellingen op nieuw / bijgewerkt / ongewijzigd / afgewezen / naar-review, en waarschuwingen
bij verkeerd formaat, generieke domeinen, users zonder brand, of onverwacht veel samenvoegingen.

Elke import kent een **dry-run** (dezelfde logica zonder databasewijziging) en wordt geleverd met
een **bestandsvingerafdruk (hash)**, zodat vaststaat dat wat gedraaid wordt gelijk is aan wat is
goedgekeurd.

---

## 14. Domeinkoppeling en beheerrechten

**Domeinkoppeling legt een verwachting vast, geen recht.** Wat we opslaan is `formatwood.com` →
brand Formatwood. Registreert iemand zich later met zo'n adres, dan stelt het platform de
koppeling voor: *"Werk je bij Formatwood? Dan kun je hun materialen beheren."*

**Domeinmatching geeft nooit automatisch beheerrechten.** Anders kan elke stagiair met een
bedrijfsadres het brandprofiel wijzigen, of een ex-werknemer wiens adres nog doorloopt. De eerste
persoon per brand wordt handmatig goedgekeurd — of bevestigd door de contactpersoon die we al
kennen — en laat daarna zelf collega's toe.

**Een geïmporteerd contact is geen account.** `md_account_kind = contact` betekent: in de
database, niet inlogbaar, telt niet als geregistreerde gebruiker. Een account ontstaat pas als de
persoon zelf handelt — registreren, een boek bestellen, een ticket kopen. Dat geeft de datapool en
de deelnamehistorie zonder honderden slapende accounts van mensen die er niet meer werken, en
zonder de AVG-vraag waarom er accounts zijn gemaakt voor mensen die daar nooit om vroegen.

---

## 15. Vaste volgorde per bron

1. **Batch-ID** toekennen (herkomst + datum). Onduidelijke datum → vragen.
2. **Bronvalidatie**: kopregel, rijtelling, kolom-vulgraad.
3. **Kolom-kwitantie** leveren en op akkoord wachten.
4. **Toelatingstoets** per rij (§3); `AFGEWEZEN` mét reden.
5. **Splitsen** in brand-velden, user-velden en relaties.
6. **Matchen** op harde identiteit (KvK/btw/e-mail); domein verifiëren; twijfel → review-lijst.
7. **Besluit per rij** bepalen (§5).
8. **Samenvoegen/aanvullen** volgens de conflictregels (§7) en de waarde-status (§8).
9. **Deelnamefeiten** vastleggen (§10).
10. **Externe verrijking** als aparte gelogde stap (§12).
11. **Herkomst per veld** + batch-log aanhangen (§6).
12. **Dry-run + vulling-telling** leveren, met bestandshash.
13. Na akkoord: **uitvoeren in een transactie** — alles of niets.
14. Bij een latere fout: **terugdraaien op batch-ID** — herstel naar de vorige waarde, geen botte
    verwijdering.

---

## 16. Rolverdeling

De imports worden met de hand voorbereid, gecontroleerd en als kant-en-klaar script geleverd. Er
is **geen geautomatiseerd importplatform**, en dat is een bewuste keuze: een mens beoordeelt elke
bron vóór verwerking. De databasebeheerder (Johan) hoeft zo min mogelijk te doen — alleen een
script draaien. Zware machinerie (idempotency, retry-logica, parallelle-schrijfbescherming) is
daardoor niet nodig.

| Stap | Wie |
|---|---|
| Bronvalidatie, kolom-kwitantie, toelatingstoets, matching, script | Claude |
| Dry-run, vulling-telling, review-lijst | Claude |
| Oordeel op de review-lijst en de patronen | Jeroen (commercieel) · Sigrid (redactioneel) |
| Script draaien in een transactie | Johan |
| Verificatie op vulgraad per veld | Claude |

**Wat Johan eenmalig bouwt:**

1. **Herkomst per veld** (provenance) + batch-log.
2. **Veldvergrendeling** (`locked_by`, `locked_at`).
3. **Conceptstatus** voor nieuwe records (`record_status = prospect`, `visible = false`).
4. **Deelnamefeiten** met de woordenlijst uit §10, editie en bron.
5. **Een transactie** om het importscript.

Al het overige gebeurt in de voorbereiding, niet in de database.

---

## Status

**v3.0 · 25-08-2026** — samenvoeging van twee onafhankelijk geschreven versies van dit protocol:
één uit deze sessie (v2.0) en één uit een parallelle importsessie. Ze overlapten grotendeels en
vulden elkaar op de resterende punten aan.

**Uit de parallelle versie overgenomen, omdat die concreter of strenger was:** de echte veldnamen
in plaats van categorieën (§2); `md_account_kind = contact` als technische oplossing voor het
onderscheid tussen contact en account (§2, §14); de gelaagde matchsterkte waarin **een domein een
sterk signaal is en geen bewijs** (§4); concernstructuur zonder derde entiteit (§1); batch-ID en
rij-ID met terugdraaien op batch (§6, §15); veldvergrendeling met `locked_by`/`locked_at` (§7);
bronautoriteit **per veld** in plaats van één globale rangorde (§7); "recent" als moment van
geldigheid en niet van aanlevering (§7); de vier waarde-statussen van leeg tot verlopen (§8);
nieuwe records als concept (§11); de afleidingsvolgorde bij externe verrijking inclusief VIES
(§12); kolom-kwitantie, bestandshash en transactie (§13, §15).

**Uit v2.0 behouden, omdat de parallelle versie ze niet had:** de toelatingstoets met expliciete
afwijsgronden (§3) — `AFGEWEZEN` bestond daar als uitkomst zonder criteria; de deelnamefeiten met
vaste woordenlijst inclusief het onderscheid geregistreerd/aanwezig/no-show (§10); de kopregel-
controle als aparte stap (§13); de reden achter e-mailvalidatie — de 5%-bouncegrens van SES (§9);
en de regel dat domeinmatching nooit automatisch beheerrechten geeft (§14).

**Eén inhoudelijke correctie op een bestaand besluit.** Besluitenregister B37.2 en B24 zeggen
"ontdubbelen op exact domein óf btw/KvK". De parallelle versie stelt terecht dat één domein bij
meerdere merken kan horen, en degradeert domein van bewijs naar sterk signaal dat eerst tegen
KvK/btw geverifieerd moet worden. Dat is een aanscherping van de norm en is als zodanig in het
besluitenregister vastgelegd — niet stilzwijgend doorgevoerd.

**Openstaand:** de waardenlijst voor `record_status` (§11). Het veld bestaat al op brand maar is
leeg op alle 2.093 gepubliceerde brands (meting 25-08-2026).

**v2.0 · 25-08-2026** — herbouwd als beslisflow. **v1.0 · 25-08-2026** — eerste vastlegging in de
moedermap; de kern kwam uit `datastrategie-specificatie.docx` (augustus 2026), dat niet in de
moedermap stond.

Opgesteld door Claude, namens Jeroen.
