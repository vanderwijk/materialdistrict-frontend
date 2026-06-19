# Roadmap & ideeën — MaterialDistrict frontend

> **Levend document.** Tegenhanger van `session-log.md`: dat kijkt terug, dit kijkt
> vooruit. Bron van waarheid blijft de moedermap; dit bestand woont in `docs/`.
>
> **Status gekalibreerd tegen de code (moedermap-scan 18-06-2026).** Labels:
> **[live]** = staat in de codebase · **[deels]** = deel af, rest open ·
> **[open]** = nog niet gebouwd.

---

## 1. Inbox — ongesorteerd

### Terug naar de pagina na inloggen  ·  **[deels]**  ·  quick win
Uitgelogd iets willen volgen (bv. een channel op een materiaalpagina) → eerst inloggen →
daarna terug naar diezelfde pagina, met de follow idealiter meteen voltooid. De redirect-
infra bestaat al: `/sign-in?next=/pad` (veilig genormaliseerd, open-redirect-bescherming)
stuurt na login naar `next`. Gat: de follow-knop geeft uitgelogd de huidige pagina nog niet
als `next` mee (kale `/sign-in`-link), dus je belandt op `/materials` i.p.v. terug. Dichten
voor follow én breder voor elke "moet inloggen"-actie; follow-intentie onthouden zodat 'ie
na login doorgaat. Vooral frontend.

### Preferred-source-knop verbergen na dismiss  ·  **[open]**  ·  quick win
De Google "preferred source"-knop (nu overal) verbergen voor wie 'm al gebruikte. Google
geeft géén signaal of iemand MD echt heeft toegevoegd — dus werk met een dismiss: onthoud
"geklikt / niet meer tonen" en verberg 'm daarna. Ingelogd → opslaan in profiel (overleeft
cookie-wissen, werkt cross-device); uitgelogd → cookie/localStorage als fallback. Cookie
weg → knop terug is acceptabel, want de echte status ken je toch niet. Functionele voorkeur,
geen tracking — botst niet met de cookie-consent-tool. Vooral frontend.

### Artikel beluisteren i.p.v. lezen  ·  **[open]**
Knop op de detailpagina die het artikel voorleest (audio-versie). Toegankelijkheidswin
(sluit aan op de WCAG-lijn) + engagement: luisteren onderweg. Kwaliteit zit in de stem —
browser-eigen TTS is gratis maar robotachtig; een echte TTS-stem (vooraf gegenereerd +
gecachet per artikel) klinkt natuurlijk maar kost per teken. Levert meteen een nieuw event
op ("article_listened") voor de data-moat. Vooral frontend + een TTS-bron.
Kosten: verwaarloosbaar via Amazon Polly (zit al in de AWS/SES-stack). Audio één keer
genereren + cachen (herafspelen gratis) → ~$3/mnd standaard, ~$9 neural, ~$18 generative
voor alle nieuwe artikelen. Archief on-demand genereren i.p.v. vooraf alles.
Mogelijke Insider-perk: hang de hoogwaardige gecachete stem achter de bestaande
`insiderOnly`-poort; een basale (browser-)voorleesoptie blijft gratis voor toegankelijkheid.
On-demand genereren bij lid-klik koppelt de kost aan inkomsten i.p.v. aan al het verkeer.
Eigenaar: beide

