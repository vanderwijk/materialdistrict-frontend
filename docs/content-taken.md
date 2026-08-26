# Content- & redactietaken

> **Levend document.** Het niet-code werk dat bij het team ligt: Jeroen, Sigrid en Sjoerd.
> Tegenhanger van `roadmap.md` (product en features) en `session-log.md` (terugblik).
>
> **Herzien 25-08-2026.** De vorige versie heette `launch-taken.md` en dateerde van 19-06-2026: een
> pre-launch lijst met een launchvenster van eind juli en een vakantieplanning eromheen. De site is
> op 1 augustus live gegaan (besluitenregister B1), dus die premisse is verlopen. De taken zelf
> waren dat grotendeels niet — vandaar deze herziening in plaats van een intrekking.
>
> **Alle statussen hieronder zijn gemeten tegen `cms.materialdistrict.com` op 25-08-2026**, niet
> geschat. Waar iets niet meetbaar is, staat dat er expliciet bij.
>
> Woont in `docs/` van de frontend-repo. Norm en besluiten: `besluitenregister.md`,
> `begrippenlijst.md`.

---

## Afgerond sinds 19-06

Deze vijf hoeven niet meer op de lijst.

| # oud | Taak | Bewijs |
|---|---|---|
| 3 | Boekshop actualiseren met Designer Books-content | 71 boeken live; migratie juli 2026 |
| 6 | Materiaalcategorieën herzien | 11 types, inclusief (Bio)Plastics en Composites |
| 17 | Toegankelijkheidsverklaring publiceren | `/accessibility-statement` live, 31-07 |
| 18 | Bannerposities integreren (GAM/GPT) | Sessie bannerintegratie 22-07 |
| 19 | About-pagina updaten | `/about` bijgewerkt 31-07 |

---

## Open — op volgorde van wat andere dingen blokkeert

### 1. Statussen zetten die er al horen te staan · **Jeroen + Johan** · *blokkeert 5, 6, 11*
Twee velden bestaan maar zijn leeg. Dit is geen contenttaak maar hij blokkeert er drie.

- `material.publication_status` is **leeg op alle 3.246 gepubliceerde materialen**, terwijl de
  spec `legacy` als default voorschrijft (besluitenregister B32).
- `brand.tier` staat op **`free` bij alle 2.093 gepubliceerde brands** (B31).

Gevolg: geen memberlijst, geen onderscheid tussen betaald, legacy en standalone, de legacy-banner
kan niet verschijnen en de archivering per 30-04-2027 heeft niets om op te draaien.
*Zie `roadmap.md` §10a. Backfill langs `mutatieprotocol.md`.*

### 2. Channellijst definitief vastzetten · **Jeroen + Sigrid** · *blokkeert 8*
De catalogus telt **18 channels**, niet de 20 die het code-commentaar noemt. Zes daarvan dragen
veertien materialen of minder:

| Channel | Materialen |
|---|---|
| Sense & Sensibility | 0 |
| Recycling | 1 |
| Regenerative | 1 |
| Leisure & Hospitality | 10 |
| Timber | 10 |
| Translucency | 14 |

Tegenover Biophilic & Human-Centred (832) en Bio-based & Living Materials (829). Daarnaast dragen
**987 materialen (30,4%)** helemaal geen channel. Dat was 1.189 (37%) op 11-08; de ronde van 523
toevoegingen heeft dat gat verkleind. Vijf records dragen er méér dan drie (vier met vier, één met
vijf) en overtreden dus de harde limiet.

Alles hangt aan channels: follow, digest, homepage-strips, de boeken-koppeling. Zolang de lijst
niet vaststaat, is content toewijzen dubbel werk.

### 3. Events opschonen en aanvullen · **Sigrid** · *urgent*
170 events, waarvan er **drie op 2026 of later staan**: MaterialDistrict Utrecht 2026 (maart, dus
geweest), **MaterialDistrict Expo: Beyond Plastics op 16-09-2026** en Utrecht 2027 (10-03-2027).

