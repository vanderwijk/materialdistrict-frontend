# Besluitenregister

> **Normdocument.** De gedeelde besluiten waarop de rest van de documentatie rust. Elk ander
> document verwijst hiernaar in plaats van zijn eigen versie van een besluit te dragen — zo
> blijft de set uitgelijnd en loopt hij niet uiteen.
>
> **Wat hier hoort:** een besluit dat méér dan één document, script of bouwronde raakt, en dat
> je over drie maanden opnieuw zou willen kunnen opzoeken. Wat hier niet hoort: code-conventies
> (die staan in `architecture-rules.md` en `START-HIER.md`), terminologie (`begrippenlijst.md`),
> en de norm voor classificatie (`docs/materiaal-classificatie-regelboek.md` in de frontend-repo).
>
> **Hoe je ernaar verwijst:** bij nummer en bij naam, nooit bij versienummer van dit bestand.
> "Zie B12" is genoeg; de actuele tekst staat hier.
>
> **Herzien, niet overschrijven.** Wordt een besluit achterhaald, dan blijft het staan met een
> `HERZIEN DOOR`-regel eronder. De redenering waarom het ooit klopte is vaak nog geldig; wat
> ontbrak hoort erbij te staan. Alleen een besluit dat nooit gegolden heeft, wordt geschrapt.
>
> Versie 1.25 · 04-09-2026 · B88: het CMS is live-only voor Stripe; e2e tegen test-Stripe is een
> bewuste, tijdelijke handeling.
> Gereconstrueerd uit `docs/`, `session-log.md`,
> `roadmap.md` en `livegang-checklist.md` van de moedermap-stand van 24-08-2026. Zie §Status.

---

## Leeswijzer per regel

Elk besluit heeft dezelfde vier velden:

- **Besluit** — wat er is besloten, in één of twee zinnen.
- **Grond** — waarom, kort. Zonder de grond is een besluit over drie maanden niet te herzien.
- **Bron** — datum + wie + het document waar het vandaan komt.
- **Raakt** — welke documenten, code of processen ervan afhangen.

Staat er `TE BEVESTIGEN`, dan is het besluit wel genomen maar niet in de moedermap
teruggevonden; het is gereconstrueerd en moet door Jeroen of Johan bevestigd worden voordat
erop gebouwd wordt.

---

## 1. Architectuur & hosting

### B1 · Cutover-architectuur — Vercel + headless CMS op DigitalOcean
**Besluit.** `materialdistrict.com` wijst naar Vercel (Next.js frontend); het CMS draait
headless op DigitalOcean als `cms.materialdistrict.com`. Media en uploads staan op
`media.materialdistrict.com`.
**Grond.** Splitsing van publieke laag en redactielaag; de oude monolithische WP-site kan niet
tegelijk publieksverkeer en redactie dragen.
**Bron.** 01-08-2026, `livegang-checklist.md` §0.1.
**Raakt.** Alle API-calls, cache-strategie, DNS, `next.config.ts`, elke deploy.

### B2 · Rollback-pad blijft open op WP Engine
**Besluit.** De oude klassieke site blijft na cutover in de lucht op WP Engine, zonder DNS.
Bij ernstige problemen gaat DNS van `materialdistrict.com` terug van Vercel naar WP Engine.
**Grond.** Een cutover zonder terugweg is geen cutover maar een gok.
**Bron.** 01-08-2026, `livegang-checklist.md` §0.1.
**Raakt.** Afbouwbeslissing WP Engine (nog niet genomen), FacetWP-afhankelijkheid (B8).

### B3 · Boekshop verhuist naar het hoofddomein
**Besluit.** `books.materialdistrict.com` wordt uitgeschakeld voor bezoekers; alle URL's 301'en
naar `materialdistrict.com/book/`. Uitgevoerd via host-based redirects in `next.config.ts`, niet
via redirects op WP Engine.
**Grond.** Eén domein, één shop; de redirects horen bij de partij die het verkeer ontvangt.
**Bron.** 06-08-2026, `note-books-subdomain-redirect-2026-08-06.md`. Live sinds 06-08-2026.
**Raakt.** SEO-migratieplan, `next.config.ts`, WooCommerce-migratie.

### B4 · Het CMS toont geen publieke content
**Besluit.** `cms.materialdistrict.com` draait een lockdown-theme: anonieme content-URL's 301'en
naar de frontend, de homepage is een editor-gateway met `noindex`, `/xmlrpc.php` geeft 403.
Allowlist zonder redirect: `/wp-json/*`, `/wp-admin`, `/wp-login.php`, ajax, cron, uploads.
**Grond.** Twee publieke kopieën van dezelfde content is een SEO-probleem en een verwarringsbron
voor de redactie.
**Bron.** 06-08-2026, `note-cms-lockdown-theme-2026-08-06.md`.
**Raakt.** Redactieworkflow ("bekijk op site"), draft-preview (bekende beperking), SEO.

### B5 · SearchWP Metrics telt niet mee in headless context
**Besluit.** SearchWP Metrics slaat geen visitor-UID meer aan op REST-, cron-, CLI- en
ajax-verzoeken; zoekopdrachten worden daar niet gelogd.
**Grond.** Headless betekent dat elke frontend-render tientallen cookieloze WP-bootstraps doet.
Elke bootstrap maakte een nieuwe UID; met binlogs erbij groeide de schijf ~22 GB/uur en liep het
CMS binnen 2,5 uur vol. ~445.000 van de ~446.000 UID's waren wees-records.
**Bron.** 06-08-2026, `note-cms-disk-full-binlog-2026-08-06.md`.
**Raakt.** Elke toekomstige WP-plugin die per request iets wegschrijft — dit is het patroon om
op te letten, niet een incident.

### B6 · CMS-droplet op 4 vCPU / 8 GB, doorbelast
**Besluit.** De DigitalOcean-droplet is geüpgraded naar 4 vCPU / 8 GB RAM; de meerkosten worden
doorberekend op de maandfactuur aan MaterialDistrict. De SearchWP-indexer staat daarna weer aan.
**Bron.** 06-08-2026, `note-searchwp-indexer-uit-2026-08-06.md`.
**Raakt.** Kostenbasis, hostingafspraken met Johan.

### B7 · AI-crawlers blijven toegestaan
**Besluit.** Na de DDOS van 22-06 wordt de Cloudflare-knop die AI-crawlers blokkeert *niet*
aangezet. Rate limiting en Bot Fight Mode komen er wel als permanente onderlaag; "under attack
mode" is een noodknop, geen permanente stand — hij hindert ook de headless API-calls vanaf Vercel.
**Grond.** Vindbaarheid in AI-zoekantwoorden weegt zwaarder dan content afschermen.
**Bron.** 22-06-2026, Jeroen. `roadmap.md` §1.
**Raakt.** Cloudflare-configuratie, cache-hardening, de API-paden die uitgezonderd moeten blijven
als de challenges ooit worden aangescherpt.

---

## 2. Data & analytics

### B8 · FacetWP is uitgefaseerd
**Besluit.** FacetWP is van het CMS verwijderd. Materials-filters lopen via
`POST /md/v2/materials/facet-query` (native WP).
**Grond.** Laadsnelheid (meerdere FacetWP-calls per request), plugin-armoede in een headless
stack, en één filtermodel dat aansluit op brands en channels op andere post types.
**Bron.** Juni 2026, afgerond en bevestigd 07-08-2026. `note-go-live-facetwp-uitfaseren.md`,
`facetwp-phase-out-policy.md`.
**Raakt.** `roadmap.md` (waar nog "op de FacetWP-infra" staat is verouderde tekst), elke
filterimplementatie.

### B9 · Analytics staat in een aparte database
**Besluit.** Gedragsevents gaan naar een eigen analytics-database, niet naar de content-database.
De keten is WP `/md/v2/events` → API Gateway → Lambda → SQS → Lambda → RDS.
**Grond.** Statistiek en content zijn twee verschillende levensduren en twee verschillende
belastingsprofielen.
**Bron.** `fase1-logging-datalaag-plan.md`; live sinds 18-06-2026 (Johan).
**Raakt.** Eventlaag, businessdashboard, mailrapportage (B15).

### B10 · RDS is de telbron; leads blijven in WordPress
**Besluit.** De interactions-route (`website_click`, `brochure_download`) schrijft de telling door
naar RDS via `md_analytics_submit_event()`. Het manufacturer-dashboard leest via
`md_analytics_api_get_total_count()`. Er zijn geen WP-meta-tellers meer. De leads zelf — de
lead-CPT en de opvolging per fabrikant — blijven in WordPress.
**Grond.** Alle statistiek op één plek; CRM hoort niet in een analytics-database.
**Bron.** 19-06-2026 (plugin-analyse), live 30-06-2026 (Johan).
**Raakt.** `dual-write-events-voorstel.md`, `event-spec-gedrag.md`, dashboardstatistieken.
**Verfijning (30-06).** Brochure-downloads tellen per losse PDF, niet als totaal per materiaal:
`download_scope` (brand|material) + teller per attachment. Historische per-PDF-data bestaat
vrijwel niet; de telling klopt vanaf 30-06 vooruit.

### B11 · Users worden niet blind gesynchroniseerd
**Besluit.** De incrementele sync productie → CMS neemt géén users mee, alleen content. Bij
cutover volgt één gefilterde import van echte accounts sinds 22-06-2026.
**Grond.** Een steekproef van ~100 recente productie-users was ~62% duidelijke spam. Een blinde
sync zet die bots via de achterdeur in het CMS.
**Bron.** 24-07-2026, `livegang-checklist.md` §2.3b.
**Raakt.** Cutover-draaiboek, `MD_CLOSE_CLASSIC_REGISTRATION`, mailbaarheid (B15).

### B12 · Een draft brand geeft geen dode link
**Besluit.** Staat een brand niet op `publish`, dan levert de API `brand_slug: null` en
`brand_public: false`. De frontend toont de merknaam wel, maar linkt niet en toont geen
"View all". Bij publiceren van een material met een niet-publieke brand krijgt de redactie een
waarschuwing — geen blokkade.
**Grond.** "Gepubliceerd material zonder publieke brandpagina" is een legitieme permanente
toestand (dode bedrijven, archief), geen fout die je met 209 materials offline halen oplost.
Een brandpagina is een redactioneel product, los van materialpublicatie.
**Bron.** 07-08-2026, `note-draft-brands-decision-2026-08-07.md`, na Johans vraag van 06-08.
**Raakt.** API-contract, frontend-linkgedrag, redactietriage (139 brands archiveren, 23
controleren).

---

## 3. Mail & distributie

### B13 · Wij assembleren, SES verstuurt
**Besluit.** De mail wordt per ontvanger samengesteld in WordPress en als kant-en-klare HTML aan
Amazon SES aangeboden. Geen lijsttool in het verzendpad.
**Grond.** "Your update" is per ontvanger anders; bij vrij combineerbare channels is het aantal
onderscheiden follow-sets in de praktijk gelijk aan het aantal ontvangers. Een lijsttool werkt met
segmenten en kan dat niet.
**Bron.** 24-07-2026, `mailsysteem-spec.md` v7 §0.
**Raakt.** `blauwdruk-email-nieuwsbriefsysteem.md` (toolafweging vervallen),
`backend-spec-datalaag-follow.md` §7, de hele digest-engine.

### B14 · Geen mailtool — Sendy wordt uitgefaseerd, niet vervangen
**Besluit.** WordPress is de lijst, SES de verzender, met een dunne eigen laag in de `md`-plugin.
**Grond.** Lijst en consent liggen al op het user-record; een tool ernaast maakt daar een tweede
waarheid van. Doorslaggevend: SES levert open-, klik-, bounce- en klachtevents via een
configuration set in dezelfde eventketen als `material_viewed` en `channel_followed` — een externe
tool zou openrates en gedrag uit elkaar trekken.
**Bron.** 24-07-2026, `mailsysteem-spec.md` v7 §0 en §1.
**Raakt.** `mailautomation-overdracht.md` (waar "Sendy-op-SES als lead" staat, is achterhaald),
bounce-historie moet uit Sendy geoogst worden vóór uitfasering.

### B15 · Het mailsysteem bezit geen contactgegevens
**Besluit.** Wie gemaild mag worden staat op het user-record en komt uit de datasessie. Het
mailsysteem leest dat en berekent er niets bij.
**Grond.** Eén waarheid over mailbaarheid; consent is geen afgeleide.
**Bron.** 24-07-2026, `mailsysteem-spec.md` v7 §0, `mailvoorkeur-datamodel.md`.
**Raakt.** Elke plek waar mailbaarheid wordt bepaald.

### B16 · Bestaande abonnees gaan op álle channels
**Besluit.** Geen aparte huiseditie. De bestaande nieuwsbrief is simpelweg de digest van iemand
die alles volgt; bestaande abonnees krijgen alle channels en alle contenttypes.
**Bron.** 24-07-2026, `mailsysteem-spec.md` v7 §0.
**Raakt.** Migratie van de bestaande lijst, de digest-assembler.

### B17 · Er is geen aparte channel-mail — "New in [Channel]" is geschrapt
**Besluit.** Een gecureerde mail per channel bestaat niet als eigen product. Er zijn twee
mailproducten: **Your update** (de gepersonaliseerde digest op basis van follows) en
**campagne-/event-maatwerk**.
**Grond.** Twee argumenten. De ontvangers hebben die inhoud al in hun Your update gehad. En met
achttien à twintig channels zou het twintig redactionele edities per maand betekenen — het
grootste nieuwe terugkerende werk in een systeem dat het redactiewerk juist moest vermínderen.
Het idee stond alleen in sessie X7.2 van 18-06 en nergens in de moedermap, en is vrijwel zeker
ontstaan uit naamsverwarring met de site-functie "New in your channels".
**Bron.** 24-07-2026, Jeroen. `mailsysteem-spec.md` v7 §5.
**Raakt.** Mailtypen-overzicht. Wat wél bestaat onder die naam is de *site*-functie: de
cross-channel listing achter "+N more", ingelogd — pull in plaats van push, op `last_seen` in
plaats van `last_sent`. Die staat nog open (`roadmap.md` §3).
**Bevestigd 25-08-2026.** Zie B18a: de frequentiekeuze per gebruiker staat hier volledig los van
en is niet geraakt door dit besluit.

