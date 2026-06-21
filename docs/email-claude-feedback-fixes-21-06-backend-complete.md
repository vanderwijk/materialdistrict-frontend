Onderwerp: Drie backend-punten uit feedback 21-06 — afgerond

Hoi Claude,

Update op je zip `md-feedback-fixes-21-06.zip`: die staat al op frontend **main** (`08a24f8`, basis `da82d5c`). Alle 25 bestanden, build groen, geen merge-fixes.

Daarna heb ik jouw drie open plugin-punten opgepakt. Hieronder per punt wat er aan de hand was, wat er nu live staat, en wat jij nog hoeft te weten voor rooktest/verwachtingen.

---

## 1. Get tickets — `external_website` op event-LIST

**Jouw vraag:** homepage-mapper leest `external_website` al, maar alleen het detail-endpoint levert dat veld — expose het ook op `GET /wp/v2/event` (list).

**Bevinding:** geen plugin-wijziging nodig. `meta.external_website` wordt al gezet via `md_extend_event_rest_meta` op **`rest_prepare_event`** — dat draait op zowel single als collection (list). Rooktest prod:

```http
GET /wp-json/wp/v2/event?per_page=1&_fields=id,slug,meta
→ meta.external_website: "https://utrecht.materialdistrict.com/"
```

Je frontend-kant was dus al klaar (`mapEventListItem` → `externalWebsite`). Als de knop ergens nog ontbreekt: check Vercel-cache/revalidate of het featured event zelf geen URL heeft — niet een ontbrekend list-endpoint.

**Plugin:** alleen docblock-verduidelijking in `rest-post-meta.php` (geen functionele diff).

---

## 2. Follow-scope — `types: ['material','story','talk']` bewaren/honoreren

**Jouw vraag:** generiek follow-blok stuurt scoped types mee; follow-record moet dat bewaren/honoreren zodat book/event/brand niet ongevraagd meekomen.

**Frontend (was al klaar):**

- `FollowDigestBlock` → `followEntity({ …, types: DEFAULT_FOLLOW_TYPES })`
- `DEFAULT_FOLLOW_TYPES = ['material','story','talk']` in `useFollow.tsx`
- Proxy `/api/follows` mapt camelCase ↔ snake_case correct

**Plugin (`master`, commit `8e5ecff`):**

| Onderdeel | Gedrag |
|-----------|--------|
| **POST `/md/v2/follows`** | `types` verplicht; bij weglaten → default `material/story/talk` |
| **GET `/md/v2/follows`** | Lege/legacy records → defaults; opgeslagen types gesaneerd |
| **POST-response** | Bevat nu `{ follow: { entity_type, entity_id, types } }` |
| **Digest-helpers** | `md_follows_includes_post_type()`, `md_follows_includes_content_type()`, post-type mapping (`story`→`article`, `book`→`insider_report`, …) — klaar voor wanneer digest-mail gebouwd wordt |

Opslag in `wp_md_follows.types` (JSON) werkte al; dit commit maakt defaults, normalisatie en toekomstige digest-filtering expliciet en consistent.

---

## 3. Compare-velden — environmental (10) + content composition (3)

**Jouw vraag:** `/compare` toont sensorial/technical volledig; environmental + content wachten op WP-data.

**Diagnose:**

- Compare/detail lezen properties via `class_list` → `parseMaterialProperties()` (24 facets).
- Sensorial/technical stonden op veel materials (taxonomy-termen → `{facet}-{slug}` in `class_list`).
- Environmental/content ontbraken vrijwel overal op prod: **taxonomy-termen nog niet ingevuld** (0/100 recente materials met bv. `energy_saving-*` of `biobased_content-*`).
- Legacy content-slugs (`25-percent`) matchen niet met UI-range-slugs (`1-25-percent`).

**Plugin (`master`, commit `3bc4737`):**

- **`meta.properties`** — object met alle 24 facet-keys; waarde = canonieke slug of `""`
- **`class_list`** — property-classes opnieuw opgebouwd uit taxonomieën; legacy percentage-buckets → range-slugs via bestaande `md_dashboard_content_composition_slug_for_dashboard()`
- **`md_material_property_taxonomies()`** — gedeelde lijst (dashboard form + REST)

**Frontend (`main`, commit `f813c26`):**

- **`mergeMaterialProperties(classList, meta.properties)`** in `material-properties.ts`
- `mapMaterialListItem` + `mapMaterial` gebruiken merge: niet-lege `meta.properties` wint over `class_list`

**Verwachting:** zodra environmental/content **in WP gezet** worden (dashboard material form of theme edit-materials), vullen compare + detail die rijen — met juiste labels (`1–25%` i.p.v. oude buckets). Tot die termen gezet zijn blijft UI “Not specified” (correct).

---

## Commits (referentie)

| Repo | Commit | Onderwerp |
|------|--------|-----------|
| frontend | `08a24f8` | md-feedback-fixes-21-06.zip |
| frontend | `f813c26` | mergeMaterialProperties voor compare |
| plugin | `8e5ecff` | follow-scope defaults + digest-helpers |
| plugin | `3bc4737` | meta.properties + class_list normalisatie |

Plugin deploy loopt via GitHub Action op push naar `master` (geen handmatige WPE-stap).

---

## Rooktest (jouw kant, optioneel)

- [ ] Homepage: Get tickets-link op featured event (externe URL)
- [ ] Follow-blok generiek: follow → check GET `/api/follows` → `types` = `material/story/talk` (geen book/event/brand)
- [ ] `/compare?ids=…`: sensorial/technical zoals voorheen; environmental/content zodra testmaterial taxonomie-termen heeft
- [ ] Material detail: zelfde property-groepen als compare (dezelfde mapper)

---

## Nog open (bewust niet gedaan)

- **Bulk editorial:** environmental/content vullen op bestaande materials — redactioneel, geen code-blokkade meer.
- **WP-CLI audit:** kan ik nog toevoegen (`wp md-material audit-properties`) als je een vulgraad-rapport wilt; niet nodig voor de pipeline zelf.

Groet,  
Johan
