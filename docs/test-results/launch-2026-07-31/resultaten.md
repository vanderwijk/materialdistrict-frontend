# Testresultaten — MaterialDistrict soft-launch

Uitgevoerd: 2026-07-31 · Omgeving: https://materialdistrict-frontend.vercel.app/ (Vercel preview, praat tegen gedeelde CMS)
Uitvoerder: AI-agent met browsertoegang. Niets gerepareerd; afwijkingen genoteerd.

> Let op: bij openen was al een bestaande sessie **"E2E"** ingelogd. Verse registraties (flow A) via aparte accounts.

---

## Voortgang per stap

### Flow H — Basiscontrole van de site
| # | Uitkomst | Waarneming |
|---|----------|------------|
| H1 | ✅ | Header bevat **15 channels + "All"** (draaiboek noemt "de elf" — verouderd). Set: Biophilic & Human-Centred, Bio-based & Living Materials, Circular, Acoustic, Smart & Responsive, Material Futures, New Making, Lightweight, Sustainable, Energy & Resilience, Translucency, Leisure & Hospitality, Timber, Net Zero & Carbon, Regenerative. Gecontroleerde channels (8/15, incl. alle ampersand-slugs) laden allemaal echte content; geen kale 404. |
| H2 | ✅ | Homepage laadt volledig; featured story, top stories met afbeeldingen, geen lege blokken |
| H3 | ✅ | Header-zoekveld → `/search/?q=wood`, 181 resultaten, breakdown "7 materials · 15 stories · 2 events" |
| H4 | ✅ | Onbestaande term → nette "No results found" met CTA's Browse materials/stories; geen fout, geen 404 |
| H5 | ✅ | `cork` = 155 resultaten, "Page 1 of 7"; page 2 toont verse resultaten (11 materials · 7 stories · 3 brands · 1 talk). Geen valse "No results" |
| H6 | ✅ | Onbestaande URL → sitebrede branded 404 ("This page has moved or no longer exists"), CTA's Browse materials/Read stories, verwijst naar feedbackknop. Geen kale Next.js-default |
| H7 | ⚠️ Niet-verifieerbaar | `resize_window` naar 390px meldde succes, maar screenshots bleven op 1568px renderen (viewport verandert niet mee). Telefoonformaat kon met deze tooling niet betrouwbaar worden getest → handmatig checken op echt toestel |
| H8 | ⚠️ Observatie | Geen cookie-/consentmelding verschenen bij alle paginaloads. Sessie was al ingelogd (cookies eerder geaccepteerd). Verse/incognito-sessie nodig om te verifiëren; tool kan cookies niet wissen |
| H9 | ✅ | `/faq/` (accordion-FAQ) en `/about/` laden, geen 404 |
| H10 | ✅ | `/material/` (3.244 materialen), Wood-filter → `?material_category=wood`, teller 334; op page 2 blijft filter actief ("Filters: 1") met kloppende houtmaterialen |

**Bevindingen Flow H (klein/cosmetisch):**
- Breadcrumb op zoekpagina toont dubbel "Home / Home / Search".
- `/about/` page-title bevat dubbel "MaterialDistrict" ("About MaterialDistrict - MaterialDistrict | MaterialDistrict").
- Channelpagina's flitsen vóór hydration kort een lege staat + accountmenu toont "Login" i.p.v. de ingelogde naam (laad-artefact).
- In de materiaal-typefilter staan **Composites (0)** en **Leather (0)** op nul — grijs/leeg. Relevant voor E2 (types Composites/Leather).

### Flow G — Openbare API (tegen cms.materialdistrict.com)
| # | Uitkomst | Waarneming |
|---|----------|------------|
| G1 | ✅ | `/wp/v2/brand?per_page=5`: geen e-mailadressen, geen Stripe-identificatie. Socials null, alleen website/land/membership-tier/city zichtbaar |
| G2 | ✅ | `/wp/v2/talk`: meta bevat `"vimeo_id":null` terwijl `has_video:true` + `insider_only:true`. Video-ID wordt **bewust niet** gelekt (veld aanwezig maar null). Gecontroleerd op sample van 3 |
| G3 | ✅ | `/wp/v2/lead` → `{"code":"rest_no_route",...,"status":404}`. Route niet beschikbaar, correct |
| G4 | ✅ | `/wp/v2/users` → `{"code":"rest_forbidden","message":"Authentication required to access users.","status":401}`. Geen e-mails, geen gebruikersnamen |
| G5 | ✅ | `/md/v2/search?q=wood&page=1` → `total:182, total_pages:8`, 24 items. Geen PII/video-ID |
| G6 | ✅ | `page=2` → verse resultaten, `total:182` behouden. Geen valse `total:0` |