### B18a · De gebruiker kiest zijn eigen digest-frequentie
**Besluit.** `digest_frequency` staat op het user-record en wordt door de persoon zelf gezet:
**daily** (elke dag 07:00 CET), **weekly** (dinsdag 07:00), **monthly** (eerste dinsdag van de
maand 07:00) of **none**. Bij `none` gaat er geen Your update uit, wel campagnemail mits consent.
Staat consent op nee, dan gaat er niets uit, ongeacht de frequentie.
**Startwaarde.** Bestaande abonnees (61.764 actief) beginnen op **weekly** — niemand heeft ooit
een frequentie gekozen en weekly ligt het dichtst bij de huidige nieuwsbriefcadans.
**Grond.** Frequentie is een voorkeur van de ontvanger, geen redactioneel product. Dat is precies
het verschil met B17: dáár ging het om twintig door de redactie te maken edities, hier om één
digest die de gebruiker vaker of minder vaak ontvangt.
**Bron.** `mailsysteem-spec.md` v7 §4, `mailvoorkeur-datamodel.md`.
**Status: frontend gebouwd.** `FollowDigestBlock`, `FollowToggle` en `DetailChannelPill` bieden
de keuze en schrijven naar `PATCH /md/v2/follows/mail-frequency`. De verzendkant (cron per
frequentie, wachtrij, worker) is nog niet gebouwd. Cron via de systeem-cron, niet WP-cron — die
hangt aan paginabezoek en is hiervoor te wisselvallig.

### B18 · Afzender is `news@materialdistrict.com`; geen apart marketing-subdomein
**Besluit.** Geen apart marketing-subdomein. Afzender wordt `news@`. Opwarmen geldt alleen nog
voor het re-engagement-subdomein.
**Grond.** Het hoofddomein heeft al reputatie; een vers subdomein zou opgewarmd moeten worden
zonder dat daar iets tegenover staat.
**Bron.** 24-07-2026, `mailsysteem-spec.md` v7 §7.2 en §7.4.
**Raakt.** SPF/DKIM/DMARC-configuratie, de servicemail (B19).

### B19 · De servicemail naar de 33.188 uitschrijvers gaat door
**Besluit.** Eenmalig servicebericht met een echte keuze (opt-in) naar de 33.188 uitschrijvers,
vanaf een eigen re-engagement-subdomein dat zelf opgewarmd moet worden vóór gebruik.
**Bron.** 24-07-2026, Jeroen. `mailsysteem-spec.md` v7 §7.6, `mailvoorkeur-datamodel.md`.
**Raakt.** Domeinreputatie, juridische houdbaarheid van de opt-in, planning fase 0.

### B20 · Distributie is een eigen poort, los van publicatie
**Besluit.** Alleen redactioneel goedgekeurde content komt in outbound-kanalen. Publicatie op het
platform en distributie naar buiten zijn twee aparte besluiten; live-op-platform is niet
automatisch klaar-voor-verzenden. In v7 geldt de distributie-goedkeuring in de praktijk voor
merkuploads (`_md_distribution_approved`), met `_md_first_approved_at` als write-once ijkpunt.
**Grond.** Een merkupload die door de publicatiepoort komt, hoeft nog niet geschikt te zijn om
in naam van MaterialDistrict de deur uit te gaan.
**Bron.** 22-06-2026 (principe), 24-07-2026 (scope in `mailsysteem-spec.md` v7 §3.5).
**Raakt.** Digest-engine, submissions-flow, elke toekomstige agent die content voorbereidt.

---

## 4. Redactie & rechten

### B21 · Redacteuren werken via `edit_others_posts`, geen eigen capability
**Besluit.** Geen eigen `md_manage_content`-capability. In `md_dashboard_require_managed_brand()`
(`rest-dashboard.php`) slippen users met `edit_others_posts` de `connected_brand_id`-check.
Brands en materials zijn daarmee admin-breed bewerkbaar; de eigenaar-flow voor gewone members is
ongewijzigd, `require_brand_material` is niet aangeraakt.
**Grond.** Dicht bij de bestaande Editor-rol blijven in plaats van een eigen rechtenstelsel
optuigen.
**Bron.** 22-06-2026, gedeployed door Johan. `redactie-dashboard-rechten-voorstel.md`.
**Raakt.** Redactiedashboard, brand-switcher (nog te bouwen — de switcher leest nu nog
`connected_brands[]` uit `/auth/me`, dus een Editor ziet in de UI alleen gekoppelde brands
terwijl de API alles toestaat).
**Scope-grens.** Stories, events, talks, books en users hebben géén dashboard-endpoints. Dat
blijft nieuwbouw en valt buiten deze patch.

---

## 5. Classificatie

> De inhoudelijke norm staat in `docs/materiaal-classificatie-regelboek.md` in de **frontend-repo**.
> Hieronder alleen de besluiten die daarbuiten doorwerken.

### B22 · Het regelboek in de frontend-repo is de enige canonieke versie
**Besluit.** Canoniek pad: `materialdistrict-frontend/docs/materiaal-classificatie-regelboek.md`.
Geen tweede kopie onder `docs/cms-plugin/`. De private plugin-repo mag een pointer houden, geen
parallelle normtekst.
**Grond.** Twee bestanden met dezelfde naam lopen uiteen (19-08: frontend nog op 1.1). De
plugin-repo is privé; de frontend-repo is de gedeelde werkruimte voor Claude/Jeroen — daarom
woont de norm daar, niet omgekeerd.
**Bron.** 19-08-2026 regelboek §Werkwijze; bevestigd 26-08-2026 (Johan); Claude-klaring 26-08.
**Raakt.** `START-HIER.md` (bronhiërarchie), elke classificatiesessie.
**HERZIEN 26-08-2026.** Eerdere formulering (“alleen in de plugin-repo”) botste met de
toegangsreden; cms-plugin-kopie en v1.3 zijn verwijderd.

### B23 · Certificaten zijn geen channel-bewijs
**Besluit.** C2C, FSC en PEFC tellen op zichzelf niet als bewijs voor een channel. De
materiaaltekst moet een expliciete claim maken.
**Grond.** Een certificaat zegt iets over een proces, niet noodzakelijk over de eigenschap
waarop het channel selecteert.
**Bron.** Regelboek (`docs/materiaal-classificatie-regelboek.md`).
**Raakt.** Elke classificatieronde, elk classificatiescript.

### B24 · Vier harde uitsluitingsregels
**Besluit.** (1) Minerals, metals, glass, ceramics, concrete en stone kunnen geen *Bio-based &
Living Materials* dragen. (2) *Timber* vereist een houtidentiteit. (3) Uiterlijk-woorden (look,
print, effect, imitation) tellen niet als compositiebewijs. (4) Een merknaam-match alleen is geen
bewijs.
**Grond.** Alle vier zijn uit fouten geleerd; het zijn negatieve regels omdat een positieve
definitie de verkeerde aanname niet uitsluit.
**Bron.** Regelboek (`docs/materiaal-classificatie-regelboek.md`).
**Raakt.** Elk classificatiescript, elke handmatige ronde.

### B25 · Materiaalcodes zijn stabiele identifiers
**Besluit.** `_material_code` verandert niet mee bij een typewijziging. De prefix wordt daarmee
historisch. Bestaande codes worden niet bijgewerkt; fysieke samples hoeven niet opnieuw gelabeld
te worden.
**Grond.** De code is een identifier, geen classificatie. Herlabelen van de fysieke
samplecollectie weegt niet op tegen cosmetische consistentie.
**Bron.** 19-08-2026, regelboek §2a.
**Raakt.** Elke type-mutatie, de samplecollectie, `_material_code`-gebruik in scripts.

### B26 · Een script mag een channel-set nooit leegmaken
**Besluit.** Een classificatiescript kan channels toevoegen en vervangen, maar mag het resultaat
nooit leeg achterlaten. Bij een versmallende regel die alles zou weghalen: geen mutatie, wel een
rapportregel.
**Grond.** Een leeg channelveld is niet te onderscheiden van "nog niet beoordeeld" (zie
`mutatieprotocol.md`, de gereserveerd-versus-dood-val).
**Bron.** Biophilic-versmalling. `materiaal-classificatie-regelboek.md`.
**Raakt.** Elk bulkmutatiescript. Nu ook algemeen vastgelegd in `mutatieprotocol.md` §4.

---

## 6. Werkwijze & documentatie

### B27 · Bronhiërarchie — een normdocument wint van een sessiebundel
**Besluit.** Een normdocument in `docs/` wint van alles. Een sessiebundel is een momentopname,
geen gezag; spreekt hij een normdocument tegen, dan verliest de bundel en wordt hij gecorrigeerd
of ingetrokken. Elke bundel noemt bovenaan de normdocumenten die over het onderwerp gaan, met
pad. Claude begint een sessie over een genormeerd onderwerp door dat normdocument op te vragen,
ook als de bundel compleet lijkt.
**Grond.** Een sessie waarin een bundel het tegendeel beweerde van het geldende regelboek, en
Claude de bundel volgde.
**Bron.** 31-07-2026, `START-HIER.md`.
**Raakt.** Elke sessie. Dit register is er een uitwerking van: het maakt losse besluiten
opzoekbaar zonder dat er een bundel voor nodig is.

### B28 · Verwijzen bij naam, nooit bij versienummer
**Besluit.** Documenten verwijzen naar elkaar bij naam en — waar van toepassing — bij
besluitnummer. Niet bij versienummer, want dat veroudert in de verwijzing terwijl het document
doorloopt. Zips en leveringen dragen wél een versienummer; documenten in de moedermap niet, in de
verwijzing.
**Grond.** "Zie regelboek v1.3" wijst binnen een week naar niets.
**Bron.** 25-08-2026, deze sessie. Overgenomen uit de Sample.Store-documentenset.
**Raakt.** Alle onderlinge verwijzingen.

### B29 · Elk normdocument draagt onderaan een statusparagraaf
**Besluit.** Elk levend document eindigt met: wat er in deze versie is veranderd, waarom, en wat
de aanleiding was. Correcties worden vastgelegd, niet stil overschreven — inclusief versies die
zijn opgesteld maar nooit in de repository zijn geland.
**Grond.** Het regelboek doet dit al en het heeft daardoor drie mislandingen (1.3, 1.5, 1.7)
zichtbaar kunnen maken. Zonder die paragraaf was er "ruim een week gewerkt met een normdocument
dat vier besluiten als open toonde" zonder dat iemand het had kunnen terugvinden.
**Bron.** 25-08-2026, deze sessie; patroon uit het regelboek.
**Raakt.** `roadmap.md`, `begrippenlijst.md`, `mutatieprotocol.md`, dit register.

---

## 7. Membership, tiers & statussen

### B30 · Twee gescheiden membership-systemen
**Besluit.** Brand-membership (tiers voor merken) en Insider (readertier voor personen) staan
volledig los van elkaar. `legacy` is uitsluitend een brand-/materiaalbegrip en is géén geldige
waarde op `user.membership_status`.
**Bron.** `docs/cms-plugin/database.md` (19-05-2026), `membership-config.md`.
**Raakt.** Elke plek waar "lid" of "member" wordt gezegd — zie `begrippenlijst.md`.

### B31 · Vier brand-tiers, met een grandfathered-tarief ernaast
**Besluit.** `brand.tier` = `free` / `basic` (€750/jr) / `plus` (€1.500/jr) / `partner`
(€3.000/jr), default `free`. Daarnaast `brand.tier_grandfathered` = `null` / `pro_5` (€995/jr) /
`pro_10` (€1.245/jr) voor bestaande relaties op een afwijkend tarief.
**Grond.** Bestaande members moeten tegen hun oude tarief kunnen doorlopen zonder dat het nieuwe
prijsmodel erop hoeft te worden geforceerd.
**Bron.** `docs/cms-plugin/database.md` A1–A2, geïmplementeerd (batch A `done`).
**Raakt.** Dashboard, `/become-a-partner`, Stripe-productnamen, de member-outreach.
**Let op.** In de UI heet `basis` "Basic"; de sleutel blijft `basis`. Een bredere hernoeming
(Starter / Professional / Partner) is besproken en **uitgesteld** (31-07-2026).

### B32 · Zes publicatiestatussen op materiaalniveau
**Besluit.** `material.publication_status` = `member` / `standalone_regular` (€250/jr) /
`standalone_grandfathered` (€100/jr) / `legacy` / `former_member` / `former_standalone`.
**Default voor bestaande materialen: `legacy`.**
**Grond.** Het onderscheid tussen betaald, historisch en beëindigd bepaalt zichtbaarheid,
filtering, badges en sortering — en is de basis onder de member-outreach.
**Bron.** `docs/cms-plugin/database.md` A4.
**⚠ NIET UITGEVOERD.** Gemeten op 25-08-2026: `publication_status` is **leeg op alle 3.246
gepubliceerde materialen**. Het veld bestaat, de backfill naar `legacy` is nooit gedraaid.
Daarmee is het hele onderscheid op dit moment onzichtbaar in de data. Zie §Bevindingen.

### B33 · Een brand heeft óf een tier, óf standalone-publicaties — nooit beide
**Besluit.** Bij `brand.tier = free` zijn alleen `legacy`, `standalone_*` en `former_*`
toegestaan; bij `basic`/`plus`/`partner` alleen `member`.
**Bron.** `docs/cms-plugin/database.md` A6.
**Open.** Of dit als harde constraint in WordPress wordt afgedwongen (bijvoorbeeld via een
`save_post`-hook) of alleen op UI-niveau, stond in de spec als beslissing voor Johan en is niet
teruggevonden als beantwoord.

### B34 · Legacy-materiaal verloopt op 30 april 2027
**Besluit.** Brands die vóór het nieuwe systeem materialen hadden krijgen een legacy-banner
("Your materials expire in X months") met automatische archivering op 30 april 2027; de actie is
een membership kiezen om de materialen te behouden.
**Bron.** `membership-config.md` §Legacy-modus.
**Raakt.** De member-outreach en de septembercampagne.
**Afhankelijk van B32.** Zolang geen enkel materiaal op `legacy` staat, kan de banner niet
verschijnen en kan de archivering niet draaien.

---

## 8. Data-import

> De volledige norm staat in `importprotocol.md`. Hieronder de besluiten die daarbuiten
> doorwerken.

### B35 · Een import raakt twee entiteiten: brand en user
**Besluit.** Alles wat in een bronbestand op een derde entiteit lijkt (materiaal, event, editie)
wordt vastgelegd als gedateerd feit bij brand of user, niet als nieuwe entiteit. Beursdeelname is
zo'n gedateerd feit: "exposant editie 2016" blijft waar, ook als het bedrijf verdwijnt.
**Bron.** `datastrategie-specificatie.docx`, augustus 2026.

### B36 · Import-velden en redactionele velden zijn gescheiden
**Besluit.** Een import mag schrijven op naam, adres, contact, btw, KvK, website en socials. Een
import komt **nooit** aan beschrijving, slug, logo, channels, keywords, applications, video's,
gallery en downloads.
**Grond.** De rechterkolom is redactie- en merkwerk dat niet uit een bronbestand terug te halen
is.
**Bron.** `datastrategie-specificatie.docx`, augustus 2026.

