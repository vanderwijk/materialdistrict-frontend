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
> Versie 1.6 · 26-08-2026 · B22 herzien (frontend-canon); bevindingen 2 en 5 gesloten bij merge
> van documentatiefundament-v8. v1.5 · 25-08-2026 · §9 en §10 toegevoegd na een sweep over alle
> sessies in dit project. Gereconstrueerd uit `docs/`, `session-log.md`,
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

> De inhoudelijke norm staat in `docs/materiaal-classificatie-regelboek.md` in de
> **frontend-repo** (publiek, zodat Claude en Jeroen erbij kunnen). De plugin-repo is privé.
> Hieronder alleen de besluiten die daarbuiten doorwerken.

### B22 · Het regelboek in de frontend-repo is de enige canonieke versie
**Besluit.** Canoniek pad: `materialdistrict-frontend/docs/materiaal-classificatie-regelboek.md`.
Geen tweede kopie onder `docs/cms-plugin/`. De private plugin-repo mag een pointer houden, geen
parallelle normtekst.
**Grond.** Twee bestanden met dezelfde naam lopen uiteen (19-08: frontend nog op 1.1). De
plugin-repo is privé; de frontend-repo is de gedeelde werkruimte voor Claude/Jeroen — daarom
woont de norm daar, niet omgekeerd.
**Bron.** 19-08-2026 regelboek §Werkwijze; bevestigd 26-08-2026 (Johan): cms-plugin-kopie en
v1.3 verwijderd; Claude’s klaring 26-08: root-pad houden, cms-plugin-kopie weg.
**Raakt.** `START-HIER.md` (bronhiërarchie), elke classificatiesessie.
**HERZIEN 26-08-2026.** Eerdere formulering (“alleen in de plugin-repo” / “NIET UITGEVOERD”)
botste met de toegangsreden en is uitgevoerd.

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
De rest van de acht regels blijft ongewijzigd geldig.

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

### B44 · Deelnamefeiten hebben een vaste woordenlijst
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

## Bevindingen bij het opstellen — drie dingen die nu niet kloppen

*Deze horen niet permanent in het register; ze staan hier tot ze zijn opgelost.*

**1. `roadmap.md` bestaat in twee versies die beide uniek materiaal bevatten.** De versie in de
moedermap (`docs/roadmap.md`, laatst gewijzigd 31-07) mist de hele sessie van 22-06: §5d (het
AI-team met acht agents), de DDOS-/bot-beschermingsingang, de distributiepoort, submissions, de
koerswijziging naar command center, Campaigns onder geparkeerd, en de bevestiging dat de
redactie-rechten gedeployed zijn. De versie in de project knowledge mist juist wat er ná 22-06 is
bijgekomen: de Material visualizer (25-06), de dual-write-status van 30-06, en de mailtool-keuze
van 24-07. Ze zijn in beide richtingen uit elkaar gelopen. De meegeleverde `docs/roadmap.md`
is de samenvoeging.

**2. Dubbel regelboek — opgelost 26-08.** Canoniek is
`docs/materiaal-classificatie-regelboek.md` in de frontend-repo. De kopie onder
`docs/cms-plugin/docs/` en de v1.3 zijn verwijderd. Zie B22 HERZIEN. (Claude’s klaring van
26-08 bevestigt dit pad; de oude mail die het omkeerde is ingetrokken.)

**3. `publication_status` is leeg op alle 3.246 gepubliceerde materialen.** Volgens B32 hoort de
default `legacy` te zijn. Het veld bestaat en is geregistreerd, maar de backfill is nooit
gedraaid. Gevolg: het onderscheid tussen betaald, historisch en beëindigd materiaal bestaat op
dit moment niet in de data, de legacy-banner uit B34 kan niet verschijnen, en de automatische
archivering op 30 april 2027 heeft niets om op te draaien. Ook `brand.tier` staat op `free` voor
alle 2.093 gepubliceerde brands — de member-status uit launch-taak 5 is dus nog niet gezet.

**4. `datastrategie-specificatie.docx` staat niet in de moedermap.** De importnorm — acht
kernregels, veldscheiding, twee entiteiten — is in augustus 2026 vastgelegd na de mislukte
importronde, maar alleen als los docx-bestand uit die sessie. Voor het riskantste project dat er
ligt is de norm daarmee alleen vindbaar door de sessie te kennen. `importprotocol.md` in deze
levering brengt hem in de moedermap; het originele docx zou daarna ingetrokken moeten worden in
plaats van ernaast blijven bestaan.

**5. Dubbele session-log — opgelost 26-08.** `docs/session-log-mission-beeld-04-08-v2.md`
verwijderd. Enige log: `session-log.md` in de repo-root.

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
`free`. Zie §Bevindingen 3.

**v1.3 · 25-08-2026** — B41–B45 toegevoegd bij de herbouw van `importprotocol.md` tot een
volledige beslisflow: herkomst per veld (B41), de bronautoriteit-rangorde (B42), de zes
e-mailstatussen (B43), de vaste woordenlijst voor deelnamefeiten (B44) en de toelatingstoets
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

Vijf bevindingen stonden apart genoteerd; 2 en 5 zijn op 26-08 gesloten. 3 en 4 blijven open.

**v1.6 · 26-08-2026** — documentatiefundament-v8 gemerged door Johan. B22 herzien naar
frontend-canon (in lijn met Claude’s klaring). Regelboek-bestand zelf niet aangeraakt in deze
stap (v2.0 volgt uit herclassificatie-levering).

Opgesteld door Claude, namens Jeroen; v1.6 door Johan.