De rest is archief dat teruggaat tot 2013 — 141 van de 170 events dateren van vóór 2020. Het
eigen evenement van september staat er wel, maar de agenda oogt daardoor dood.

Twee dingen: de eigen evenementen fatsoenlijk herschrijven (Beyond Plastics is over drie weken),
en events van derden toevoegen zodat er een levende agenda staat.

### 4. Talks afmaken · **Jeroen + Sjoerd**
**102 talks live** van de 254 in het archief. Wat er per veld staat:

| Veld | Gevuld |
|---|---|
| Sprekers | 102 van 102 ✓ |
| Duur | 32 van 102 |
| Bedrijf gekoppeld | 31 van 102 |
| Vimeo-ID | niet publiek meetbaar — zie hieronder |

Verdeling over de jaren: 2022 → 48 · **2023 → 0** · 2024 → 10 · 2025 → 19 · 2026 → 25. Daarmee is
de oude taak 11 ("waarom staan er per jaar veel minder online") beantwoord: 2023 ontbreekt
volledig en 2024/2025 zijn incompleet. Het archiefwerk heeft die content opgeleverd; publiceren
is wat rest.

**Over Vimeo-ID's: die zijn niet leeg, ze worden gestript.** De publieke API verwijdert
`meta.vimeo_id` bij Insider-only talks; ingelogde members laden hem via
`/api/talks/[id]/embed`. Dat is een bewuste beveiliging, ingebouwd nadat op 06-08-2026 bleek dat
97 Insider-only talks hun Vimeo-ID publiek toonden en de paywall daarmee te omzeilen was
(besluitenregister B51). `has_video` staat op alle 102 op `true`.

Wat er wél openstond, uit de inventarisatie van 28-07: van de toen 92 live talks hadden er **11
geen Vimeo-ID** en 83 geen speelduur. De speelduur is inmiddels 32 van 102 — er is dus beweging.
Of die elf inmiddels gevuld zijn, is alleen achter de login te controleren.

### 5. Member-status en brandprofielen · **Jeroen + Sjoerd** · *na 1*
Brands die lid zijn aanvinken als member; materialen vanaf legacy sorteren naar member of betaalde
materiaalpublicatie (€250/jaar, niet €100 — zie B31/B32). Daarna: brandprofiel en materialen op
orde brengen voor de huidige betaalde members, gekoppeld aan de member-mailing. Sommige members
hebben nog geen profiel of geen materialen; voor die members aanvullen.

Kan niet vóór taak 1 — zonder tier- en publicatiestatus is er geen lijst om op te richten.

### 6. Boeken koppelen aan channels · **Sigrid** · *na 2*
**0 van de 71 boeken draagt een channel.** De boeken staan er, de koppeling niet. Wacht op de
definitieve channellijst.

### 7. Verouderde contentpagina's · **Jeroen** · *nieuw op deze lijst*
Drie pagina's zijn jaren niet aangeraakt en staan wel publiek:

| Pagina | Laatst gewijzigd |
|---|---|
| `/submit-your-materials` | **19-10-2016** |
| `/contact` | **18-07-2018** |
| `/advertise` | 04-05-2023 |

`/submit-your-materials` en `/advertise` zijn commerciële instappagina's; dat ze tien respectievelijk
drie jaar oud zijn, is een gemiste kans richting de septembercampagne.

Privacy statement (05-08), cookie statement en FAQ (beide 31-07) zijn wél actueel — de oude taak 7
is daarmee grotendeels gedaan. Wat rest zijn de algemene voorwaarden, die nog een PDF-link zijn in
plaats van een pagina.

### 8. Named authors · **Jeroen + Sjoerd + Sigrid**
3.335 stories live, allemaal met "Story by MaterialDistrict" in de footer. Echte auteurs met bio en
foto. De footer-UI staat al; wat ontbreekt is de auteur-resolve vanuit de redactie. Niet
retroactief toepassen.