### B37 · Acht kernregels voor elke import
**Besluit.** (1) elke bronregel krijgt een expliciet besluit uit een vaste lijst; (2)
ontdubbelen alleen op aantoonbare identiteit — exact domein óf btw/KvK, nooit op naam; (3)
bronautoriteit gaat vóór datum bij conflicten; (4) een lege cel overschrijft nooit een gevulde
waarde; (5) handmatige correcties zijn veldgeslotend; (6) terugdraaien herstelt veldwaarden, het
verwijdert geen records; (7) externe verrijking is een aparte gelogde stap; (8) nooit blind
schrijven — eerst een volledige uitdraai ter goedkeuring.
**Grond.** De importronde van augustus 2026: 287 brands landden vrijwel leeg (nul adressen
terwijl de bron er 111 had), ~193 bestaande brands misten hun verrijking, en één persoon ging
verloren door een ontbrekende kopregel.
**Bron.** `datastrategie-specificatie.docx`, augustus 2026, na externe review.
**Raakt.** Elke importronde. Uitgewerkt in `importprotocol.md`.
**HERZIEN DOOR B46 (25-08-2026)** op regel 2: een domein is een *sterk signaal*, geen bewijs.
**HERZIEN DOOR B80 (25-08-2026)** op regel 6: terugdraaien mág records verwijderen wanneer de import
ze zelf heeft aangemaakt. De overige regels blijven ongewijzigd geldig.

### B38 · Domeinkoppeling legt een verwachting vast, geen account
**Besluit.** Geen accounts vooraf aanmaken voor bekende contacten. Sla alleen de verwachting op
(`formatwood.com` → brand Formatwood); bij registratie wordt de koppeling voorgesteld.
Domeinmatching geeft **nooit** automatisch beheerrechten: de eerste persoon per brand wordt
handmatig goedgekeurd en laat daarna zelf collega's toe.
**Grond.** Slapende accounts leveren records op voor mensen die er niet meer werken en een
moeilijk te verdedigen AVG-positie. En zonder handmatige eerste goedkeuring kan elke stagiair of
ex-werknemer met een bedrijfsadres het brandprofiel wijzigen.
**Bron.** Sessie juli 2026.
**Let op.** Vrije providers (Gmail, Hotmail) vallen hierbuiten — daar is de naam voor nodig.
**Beslist 25-08-2026 — contact, geen account.** De spanning met "account-by-default" uit de
dashboard-sessies is opgelost ten gunste van deze regel: een import maakt **contactrecords**, geen
inlogbare WordPress-users. De datapool en de deelnamehistorie ontstaan zonder dat er één account
bij komt; een account ontstaat pas als de persoon zelf handelt (registreren, boek bestellen,
ticket kopen). Zelfde datawaarde, fractie van het risico. Zie `importprotocol.md` §7.

### B39 · Valideren vóór mailen, met een betaalde dienst
**Besluit.** Geïmporteerde adressen gaan pas naar SES nadat ze zijn gevalideerd door een betaalde
dienst (ZeroBounce, Kickbox, Bouncer). SMTP-ping is uitgesloten.
**Grond.** Bij een bounce rate boven 5% zet AWS het SES-account op review, en dan werken ook de
transactionele mails niet meer — wachtwoord-resets, orderbevestigingen, alles. Eén slechte
campagne kan de hele mailinfrastructuur meeslepen. Voor ruim 2.200 adressen kost validatie
ongeveer €11. SMTP-ping deugt niet: catch-all-servers zeggen overal ja en je IP belandt op zwarte
lijsten.
**Bron.** Sessie juli 2026.
**Raakt.** Elke campagne op geïmporteerde data; de bouncehistorie moet uit Sendy geoogst worden
vóór uitfasering (B14).

### B40 · Verificatiestatus op brand en material
**Besluit.** `verification_status` (`unknown` / `checked` / `confirmed` / `archived`, default
`unknown`) en `last_checked` (datum) op zowel brand als material, meegeleverd in de REST-output.
**Grond.** De velden vóór de launch toevoegen is triviaal; erna is het een migratie op een live
database met duizenden rijen.
**Bron.** Verzoek aan Johan, juli 2026; velden gedeployed.
**Stand op 25-08-2026.** Brands: 110 `checked`, 1.983 `unknown`. Materialen: 3.246 `unknown`.
**Regel bij de sanering.** Niets verwijderen in ronde 1 — dode brands gaan op `archived`, niet in
de prullenbak. Weggooien kan altijd nog, terughalen niet. Een bedrijf geldt als levend tenzij er
hard bewijs van het tegendeel is; een dood bedrijf laten staan kost bijna niets, een levend
bedrijf archiveren kost een klant.

### B41 · Herkomst wordt per veld vastgelegd, niet per record
**Besluit.** Bij elke geïmporteerde waarde hoort welke bron hem leverde en wanneer — per veld, op
brand en op contact. Niet één stempel per record.
**Grond.** De conflictregel (B37.3, bronautoriteit vóór datum) is niet uitvoerbaar met herkomst
per record: je weet dan alleen wanneer je voor het laatst naar het bedrijf keek, niet waar welk
veld vandaan komt. `last_checked` per record blijft bestaan als controledatum, maar volstaat niet.
**Bron.** 25-08-2026, sessie documentatiefundament.
**Raakt.** Schema-uitbreiding bij Johan, vóór de eerste grote import — achteraf is het een
migratie op gevulde data.

### B42 · Bronautoriteit-rangorde
**Besluit (voorstel, één keer te bevestigen).** Bij twee gevulde en verschillende waarden wint de
sterkste bron, niet de nieuwste. Van sterk naar zwak: (1) handmatige correctie door Jeroen,
Sigrid of het merk — wint altijd, ongeacht datum; (2) Moneybird; (3) eigen dashboardinvoer door
het merk; (4) exposantenregistratie; (5) bezoekers-/ticketregistratie; (6) externe verrijking.
Binnen dezelfde rang wint de nieuwste; bij gelijke rang én onbekende datum gaat het veld naar de
beoordelingslijst.
**Grond.** "De nieuwste wint" laat een haastig ingevuld exposantenformulier uit 2026 winnen van
een factuuradres uit Moneybird waarop daadwerkelijk betaald wordt.
**Bron.** 25-08-2026, sessie documentatiefundament.
**Status.** Voorstel. Na bevestiging door Jeroen is dit norm en wordt het niet per ronde
heronderhandeld.

### B43 · Elk e-mailadres draagt een status; niets is mailbaar zonder validatie
**Besluit.** Zes statussen: `unchecked` (default bij import) · `valid` · `risky` · `invalid` ·
`bounced` · `unsubscribed`. Alleen `valid` is zonder meer mailbaar; `risky` alleen na handmatig
besluit. Een import heft **nooit** een afmelding op — `unsubscribed` wint van elke bron.
**Grond.** Zie B39: boven 5% bounce gaat het hele SES-account op review, inclusief de
transactionele mail.
**Bron.** 25-08-2026, sessie documentatiefundament; bouwt op B39.
**Raakt.** Schema-uitbreiding bij Johan; elke campagne op geïmporteerde data.

### B44 · Interactieen hebben een vaste woordenlijst
**Besluit.** Een bronregel levert gedateerde feiten op uit een gesloten lijst: `exposant` ·
`standbemanning` · `bezoeker_geregistreerd` · `bezoeker_aanwezig` · `no_show` · `spreker` ·
`boekkoper` · `abonnee`. Elk feit draagt editie of datum, bronbestand en importdatum. Geen vrije
tekst.
**Grond.** Het onderscheid tussen aangemeld, aanwezig en no-show is commercieel het interessantst
en verdwijnt zodra je ze samenvoegt tot "bezoeker". Vrije tekst is over drie jaar niet meer
filterbaar.
**Bron.** 25-08-2026, sessie documentatiefundament.
**Raakt.** Schema-uitbreiding bij Johan; de prospectlijsten en het businessdashboard leunen erop.

### B45 · Een import kent een expliciete toelatingstoets
**Besluit.** Niet alles wat in een bronbestand staat hoort in de database. Een brand moet
tegelijk een bedrijf zijn, een aantoonbare identiteit hebben (domein of btw/KvK) en passen bij
MaterialDistrict. Een contact heeft naam én e-mail, plus een vastgelegde rol. `REJECTED` is een
uitkomst mét reden in de uitdraai, geen stilzwijgende weglating. Twijfelgevallen gaan naar een
beoordelingslijst, niet naar `REJECTED`.
**Grond.** Beursbezoekerslijsten bevatten studenten, journalisten en leveranciers van de
organisatie. Tegelijk is de fout asymmetrisch: een oninteressant bedrijf importeren kost een
regel in de database, een interessant bedrijf weggooien kost een klant.
**Bron.** 25-08-2026, sessie documentatiefundament.

### B46 · Een domein is een sterk signaal, geen identiteitsbewijs
**Besluit.** Hard bewijs voor het samenvoegen van brands is uitsluitend: zelfde KvK, zelfde btw,
of zelfde intern/bron-ID. Voor users: zelfde e-mailadres. Een **exact domein** is een *sterk
signaal* dat eerst tegen KvK of btw geverifieerd moet worden — geen bewijs op zichzelf.
Gelijkende naam, zelfde adres of zelfde telefoonnummer zijn *zwakke* signalen en leiden nooit tot
samenvoegen, altijd tot de review-lijst.
**Grond.** Eén domein kan bij meerdere merken horen. Daarnaast: zelfde btw of KvK bewijst dezelfde
rechtspersoon, niet automatisch hetzelfde merk; en verschillende btw-nummers zijn aparte
rechtspersonen die tot één concern kunnen behoren (Tarkett NL en Tarkett DE) en dus niet mogen
worden samengevoegd.
**Bron.** 25-08-2026, parallelle importsessie; overgenomen bij de samenvoeging tot
`importprotocol.md` v3.0.
**Herziet.** B37 regel 2 ("exact domein óf btw/KvK") — die stelde domein gelijk aan bewijs. De
redenering van B37 blijft geldig; wat eronder ontbrak is dat een domein niet exclusief aan één
merk toebehoort.
**Raakt.** Elke importronde, elk ontdubbelingsscript, en de eerdere merge-actie van 37 brands die
op domein óf btw/KvK is uitgevoerd — die is met de oude, ruimere regel gedraaid.

### B47 · Nieuwe geïmporteerde records komen binnen als concept
**Besluit.** Een nieuw geïmporteerd record is onzichtbaar op de site, niet in zoekresultaten en
niet in nieuwsbrieven of exports. Het is gemarkeerd als geïmporteerd, met zichtbaar waarom en
welke velden onzeker zijn. Een brand komt binnen als `record_status = prospect`, `visible = false`
en is pas publiceerbaar na een minimale controle door een mens.
**Grond.** "Bestaat in de database" en "mag als profiel op de site" zijn twee verschillende
dingen. De kale-brands-ronde van augustus stond meteen live.
**Bron.** 25-08-2026, parallelle importsessie.
**Openstaand.** De waardenlijst voor `record_status` moet worden vastgelegd. Het veld bestaat al
op brand maar is leeg op alle 2.093 gepubliceerde brands (meting 25-08-2026).

### B48 · Veldvergrendeling en batch-terugdraaien
**Besluit.** Een bewust gecorrigeerd veld staat op slot (`locked_by`, `locked_at`) en wordt door
geen enkele import geraakt. Elke import draagt een **batch-ID**, elke rij een **rij-ID**;
terugdraaien gebeurt op batch-ID en herstelt de vórige veldwaarden — het verwijdert geen records.
Het importscript draait in een **transactie**: alles of niets.
**Bron.** 25-08-2026, parallelle importsessie; scherpt B37 regel 5 en 6 aan met een concrete vorm.
**Raakt.** Schema-uitbreiding bij Johan.

**HERZIEN DOOR B80 (25-08-2026)**: terugdraaien herstelt veldwaarden bij records die al bestonden,
maar mág records verwijderen die de import zelf heeft aangemaakt. De grens langs het batch-ID blijft
ongewijzigd geldig.

### B49 · "Recent" is het moment van geldigheid, niet van aanlevering
**Besluit.** Bij gelijke bronautoriteit wint de recentste **bevestigde** waarde: het moment waarop
de waarde geldig of geverifieerd was, niet het moment waarop het bestand werd aangeleverd.
**Grond.** Een oud bestand dat vandaag wordt gestuurd is geen actuele data.
**Bron.** 25-08-2026, parallelle importsessie.
**Verhouding tot B42.** B42 geeft een standaardrangorde voor het geval een veld niet onder een
expliciete regel valt. De parallelle versie stelt terecht dat bronautoriteit **per veld** wordt
bepaald en niet globaal — btw/KvK uit officiële registers, factuuradres uit Moneybird, opt-in
alleen uit een juridisch geldige toestemmingsbron. B42 blijft gelden als vangnet, niet als
hoofdregel.

### B50 · Geen geautomatiseerd importplatform
**Besluit.** Imports worden met de hand voorbereid, gecontroleerd en als kant-en-klaar script
geleverd. Er komt geen importplatform. Johan draait alleen het script.
**Grond.** Een mens beoordeelt elke bron vóór verwerking. Daardoor is zware machinerie —
idempotency, retry-logica, bescherming tegen parallelle schrijfacties — niet nodig.
**Bron.** 25-08-2026, parallelle importsessie.

### B58 · Verrijking is een stap ín de import, niet erna
**Besluit.** Levert een bron geen KvK, btw of domein, dan zoekt Claude die zelf op vóórdat er een
besluit valt. Afleidingsvolgorde: corroboratie in de eigen database → andere bron in dezelfde
levering → e-maildomein → KvK-handelsregister → VIES → bedrijfswebsite → zoekmachines. Verrijkte
waarden dragen bronlabel `research`, zijn de zwakste bron, vullen alleen lege velden en
overschrijven nooit. Per aanvulling wordt bron, zoekopdracht, resultaat en datum gelogd. Levert het
niets op, dan blijft het veld leeg mét reden.
**Grond.** Een bron die zichzelf niet kan identificeren is geen reden om het oordeel bij Jeroen te
leggen, maar een reden om te zoeken.
**Bron.** 25-08-2026, na de droogloop op MDU 2022.
**Raakt.** `importprotocol.md` §4b. Verrijking is een aparte batchronde met eigen batch-ID.

### B59 · Een naam-match is een onderzoeksopdracht, geen besluit
**Besluit.** Bij naamgelijkenis verifieert Claude zelf voordat er iets wordt voorgelegd. De
goedkoopste toets is domeincorroboratie: draagt het bestaande merk een website waarvan het domein
de genormaliseerde bronnaam bevat, dan is naam + domein samen wél bewijs. Pas wat daarna onzeker
blijft gaat naar de review-lijst.
**Grond.** In de droogloop op MDU 2022 leverde de oude regel 48 review-regels op 141 bedrijven —
`MOGELIJK_DUBBEL` werd de hoofdmoot in plaats van de uitzondering, en dat verschuift werk naar
Jeroen. Domeincorroboratie alleen bracht het terug naar 2. "Plexwood" tegenover een merk met
`plexwood.com` is geen twijfelgeval.
**Bron.** 25-08-2026.
**Wat níét verandert.** Samenvoegen mag nog steeds alleen op bewijs (B46). Naam alleen blijft
verboden; wat verandert is dat Claude het bewijs zelf gaat halen.

