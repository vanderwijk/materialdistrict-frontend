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
> Versie 1.2 · 26-08-2026 · B22 herzien (frontend-canon); B5–B12/B21 bevestigd; bevindingen 2–3
> gesloten. v1.1 · 25-08-2026 · B17 bevestigd en gesplitst (B18a toegevoegd). Gereconstrueerd uit
> `docs/`, `session-log.md`, `roadmap.md` en `livegang-checklist.md` van de moedermap-stand van
> 24-08-2026. Zie §Status.

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
**Grond.** Op 2 vCPU zat de indexer de CMS-CPU vast (~100%, load ~5); tijdelijk uitzetten was
alleen noodverband. Na de upgrade weer aan, met bestaande reduced aggressiveness.
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
v1.3 verwijderd; Claude trok het eerdere “spiegel onder cms-plugin” in.
**Raakt.** `START-HIER.md` (bronhiërarchie), elke classificatiesessie.
**HERZIEN 26-08-2026.** Eerdere formulering (“alleen in de plugin-repo”) botste met de
toegangsreden; uitgevoerd in commit `148339b` e.v.

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

## Bevindingen bij het opstellen — status 26-08-2026

**1. `roadmap.md` — opgelost.** Samengevoegd in de zip van 25-08; staat zo in de repo.

**2. Dubbel regelboek — opgelost (andere kant dan Claude eerst voorstelde).** Canoniek is
`docs/materiaal-classificatie-regelboek.md` in de frontend-repo. De kopie onder
`docs/cms-plugin/docs/` en de v1.3 zijn verwijderd (26-08). Zie B22 HERZIEN.

**3. Dubbele session-log — opgelost.** `docs/session-log-mission-beeld-04-08-v2.md` verwijderd
(26-08). Enige log: `session-log.md` in de repo-root.

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

**v1.2 · 26-08-2026** — Johan: documentatiefundament gemerged; B5–B12 en B21 bevestigd (plus B4
lockdown, die in dezelfde notitiereeks zat); B22 herzien naar frontend-canon; bevindingen 2 en 3
gesloten. B6 kreeg een ontbrekende **Grond**-regel.

Opgesteld door Claude, namens Jeroen; v1.2 door Johan.