**Bevindingen Flow G:**
- Aandacht: `/wp/v2/brand` exposeert per merk interne velden (`verification_status`, `record_status`, `downloads` met brochure-URL's, `video_url`). Voor E2E Partner Brand is `downloads_insiders_only:true`, maar de brochure-media-URL staat wél letterlijk in de publieke respons → insider-only download direct benaderbaar via die URL. Verifiëren of dat de bedoeling is.
- In `/wp/v2/brand` staan al **ZZTEST-/E2E-testbrands** in de live database (zie opruimen).

### Flow C — Insider worden (betaling)
> Uitgevoerd met bestaande **E2E-sessie** (E2E Personal = gratis/niet-Insider account). Stripe bevestigd testmode (`cs_test_` + "Sandbox"-badge). Kaartbetaling zelf voer ik niet uit (veiligheidsgrens).
| # | Uitkomst | Waarneming |
|---|----------|------------|
| C1 | ✅ | Insider-pagina toont voordelen + prijzen: Annual €100/jaar, Monthly €10/maand (excl. VAT) |
| C2 | ✅ | Checkout = Stripe **Sandbox** (`cs_test_...`). "Abonneren op MD Insider € 100,00 per jaar", product "MD Insider — reader tier". Betaalmethoden: **Kaart** (Visa/MC/Amex) én **iDEAL \| Wero**. Bedrag klopt |
| C3 | ⏸️ Door jou | Betaling met testkaart afronden — kaartinvoer doe ik niet |
| C4 | ⏸️ Door jou | Insider-status/ring controleren na betaling |
| C5 | ⏸️ Door jou | Bevestigingsmail controleren |
| C6 | ✅ | Checkout afgebroken → terug op `/membership/?checkout=cancel` met "Checkout was cancelled. No charge was made." E2E blijft gratis; geen half-account met Insider-rechten |
| C7 | ⏸️ Door jou | Weigerende testkaart — kaartinvoer doe ik niet |

### Flow F — Rechten en afscherming (gedeeltelijk; kernchecks)
| # | Uitkomst | Waarneming |
|---|----------|------------|
| F1 | ⏸️ Deels | Andermans brand openen in dashboard-UI vereist 2e account (kan ik niet aanmaken). Isolatie wél aangetoond via F2 |
| F2 | ✅ | Directe URL `/dashboard/brands/beleaf/` (merk dat E2E niet bezit) → 404 "This page has moved…". Geen toegang tot andermans branddashboard |
| F3 | ⏸️ Door jou | Materiaal aanmaken onder andermans brand vereist 2e account. Isolatie geïndiceerd door F2 |
| F4 | ⏸️ Uitgelogd-pass | Talk als uitgelogde bezoeker (zie logged-out sectie hieronder / door jou) |
| F5 | ✅ | Insider-only talk als **gratis** E2E-gebruiker: video niet speelbaar. Poster met play-knop is statisch (klik start niets, geen video/embed-verzoek); direct eronder "INSIDER ONLY — Watch this talk / Become an Insider" |
| F6 | ✅ | **Kern:** paginabron bevat geen `<iframe>`/`<video>`, geen 9–10-cijferig getal. Enige "vimeo" = RSC-payload `{"talkId":137838,"vimeoId":null,...}` → video-ID is **null** voor gratis gebruiker. Betaalmuur niet te omzeilen |
| F7 | ✅ | Insider insights als gratis gebruiker → "INSIDER ONLY — All reports included with Insider / Become an Insider". Rapport "Testreport" gegate |
| F8 | ✅ | Download-endpoint `/api/dashboard/insider-insights/137198/download` → redirect → `404 {"code":"md_dashboard_not_found","message":"This report PDF is not available."}`. Gratis gebruiker krijgt PDF niet |
| F9 | ✅ | Insider-checkout met `?amount=1&price=1&discount=99` → Stripe toont onverkort **€ 10,00** (serverprijs maandtier). Korting/prijs niet client-side te forceren |
| F10 | ⏸️ | Brandmembership-checkout param-manipulatie — bij Flow I |
| F11 | ⏸️ Door jou | Insider-talk afspelen vereist Insider-account; E2E is gratis. Niet te testen zonder Insider-login |

**Bevinding Flow F (klein/UX):** de groene "Download PDF"-knop bij Insider insights wordt **actief** getoond aan een niet-Insider, maar levert een 404 i.p.v. een nette upgrade-prompt. Cosmetisch/verwarrend, geen securitylek (PDF wordt niet geserveerd).

### Flow B — Volgen en digest-voorkeur (via E2E-sessie)
| # | Uitkomst | Waarneming |
|---|----------|------------|
| B1 | ✅ | Channel (Acoustic) volgen → knop wordt "Following" (groen), blijft na verversen. Popover "What do you want to follow?" met Materials/Stories/Talks aangevinkt, Books/Events/Brands uit |
| B2 | ✅ | Ontvolgen vraagt bevestiging: "Unfollow Acoustic? You'll stop getting updates from it." → Cancel/Unfollow. Na Unfollow terug naar "Follow" |
| B3 | ⏸️ Uitgelogd | Account-catch bij volgen uitgelogd — zie logged-out sectie / door jou |
| B4 | ⏸️ Door jou | Login via catch (wachtwoord) |
| B5 | ⏸️ Door jou | Register via catch (wachtwoord) |
| B6 | ✅ | Digest-voorkeur zichtbaar: exacte tekst **"Updates: Weekly"** (default). Opties: Daily / Weekly / Monthly / No digest |
| B7 | ⚠️ Deels | Frequentie-control werkt: weekly → **daily** gezet (change-event gevuurd). Volledige persistentie na reload kon ik niet los herbevestigen — de config-popover sluit direct en is via de UI/bel niet te heropenen (tooling-beperking) |
| B8 | ⏸️ Uitgelogd | Detailpagina-catch — zie logged-out sectie / door jou |

> Opruimen: E2E volgt nu channel **Acoustic** (op Daily) — terugdraaien indien ongewenst.

### Flow D — Brandaanvraag, goedkeuring en profiel
| # | Uitkomst | Waarneming |
|---|----------|------------|
| D1 | ✅ | ZZTEST-brandaanvraag ingediend via `/dashboard/brands/new/` (naam `ZZTEST-20260731-brand-e2e-req1`, contact `zztest+20260731-req1@vanderwijk.nl`). Bevestiging: "Thanks — your request has been sent. We'll review it and get back to you." Verschijnt in WP-wachtrij (**opruimen**) |
| D2 | ⏸️ Door jou | Goedkeuren in WordPress (admin-login) |
| D3 | ⏸️ Door jou | Goedkeuringsmail + link controleren |
| D4 | ⏸️ Door jou | Beheerbaarheid na goedkeuring |
| D5 | ⏸️ Deels | Brandprofiel-form (E2E Partner Brand) bevat alle velden (naam, omschrijving, logo, website, e-mail, telefoon, land, adres, sectoren, socials, media, downloads, keywords, channel-koppeling). Niet opgeslagen om het gedeelde testbrand niet te wijzigen |
| D6 | ⚠️ Afwijking | Logo-veld vermeldt **"max 2 MB"** (draaiboek verwacht 5 MB-test). Upload-limiettest niet uitgevoerd |
| D7 | ⏸️ | Website-validatie niet los uitgevoerd (form-refs lastig; gedeprioriteerd) |
| D8 | ⏸️ Door jou | Afwijzen met reden (WP-admin) |
| D9 | ⏸️ Door jou | Gmail-claim vereist Gmail-account (registratie) |
| D10 | ⏸️ | Openbare brandpagina — zie hieronder |

**Bevinding Flow D (aandacht):** de **Channel coupling** in het brandprofiel gebruikt de **oude** channel-taxonomie (Biobased, Concept, Curious, Ecology, Healing Environment, High-tech, Innovation, Manufacture, Process, Recycling, Sense & Sensibility, Smart Materials, Technology Transfer, Trend) — die niet overeenkomt met de 15 nieuwe header-channels. Twee taxonomieën naast elkaar. Relevant voor E3.

### Flow E — Materiaal publiceren (via E2E Partner Brand, Partner-tier)
| # | Uitkomst | Waarneming |
|---|----------|------------|
| E1 | ✅ | Materiaal-aanmaakformulier opent (`…/materials/new/`). "0 published · unlimited" (Partner = ongelimiteerd) |
| E2 | ✅ | **11 materiaaltypes**: (Bio)Plastics, Bio-based (excl. Wood), Ceramics, Coatings, **Composites**, Concrete, Glass, **Leather**, Metals, Natural Stones, Wood. Composites én Leather aanwezig |
| E3 | ✅/⚠️ | Partner: channels kiesbaar (max 3). Sustainable, Lightweight, Translucency én Leisure & Hospitality worden aangeboden — maar via **oude taxonomie** (20 opties: o.a. Biobased, Concept, Curious, Ecology, Healing Environment, High-tech, Manufacture, Process, Recycling, Sense & Sensibility, Smart Materials, Technology Transfer, Trend). Zelfde mismatch als Flow D |
| E4 | ✅ | Eigenschappen bevatten expliciete optie **"Not specified"** (bv. Fire/UV resistance, Energy saving, Climate neutral, Biobased/Recycled/Upcycled content) — label is "Not specified", niet "Unknown" |
| E5 | ⏸️ Door jou | PNG als featured image: vereist uploadbaar bestand (kan ik niet leveren aan de browser) |
| E6 | ⚠️ Inconsistentie | Featured image belooft alleen **JPEG/PNG/WebP** (geen SVG). Brand-logo stond SVG wél toe → UI-inconsistentie tussen logo (SVG ok) en materiaal-featured image (geen SVG) |
| E7 | ⏸️ Door jou | Publiceren binnen quotum: vereist volledig materiaal mét afbeelding. Partner = "unlimited" (geen quotumgating). Live-vs-goedkeuring-gedrag niet vast te stellen zonder afgeronde publicatie |
| E8 | ⏸️ Door jou | Openbare materiaalpagina — na publicatie |
| E9 | ✅ | Publiceren met lege verplichte velden → validatie "This field is required." + materiaaltype/applicaties verplicht. Geen materiaal aangemaakt (URL blijft `/new/`) |
| E10 | ⏸️ | Quotum-overschrijding: Partner is ongelimiteerd; vereist Free-brand om quotumblokkade te testen |

### Flow I — Brandmembership (betaling)
> E2E Partner Brand is al **Partner** (hoogste tier); upgrade-checkout niet startbaar. Volledige I2–I7 + F10 vereisen een Free/lager-tier goedgekeurd brand.
| # | Uitkomst | Waarneming |
|---|----------|------------|
| I1 | ✅ | "Compare plans" toont alle tiers met jaarprijzen: **Free** (pay-per-material €250), **Basis €750/jr** (5 materialen + statistics), **Plus €1.500/jr** (15 materialen + keywords, PDF/EPD, geo-lead-routing), **Partner €3.000/jr** (CURRENT, unlimited + featured + events). "Upgrade securely via Stripe Checkout" |
| I2–I7 | ⏸️ Door jou | Upgrade-checkout/annuleren/kaart/webhook-brandisolatie: niet startbaar vanaf top-tier; vereist Free/lager brand |
| F10 | ⏸️ Door jou | Brandmembership-checkout param-manipulatie: idem, geen checkout te starten vanaf Partner |

### Flow K — Contact, samples, gated acties
| # | Uitkomst | Waarneming |
|---|----------|------------|
| K1 | ⏸️ Uitgelogd | "Get in touch" uitgelogd — zie logged-out sectie / door jou |
| K2 | ✅ | Ingelogde gratis gebruiker: "Get in touch" opent lead-modal "Select what you'd like to receive from Frans Gommans BV" met opties **Call me back / Send me a catalogue / Find a rep / Send me a sample / I have a different question** + bericht. Niet verzonden (echte lead) |
| K3 | ✅ | Sample-optie ("Send me a sample — Physical sample to my address") aanwezig voor ingelogde gebruiker binnen dezelfde lead-modal. Niet verzonden |
| K4 | ✅ | **Compare** gate't gratis gebruiker naar een INSIDER-ONLY modal ("Compare materials side by side … Become an Insider — €10/month"). Save/Share/Add to board zichtbaar; Boards/Sample requests staan ook als Insider-feature vermeld. Uitgelogde gating → logged-out sectie |

### Flow J — Soft-launch instrumentatie (404 + meldknop)
| # | Uitkomst | Waarneming |
|---|----------|------------|
| J1 | ✅ (deels) | Sitebrede 404 aanwezig (zie H6); vaste meldknop **"Something broken?"** rechtsonder op alle pagina's incl. de 404. Zichtbaarheid **uitgelogd** → logged-out sectie |
| J2 | ⏸️ Door jou | Meldknop opent widget "Report a problem — What went wrong on this page? We include the page address automatically" + Send. Versturen = mail naar `webmaster@` namens jou → doe ik niet (jouw toestemming/handeling) |
| J3 | ⏸️ Door jou | Rate limit (5+ meldingen) — vereist daadwerkelijk versturen |
| J4 | ⏸️ | Analytics-event `page_not_found` niet verifieerbaar via deze tooling |

### Flow A — Registratie en inloggen
> Account aanmaken en wachtwoord-login/-reset voer ik niet zelf uit (veiligheidsgrens, ook met toestemming). Register-form waargenomen: account-type-toggle **Discover materials (specifier) / List your materials (manufacturer)**, social login **Google/LinkedIn**, wachtwoord **min. 10 tekens**, T&C-checkbox verplicht.
| # | Uitkomst | Waarneming |
|---|----------|------------|
| A1 | ⏸️ Door jou | Registratie specifier (account aanmaken + wachtwoord) |
| A2 | ⏸️ Door jou | Welkomst-/verificatiemail |
| A3 | ⏸️ Door jou | Verificatielink |
| A4 | ⏸️ Door jou | Uit-/inloggen (wachtwoord). Login-routing wél geverifieerd: `next`-URL wordt correct meegegeven (zie B4) |
| A5 | ⏸️ Door jou | Wachtwoordreset (Forgot password-link aanwezig op /sign-in/) |
| A6 | ⏸️ Door jou | Dubbel adres (registratie) |
| A7 | ✅ | Ongeldig adres `geen-apenstaartje` → validatie blokkeert vóór verzending met klopsprekende melding: *"Gebruik een '@' in het e-mailadres. In 'geen-apenstaartje' ontbreekt een '@'."* Geen generieke "required", geen account aangemaakt |
| A8 | ⏸️ Door jou | Social login annuleren (auth-flow) |

### Flow L — Registratie als fabrikant
| # | Uitkomst | Waarneming |
|---|----------|------------|
| L1 | ⏸️ Door jou | Manufacturer-registratie (account aanmaken) — register-form heeft "List your materials"-optie |
| L2 | ⏸️ Door jou | Welkomst-/bevestigingsmail |
| L3 | ✅ | `/become-a-partner/` toont tiers: Free €0 (pay-per-material €250), Basic €750/jr (5), Plus €1.500/jr (15, "Most popular"), Partner €3.000/jr (unlimited). CTA's "Start free"/"Choose …" leiden naar register/checkout — **geen** dode "Talk to us" (die staat alleen bij "tailored plan"). Prijzen consistent met brand-membership (I1) |

### Logged-out ronde — bevestigd
Na uitloggen (E2E → "Login") uitgevoerd:
- **J1 ✅** — meldknop "Something broken?" ook **uitgelogd** zichtbaar (homepage, talk, material, 404).
- **F4 ✅** — talk als uitgelogde bezoeker: video niet speelbaar, geen `<iframe>`/`<video>`, geen 9–10-cijferig ID, alleen `vimeoId:null` in de bron.
- **B3 / B8 ✅** — uitgelogd een channel volgen → account-catch popover "Create a free account to follow … [Create account] / Already have one? Log in". Geen stille mislukking; ook op detailpagina (talk).
- **B4 ✅** — "Log in" vanuit de catch → `/sign-in/?next=%2Ftalk%2F…%2F`. `next`-URL correct naar de bronpagina.
- **K1 ✅** — "Get in touch" uitgelogd = link **"Sign in to get in touch"** → `/sign-in?next=%2Fmaterial%2F…`. Brandcontact ("Sign in to view full brand details") ook gegate.
- **K4 ✅** — Compare uitgelogd → `/sign-in/?next=%2Fmaterial%2F…` (login-gate met return-URL, geen stille no-op).

---

## Samenvatting

**Uitgevoerd en geslaagd (kern):** de beveiliging houdt — talk-video's (`vimeoId:null`, geen embed), Insider-artikelen/-downloads en Compare zijn niet te omzeilen voor gratis/uitgelogde gebruikers; prijzen zijn niet client-side te manipuleren (serverprijs wint); brand-isolatie via directe URL geweigerd; publieke API lekt geen e-mails, Stripe-ID's of video-ID's, en `lead`/`users` zijn afgeschermd (404/401). Site-basics (channels, zoeken, paginering, 404, statische pagina's, filters), volgen/digest, Insider-checkout (Sandbox, correcte bedragen/methoden), brandaanvraag indienen, materiaal-formulier (11 types incl. Composites & Leather, validatie) en de tier-/prijspagina's werken.