### B60 · Normaliseren gebeurt bij de import, met één standaard per veld
**Besluit.** Een import gebruikt alles wat de bron biedt en zet het meteen in de vastgelegde
notatie. De standaard: e-mail in kleine letters; website als `https://` zonder `www.` en zonder
afsluitende slash; telefoon in E.164 (`+31631968244`); land in ISO 3166-1 alpha-2; NL-postcode als
`1017 CE`; btw-nummer met landcode-prefix zonder punten of spaties, VIES-gevalideerd; KvK als acht
cijfers met voorloopnul; socials als volledige URL.
**Grond.** Normaliseren kost tijdens een import vrijwel niets en achteraf een hele mutatieronde.
**Bron.** 25-08-2026, Jeroen.
**Raakt.** `importprotocol.md` §2b. Normalisatie gebeurt **vóór** het matchen — een
niet-genormaliseerd domein matcht niet.

### B61 · Technische hygiëne is automatisch, presentatie is een voorstel
**Besluit.** Objectieve fouten worden zonder oordeel rechtgezet: HTML-entiteiten, dubbele spaties,
voor- en naspaties, hoofdletters in domeinnamen, ontbrekende protocollen. Keuzes gaan als
**patroonvoorstel** naar de review-lijst: rechtsvorm, kapitalisatie van bedrijfsnamen en steden.
**Grond.** Een merknaam is merkeigendom. "3M" mag niet "3m" worden omdat een script dat netter
vindt. Maar `&amp;amp;` in een naam is geen keuze, dat is een weergavefout.
**Bron.** 25-08-2026.
**HERZIEN DOOR B69 (25-08-2026)** voor plaats-, straat- en persoonsnamen: die worden wél
automatisch rechtgezet. Voor bedrijfsnamen blijft B61 onverkort gelden.
**Voorkeursnotatie rechtsvorm (voorstel):** `BV` en `NV` zonder punten — de meest voorkomende vorm
in de eigen database en de notatie van het KvK-handelsregister zelf. Internationale vormen
(`GmbH`, `Ltd`, `Inc`, `S.r.l.`, `SA`) blijven zoals het land ze schrijft.

### B62 · Opschonen met terugwerkende kracht is een bulkmutatie, geen import
**Besluit.** De bestaande database uniform maken loopt langs `mutatieprotocol.md` — dry-run,
oordeel op patroon, terugweg, verificatie — als eigen ronde met eigen batch-ID. Eerst de technische
hygiëne, daarna de presentatievoorstellen in één patroonbesluit.
**Nulmeting 25-08-2026** over 2.093 brands: land is al uniform (ISO alpha-2) en wordt niet
aangeraakt; website kent negen notaties (1.194 met `www.`, 437 zonder, 331 met slash, 111 nog
`http://`, 14 met hoofdletters); **83 bedrijfsnamen bevatten een letterlijke `&amp;amp;`**; 96 namen
staan volledig in hoofdletters; rechtsvorm komt in vier varianten voor (`B.V.` 72, `BV` 87, `b.v.`
3, `bv` 12); 38 steden staan volledig in hoofdletters. Telefoon is niet publiek meetbaar.
**Bron.** 25-08-2026.

### B63 · De import kent twee trappen en Jeroen doet twee handelingen
**Besluit.** Trap 1 is filteren: Claude levert één werkboek met exact twee tabbladen, WEL en NIET.
Trap 2 is importeren: alles op de WEL-lijst wordt aangemaakt of bijgewerkt — welk van de twee is
werk van Claude, niet van Jeroen. Jeroen doet twee dingen: bron en brondatum opgeven, en één keer
"ga" zeggen.
**Grond.** De eerdere versies produceerden lijsten waarin Jeroen per bedrijf moest oordelen: eerst
48 review-regels op 141 bedrijven, daarna 193 op 351. Dat is het omgekeerde van waar het protocol
voor is.
**Bron.** 25-08-2026, Jeroen.

### B64 · Er is geen bak "onbeslist"
**Besluit.** Elke bronregel krijgt een besluit. Is iets niet vast te stellen, dan gaat het naar
**NIET** met de reden en het gevonden bewijs erbij — niet naar een derde tabblad. Jeroens
correcties op de NIET-lijst zijn veldgesloten.
**Grond.** Een derde bak is een wachtrij voor Jeroen. Bovendien landt er zo nooit iets in de
database op een gok.
**Bron.** 25-08-2026.

### B65 · Koopgedrag is het eerste en sterkste bewijs
**Besluit.** Bij het filteren begint Claude bij wat het bestand zelf zegt over gedrag.
**Materiaalpublicatie en site membership zijn hard bewijs** van een materiaalleverancier.
**Beursdeelname, innovatiefonds en innovation hotspot zijn géén bewijs.** Alleen boeken kopen
evenmin; advertenties en nieuwsbrief-sponsoring maken iemand adverteerder, geen leverancier.
**Grond.** Een indeling op "betaalde voor beursdeelname of membership" liet 46 niet-leveranciers
binnen: vakmedia, vier onderwijsinstellingen, een cateraar, een ingenieursbureau, een
certificeringsinstantie en drie stichtingen. Betalen bewijst een relatie, geen propositie.
Omgekeerd bleek een factuurregel met "materiaalpublicatie" 120 bedrijven te beslissen zonder één
website te raadplegen.
**Bron.** 25-08-2026, droogloop op de Moneybird-export.

### B66 · Een leeg websiteveld is het startsein voor opzoeken, niet om op te geven
**Besluit.** Staat er geen website in de bron of is het domein dood, dan zoekt Claude het bedrijf
op — KvK-register, VIES, zoekmachine. Opgeven is geen uitkomst.
**Grond.** In de droogloop werden 164 bedrijven afgevoerd naar "nakijken" omdat het websiteveld
leeg was. Dat is de verrijkingsstap overslaan en hem vervolgens bij Jeroen neerleggen.
**Bron.** 25-08-2026.

### B67 · Bedrijf of persoon bepaalt welke gegevens worden opgezocht
**Besluit.** Bij een **bedrijf** wordt het algemene e-mailadres en telefoonnummer van de website
gebruikt, plus KvK en btw uit openbare registers. Bij een **persoon** wordt niets opgezocht:
alleen wat de bron zelf levert, en dat moet persoonsgebonden zijn — nooit een algemeen adres.
**Grond.** Bedrijfsgegevens zijn openbaar, persoonsgegevens niet.
**Bron.** 25-08-2026, Jeroen.

### B68 · De bron wordt in vorm gebracht vóór het matchen
**Besluit.** Claude stelt per kolom vast wát erin staat op basis van de inhoud, niet de kolomnaam.
Bedrijf en persoon in één regel worden gesplitst in twee records met een relatie ertussen. Is de
bedrijfsnaam gelijk aan de persoonsnaam, dan levert dat allebei op — een brand én een gekoppeld
contact (eenmanszaak of ontwerpstudio). Een volledige naam in één veld wordt gesplitst in
**voornaam · tussenvoegsel · achternaam**, met herkenning van Nederlandse en Belgische
tussenvoegsels en van de omgekeerde notatie met komma. Bij twijfel gaat de volledige naam in
`achternaam` met een notitie — een persoon verliezen is erger dan een veld verkeerd vullen.
Dubbele records bínnen één bron worden ontdubbeld vóór het matchen tegen de database.
**Grond.** In het MDU-bestand 2022 stond in de kolom "Organisatie" tientallen keren een
persoonsnaam, en stond Archipoint Belgium er twee keer in met verschillende schrijfwijze — met
twee tegengestelde oordelen als gevolg.
**Bron.** 25-08-2026, Jeroen.

### B69 · Plaats-, straat- en persoonsnamen worden automatisch rechtgezet
**Besluit.** Kapitalisatie van plaatsnamen, straatnamen en persoonsnamen is **technische hygiëne**
en gaat automatisch: `AMSTERDAM` → `Amsterdam`, `den haag` → `Den Haag`, `'S-HERTOGENBOSCH` →
`'s-Hertogenbosch`, met correcte behandeling van tussenvoegsels en vormen als `MacDonald`.
**Bedrijfsnamen blijven een voorstel.**
**Grond.** Een plaatsnaam heeft één juiste schrijfwijze; die is geen keuze maar een feit. Een
merknaam is merkeigendom.
**Herziet B61** op dit punt: daar vielen plaatsnamen onder "presentatiekeuze". De redenering van
B61 blijft geldig voor bedrijfsnamen; wat eronder ontbrak is dat een plaatsnaam geen eigendom is.
**Bron.** 25-08-2026, Jeroen. Aanleiding: 38 van de 2.093 brands dragen een plaatsnaam volledig in
hoofdletters.

### B70 · Een interactie is een eigen record; rol en event zijn twee kolommen
**Besluit.** Deelname wordt vastgelegd als losse records (`entity_type`, `entity_id`, `event_id`,
`rol`, `datum`, `detail`, `bron`, `batch_id`), zodat één brand of persoon er onbeperkt veel kan
dragen. **`event_id` verwijst naar het event-record, niet naar de naam.** Rol en event blijven
gescheiden kolommen — **nooit een samengesteld label** als `exhibitor_mdu2022`.
**Grond.** Een samengesteld label is één keer schrijven en daarna niet meer filteren: je kunt er
niet op tellen, niet op sorteren, en elke schrijfvariant maakt een nieuwe categorie. Met twee
kolommen zijn de gevraagde vragen wél uitvoerbaar: "personen die MDU 2022, 2023 én 2024 bezochten"
en "exposanten met meer dan één editie".
**Uniciteit.** `entity_id + event_id + rol`. Herimport van dezelfde bron levert geen tweede rij op.
**Bron.** 25-08-2026, Jeroen.
**Raakt.** Schema-uitbreiding bij Johan; het businessdashboard leunt hierop.
**HERZIEN DOOR B72 (25-08-2026):** waar hier `event_id` stond, moet `edition_id` staan.

### B71 · Een event moet bestaan vóór het interactie
**Besluit.** Een interactie verwijst naar een bestaand event-record. Ontbreekt de editie, dan
wordt die eerst aangemaakt — nooit als losse tekst weggeschreven.
**Stand 25-08-2026.** Alleen MDU Utrecht **2022 t/m 2027** bestaan als event (id's 93812, 107741,
116159, 124180, 131610, 136167). **2019, 2020 en 2021 ontbreken**, terwijl de factuurdata voor die
jaren 72, 85 en 6 exposanten telt. Die drie moeten worden aangemaakt vóór de import.
**Tweede bevinding.** `is_md_event` staat op `false` bij **alle 170 events**, ook bij de eigen
MDU-edities. Het onderscheid tussen een eigen evenement en een agenda-item van derden bestaat dus
niet in de data.
**Bron.** 25-08-2026, meting tegen de live API.

### B72 · Een editie is niet hetzelfde als een agendapagina
**Besluit.** Interactieen hangen aan een **editie** — een intern object voor relaties en
commercie (MDU Utrecht 2019 t/m 2026). Zij hangen **nooit** aan het post type `event`, dat de
publieke agenda vormt en ook evenementen van derden bevat. Een editie mág verwijzen naar een
agendapagina als die bestaat; dat is uitsluitend weergave.
**Grond.** De 170 event-records zijn redactionele agendapagina's, waarvan 164 niets met deelname te
maken hebben. Deelname aan die lijst koppelen vermengt een commercieel interactieengeheugen met
publieke content, en maakt beide onbruikbaar.
**Gevolg.** Dat MDU 2019, 2020 en 2021 geen agendapagina hebben is geen probleem: die edities
hebben plaatsgevonden en er zijn facturen van. In v4.2 van het importprotocol stond dit ten
onrechte als blokkade.
**Herziet B70** (waar `event_id` stond) en **B71** (die de agendapagina als voorwaarde stelde).
**Bron.** 25-08-2026, Jeroen.

### B73 · Jeroen noemt de editie bij het aanleveren
**Besluit.** Bij elk bronbestand hoort, naast bron en brondatum, bij welke editie het hoort. Claude
leidt dat niet af uit bestandsnamen of datums.
**Grond.** Een bestandsnaam is geen bron van waarheid, en een factuurdatum valt niet samen met een
editie.
**Bron.** 25-08-2026, Jeroen.

### B74 · "Event" wordt niet gebruikt zonder bijvoeglijk naamwoord
**Besluit.** Het woord betekent drie dingen: **agenda-item** (post type `event`, publieke content),
**analytics-event** (`material_viewed` e.d., naar RDS) en **interactie** (gedateerd feit over de
relatie met een brand of persoon). In documentatie, code en teamcommunicatie wordt altijd gezegd
welke van de drie bedoeld wordt.
**"Deelnamefeit", "relatiefeit" en "interactie" vervallen** als term. Het heet **interactie** —
`interaction` — want die naam bestaat al live in het dashboard. Eén naam, één tabel, geen tweede
systeem ernaast.
**Het bestaande model wordt uitgebreid, niet gedupliceerd.** `Interaction` bewaart nu de gegevens
van de aanvrager inline en verwijst niet naar een user- of brandrecord; daardoor is een
sampleaanvraag van een ingelogde gebruiker niet aan die gebruiker gekoppeld. Toe te voegen:
`subject_type`/`subject_id` (wie), `object_type`/`object_id` (waar), `edition`, `source`,
`batch_id`. De inline-velden blijven als terugval voor anonieme aanvragers.
**Types:** de bestaande vier (`request`, `brochure-download`, `info`, `contact`) blijven ongewijzigd
en worden aangevuld met de beurs- en commercietypes. `sampleaanvraag` en `brochuredownload` komen er
níét bij — dat zijn `request` en `brochure-download`.
**Soortenlijst**, gesloten, in drie groepen. *Beurs:* `exposant` · `standbemanning` ·
`bezoeker_geregistreerd` · `bezoeker_aanwezig` · `no_show` · `spreker`. *Commercie:*
`boekbestelling` · `ticketbestelling` · `materiaalpublicatie` · `membership` · `advertentie` ·
`innovatiefonds`. *Contact:* `abonnee` · `sampleaanvraag` · `brochuredownload` ·
`contactformulier`.
**Grens met analytics.** Een interactie is schaars en commercieel betekenisvol en staat naast de
entiteit; hoogvolume gedrag gaat naar RDS (B9, B10). Een boekbestelling is een interactie, een
paginaweergave niet.
**Grond.** Op 25-08-2026 schreef Claude een protocol waarin interactieen aan het post type `event`
werden gekoppeld — de publieke agenda, inclusief 164 items van derden. Dat vermengt een commercieel
interactieengeheugen met redactionele content en maakt beide onbruikbaar.
**Bron.** 25-08-2026, Jeroen.
**Raakt.** `begrippenlijst.md`, `importprotocol.md` §2.7, de schema-uitbreiding bij Johan.

