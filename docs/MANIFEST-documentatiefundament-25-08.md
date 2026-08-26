# MANIFEST — documentatiefundament v1 · 25-08-2026

**Zip:** `materialdistrict-documentatiefundament-v8.zip`
**Vervangt v1 t/m v7** — die zijn niet verspreid; als je ze toch hebt, gooi ze weg.

**Twee handelingen, meer niet.** Johan merget de inhoud van `docs/` en `session-log.md` in de
repo. Jeroen vervangt `START-HIER.md` in de project knowledge door het exemplaar uit deze zip —
dat bestand hoort daar en niet in de repo.
**Geen code.** Alleen markdown in de moedermap-structuur. Niets hoeft gedeployed te worden.

---

## Nieuw

| Pad | Wat |
|---|---|
| `docs/besluitenregister.md` | 57 besluiten met grond, bron en gevolg, in acht domeinen. Nieuw normdocument. |
| `docs/begrippenlijst.md` | Canon + mensentaal-versus-systeemnaam + verboden woorden + negatieve regels. Nieuw normdocument. |
| `docs/mutatieprotocol.md` | Zes poorten voor bulkmutaties, twee-helften-regel, vijf statussen. Nieuw normdocument. |
| `docs/content-taken.md` | Het niet-code werk bij Jeroen, Sigrid en Sjoerd. Vervangt `launch-taken.md` uit de project knowledge; alle statussen gemeten tegen de live API. |
| `docs/importprotocol.md` | v3.0 — samenvoeging van twee onafhankelijk geschreven protocollen. Zestien secties, van bronvalidatie tot terugdraaien op batch-ID. Nieuw normdocument. |

## Gewijzigd — vervangt de bestaande versie

| Pad | Wat |
|---|---|
| `docs/roadmap.md` | Samengevoegd met de divergerende kopie uit de project knowledge, **plus nieuwe §10 (Data, relaties & imports)**. Zie §Status onderaan het bestand. |
| `session-log.md` | Nieuwe sectie `§DOC-25-08` onderaan + kopregel bijgewerkt. |

**Let op:** `docs/roadmap.md` en `session-log.md` zijn **complete bestanden** die de bestaande
versies vervangen — geen patches. De oude versies mogen weg.

---

## Voor Jeroen — project knowledge

| Pad | Wat |
|---|---|
| `START-HIER.md` (zip-root) | Bijgewerkt. **Hoort in de project knowledge, niet in de repo.** Wordt ook los aangeleverd. |

**En: `launch-taken.md` en `roadmap.md` mogen uit de project knowledge.** De eerste is herzien en
heet nu `docs/content-taken.md`; de tweede is de kopie die was uitgelopen en staat samengevoegd in
`docs/`. `START-HIER.md` blijft het enige bestand daar.

Drie wijzigingen: een sectie Normdocumenten die naar de vier nieuwe bestanden wijst en vastlegt
dat er géén tweede kopie in de project knowledge komt; de regel dat nieuwe besluiten in het
register landen ook als ze elders zijn genomen; en een aanscherping op "wat Claude zelf doet" —
een blok tekst om over te nemen is geen levering.

---

## Wat er níét in zit, bewust
- **Geen opschoning van `docs/`.** Er staan ~200 bestanden, waarvan veel eenmalige MANIFESTs,
  `email-claude-*`-bestanden en `session-log-append-*`-fragmenten die al zijn verwerkt. Dat is een
  eigen ronde, langs `mutatieprotocol.md` §3 (nog-niet-gebruikt versus niet-meer-gebruikt), niet
  iets om er stilletjes bij te doen.
- **Geen inhoudelijke herschrijving van `roadmap.md`.** "Atlas" staat er nog, en de
  FacetWP-verwijzing bij "New in your channels" is achterhaald. Samenvoegen en herschrijven zijn
  twee dingen; dit is het eerste.

---

## Dingen die opgelost moeten worden

1. **Regelboek — gedaan 26-08.** Canoniek `docs/materiaal-classificatie-regelboek.md`;
   cms-plugin-kopie weg. Zie B22 HERZIEN. (v2.0 volgt later uit herclassificatie-levering.)