**Afwijkingen — op ernst:**

_Blokkerend:_ geen gevonden in het geteste deel.

_Ernstig:_ geen gevonden in het geteste deel.

_Klein / cosmetisch / aandacht:_
1. **Channel-taxonomie mismatch** — brand- én materiaal-**channel coupling** gebruiken de oude taxonomie (Biobased, Concept, Curious, Ecology, Healing Environment, High-tech, Innovation, Manufacture, Process, Recycling, Sense & Sensibility, Smart Materials, Technology Transfer, Trend), terwijl de site 15 nieuwe header-channels toont. Twee taxonomieën naast elkaar. (D/E)
2. **"Download PDF"-knop actief voor niet-Insider** bij Insider insights, maar levert 404 i.p.v. upgrade-prompt. Geen securitylek. (F8)
3. **Logo-limiet "max 2 MB"** in brandprofiel (draaiboek D6 verwacht 5 MB-test).
4. **SVG-inconsistentie** — brand-logo accepteert SVG, materiaal-featured-image belooft alleen JPEG/PNG/WebP. (E6)
5. **Pre-hydration flikkering** — channel-/detailpagina's tonen kort een lege staat en accountmenu "Login" vóór hydration. (H1/B)
6. **Dubbele breadcrumb** "Home / Home / Search" op zoekpagina. (H3)
7. **Dubbele titel** "About MaterialDistrict - MaterialDistrict | MaterialDistrict". (H9)
8. **Insider-only download-URL in publieke brand-API** — brochure-media-URL (`downloads_insiders_only:true`) staat letterlijk in `/wp/v2/brand`; verifiëren of die direct benaderbaar hoort te zijn. (G1)
9. **Mobiel formaat (H7)** niet betrouwbaar te testen via deze tooling (viewport rendert op desktopbreedte) — handmatig checken.