### B75 · Activity is de naam; Events is de agenda
**Besluit.** Wat een brand of persoon op het platform doet heet **Activity** — in gesprek, in
documentatie en in het dashboard. De publieke agenda op de voorkant heet **Events**.
**Grond.** "Activity" beschrijft wat het is: activiteit van een bedrijf of persoon op ons platform.
"Interactie" suggereert dat iemand contact opneemt, maar een channel volgen of iets bookmarken is
geen contactmoment. En het lost het naamconflict op in plaats van het te verplaatsen.
**Onder de motorkap blijft alles zoals het is:** `event_type`, `object_type` en `object_id` staan
live in de analytics-keten en worden niet hernoemd — een migratie voor een woord kost werk en
levert de gebruiker niets op.
**`Interaction` in het dashboard** wordt `Activity` zodra dat model tóch wordt uitgebreid met
subject, editie en herkomst. Niet als losse migratie.
**Herziet B74** op de naamkeuze; de driedeling per laag uit B74 blijft gelden.
**Bron.** 25-08-2026, Jeroen.

### B76 · Eén logboek, twee filters
**Besluit.** Er is één activiteitenlogboek. Het dashboard toont er twee doorsneden van:
- **filter op `subject`** — "wat heeft deze persoon of dit merk bij ons gedaan?" (businessdashboard)
- **filter op `object`** — "wat is er bij mijn bedrijf gebeurd?" (memberdashboard)

Dezelfde rijen, andere kant van de relatie. Daarom moeten `subject_type`/`subject_id` én
`object_type`/`object_id` allebei in het model zitten. Nu is `page` een tekstveld en is filteren op
object niet mogelijk.
**Grond.** Wat een member als "Interactions" ziet, is geen apart systeem maar een filter op
hetzelfde logboek. Twee systemen voor dezelfde vraag leveren twee tellingen op die niet kloppen.
**Bron.** 25-08-2026, Jeroen.

### B77 · Loggen is altijd volledig; zichtbaarheid is een eigenschap van het type
**Besluit.** Elke activiteit wordt volledig vastgelegd, inclusief `subject`, óók als die naam nooit
getoond wordt. Wat een member te zien krijgt, is een aparte laag met twee niveaus per
activiteitentype:

| Niveau | Wanneer | Wat de member ziet |
|---|---|---|
| **Met naam** | de persoon zocht zelf contact: sampleaanvraag, contactformulier, brochuredownload | naam en contactgegevens — dat is de bedoeling van het formulier |
| **Geteld, zonder naam** | gedrag zonder contactintentie: websiteklik, materiaal bekeken, bookmark, follow | aantallen, eventueel verrijkt met sector, land of functiegroep |

**Grond.** Volledig loggen kan later alsnog getoond worden; niet loggen is onherstelbaar. En een
bezoeker die een materiaal bekijkt heeft geen contact gezocht — zijn naam aan het merk tonen is een
AVG-probleem en schaadt het vertrouwen.
**Commercieel is dat geen verlies:** "zeven mensen bewaarden dit materiaal en drie vroegen een
sample aan" zegt een fabrikant meer over zijn trechter dan zeven losse namen.
**Bron.** 25-08-2026, Jeroen.

### B78 · De agenda wordt verbreed naar Events — richting, geen datum
**Besluit.** De eventsectie op de voorkant wordt een echte agenda: ook beurzen, lezingen, cursussen
en online meets van derden. Naam blijft **Events** — in de architectuur- en ontwerpwereld is dat de
gangbare verzamelnaam (Dezeen, Archdaily, Domus gebruiken het zo). De bredere lading komt in een
ondertitel, niet in de menunaam.
**Overwogen en afgevallen:** *What's on* (te Brits, en het roept "wat is er vandaag?" op), *Calendar*
(klinkt als een functie), *Programme* (verwart met het eigen programma), *Agenda* (in het Engels een
verborgen bedoeling).
**Gevolg.** `is_md_event` wordt daarmee functioneel — het onderscheid eigen evenement versus derden
gaat ertoe doen. Nu staat die vlag op `false` bij alle 170 records.
**Geen haast**, wel vastgelegd. Een eventuele hernoeming van het post type lift mee met dit werk in
plaats van als losse migratie.
**Bron.** 25-08-2026, Jeroen.

### B79 · De route `/md/v2/interactions/events` wordt hernoemd
**Besluit.** De route heet `/md/v2/interactions` — zonder `/events`. Dit is de enige plek waar beide
woorden letterlijk in één pad staan.
**Grond.** Goedkoop: het is het nieuwste stuk code, er zit geen migratie aan vast, alleen de
frontend-call verandert mee. De rest van de naamgeving blijft ongemoeid (B75).
**Bron.** 25-08-2026.
**Actie voor Johan**, mee te nemen met een volgende deploy.

### B80 · Terugdraaien kent twee vormen
**Besluit.** Bestond het record vóór de import, dan herstelt terugdraaien de vórige veldwaarden en
wordt het record niet verwijderd. Maakte de import het record **zelf** aan, dan mag terugdraaien het
verwijderen — het bestond ervoor niet. De grens loopt langs het **batch-ID**, nooit langs een
datumgrens of een namenlijst. Verwijderen gaat naar de prullenbak, niet met `force delete`, zodat de
terugdraaiactie zelf terug te draaien is.
**Grond.** De terugdraaiactie van 5 augustus 2026 verwijderde 268 records en had daarin gelijk: de
schade bestond niet uit verkeerd bijgewerkte velden maar uit records die nooit hadden mogen ontstaan.
Veldwaarden herstellen levert daar een leeg record op dat er nog steeds staat. Die uitzondering stond
nergens opgeschreven.
**Bron.** 25-08-2026, importsessie; mailwisseling Jeroen–Johan van 05-08-2026.
**Raakt.** B37 regel 6 en B48, die beide zeggen dat terugdraaien nooit records verwijdert. Beide
worden op dat punt herzien.
**Let op.** Het script dat in augustus is gebruikt, `terugdraai-merken.php`, draagt een harde
datumgrens van `2026-08-04` en een `force delete`. Opnieuw draaien ná een herimport wist precies wat
er net is binnengehaald. Het hoort na gebruik uit omloop.

### B81 · De entiteiten zijn rolloos, de rol staat erbovenop
**Besluit.** Er zijn twee entiteiten: **user** (een mens) en **brand** (een bedrijf). Die woorden
zeggen alleen wat iets *is*. **specifier** en **manufacturer** zijn rollen en gelden aan beide
kanten: een user kan specifier of manufacturer zijn, een brand ook. De rol van een persoon volgt uit
waar hij werkt — Peter Albertz staat aan de manufacturer-kant omdat Forbo dat is, niet omdat hij zelf
iets fabriceert.
**Grond.** Zolang `specifier` zowel een soort record als een kant van het platform aanduidde, botste
het bij iedereen die bij een merk werkt. Met rol als aparte laag verdwijnt die tegenspraak, en kan
een adviesbureau dat een membership koopt specifier blijven: rol zegt aan welke kant je staat, tier
zegt wat je afneemt.
**Bron.** 25-08-2026, importsessie. Sluit aan op de twee kaarten van de registratiepagina: *Discover
materials* tegenover *List your materials*.
**Raakt.** `account_type` op `POST /md/v2/auth/register`, de importlogica, `begrippenlijst.md`.
**Openstaand.** De enum telt vijf waarden — `specifier` · `manufacturer` · `show` · `brand` ·
`partner` — waar het formulier er twee aanbiedt. Snoeien vóór er iets op geschreven wordt. Of het
veld ná registratie wordt uitgelezen is niet vastgesteld.

### B82 · `brand_type` is fijnmaziger dan de rol, en nooit een drempel
**Besluit.** Hoe een bedrijf aan het materiaal komt is voor toelating niet relevant. Fabrikant,
producent, merkeigenaar, importeur, agent en handelaar dragen allemaal de manufacturer-rol. Het
verschil wordt vastgelegd als `brand_type`, als eigenschap van het merk.
**Grond.** Dit was altijd een lastig punt omdat het als toelatingsvraag werd behandeld terwijl het
een etiketteringsvraag is. Spadon verkoopt Italiaanse tegels van Coem en Mutina en maakt zelf niets;
Spadon heeft een account en voegt materialen toe. Als type is dat vast te leggen, als drempel moet je
er nee op zeggen.
**Bron.** 25-08-2026, importsessie.
**Raakt.** De toelatingstoets, het merkprofiel, de importlogica.

### B83 · De toelatingsladder en de productuitzondering
**Besluit.** Vier lagen bepalen of een bedrijf op het platform hoort. **Grondstof** en **materiaal**:
ja. **Dienst**: nee. **Product**: nee, tenzij de productuitzondering geldt. Over alle lagen heen ligt
één begrenzing: het **ruimtelijke domein** — gebouwen, interieurs, buitenruimtes, decor, jachten en
boten, alles wat het materialiseren van ruimte betreft. Daarnaast moet het een bedrijf zijn, geen
school of stichting, met een aantoonbare identiteit.

> **De productuitzondering, in één vraag:** wordt dit gekozen of voorgeschreven vanwege de *duurzame*
> materialen waar het van gemaakt is?

Het woord *duurzaam* is daar de kern van, geen bijvoeglijk naamwoord. Een fabrikant van hoogwaardig
meubilair waar mensen voor kiezen om de kwaliteit van het leer valt af: het materiaal beïnvloedt de
keuze, maar het is geen duurzaamheidsargument. Het materiaal moet een verkoopargument zijn, geen
verantwoording achteraf — het staat bij het aanbod, in de collectie, op de productpagina. Staat het
alleen op een duurzaamheidspagina onder "Over ons", dan telt het niet.
**Grond.** De oude toets eiste dat een bedrijf "materialen maakt, levert of verwerkt" en sloot
adviesbureaus categorisch uit. Beide zijn te smal: grondstofleveranciers maken geen materiaal, en een
adviesbureau kan straks een membership afnemen. Zonder opgeschreven grens kon geen enkele toets
zeggen welke bedrijven erbij horen — daardoor lieten eerdere rondes 46 niet-leveranciers binnen.
**Bron.** 25-08-2026, importsessie. Het onderscheid grondstof–materiaal is overgenomen uit de
begrippenlijst van SampleStore.
**Raakt.** Elke import, de sitescan, het merkprofiel. Vervangt §1.3 van `importprotocol.md` v3.0.
**IJkpunt.** ROFA maakt projectmeubilair — een product, dus in principe buiten. Maar drie van de zes
blokken op de eigen homepage gaan over herstoffering, circulariteit en duurzame stoffen, bij de
collectie. ROFA komt binnen. Bece verkoopt raamdecoratie zonder één woord over waar het van gemaakt
is: dezelfde laag, geen materiaalverhaal, valt af.

### B84 · Identiteit en relatie zijn twee besluiten; naam is een kandidaatgenerator
**Besluit.** Kandidaten worden gezocht op alles wat de bron levert: **exact domein**, **domeinstam**
en **bedrijfsnaam**. Een treffer op naam stelt vast *dát* het bedrijf al bestaat — genoeg om géén
duplicaat aan te maken — maar legt **nooit** de relatie tussen persoon en merk. Daarvoor is een
bedrijfsdomein nodig. Een schooladres of een vrije provider legt nooit een dienstverband vast.
**Grond.** Matchen op alleen het domein miste in de testronde dertien bestaande merken mét
materialen: Moso is verhuisd naar `moso.eu` terwijl het merk op `moso-bamboo.com` staat, Pretty
Plastic mailt vanaf het domein van zijn websitebouwer, NPSP vanaf `basfroon.nl`. Tegelijk matchte
"Blueblocks" op naam terwijl de persoon vanaf `student.hku.nl` mailde — een stagiair, geen
medewerker. Een bedrijf kan van domein wisselen; de naam blijft.
**Bron.** 25-08-2026, importsessie, ronde 5 op het MDU2023-bezoekersbestand.
**Raakt.** De matchlogica, elke personenimport. Scherpt B46 aan met een derde ingang.
**Uitvoering.** Werkt alleen met een strakke naamvergelijking: exact na normalisatie, of bevatting
waarbij de kortste naam minstens acht tekens telt en het lengteverschil hooguit vier is. Ruimer
levert JUNG–Jungbecker en Laser Whale–Hale op. En de domeinstam moet rekening houden met
samengestelde landextensies: `aub.ac.uk` en `uibk.ac.at` delen niet de stam "ac".

### B85 · Een onbekende toestand krijgt geen waarde, en wordt niet gemaild
**Besluit.** Kan de rol van een persoon niet worden vastgesteld, dan blijft het rolveld **leeg** met
een reden ernaast — bijvoorbeeld "site onbereikbaar" of "site leeg". Een persoon zonder rol gaat in
**geen enkele** mailing. Een reden die een technische mislukking beschrijft wordt automatisch opnieuw
geprobeerd met oplopende tussenpozen; pas na drie mislukte pogingen wordt het een menselijke vraag.
**Grond.** Een timeout, bot-blokkade of lege pagina is geen bevinding maar een toestand. Wie die als
"specifier" wegschrijft, vult het veld met een oordeel dat nooit geveld is — en omdat het veld gevuld
is, kijkt de volgende import er niet meer naar. Dan is de vergissing permanent. In de testronde gaf
`rofa.nl` een lege pagina terwijl de site gewoon werkt; zonder deze regel was ROFA nooit meer
bekeken.
**Bron.** 25-08-2026, importsessie.
**Raakt.** De sitescan, de mailselectie, elke afgeleide status.

### B86 · Toestemming reist nooit mee uit een import
**Besluit.** Mailtoestemming wordt **nooit** overgenomen uit een bronbestand, ook niet wanneer het
veld netjes is bijgehouden. Alleen een handeling van de persoon zelf telt: een inschrijving, een
keuze bij registratie, een bevestigde aanmelding. Geïmporteerde contacten komen binnen met een lege
mailstatus en gaan dus geen mailing in.
**Grond.** In de CRM-export staat `EmailOptedOut` op `False` bij alle 5.445 contacten zonder één
uitzondering — de handtekening van een veld dat nooit is gebruikt. Er staat ook een veld dat wél
gebruikt is, met 419 expliciete inschrijvingen. Beide zijn onbruikbaar om dezelfde reden: ze zijn
door medewerkers ingevuld. Een vinkje dat iemand in een CRM zet, is een aantekening *óver* een
persoon, geen keuze *ván* die persoon.
**Bron.** 25-08-2026, importsessie, Insightly-export.
**Raakt.** Elke personenimport, het mailsysteem, B39.
**Reikwijdte.** Dezelfde redenering raakt de andere door medewerkers ingevulde velden — `Prospect`,
`Prospectwaarde`, `Hoofd Branche`, `Materiaalgroep`, `Beslissingsbevoegdheid`. Die kunnen mee als
interne aantekening met bron en jaar, nooit als feit over het bedrijf. `Materiaalgroep` staat bij
7.210 van de 7.519 organisaties op "Onbekend".