### Wekelijkse audio-digest van je channels  ·  **[open]**  ·  Insider-perk
Convergentie van drie bestaande items: follow (welke channels) + segmented digest (wekelijks
samenstellen + mailen) + TTS-audio. Een persoonlijke audio-briefing van het nieuwe nieuws in
je gevolgde channels, per mail. Twee smaken: (a) nieuwe artikelen achter elkaar voorgelezen —
hergebruikt de per-artikel gecachte audio, vrijwel gratis extra; (b) AI-samengevatte briefing
(podcast-gevoel, maar per-gebruiker uniek → iets meer werk + kost). Kroon op fase 1: kan pas
als follow + digest + audio staan.
Positionering: "Weekly Material Briefing" — een persoonlijke mini-podcast op maat. Mailflow:
trigger ("7 nieuwe updates deze week — luister je 6-min briefing") → CTA's play / view all /
save / follow. Drie lagen: mail = trigger, audio = gemak (onderweg bijblijven), platform =
verdieping (doorklikken). Sterke Insider-bundel: weekly briefing + AI-samenvattingen + save &
listen later + custom frequentie.
Kosten-nuance: de gepersonaliseerde briefing maakt één unieke audiofile per Insider per week →
kost schaalt met het ledenaantal (~paar honderd $/jr bij ~100 Insiders, richting paar duizend
bij 500-1.000, + kleine AI-samenvattingskost). Niet "verwaarloosbaar" zoals de gedeelde-cache-
variant, maar prima — betaalde tier, kost schaalt mee met inkomsten.
Fasering: v1 = audio in de digest (artikelen voorgelezen, gedeelde cache, bijna gratis, nu
haalbaar) is de richting. v2 = gepersonaliseerde AI-podcast — **nu niet aan de orde** (kost
schaalt per gebruiker); later heroverwegen als de Insider-basis dat draagt.
Eigenaar: beide

### Sample-/info-aanvraag wordt een lead  ·  **[open]**
Vanaf een materiaal-/brandpagina of opgeslagen materialen een knop "vraag samples/info aan"
→ landt als lead bij de brand én in de datapool/Atlas. Hergebruikt de bestaande lead-routing
uit het dashboard. Tastbare ROI voor brands; verbindt publieke engagement met de sales-data.
Eigenaar: beide

### Misgelopen zoekopdrachten benutten  ·  **[open]**
`search_materials` wordt al gelogd; vang de zoekacties zónder resultaat apart op. Dubbel
signaal: ontbrekende content (redactie) + binnen te halen brands (Atlas-prospects). Bijna
gratis — het event bestaat al.
Eigenaar: beide

### Interesse-onboarding bij aanmelding  ·  **[open]**
Bij registratie meteen een paar channels/interesses uitvragen → automatisch follows → digest
en data-moat gevuld vanaf dag één. Hergebruikt follow-systeem + registratiescherm.
Eigenaar: vooral frontend

### Datasheet-/moodboard-PDF van een board  ·  **[open]**  ·  mogelijke Insider-perk
Eén klik exporteert opgeslagen materialen als nette PDF (specs of moodboard) voor in een
projectvoorstel. Concrete werkwaarde; materiaaldata + PDF-generatie zijn standaard.
Eigenaar: beide

### EPD / duurzaamheidsdata als filter & vergelijking  ·  **[open]**  ·  na upload agent
Zodra de upload agent EPD-/milieuvelden vult: filteren en vergelijken op duurzaamheid
("laagste CO₂ eerst"). Sluit aan op de biobased/sustainability-hoek.
Afhankelijk van: upload agent · Eigenaar: beide

### Add-to-calendar bij events  ·  **[open]**  ·  laag / nice-to-have
"Toevoegen aan agenda" (Google + Outlook + universele .ics) bij event-knoppen en in mails. Geen
account-detectie nodig — gewoon links uit de bestaande event-data; e-mail kan een account sowieso
niet herkennen. Marginaal qua prioriteit; vooral interessant voor de maatwerk event-promotiemails
(eerder met Sjoerd besproken), niet voor nu.
Eigenaar: vooral frontend

---

## 2. De rode draad: fasering

**Fase 1 — het fundament = de data-moat.** Loggen moet nú, want data is niet
backfillbaar. Loggen, relateren, volgen. Dit is geen analytics, het is bedrijfswaarde.

**Fase 2/3 — intelligentie bovenop.** Aanbevelingen, AI-agent, slimme dashboards —
waardevol, maar waardeloos zonder opgebouwde historie. Bouwt op de data die er dan ligt.