**Niet uitgevoerd (door jou — veiligheidsgrens of afhankelijkheid):**
- Account aanmaken + wachtwoord-login/-reset (A1–A6, A8, B4/B5-inloggen, L1–L2).
- Kaartbetalingen in Stripe Sandbox (C3–C5, C7, I2–I7 afronden). Stripe stáát in testmode (bevestigd).
- WordPress-admin: brandaanvraag goedkeuren/afwijzen + mails (D2–D4, D8).
- Flow D6 (logo >limiet upload), D7 (website-validatie), D9 (Gmail-claim), E5/E7/E8/E10 (materiaal mét afbeelding publiceren + quotum), F1/F3/F11 (2e account / Insider-account), F10 (brand-checkout params vanaf lager tier).
- J2/J3 (feedbackmelding versturen + rate limit — verstuurt mail namens jou).

## Opruimen (achtergebleven ZZTEST-/testdata)
- **Brandaanvraag** `ZZTEST-20260731-brand-e2e-req1` (contact `zztest+20260731-req1@vanderwijk.nl`) — staat in de WP **Brand requests**-wachtrij.
- **Reeds aanwezige testdata** in live DB (van eerdere runs, gezien via API): brands `ZZTEST-20260731-brand-e2e-05`, `E2E Insider Brand`, `E2E Partner Brand`, account `E2E Personal` (`e2e-dashboard-partner@materialdistrict.com`).
- **E2E volgt channel Acoustic** (digest op Daily) — indien ongewenst, ontvolgen.
- Geen materialen/abonnementen aangemaakt door deze run (materiaal niet gepubliceerd; geen betaling gedaan).