### B87 · Zichtbaarheid in het Activity-logboek ligt vast op de soort, en begint dicht
**Besluit.** Naast de twee bestaande zichtbaarheidsklassen uit B77 — met naam wanneer de persoon zelf
contact zocht, geteld zonder naam bij gedrag — komt een derde: **intern commentaar**. Verkoopnotities
en andere aantekeningen *óver* een relatie zijn nooit zichtbaar voor de member, ook niet geteld.
Zichtbaarheid wordt vastgelegd op het **type** activiteit, nooit per record. Een nieuw type begint
dicht en wordt alleen zichtbaar door een bewust besluit.
**Grond.** Van de 24.266 echte notities in de CRM-export bevatten er 5.369 persoonlijke opmerkingen
over met naam genoemde mensen: karakteriseringen, inschattingen over budget, wat een bedrijf wel of
niet gaat doen. Het memberdashboard toont een doorsnede van hetzelfde logboek. Ligt zichtbaarheid per
record vast, dan volstaat één verkeerd vinkje om dat naar buiten te brengen. Ligt het vast op de
soort, dan kan het niet.
**Bron.** 25-08-2026, importsessie.
**Raakt.** B75–B77, het Activity-schema (`roadmap.md` §10b-3), het memberdashboard.
**Gevolg voor imports.** Een gedateerd feit veroudert niet, een veldwaarde wel. Dat een gesprek in
2017 plaatsvond is in 2026 nog steeds waar; dat het telefoonnummer uit 2017 klopt, is een gok.
Notities gaan daarom altijd mee als tijdlijn, veldwaarden uit een oude bron nooit over een gevulde
waarde heen. Notities worden aan het merk gehangen ná de kandidaatstap van B84, nooit op naam.

---

## 9. Beveiliging, infrastructuur & werkritme

*Toegevoegd 25-08-2026 na een sweep over alle sessies in dit project. Deze besluiten waren genomen
en uitgevoerd, maar stonden in geen enkel document in de moedermap.*

### B51 · Vimeo-ID's worden gestript uit de publieke API
**Besluit.** `meta.vimeo_id` wordt niet meegeleverd in de publieke `wp/v2/talk`-respons voor
Insider-only talks. Ingelogde members laden hem na authenticatie via
`/api/talks/[id]/embed`. `has_video` blijft wél publiek als vlag.
**Grond.** Op 06-08-2026 bleek dat 97 Insider-only talks hun Vimeo-ID in de paginabron toonden aan
niet-ingelogde bezoekers, waarmee de paywall via de player-URL te omzeilen was.
**Bron.** 06-08-2026, sessie livegang; fix door Johan in de bestaande plugin.
**Raakt.** Elke meting op talks — een lege `vimeo_id` in de publieke API betekent **niet** dat er
geen video is. Zie `begrippenlijst.md` §4.

### B52 · Het lead-endpoint is achter authenticatie gezet
**Besluit.** Het lead-endpoint levert geen records meer zonder authenticatie.
**Grond.** Het gaf bijna 44.000 leadrecords vrij aan iedereen die de URL kende.
**Bron.** 06-08-2026, sessie livegang.
**Raakt.** De leaddata blijft in WordPress (B10); dit is de poort eromheen.

### B53 · Releases gaan op woensdag, via staging
**Besluit.** Vaste releasedag is **woensdag**. Werk gaat eerst naar de staging-branch
(`materialdistrict-frontend-git-staging-material-district.vercel.app`, achter Vercel-login, met
test-Stripe), daarna naar `main`. Uitzondering alleen voor spoedfixes.
**Grond.** Woensdag past bij Jeroens opnameschema en laat donderdag en vrijdag over om problemen op
te lossen vóór het weekend.
**Bron.** 18-08-2026.
**Bekende beperking.** Er is **geen aparte CMS-/backend-staging**. Plugin- en API-werk landt direct
op de live database. Relevant voor al het backendwerk van september.

### B54 · Sample requests staan open voor iedereen
**Besluit.** Een sample aanvragen is niet Insider-only. Het Free-tier is een echt tier: channels
volgen en de weekly update horen erbij en zijn niet gated.
**Grond.** De drempel om een sample aan te vragen is het hart van de propositie; die achter een
betaalmuur zetten werkt averechts.
**Bron.** 04-08-2026, contentsessie (mastercopy EN).
**Raakt.** Alle copy over membership; `membership-config.md`.

### B55 · "Insider insights" in plaats van een kwartaalrapport
**Besluit.** De Insider-content heet "Insider insights" en draagt geen frequentiebelofte.
**Grond.** Een frequentie is een leveringsbelofte die de redactie niet consistent kan waarmaken.
**Bron.** 04-08-2026.

### B56 · Innovation Fund en de 2030-belofte staan
**Besluit.** Het Innovation Fund is echt en subsidieert deelname aan MaterialDistrict Utrecht voor
75% tot maximaal €3.500. De belofte om vanaf 2030 uitsluitend circulaire materiaalinnovaties te
tonen blijft bindend en krijgt prominente plaatsing op Our Mission. Oprichtingsjaar: 1998.
**Bron.** 04-08-2026, bevestigd door Jeroen.
**Raakt.** Alle publieke copy; het jaartal in de footer (© 1998).

### B57 · Meet in de juiste laag — de publieke API is een uitsnede
**Besluit.** Voordat een veld als "leeg" of "bestaat niet" wordt gerapporteerd, wordt gecontroleerd
in welke laag het hoort: publiek (`wp/v2`), gated (`md/v2/talks/{id}/embed` e.d.) of dashboard
(`md/v2/dashboard/…`). Een veld dat niet in de publieke respons staat, bestaat níét niet. Is een
veld niet bereikbaar, dan is "niet meetbaar via de publieke API" de juiste uitkomst — "leeg" niet.
**Grond.** Twee keer op 25-08-2026 werd een bestaand veld als ontbrekend gerapporteerd: `vimeo_id`
op talks (wordt gestript, B51) en `email`/`phone`/`vat_number`/`chamber_number` op brands (zitten
achter het dashboard-endpoint). Beide keren ging er een levering of een mail aan een teamlid mee de
deur uit.
**Bron.** 25-08-2026, sessie documentatiefundament.
**Raakt.** Elke meting, elke audit, elke importronde. Uitgewerkt in `datamodel.md` §1 en §7.

### B88 · Het CMS is live-only voor Stripe
**Besluit.** Het CMS draagt uitsluitend de **live** Stripe-keys en het **live** webhook-secret.
Test-mode events worden met het test-secret ondertekend, dat het CMS niet kent; de signature-check
faalt dan met een nette `400`. Dat is geen storing maar het bedoelde gedrag. Het testmodus-endpoint
naar `/md/v2/stripe/webhook` is op 03-09-2026 uitgeschakeld.

Wil er weer end-to-end tegen test-Stripe getest worden via dit CMS, dan is dat een **bewuste,
tijdelijke handeling**: endpoint aanzetten én het test-secret (en bij voorkeur de test-API-key)
tijdelijk ondersteunen, daarna terug naar live-only. Nooit permanent twee secrets naast elkaar.
**Grond.** Voor productie is live-only het juiste model: twee geldige secrets naast elkaar betekent
dat een testevent de live-handler kan bereiken, en die kent geen verschil tussen een test-`sub_` en
een echte. De prijs ervan is een reeks 400's zodra er nog test-verkeer bestaat — hinderlijk, niet
gevaarlijk.
**Uitgevoerd 03-09-2026 door Johan.** Vijf nog actieve test-abonnementen geannuleerd (nul over op
`active`/`trialing`/`past_due`), het testmodus-endpoint uitgeschakeld, en de e2e-usermeta op het CMS
opgeschoond — die stond nog op `insider`/`active` met test-`sub_`- en `cus_`-ID's. Live webhooks en
live keys zijn niet aangeraakt.
**Bron.** 03-09-2026, Johan, na de Stripe-melding van dezelfde dag: twaalf mislukte leveringen in
testmodus sinds 31-08 09:39 UTC, in het dashboard allemaal een `400`. Live stond en staat op 0%
foutpercentage, zowel op `/?wc-api=wc_stripe` als op `/wp-json/md/v2/stripe/webhook`. De events
kwamen van oude e2e-abonnementen, niet van klanten.
**Gevolg.** Er is geen aparte CMS-staging (B53) en de staging-frontend draait op test-Stripe. Met
het testmodus-endpoint uit kan de **abonnementsflow niet end-to-end getest worden**: juist de
webhook-handler is wat ná betaling het membership toekent. Zonder test zou dat pad pas op live
blijken te werken of niet — bij een betalende member die geen toegang krijgt, midden in de
campagne.
**Besloten 03-09-2026 door Jeroen: één e2e-ronde vóór de septembercampagne.** Uitvoering door Johan,
in deze volgorde: (1) het testmodus-endpoint naar `/md/v2/stripe/webhook` weer aanzetten; (2) het
CMS tijdelijk ook het **test**-signing-secret laten accepteren naast het live-secret, en zo nodig de
test-API-key; (3) één volledige aankoop door de flow — checkout, webhook, membership toegekend,
zichtbaar in het account; (4) test-abonnement en e2e-usermeta opruimen; (5) test-secret eruit,
endpoint uit, terug naar live-only.

De omvang is een dagdeel. Stap 5 is niet optioneel: twee geldige secrets naast elkaar is precies de
toestand die dit besluit uitsluit, en die mag niet blijven staan omdat de test toevallig klaar is.
Wat er tussen stap 1 en 5 gebeurt is een tijdelijke uitzondering, geen nieuwe norm.
**Uitgevoerd 04-09-2026 door Johan.** Alle vijf stappen doorlopen. Testaccount
`e2e-betaalflow-20260904@…` (WP id 160988), Insider maandelijks €10, betaald in Stripe-sandbox;
daarna in het dashboard Insider `active`, billing Monthly, verlenging 4 oktober, factuur €10 `paid`.
Screenshots van status en invoice zijn bewijs. Daarna opgeruimd en terug naar live-only.

**Wat hiermee bewezen is:** de webhook-handler kent ná betaling het Insider-membership correct toe,
en het dashboard toont dat. **Wat níét:** de merk-tiers (basic, plus, partner) zijn niet e2e
getest, terwijl juist die de commercieel zwaarste kant van de septembercampagne zijn. Dat is een
open risico, geen afgeronde zaak.

**Vervolg, besloten 04-09-2026 door Jeroen: de merk-tiers worden vóór de campagne getest, in de
goedkope variant.** Basic volledig end-to-end (checkout, webhook, brand-meta, dashboard, met een merk
dat de testuser mag beheren); plus en partner als smoke — checkout-session plus webhook-meta. Grond:
het risico zit in de machinerie die alle drie de tiers delen (`md_dashboard_require_managed_brand`,
en dat de webhook op brand-meta schrijft in plaats van op user-membership). Die bewijs je één keer,
volledig. Wat de tiers verder onderscheidt is vooral een andere prijs, en een verkeerd gekoppelde
prijs is met een smoke net zo zichtbaar. Johans inschatting: een halve tot hele dag voor één tier
volledig; drie volledig zou eerder een dag zijn. Opruimen omvat hier ook brand-Stripe-meta en het
testmerk, en stap 5 (terug naar live-only) geldt onverkort.

**Uitgevoerd 04-09-2026 door Johan: alle drie de merk-tiers geslaagd.** Basic, plus en partner elk
een geslaagde checkout met de juiste prijs (€750 / €1.500 / €3.000, alle drie `paid`), webhook
schrijft op brand-meta en niet op user-membership, `md_dashboard_require_managed_brand` en de
zichtbaarheid in het brand-dashboard kloppen. Fixture-user 160990 verwijderd, drie test-abonnementen
geannuleerd, merk 140833 naar de prullenbak, test-secret eruit en terug naar live-only.

**Het uitzonderingsvenster is gebruikt en gesloten.** De test liep tegen het *live* CMS op
`materialdistrict.com`, dat tijdelijk zowel het live- als het test-signing-secret accepteerde; de
checkouts zelf zijn door een geautomatiseerde agent uitgevoerd. Dat is precies de tijdelijke
uitzondering die dit besluit toestaat, en stap 5 is uitgevoerd. Vastgelegd omdat er een venster
bestond waarin een test-ondertekend event op live merk-meta had kunnen schrijven; dat is de prijs van
geen aparte CMS-staging (B53), en de reden dat het venster kort hoort te zijn.

**Losse verificatie van de verlengingskant.** Johan heeft sinds begin augustus een lopend *live*
Insider-abonnement, dat op 05-09-2026 opnieuw zou moeten afschrijven. De e2e-ronde dekte alleen de
eenmalige checkout; een geslaagde verlenging dekt de andere helft, op live en zonder testopstelling.
**Raakt.** B53 (de bekende beperking "geen aparte CMS-/backend-staging" krijgt hier zijn concrete
prijs), de septembercampagne, elke toekomstige e2e-test op de betaalflow.
**Verhouding tot B57.** Dezelfde familie fout, andere laag. Bij het diagnosticeren gaf de externe
test exact `400 md_stripe_expired_signature` terug — het antwoord stond in de eigen meting — maar
Stripe's formulering *"other errors"* woog zwaarder en leidde naar een verkeerd vermoeden
(hangende handler, time-out). **Meting boven melding**, ook wanneer de melding van de leverancier
zelf komt.

### B90 · Een degraded render wordt niet gecachet
**Besluit.** Een pagina die na alle fallbacks geen inhoud draagt, wordt niet weggeschreven als
geldige pagina. De datalaag maakt daarbij onderscheid tussen twee toestanden die tot 02-09-2026
hetzelfde antwoord gaven: **leeg** (er zijn nul resultaten, een geldige uitkomst) en **onbereikbaar**
(de bron antwoordde niet, geen uitkomst). Alleen de eerste mag worden gecachet.

De verdeling loopt langs het gewicht van een blok, niet langs de techniek:

- **Sier-blokken mogen wegvallen.** Boeken, brands, featured, gerelateerde content. Een ontbrekend
  boekenblokje hoort de homepage niet te slopen. Hiervoor blijft `withUpstreamFallback` het middel.
- **Kern-blokken gooien.** De data die de pagina *ís*. Vallen die weg, dan wordt er geen lege pagina
  gerenderd maar een fout. Bij ISR is dat precies het gewenste gedrag: Next.js schrijft dan geen
  nieuwe cache-entry en blijft de laatste goede versie serveren.

Praktisch: `assertRenderable(label, counts)` in `src/lib/api/upstream-page.ts`, aangeroepen na het
verzamelen van de kern-data. Een kale `catch { return [] }` in de datalaag is vanaf nu een fout,
tenzij expliciet gemotiveerd bij een sier-blok.

**Grond.** Op 02-09-2026 lag het CMS onder de belasting plat. `getChannelCatalog` droeg een kale
`catch { return [] }` die ook de `UpstreamUnavailableError` van de eigen load shield opslokte. De
storing kwam daardoor niet aan als storing maar als "er zijn geen channels", en Next.js schreef dat
met `revalidate: 3600` een uur lang weg als geldige pagina. `/channel` toonde die hele periode "No
channels available" terwijl de API de twintig channels gewoon teruggaf. De homepage had hetzelfde
met `revalidate: 600` en herstelde na circa dertig minuten vanzelf.