### 9. Sample-beschikbaarheid markeren · **Sigrid** · *geblokkeerd op een veld*
Per materiaal aangeven of we er een sample van in huis hebben. **Dit veld bestaat niet.** Er zijn
wel `disable_sample_request` en `not_available`, maar die zeggen iets anders — namelijk of een
bezoeker een sample mág aanvragen, niet of wij er een hebben liggen.

Vraagt dus eerst een veld bij Johan. Zo lang dat er niet is, kan Sigrid niets invullen.

### 10. Homepage-curatie en quotes · **Jeroen + Sjoerd + Sigrid** · *niet meetbaar*
De drie verzonnen quotes vervangen door echte, en bepalen wat featured partner, featured talk en
featured content wordt. Beide raken dezelfde pagina; samen plannen.

*Niet via de API vast te stellen of dit al is gebeurd — te controleren op de live homepage.*

### 11. Insider insights vullen · **Jeroen + Sjoerd** · *na 1*
**Eén insider report** staat er op dit moment. Te uploaden: de digitale beurscatalogi van de
afgelopen jaren en het boek Material Discovery 01 (bestaat alleen als PDF).

### 12. Site testen en bugs rapporteren · **allen** · *doorlopend*
Loopt. Laatste ronde: de betafeedback van 24-08 (elf UI-punten, de cachekwestie en de soft-404).

---

## Verbanden

- **Taak 1 eerst.** Statussen blokkeren de member-outreach (5), de insights (11) en de
  brandprofielen.
- **Taak 2 daarna.** Channels blokkeren de boeken-koppeling (6) en raken de digest.
- **Taak 3 is tijdgebonden.** Beyond Plastics is op 16-09-2026.
- **Talks: uitzoeken en publiceren lopen nu samen** (de oude 11 is beantwoord door de meting).
- **Beleidspagina's** (7) horen bij elkaar: AV als pagina in plaats van PDF.

---

## Per persoon

**Jeroen:** 1, 2, 5, 7, 8, 10, 11, 12
**Sigrid:** 2, 3, 6, 9, 8, 10, 12
**Sjoerd:** 4, 5, 8, 10, 11, 12
**Johan:** 1 (backfill), 9 (veld toevoegen)

---

## Geparkeerd — apart project, ná de septembercampagne

- **Brandprofielen breed op orde brengen** (álle brands, niet alleen de members). Onderdeel van de
  bredere data-verrijking; zie `roadmap.md` §10 en `importprotocol.md`.

---

## Status

**Herzien 25-08-2026.** De vorige versie (`launch-taken.md`, 19-06-2026) ging uit van een launch
die inmiddels heeft plaatsgevonden; de vakantieplanning en het launchvenster erin zijn verlopen.
Alle negentien taken zijn tegen de live API gecontroleerd in plaats van overgeschreven.

Vijf zijn afgerond en van de lijst gehaald (boekshop, materiaalcategorieën,
toegankelijkheidsverklaring, bannerposities, about-pagina). De oude taak 11 — uitzoeken waarom er
per jaar zoveel talks ontbreken — is door de meting beantwoord en samengevoegd met taak 4: 2023 is
volledig leeg, 2024 en 2025 zijn incompleet.

Twee dingen zijn nieuw en stonden nergens op een lijst: drie zwaar verouderde contentpagina's
(`/submit-your-materials` uit 2016, `/contact` uit 2018, `/advertise` uit 2023), en de constatering
dat sample-beschikbaarheid niet ingevuld kán worden omdat het veld niet bestaat.

De volgorde is omgegooid: de lege statusvelden staan nu bovenaan omdat ze drie andere taken
blokkeren, en de events zijn naar voren gehaald omdat Beyond Plastics op 16-09 valt.

Opgesteld door Claude, namens Jeroen.