2. **Twee session-logs — gedaan 26-08.** Sessiekopie verwijderd.
3. **De channel-catalogus is niet vastgezet** en zes van de achttien channels dragen tien of minder
   materialen. Launch-taak 1. **Actie: Jeroen + Sigrid** — redactioneel oordeel.
4. **`publication_status` is leeg op alle 3.246 gepubliceerde materialen** terwijl de spec `legacy`
   als default voorschrijft, en `brand.tier` staat op `free` voor alle 2.093 brands. Het veld
   bestaat, de backfill is nooit gedraaid. Gevolg: geen memberlijst, geen legacy-banner, en de
   archivering per 30-04-2027 heeft niets om op te draaien. Zie roadmap §10a. **Actie: Jeroen
   (oordeel) + Johan (uitvoeren)** — dit blokkeert de member-outreach.
5. **`datastrategie-specificatie.docx` staat niet in de moedermap.** De importnorm uit augustus
   staat nu als `importprotocol.md` in `docs/`; het losse docx zou daarna ingetrokken moeten
   worden in plaats van ernaast blijven bestaan.

---

## Schema-uitbreiding bij Johan — vóór de eerste grote import

Drie velden die nu triviaal zijn en achteraf een migratie op gevulde data. Ze volgen uit het
importprotocol; de specificatie komt in een aparte levering, dit is de vooraankondiging.

1. **Herkomst per veld** (provenance: bron-label + ISO-datum) + **batch-log** met batch-ID en
   rij-ID (B41, B48). Zonder dit is de conflictregel niet uitvoerbaar — `last_checked` per record
   zegt alleen wanneer je voor het laatst keek.
2. **Veldvergrendeling** — `locked_by`, `locked_at` (B48). Een bewust gecorrigeerd veld wordt door
   geen import geraakt.
3. **Conceptstatus** voor nieuwe records — `record_status = prospect`, `visible = false` (B47).
   Het veld `record_status` bestaat al op brand maar is leeg; de waardenlijst moet vast.
4. **Deelnamefeiten** met vaste woordenlijst, editie en bron (B44) — `exposant`,
   `standbemanning`, `bezoeker_geregistreerd`, `bezoeker_aanwezig`, `no_show`, `spreker`,
   `boekkoper`, `abonnee`.
5. **Een transactie** om het importscript — alles of niets (B48).

---

## Aan Johan gevraagd

De besluiten B5 t/m B12 en B21 liggen in jouw domein en zijn door mij gereconstrueerd uit je
notities. Nakijken of ik ze goed heb weergegeven is de enige review die ik vraag — de rest van
het register hoeft niet langs jou. Ontbreekt er een besluit, dan is een regel in een mail genoeg;
het nummeren en opschrijven doe ik.

---

## Bron van de besluiten

Gereconstrueerd uit de moedermap-stand van 24-08-2026: `livegang-checklist.md`,
`mailsysteem-spec.md` v7, `note-cms-disk-full-binlog-2026-08-06.md`,
`note-cms-lockdown-theme-2026-08-06.md`, `note-searchwp-indexer-uit-2026-08-06.md`,
`note-books-subdomain-redirect-2026-08-06.md`, `note-draft-brands-decision-2026-08-07.md`,
`note-go-live-facetwp-uitfaseren.md`, `redactie-dashboard-rechten-voorstel.md`,
`fase1-logging-datalaag-plan.md`, `materiaal-classificatie-regelboek.md`, `START-HIER.md` en
beide versies van `roadmap.md`. Aantallen gemeten tegen `cms.materialdistrict.com` op 25-08-2026.

Er staat geen `TE BEVESTIGEN` meer open. B17 is door Jeroen bevestigd: wat geschrapt is, is de
gecureerde channel-editie als redactioneel product — niet de frequentiekeuze van de gebruiker.
Die twee werden door elkaar gehaald en staan nu apart (B17 en B18a).

Opgesteld door Claude, namens Jeroen.