Het addertje zit in de goede bedoeling: de fallback is gebouwd om te voorkomen dat Vercel een
herstartend CMS stukloopt. Maar dat werk doet de circuit breaker in `upstream-guard.ts`. De fallback
voorkomt geen storm — hij verbergt alleen de uitkomst, en omdat een render die "lukt" ook gecachet
wordt, betaalt hij dat met een leugen in de cache.

**Bron.** 02-09-2026, incidentsessie. Geleverd in `md-incident-fix-02-09-2026-v2.zip`, door Johan
gedeployed als commit `f2a1fcc`.

**Gevolg voor deploys.** `next build` faalt nu wanneer het CMS onbereikbaar is tijdens de build,
waar hij eerder een lege homepage opleverde en die als geldige cache wegschreef. Dat is gewenst.
Komt dit voor, dan is de juiste reactie wachten tot het CMS terug is — niet de guard verwijderen.

**Raakt.** Elke route met ISR, elke datalaagfunctie die een fout in een lege waarde omzet, en
`upstream-guard.ts` (dat ongewijzigd blijft). Zie ook B57: meten in de juiste laag en niet cachen
wat je niet gemeten hebt zijn dezelfde fout in twee richtingen.
**Nummering.** Dit besluit is op 04-09-2026 geschreven als B88 en hernummerd naar B90; zie de
statusparagraaf onder v1.22.

### B91 · Bewaking dekt twee verschillende storingen, en staat buiten wat ze bewaakt
**Besluit.** Er lopen twee onafhankelijke controles naast elkaar, omdat ze verschillende dingen zien:

1. **Uptime met keyword-checks** (Johan, bestaand) — ziet dat de site plat ligt of niet reageert.
   Alarmeert per telefoon.
2. **Content-healthcheck** (`scripts/md-frontend-healthcheck.sh`, via
   `.github/workflows/content-healthcheck.yml`) — ziet het geval waarin de site 200 geeft, valide
   HTML uitlevert en gewoon geen inhoud draagt. Elke tien minuten plus na elke push op `main`.
   Opent bij falen een issue met label `healthcheck`.

Een controle draait **niet** op de infrastructuur die hij controleert. Daarom staat de
content-healthcheck op GitHub Actions en niet op de droplet of op Vercel: een check op de droplet
valt stil op precies het moment dat de droplet het probleem is.

**Grond.** Op 02-09-2026 sloeg de uptime-monitoring correct aan en zag Johan het incident vóór
Sigrids melding — die laag werkte. Wat níét werd gezien was de nasleep: `/channel` gaf een uur lang
200 met valide HTML en nul inhoud. Geen enkele klassieke check merkt dat op.

**Bron.** 02-09 en 04-09-2026, incidentsessie en de terugkoppeling van Johan.
**Raakt.** B90 (waar de check op controleert), en elke toekomstige monitoring-keuze.
**Nummering.** Geschreven als B89, hernummerd naar B91; zie v1.22.

---

## 10. Openstaand uit eerdere sessies — niet eerder vastgelegd

*Geen besluiten maar open punten die nergens op een lijst stonden. Ze horen in `roadmap.md` of
`content-taken.md` te landen; hier staan ze tot dat gebeurd is.*

**Biophilic-versmalling is uitvoerbaar noch afgerond.** 458 materialen hebben Biophilic als
**enige** channel, en het apply-script kan een channel-set niet leegmaken (B26). De goedgekeurde
reductie van 832 naar circa 15 is daarmee grotendeels niet uit te voeren zolang Sigrids besluit
over de herdefinitie (design/zintuiglijk channel versus vervangen door Green Building) niet
gevallen is.

**331 materialen hebben geen enkele afbeelding.** Allemaal gepubliceerd tussen 2004 en augustus
2015 — vermoedelijk verloren bij een migratie.

**Vijf materialen dragen méér dan drie channels** (vier met vier, één met vijf) en overtreden de
harde limiet. Meting 25-08-2026.

**Publicatietempo stond stil.** Op 11-08-2026 was er 76 dagen geen nieuw materiaal gepubliceerd
(laatste: 27 mei). Van 106 in februari naar nul vanaf juni. Aangekaart bij Sigrid.

**De `partner`-vlag is het enige werkende member-signaal.** 130 brands dragen hem, 3 dragen
`featured`. De homepage leest `partner`, niet `featured`. De vlag is een erfenis: circa 22 partners
hebben geen betaalde materialen en 34 brands mét betaalde materialen missen de vlag. Zolang
`brand.tier` leeg is (B31, bevinding 3) is dit het enige waar iets op te sturen valt — maar het is
niet betrouwbaar.

**Vercel: twee open vragen aan Johan** uit 18-08 die nooit beantwoord zijn: Web Analytics toont geen
data terwijl het aanstaat, en er lopen circa 79.000 function invocations per zes uur — mogelijk
scraperverkeer, met directe kostengevolgen op Vercels model.

**Channel-afbeeldingen ontbraken sinds 2013** doordat Tax Meta Class 1.9.9 jQuery `.live()`
gebruikte, verwijderd in jQuery 1.9 (januari 2013). Johan heeft dit opgelost met native term-meta
en `wp.media`. Opgenomen omdat het verklaart waarom er dertien jaar geen channelbeelden zijn
toegevoegd.

---

## Bevindingen bij het opstellen — wat nu niet klopt

*Deze horen niet permanent in het register; ze staan hier tot ze zijn opgelost.*

**1. `publication_status` is leeg op alle 3.246 gepubliceerde materialen.** Volgens B32 hoort de
default `legacy` te zijn. Het veld bestaat en is geregistreerd, maar de backfill is nooit
gedraaid. Gevolg: het onderscheid tussen betaald, historisch en beëindigd materiaal bestaat op
dit moment niet in de data, de legacy-banner uit B34 kan niet verschijnen, en de automatische
archivering op 30 april 2027 heeft niets om op te draaien. Ook `brand.tier` staat op `free` voor
alle 2.093 gepubliceerde brands — de member-status uit launch-taak 5 is dus nog niet gezet.

**2. Het importprotocol staat als los `.docx` in de project knowledge.**
`importprotocol-v4-25-08.docx` draagt versie 4.0 van 25-08-2026, terwijl de norm in de moedermap
(`docs/importprotocol.md`) sindsdien is doorgelopen. Dat is precies de tweede kopie die
`START-HIER.md` verbiedt: normdocumenten wonen in `docs/`, en de project knowledge bevat alleen
`START-HIER.md`. Zolang het docx daar staat, start elke importsessie met een verouderde norm die
zichzelf als normdocument presenteert. Verwijderen kan alleen Jeroen; Claude kan niet in de project
knowledge.

**3. De checkout-endpoints toetsen `email_confirmed` niet.** `/checkout/insider` en
`/checkout/brand` controleren niet of het e-mailadres bevestigd is. Dat is bewust ontworpen: de
bevestigingsbanner is een duwtje, geen betaalpoort. `email_confirmed` remt wél mail via Sendy en
delen van de afgeschermde content. Gevolg: iemand kan een betaald membership afsluiten met een adres
dat nooit geverifieerd is — een betalend lid dat niet bereikt kan worden, in een campagne die
volledig op e-mail draait. Of de checkout achter bevestiging moet, is een productbesluit dat nog
niet genomen is.

*Correctie op de eerdere formulering (v1.21).* Daar stond dat bij de e2e-ronde betaald is terwijl
het adres onbevestigd was. Zo ging het niet: het testadres was geen werkende mailbox, dus is
`email_confirmed` handmatig op `1` gezet om door te kunnen. Die handmatige waarde maakte de betaling
niet mogelijk — die was sowieso niet geblokkeerd. De conclusie klopte, de onderbouwing niet.

**4. Vijf listingpagina's staan structureel op `x-vercel-cache: MISS`.** `/material/`, `/article/`,
`/brand/`, `/talk/` en `/event/` lezen `searchParams`, wat Next.js tot dynamisch renderen dwingt.
Verwacht gedrag en geen regressie, maar het is wel waar de function invocations zitten. Een
Suspense-verbouwing is besproken en bewust uitgesteld tot na de septembercampagne, op basis van
Johans cijfers uit Vercel Usage. Overgenomen uit de incidentsessie van 02-09-2026, die als v1.17
nooit op `main` is geland.


**5. Adaptive Pricing staat aan in Stripe, zonder dat dat ergens is besloten.** Vastgesteld
04-09-2026, als bijvangst van de labelmeting: bij het openen van een checkout vanaf een niet-Europese
locatie verscheen een valutakeuze. Dat is Stripe Adaptive Pricing, dat het bedrag omrekent naar de
lokale valuta van de koper, inclusief wisselkoersopslag. Geen storing en geen tierverschil.

Wel een commerciële instelling die gevolgen heeft en die niemand aanwijsbaar heeft gekozen. Een
buitenlands merk ziet dan niet €3.000 maar een omgerekend bedrag, en wat er binnenkomt verschilt per
land. Voor een platform met een aanzienlijk deel niet-Europese merken is dat geen randgeval. Aan
verlaagt de drempel voor buitenlandse kopers; uit houdt de prijs overal gelijk en de opbrengst
voorspelbaar. Besluit ligt bij Jeroen, vóór de septembercampagne.

---

## Status

**v1.0 · 25-08-2026** — eerste vastlegging. Negenentwintig besluiten gereconstrueerd uit de
moedermap-stand van 24-08-2026: `livegang-checklist.md`, `mailsysteem-spec.md` v7, de zeven
`note-*`-bestanden van 06/07-08, `materiaal-classificatie-regelboek.md`,
`redactie-dashboard-rechten-voorstel.md`, `fase1-logging-datalaag-plan.md`,
`note-go-live-facetwp-uitfaseren.md`, `START-HIER.md` en beide versies van `roadmap.md`.

Aanleiding: de documentatieset van Sample.Store, waarin een besluitenregister voorkomt dat de
overige documenten uitgelijnd houdt. De constatering bij het opstellen is dat MaterialDistrict
zijn besluiten wél goed vastlegt maar over vijftien documenten verspreid, zodat een besluit alleen
terug te vinden is door de vindplaats al te kennen.

**v1.1 · 25-08-2026** — B17 bevestigd door Jeroen en herschreven: wat geschrapt is, is de
*gecureerde channel-editie* als redactioneel product, niet de frequentiekeuze. Die twee werden
door elkaar gehaald. De frequentiekeuze is als **B18a** apart vastgelegd, inclusief de
constatering dat de frontend-kant gebouwd is en de verzendkant niet. Daarmee staat er geen
`TE BEVESTIGEN` meer open.

**v1.2 · 25-08-2026** — twee secties toegevoegd na Jeroens constatering dat de zwaarste
afspraken nergens in de moedermap stonden. **§7 Membership & statussen** (B30–B34): de twee
gescheiden membershipsystemen, de vier brand-tiers met grandfathered-tarieven, de zes
publicatiestatussen, de wederzijdse uitsluiting en de legacy-deadline van 30 april 2027. **§8
Data-import** (B35–B40): de twee entiteiten, de veldscheiding, de acht kernregels, de
domeinkoppeling, de e-mailvalidatie en de verificatievelden — uitgewerkt in `importprotocol.md`.

Bij het meten tegen de live API kwamen twee dingen boven die niet zijn wat de specs zeggen: geen
enkel materiaal draagt een `publication_status`, en geen enkele brand draagt een andere tier dan
`free`. Zie §Bevindingen 1.

**v1.3 · 25-08-2026** — B41–B45 toegevoegd bij de herbouw van `importprotocol.md` tot een
volledige beslisflow: herkomst per veld (B41), de bronautoriteit-rangorde (B42), de zes
e-mailstatussen (B43), de vaste woordenlijst voor interactieen (B44) en de toelatingstoets
(B45). B38 is aangevuld: de spanning met account-by-default is beslist ten gunste van
contactrecords zonder login.

Van de drie besluiten die in v1.0 van het importprotocol nog openstonden, zijn er twee
beantwoord (B41, B38) en is de derde als concreet voorstel geformuleerd (B42) in plaats van als
open vraag. B42 vraagt één bevestiging van Jeroen.

**v1.4 · 25-08-2026** — B46–B50 toegevoegd bij de samenvoeging van twee onafhankelijk
geschreven importprotocollen. **B46 herziet B37 regel 2:** een domein is een sterk signaal en geen
identiteitsbewijs, want één domein kan bij meerdere merken horen. Dat is de eerste echte herziening
in dit register en hij is als zodanig vastgelegd — het oorspronkelijke besluit blijft staan met een
`HERZIEN DOOR`-regel, zoals de werkwijze voorschrijft. Verder: nieuwe records als concept (B47),
veldvergrendeling en batch-terugdraaien (B48), "recent" als moment van geldigheid (B49) en het
besluit géén importplatform te bouwen (B50).

**v1.5 · 25-08-2026** — §9 (B51–B56) en §10 toegevoegd na een sweep over alle twintig gesprekken
in dit project. Aanleiding: Claude stelde Johan een vraag over ontbrekende Vimeo-ID's waarvan het
antwoord in de eigen codebase én in een eerdere sessie stond. Jeroens vraag daarop — wat weet je
nog meer niet — bleek terecht: zes uitgevoerde besluiten stonden in geen enkel moedermap-document,
waaronder twee beveiligingsfixes (B51, B52) en de vaste releasedag (B53).

§10 verzamelt open punten uit eerdere sessies die nergens op een lijst stonden, waaronder de
458 materialen met Biophilic als enige channel (die de goedgekeurde versmalling blokkeren), 331
materialen zonder afbeelding, en twee onbeantwoorde Vercel-vragen aan Johan uit 18-08.

**Waarschuwing bij deze sectie:** een sweep is geen garantie. Claude kan zoeken en gericht openen,
niet alles inlezen. Wat hier staat is wat vier gerichte zoekopdrachten en twintig
gesprekssamenvattingen opleverden — geen volledige inventaris. De structurele oplossing is niet
opnieuw sweepen maar het register voeden.

**v1.6 · 25-08-2026** — B57 toegevoegd en `datamodel.md` opgesteld als vijfde normdocument, nadat
voor de tweede keer op één dag een bestaand veld als ontbrekend was gerapporteerd. De eerste keer
`vimeo_id`, de tweede keer de contactvelden op brand — `email`, `phone`, `vat_number` en
`chamber_number` bestaan wel degelijk, maar zitten achter `md/v2/dashboard/brands/{id}/profile` en
niet in `wp/v2/brand`.

**v1.7 · 25-08-2026** — B58 en B59 toegevoegd na de eerste droogloop, op de exposantenlijst MDU
2022. Die test legde bloot dat `MOGELIJK_DUBBEL` de hoofdmoot werd (48 van 141) in plaats van de
uitzondering. Verrijking is nu een vaste stap in de import (B58) en een naam-match is een
onderzoeksopdracht voor Claude in plaats van een regel voor Jeroen (B59).