**Planning-venster (juni–aug 2026):** Johan inzetbaar t/m ma 22-06, daarna vakantie tot 08-07
(mails worden uitgesteld tot terugkomst). Launch-streven ~1 aug. Tussentijd: Jeroen + team doen
content (channels/thema's); Claude bouwt frontend-items van de ideeënlijst die zonder nieuwe
backend kunnen. Backend-afhankelijke items vóór 22-06 met Johan scopen, anders schuift het naar
na 08-07 (~3,5 week richting 1 aug).

**Volgorde-advies:** quick wins los → fundament verbreden (events, follow, datamodel) →
hefbomen die erop leunen (digest, alerts, SEO-landingspagina's) → parallel: social login →
later & groot: bilingual + eigen admin → fase 2/3: intelligentie (incl. het Atlas-cluster).

**Quick wins (nu, vooral frontend — snel te leveren):**
- Terug naar de pagina na inloggen — `?next=`-infra bestaat al, alleen benutten. Voedt follow-conversie.
- Structured-data-dekking aanvullen waar pagina's nog schema missen — SEO-winst.
- Preferred-source-knop verbergen na dismiss (client-side; cross-device later met Johan).
- Eventlaag verbreden — DB draait al live (view + search lopen); resteert `saved/shared/followed`
  toevoegen, na korte afstemming met Johan of de DB die accepteert.

---

## 3. Fase 1 — fundament & directe hefbomen

### Eventlaag verbreden  ·  **[deels]**  ·  hoogste prioriteit
Live: `website_click`, `brochure_download`, `search_materials`, `preferred_source_click`
via `/api/interactions/events`. Open: `material_view / saved / shared / channel_followed`
toevoegen. Niet-backfillbaar — daarom prioriteit. Analytics in aparte DB (besloten).
Status (Johan, 18-06): de analytics-DB draait LIVE — AWS-keten WP `/md/v2/events` → API Gateway
→ Lambda → SQS → Lambda → RDS. Events stromen al binnen; view-events + zoekopdrachten worden
gelogd, 7.018 legacy views gemigreerd. Open bij Johan (niet blokkerend): dagelijkse rollup/prune-
cron + `last_seen` (wacht op kleine frontend-drop). Verbreding die nog rest: `material_saved /
shared / channel_followed` toevoegen — vergt afstemming of de DB die event-types accepteert.
Frontend (verse zip) stuurt al: view-events (ViewLogger) + search via `/md/v2/events` (→ RDS).
Beantwoord (Johan, 19-06): de aparte `/md/v2/interactions/events`-route (`website_click` +
`brochure_download`) gaat nu **niet** naar RDS — die schrijft in WP: `website_click` → brand
post_meta (`_brand_website_clicks`), `brochure_download` → attachment-meta (`_brochure_downloads`)
+ lead-CPT (status Download) voor het manufacturer-dashboard. Plan = **dual write**: de counts/trends
ook naar RDS (alle statistiek op één plek), de leads + manufacturer-opvolging + mail in WP (= CRM,
hoort niet in RDS). Uitgewerkt (19-06, plugin-analyse): de **backend** splitst — de interactions-route
forwardt de count naar RDS via de al bestaande `md_analytics_submit_event()` (website_click/brochure_download
+ brand/material staan al in de toegestane types), de frontend verandert niets; **RDS wordt de telbron**,
het manufacturer-dashboard leest via `md_analytics_api_get_total_count()`. Patch ligt klaar voor Johan.
Afhankelijk van: Johan-spec · Eigenaar: beide

### Follow-systeem  ·  **[deels]**
Live (frontend): `FollowToggle`, `FollowDigestBlock` (nieuwsbrief-voordeur), `useFollow`,
`/api/follows`-proxy, `followable`-flag op brands. Open: de backend-relaties/endpoints
volledig afmaken + elke follow als event wegschrijven.
Eigenaar: vooral backend nog

### Datamodel-haakjes  ·  **[deels]**
Live: `insiderOnly`-vlag wordt al gelezen op materials/articles/reports; related content
+ channels leggen relaties. Open: bredere content-relaties waar nodig.
Eigenaar: vooral backend

### Segmented newsletter / digest  ·  **[deels]**
Live: de follow-voordeur (`FollowDigestBlock`) die de oude e-mailbox vervangt. Open: de
digest-engine zelf — drie blokken (persoonlijke content / commerciële slots / insider-
trigger), "nieuw sinds vorige cyclus", marketing-consent, en de **mailtool-keuze**
(Sendy-op-SES vs MailPoet vs managed). Voorwaarde: materiaal goedgekeurd vóór opname
(+ write-once eerste-goedkeurdatum). Begin segment-gericht, niet per individu.
Afhankelijk van: tooltkeuze + backend · Eigenaar: beide

### "New in your channels"-pagina  ·  **[open]**
De pagina achter de "+24 more"-link: persoonlijke cross-channel listing op de FacetWP-
infra, ingelogd. Groeit later door naar de volledige persoonlijke feed (fase 2).
Afhankelijk van: follow-systeem · Eigenaar: vooral frontend

### Saved-search e-mailalerts  ·  **[deels]**
Live: toggle/voorkeur (`alertsEnabled`) in de saved-searches. Open: de alert-engine
(cron + matching + mail). Deelt infra met de digest.
Afhankelijk van: Johan · Eigenaar: vooral backend

---

## 4. Op de horizon

### Upload agent  ·  **[open]**  ·  NIEUW (18-06)
Klant voedt een agent met bronnen (brochures, EPD's, persberichten, company info, links);
de agent extraheert daaruit het brand-profiel én materiaalvelden, getraind op jullie
kwaliteitsnorm (bv. thumbnail = materiaalfoto, geen toepassing). Tweeledig: brands
ontzorgen + grip op contentkwaliteit (→ betere SEO/discovery). Mens-in-de-loop: agent
stelt voor, klant/redactie keurt goed. Bouwt op het bestaande material-form-datamodel —
hangt níét op de data-moat, kan dus eerder dan fase-2-intelligentie. Familie van de
brand-scan in §6.
Eigenaar: beide

### Social login (Google + LinkedIn)  ·  **[open]**
Gescoped, nog niet gebouwd (geen knoppen/callback in de code). OAuth → WP user → dezelfde
JWT-cookie. Frontend klein. Kan parallel — lage kost, hoge conversiewaarde.
*Open keuzes:* linking op geverifieerd e-mail; "complete your profile" na eerste login.
Afhankelijk van: Johan (OAuth) · Eigenaar: vooral backend

### SEO long-tail facet-landingspagina's  ·  **[open]**  ·  ná het fundament
Echte pagina's per zinvolle facet-combinatie ("Acoustic biobased materials"): intro +
gecureerde materialen + stories + structured data. Selectiviteit ís de strategie: wees
dé bron voor de query, geen dunne commodity-content.
Afhankelijk van: fundament · Eigenaar: frontend + curatie

### Rich results / structured data  ·  **[live]**, uit te breiden
structured-data.ts dekt al Article, Event, VideoObject, Product, Book, Breadcrumb,
CollectionPage e.a. Resterend: dekking checken/uitbreiden waar pagina's nog ontbreken.
Eigenaar: vooral frontend

### Named authors op artikelen  ·  **[deels]**
Footer-UI staat; toont nu "Story by MaterialDistrict". Open: echte auteur-resolve
(bio + foto vanuit redactie). Niet retroactief.
Eigenaar: beide

### Ontdek-laag — "het moet leuker"  ·  **[open]**
Serendipiteit-modus ("verras me"), curated trails (redactionele routes), verzamel-
momentum (boards belonender maken). Voedt ontdekking én interne SEO-linking.
Eigenaar: vooral frontend

### Cookie-consent tool  ·  **[open]**
Footer-link staat uitgecommentarieerd, wacht op een consent-tool.
Eigenaar: beide

### Terms als content-pagina  ·  **[open]**
Nu PDF-link; kan een WP-pagina worden via het page-template (`PAGE_SLUG_MAP`).
Eigenaar: beide

---

## 5. Dashboards — twee producten  ·  bijgewerkt 19-06

Wat begon als "één dashboard voor Sigrid" blijkt twee aparte producten met een verschillend
karakter — niet "schrijven vs lezen" (beide schrijven), maar **wát ze beheren**: het redactie-
dashboard beheert je publieke content, het business-dashboard je commerciële relatie- en sales-data
(het ís een CRM: projecten, klantnotities, kwalificaties). Beide gated bovenop MD.com, beide
hergebruiken bestaande bouwstenen.
**Open ontwerpvraag (geparkeerd):** twee aparte dashboards, of één dashboard met twee ingangen?
**Volgorde: redactie eerst** (bouwt op bestaand werk, directe dagelijkse winst), **business
daarna** (gated op de analytics-laag — die draait nu live).

**Twee agents, tegengesteld gericht.** Beide dashboards krijgen een eigen agent: de redactie-agent
**máákt** content (inbound, 5c), de business-agent **háált** commerciële signalen op (outbound, in 5b).
Gemene deler van álle agents (incl. de upload agent): niet de AI-tekstverwerking, maar dat ze de
MaterialDistrict-graph kennen — dáár zit de meerwaarde, en daarom is het datafundament bepalend.

### 5a. Redactie-dashboard (Sigrid / contentteam)  ·  **[open]**  ·  launch-kandidaat ~1 aug
*Schrijven/beheren — WP-admin vervangen voor het dagelijkse content-werk.*
- **Scope** = alleen het dagelijkse: entiteiten (stories, events, brands, talks, books) +
  gebruikersbeheer, nieuwsbrieven, handmatige mailings. Incidentele "vastzetten"-taken (channels,
  verzendklassen, facetten, voorwaarden/privacy) blijven in WP — zelden aangeraakt, hoeft niet mooi.
- **Recycling** = de edit-pagina's (brand, material, user, profiel) zijn exact dezelfde componenten
  die er al staan — een edit is een edit, of de eigenaar of een redacteur 'm opent. Vrijwel 1-op-1
  herbruikbaar; zelfde bouw als het bestaande ledendashboard.
- **Het nieuwe zit eromheen:** (a) rechten — na plugin-analyse (19-06) gesplitst: **brands + materials**
  zijn met één capability-bypass in `md_dashboard_require_managed_brand` (`edit_others_posts`, al elders
  in de plugin gebruikt) in één keer admin-breed te openen — klein, patch ligt klaar voor Johan;
  **stories/events/talks/books/users** hebben nog géén dashboard-endpoints → dat is nieuwbouw. (b)
  overzicht — zoek/lijst-laag om content te vinden (deels recyclebaar van listings).
- **Planning:** frontend-recycling kan in Johans vakantie voorbereid worden; admin-breed schrijven
  is het kritieke pad dat Johan-tijd vraagt → nú scopen (vóór 22-06).
- Bevat de **nacht-agent** (zie 5c).

### 5b. Business-dashboard (sales + business owner) — "Atlas"  ·  **[open]**
*Lezen — engagement- en leaddata omzetten in iets waar sales mee werkt (wie kijkt naar welke
materialen → lead → project).* De sales-bovenkant van dezelfde data-moat; een datapool waarop je
projecten aanmaakt. Werknaam "Atlas" uit de v4-mockup (`crm-v4.html`, bronstuk; vier tabs ontworpen,
niet gebouwd). Gated op de analytics-DB — **die draait sinds 18-06 live**, dus het fundament ligt er
al (het verslag-punt "spec moet nog naar Johan" is achterhaald).
**Backend-onderscheid t.o.v. 5a:** waar het redactie-dashboard vooral bestáánde endpoints admin-breed
opent, vraagt dit een heel nieuw datamodel (projecten, notities, prospect-lists, companies/contacts-
datapool met dedupe-import). Substantieel groter Johan-traject → eigen ontwerpronde, beter ná 08-07.

**Kerngedachte — account als ruggengraat (account-by-default).** Elk waardevol
contactmoment maakt automatisch een identiteit aan op het platform: boek besteld, ticket
geregistreerd, beurs bezocht, of no-show. Opt-out i.p.v. opt-in, transparant gemeld + makkelijk
te verwijderen. Lost dedupe op aan de bron en verbindt publieke groei (follows/digests)
met de sales-datapool onder één identiteit. (Johans eerdere "nee" gold een account voor
één losse boekbestelling; als toegangspoort tot de hele datastrategie kantelt die afweging.)

**De trechter:**
- **Datapool** — alle bronnen samen. Entiteiten (bedrijven, contacten, brands) in WP
  (overlapt met bestaande data); gedrags-events in de aparte analytics-DB; gejoind voor
  kwalificatie. Slimme **import met dedupe**: identity-matching (e-mail/KvK) + bron-tag op
  het bestaande record (#MDU2026_VISITOR) i.p.v. duplicaat.
- **AI-verrijking & kwalificatie** — verrijken, actueel houden, en identificeren wie
  interessant is (prospect-brand, potentiële Insider/architect, spreker).
- **CRM** — gekwalificeerde partijen, met stage/rating/rol.
- **Projects** — concrete deals per project (beurs/campagne), prospect-lists,
  accountmanagers met doelstellingen, weighted pipeline.
- **Dashboard** — overzicht voor sales-persoon én manager.

**Brand-monitoring-agent (de business-/outbound-agent)** — draait periodiek over de hele DB met
focus op de **brands** (daar zit het geld: memberships + beursdeelname). Checkt of de brand-info nog
klopt en of er iets nieuws is (bijv. een productlancering). Zulke veranderingen zijn verkoop-haakjes:
weet je dat een merk net iets lanceerde, dan mail je gericht. "Iets nieuws" detecteren vraagt een
opgeslagen **baseline per merk** — de agent draait feitelijk een periodieke **diff** t.o.v. wat we al
wisten; vandaar dat 'ie op de datapool leunt. Frequentie: voorlopig maandelijks (past bij de
membership-/beurs-cyclus); dagelijks alleen als je als eerste op lanceringen wilt reageren. Familie
van de upload agent.

**Inbound-signaal → prospect (centrale use-case, "de natte droom").** De inbound-spiegel van de
monitoring-agent: jíj voert een signaal in dat je opvalt (mailing, LinkedIn-post, vaktijdschrift-
noviteit, beurscatalogus van een concurrent) → het dashboard doorloopt de trechter. Staat dit
merk/product al op MD? **Nee = opening** (potentiële member/listing). → Is er eerder contact geweest
met dit bedrijf, en zo ja met wie en door wie? → Zo ja: de relatie-eigenaar wordt vanuit het dashboard
aan het werk gezet (opportunity toegewezen mét context, daarna gevolgd — dit is de brug naar het CRM-
hart). → Zo nee: externe verrijking (juiste contactpersoon, functie nog actueel?) + maatwerk-outreach
met mens-in-de-loop, nooit een invaladres.

**Contact-check zonder de mailbox open te leggen (AVG-bewust).** Niet de mailinhoud, maar een metadata-
index: wie van het team correspondeerde met welk extern bedrijfsdomein, en wanneer — puur "Vince ↔
formatwood.com ↔ maart". Détectie volledig geautomatiseerd op de achtergrond (geen verstoring van het
dagelijkse werk, schaalt grootschalig); de mens komt pas gericht in beeld bij een match (één seintje
naar de relatie-eigenaar). Proportioneel houden: alleen externe bedrijfsdomeinen (geen privémail/
contacten), vastgelegd in beleid + vooraf met het team gedeeld. Hele-mailbox-toegang gaat te ver (AVG:
privacyverwachting werknemer + derden-data) — deze metadata-route levert hetzelfde met een fractie van
het risico. Jurist/DPO laten meekijken op het derden-stuk.
- **Databron op zichzelf:** die contact-index is een herbruikbare relatie-kaart ("wie van ons kent
  wie") — ook waardevol voor beursvoorbereiding en prospect-lists, niet alleen deze ene check.
- **Taaiste stuk:** de LinkedIn-/contactcheck laat zich niet zomaar automatiseren (tegen LinkedIn-ToS,
  actief geblokkeerd) → in de praktijk een betaalde externe enrichment-dienst, data niet altijd compleet.
- **Fasering:** trede 1 (signaal in → staat 't al op MD? + metadata-contactcheck) is haalbaar en al
  waardevol; gerichte notificatie + auto-research + auto-outreach zijn de zwaardere staart.

**Open beslissing:** houdt Atlas zijn eigen brutalist-identiteit (intern tool) of trekt
'ie de MD.com-huisstijl aan? Lean: als intern tool eigen + strak houden.

### 5c. Nacht-agent (feature van het redactie-dashboard)  ·  **[open]**
Automatiseert wat nu handmatig gebeurt: Feedly scant bronnen → Sigrid cureert → screenshot →
ChatGPT met redacteur-prompt → origineel artikel. 's Nachts ~20 concepten in een draft-wachtrij;
's ochtends triageert Sigrid: bekijken, verrijken, publiceren of weggooien.
- **Geautomatiseerd:** screenshot verdwijnt (agent leest brontekst direct, voegt bronnen samen);
  de bestaande prompt wordt de versioneerbare system-prompt.
- **Echte meerwaarde = verrijking, niet tekstkwaliteit.** De agent zoekt actief extra externe bronnen
  bij, raadpleegt onze eigen database en koppelt entiteiten: ziet 'ie een merk, ontwerper of materiaal
  dat wij al in huis hebben, dan haalt 'ie die context erbij en linkt intern door. Dát is de sprong
  t.o.v. nu — redactioneel rijker, plus interne links + topical authority voor Google News/Discover.
  Familie van de upload agent (AI + content + Sigrid-review).
- **Guardrails:** origineel schrijven, nooit copy-paste; linken naar verifieerbare bronnen + eigen
  pagina's tegen verzonnen research; Sigrids review blijft de poort.
- **Bouwen:** incrementeel — eerst draft-wachtrij, dan agent simpel (huidige flow automatiseren),
  daarna intelligentie eroverheen.

**Namen (geparkeerd):** redactie → Desk / Newsroom; business → Signal / Pulse / Lens.
Voorlopig: "redactiedashboard" en "businessdashboard".

---

## 6. Internationaal & content-beheer (later, groot)

### Bilingual (NL + EN)  ·  **[open]**
EN op ongeprefixte paden, NL onder `/nl`. WPML boven Polylang. Twee lagen: UI-chrome
(frontend) vs. redactionele content (plugin + vertaalwerk).
Afhankelijk van: Johans haalbaarheid + contentlaag · Eigenaar: beide

### AI-ondersteunde vertaling  ·  **[open]**  ·  fase 2/3
Bezoeker-toggle voor onvertaalde content; gecached, als unreviewed draft teruggeschreven,
gebadged, buiten geïndexeerde HTML tot review. Onderdeel van bilingual.

---

## 7. Fase 2/3 — intelligentie op de opgebouwde data

Bewust later; pas zinvol als de data-moat gevuld is.
- **Aanbevelingen / "materialen zoals dit"** — personalisatie uit gedrag.
- **Volledige persoonlijke feed** (doorgroei van "New in your channels").
- **AI-agent / crawler / slimme dashboards** — incl. het Atlas-cluster (§5).

---

## 8. Geparkeerd

Bewust uitgesteld. **Niet voorstellen als actieve volgende stap.**
- **Upsell shop** incl. beurs-configurator (complex: varianten, contracten, capaciteit).
- **WooCommerce self-service checkout** als volledige zelfbediening + tier-vergelijking.
  *(NB: de gewone checkout/cart/iDEAL/insider-korting is wél live — zie §9.)*
- **Homepage books-sidebar-widget** — bewust geparkeerd.
- **Books filter-sidebar overhaul** — geblokkeerd op category-taxonomy van Johan + sign-off.
- **Publieke insider-reports-detailpagina** (`/insider-reports/{slug}`) — niet gebouwd.
- **VIES reverse-charge volledige afhandeling** — basis-VAT-validatie in checkout is live;
  de volledige reverse-charge-uitwerking schuift door.

---

## 9. Live / recent afgerond

Bevestigd in de moedermap-scan (18-06-2026):
- **Dashboard** (S13.x): brand/material-forms, profiel, Insider insights (gated download),
  tier-preview, statistieken, lead-routing, event-logging, 15-punts review.
- **Homepage** (S10.x): volledige productie-build.
- **Books/webshop**: index + detail (sheet-and-rail, BookBuyCard), cart, checkout, iDEAL,
  insider-korting, featured-book, books-filtersidebar.
- **Follow-systeem** (frontend): toggle, digest-voordeur, hook, proxy.
- **Structured data**: brede schema-dekking incl. VideoObject/Event/Product.
- **VAT in checkout**: validatie + `vat-status`-endpoint.
- **Google Preferred Sources-knop** (SEO/Google News-lijn).
- **Overzichtsfilters**: events Costs, brands Application area, stories Insider-only.
- **WCAG**: P1-contrast-fixes + P2 focus-traps gemerged (a11y-sessie A11Y-1, 18-06).
- **Strategie-docs**: traffic/SEO, e-mailsysteem-blueprint, mailautomation-plan.