**v1.8 · 25-08-2026** — B60 t/m B62 toegevoegd: één notatiestandaard per veld, de grens tussen
technische hygiëne (automatisch) en presentatiekeuze (voorstel), en de regel dat opschonen met
terugwerkende kracht een bulkmutatie is en geen import. Met de nulmeting over 2.093 brands erbij.

**v1.9 · 25-08-2026** — B63 t/m B67, na een droogloop die ontspoorde doordat Claude drie keer een
beoordelingslijst opleverde in plaats van een besluit. Het importprotocol is herschreven naar twee
trappen (B63), de bak "onbeslist" is afgeschaft (B64), koopgedrag is het eerste bewijs geworden
(B65), een leeg websiteveld is het startsein voor opzoeken (B66), en het onderscheid bedrijf
versus persoon bepaalt wat er wordt opgezocht (B67).

**v1.10 · 25-08-2026** — B68 (de bron in vorm brengen: splitsen van bedrijf en persoon, splitsen
van volledige namen, ontdubbelen binnen de bron) en B69 (kapitalisatie van plaats-, straat- en
persoonsnamen automatisch). B69 herziet B61 op dat ene punt; het oude besluit blijft staan met een
`HERZIEN DOOR`-regel.

**v1.11 · 25-08-2026** — B70 (interactie als eigen record, rol en event als twee kolommen) en
B71 (het event moet bestaan vóór het feit), met de constatering dat de MDU-edities 2019–2021 niet
als event-record bestaan en dat `is_md_event` op alle 170 events `false` staat.

**v1.12 · 25-08-2026** — B72 en B73. B72 herziet B70 en B71: interactieen hangen aan een
**editie**, niet aan het post type `event` dat de publieke agenda vormt. Dat onderscheid was in
v4.2 van het importprotocol fout gelegd, met als gevolg dat het ontbreken van agendapagina's voor
2019–2021 ten onrechte als blokkade werd opgevoerd.

**v1.13 · 25-08-2026** — B74. Het woord "event" dekt op dit platform drie verschillende dingen en
wordt daarom niet meer zonder toevoeging gebruikt. Wat eerder "interactie" heette, heet nu
**interactie** — breder, want een boekbestelling is geen deelname — met een soortenlijst van
zestien in drie groepen, en een expliciete grens met de analytics-laag.

**v1.14 · 25-08-2026** — B75 t/m B79. De naam is **Activity** geworden (B75, herziet B74 op de
naamkeuze): dat beschrijft wat het is en lost het conflict met de agenda op in plaats van het te
verplaatsen. Eén logboek met twee filters — op subject voor het businessdashboard, op object voor
wat een member ziet (B76). Loggen is altijd volledig, zichtbaarheid is een eigenschap van het type
met twee niveaus (B77). De agenda wordt verbreed naar **Events** met evenementen van derden (B78),
en de route `/md/v2/interactions/events` verliest zijn `/events` (B79).

**v1.15 · 25-08-2026** — B80 t/m B87, uit de importsessie waarin het protocol tegen vijf echte
bestanden is gehouden: twee exposantenbestanden, een bezoekerslijst van 4.327 rijen, een
terugdraailijst en een CRM-export van 7.519 organisaties. Elke ronde brak iets; wat brak is regel
geworden. B80 herziet B37 regel 6 en B48 (terugdraaien mág verwijderen wat de import zelf aanmaakte).
B81 t/m B83 leggen de rollenscheiding, `brand_type` en de toelatingsladder met de productuitzondering
vast. B84 voegt naam toe als kandidaatgenerator en scheidt identiteit van relatie. B85 t/m B87 gaan
over wat je *niet* mag invullen: een onbekende toestand krijgt geen waarde, toestemming reist niet
mee uit een import, en zichtbaarheid ligt vast op het type en begint dicht.

Vier punten blijven expliciet open en worden niet ingevuld met een aanname: de enum van
`account_type` (snoeien is een besluit, of het veld wordt uitgelezen een opzoekvraag), de
`wp_postmeta`-sleutels achter `vatNumber` en `chamberNumber` met hun vulgraad, de waardenlijst van
`record_status`, en of `brand.primary_user_id` is gebouwd.

De bevindingen staan apart genoteerd (§Bevindingen).
Opgesteld door Claude, namens Jeroen.

**v1.16 · 26-08-2026** — Johan: importschema-v1 gemerged; B22 frontend-canon behouden; schema-migratie dry-run/execute op CMS.

**v1.17 · 03-09-2026** — B88 toegevoegd: het CMS is live-only voor Stripe. Aanleiding was een
Stripe-melding over twaalf mislukte webhook-leveringen in testmodus, die na onderzoek door Johan
geen storing bleek maar de bedoelde uitkomst van live keys tegenover een test-signature. Het besluit
is vastgelegd omdat de *gevolgtrekking* breder gaat dan het incident: met het testmodus-endpoint uit
en zonder aparte CMS-staging (B53) is de abonnementsflow niet meer end-to-end te testen vóór de
septembercampagne. Die keuze staat expliciet open in B88 in plaats van impliciet te blijven.

Twee dingen zijn bij deze ronde gecorrigeerd zonder inhoudelijke wijziging. De versieregel in de kop
stond nog op 1.14 terwijl de Status al tot v1.16 liep; die loopt nu weer gelijk. En de foutieve
diagnose die aan B88 voorafging is als les bij het besluit genoteerd in plaats van weggelaten — de
externe meting gaf hetzelfde `400` als het dashboard, en is genegeerd ten gunste van de formulering
in de leveranciersmail. Zie de regel *Verhouding tot B57* onder B88.

**v1.18 · 03-09-2026** — Bevinding 2 verwijderd en de overige bevindingen hernummerd. De twee
elkaar tegensprekende regelboekkopieën bestaan niet meer: de frontend-kopie
(`materialdistrict-frontend/docs/materiaal-classificatie-regelboek.md`) is canoniek, de plugin-repo
houdt alleen een pointer, en onder `docs/cms-plugin/` ligt geen kopie meer. Dat was al beslist op
26-08 en staat correct in B22 met een `HERZIEN`-regel; alleen de bevinding was blijven staan.
Bevestigd door Johan, 03-09-2026.

Volgens de eigen regel van die sectie horen bevindingen daar tot ze zijn opgelost, dus is de alinea
verwijderd in plaats van als opgelost gemarkeerd. Wat de bevinding vastlegde is niet verloren: het
staat in B22, waar het thuishoort. De kruisverwijzing vanuit B32 wijst nu naar §Bevindingen 2 en de
sectiekop telt weer kloppend.

**Les uit deze ronde.** De vraag die tot deze correctie leidde was overbodig: B22 stond in de
aangeleverde moedermap-versie al herzien, en is beschreven vanuit de verouderde kopie in de project
knowledge — dezelfde bron waarvan `START-HIER.md` zegt dat hij niet als bron telt. Dat is de tweede
variant van dezelfde fout binnen één dag (zie B88, *Verhouding tot B57*): niet meten in de verkeerde
laag, maar lezen uit de verkeerde kopie terwijl de goede voorlag.

**v1.19 · 03-09-2026** — de bevindingensectie opgeruimd. Drie van de vier waren achterhaald:

- *Twee roadmap-versies* — opgelost sinds de samengevoegde `docs/roadmap.md` is geleverd, en de
  tweede kopie staat niet meer in de project knowledge.
- *`datastrategie-specificatie.docx` los naast de norm* — verwijderd; alleen
  `docs/importprotocol.md` staat er nog. Bevestigd door Johan, 03-09-2026.
- *Twee session-logs* — `docs/session-log-mission-beeld-04-08-v2.md` is weg; `session-log.md` in de
  root blijft de log. Er staat nog een `docs/MANIFEST-mission-beeld-04-08-v2.md`, een ander bestand
  dat geen tweede log is. Bevestigd door Johan, 03-09-2026.

De kop draagt geen aantal meer, en de verwijzing in de v1.15-regel ook niet. Dat aantal is nu twee
keer achtergelopen op de inhoud; een sectie die per definitie leegloopt hoort niet in een vast getal
te worden geteld.

**Eén bevinding is toegevoegd.** `importprotocol-v4-25-08.docx` staat als los normdocument in de
project knowledge, op versie 4.0, terwijl de norm in de moedermap is doorgelopen. Dat is dezelfde
fout die B22 en de vorige ronde veroorzaakte, nu op het riskantste onderwerp dat er ligt: een
importsessie die met dat bestand begint, begint met een verouderde norm die zich als geldend
presenteert. Alleen Jeroen kan het weghalen.

Daarmee blijft `publication_status` de enige inhoudelijke bevinding: leeg op alle 3.246 materialen,
met `brand.tier` op `free` bij alle 2.093 brands. Dat blokkeert de legacy-banner (B34) en de
member-outreach, en staat in dezelfde week als de septembercampagne.

**v1.20 · 03-09-2026** — de open keuze in B88 is gesloten. Jeroen kiest voor één e2e-ronde vóór de
septembercampagne, in plaats van de eerste echte transactie als test te laten gelden. De vijf
uitvoeringsstappen staan nu in B88, inclusief de terugdraai-stap; die is expliciet als niet-optioneel
genoteerd, omdat een tijdelijke uitzondering die blijft staan de facto een nieuwe norm wordt en dit
besluit dan zijn eigen inhoud tegenspreekt.

**v1.21 · 04-09-2026** — B88 aangevuld met de uitkomst: de e2e-ronde is door Johan uitgevoerd en
geslaagd voor Insider. Twee dingen zijn er expliciet bij gezet in plaats van als afgerond te worden
weggeschreven. Ten eerste dat de merk-tiers níét getest zijn, want een geslaagde test op één tier
leest makkelijk als "de betaalflow werkt" terwijl de commercieel zwaarste kant onbeproefd is. Ten
tweede de verlengingskant, die de eenmalige checkout niet dekt en waarvoor Johans eigen live
abonnement op 05-09 een gratis controle oplevert.

Eén bevinding toegevoegd: bij de test kwam een betaald membership tot stand terwijl het
e-mailadres niet bevestigd was. Genoteerd als vastgesteld gedrag, niet als besluit.

**v1.22 · 04-09-2026** — twee besluiten uit de incidentsessie van 02-09-2026 alsnog opgenomen, met
nieuwe nummers: *een degraded render wordt niet gecachet* is **B90** geworden en *bewaking dekt twee
verschillende storingen* **B91**. Ze zijn daar geschreven als B88 en B89, maar die nummers waren
inmiddels door een parallelle sessie uitgegeven aan Stripe live-only. De levering van 02-09 is nooit
geplaatst; Johan zag de botsing en heeft geweigerd, wat precies de bedoeling is.

De oorzaak is structureel en niet incidenteel: nummers worden pas bij levering uitgegeven, dus twee
sessies die naast elkaar lopen kunnen hetzelfde nummer pakken zonder dat een van beide het merkt.
Zolang dat zo is, kan dit opnieuw gebeuren. In beide besluiten staat nu een `Nummering`-regel, zodat
een verwijzing naar "B88" uit die sessie terugvindbaar blijft. **B89 blijft bewust leeg** — dat nummer is
nooit in gebruik geweest op `main`, en het gat is goedkoper dan opnieuw schuiven met nummers waar al
naar verwezen wordt. Een leeg nummer is geen verwijderd besluit.

Verder in deze ronde: B88 is aangevuld met het besluit om de merk-tiers vóór de campagne te testen in
de goedkope variant. Bevinding 3 is gecorrigeerd — de conclusie klopte, de onderbouwing niet; de
volledige toedracht staat er nu bij in plaats van dat de oude tekst stil is vervangen. En bevinding 4
is overgenomen uit de gestrande v1.17: de vijf listingpagina's die structureel op `MISS` staan.

**Twee correcties uit de incidentsessie, die alleen in de gestrande v1.17 stonden en anders verloren
waren gegaan.** Er is die dag eerst gemeld dat de homepage zichzelf niet zou herstellen; dat was
onjuist, hij draaide na circa dertig minuten om (`revalidate = 600`). En de 429's zijn eerst gelezen
als een rate-limit-instelling; het was terugslag van een vollopende functiepool. Ze staan hier omdat
correcties worden vastgelegd en niet stil overschreven — ook wanneer de versie waarin ze stonden
nooit geplaatst is.

**v1.23 · 04-09-2026** — B88 aangevuld met de uitkomst van de merk-tier-ronde: alle drie geslaagd,
opruiming en terugkeer naar live-only uitgevoerd. Het uitzonderingsvenster op het live CMS is
expliciet vastgelegd in plaats van weggelaten, omdat een gebruikte uitzondering navolgbaar hoort te
zijn en niet alleen een toegestane.

Eén bevinding toegevoegd, en die wijkt af van hoe zij is aangeleverd. Het verkeerde tier-label op de
checkout is gemeld als niet-blokkerende UI-bug; hier staat zij als blokkerend. Grond: het gaat om het
betaalscherm van de duurste tiers, waar bedrag en label elkaar tegenspreken. Dat is geen cosmetisch
verschil maar een verschil tussen wat de koper bevestigt en wat hij krijgt.

**v1.24 · 04-09-2026** — bevinding 5 bijgewerkt. De oorzaak lag niet waar dit register hem
vermoedde: niet in vaste copy in `/checkout/brand`, maar in de productnamen in Stripe, waar alle
prijzen onder één product hingen. De vermoedens-regel is vervangen door de vastgestelde oorzaak, met
de correctie zichtbaar in plaats van stil overschreven.

De bevinding blijft open, ook al is er gerepareerd. Reden: het herstel is niet gemeten, en de ingreep
raakt meer dan het label — live producten, prijzen en lookup-sleutels zijn vijf dagen vóór de
campagne omgezet. Een besluitenregister dat "opgelost" noteert op grond van een verwachting doet
precies wat B57 en B90 verbieden.

**v1.25 · 04-09-2026** — bevinding 5 (het tier-label) is gesloten na meting. Johan heeft per tier een
live checkout-sessie aangemaakt en geopend: alle drie kwamen tot stand met de nieuwe lookup-sleutels,
de labels lezen Basic, Plus en Partner, en de bedragen zijn €750, €1.500 en €3.000 per jaar. De oude
prijsobjecten zijn behouden, zodat lopende abonnementen kunnen blijven verlengen. Daarmee is het
laatste blokkerende punt vóór de campagne weg.

Eén nieuwe bevinding, als bijvangst van diezelfde meting: Adaptive Pricing staat aan in Stripe. Dat
is geen storing en het verklaart de valutakeuze die bij de meting opviel, maar het is een
commerciële instelling met gevolgen voor wat buitenlandse merken betalen — en er is geen besluit dat
haar aanzet. Genoteerd als openstaand, niet als fout.

Opgesteld door Claude, namens Jeroen.
