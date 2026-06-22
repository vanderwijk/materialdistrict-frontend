Onderwerp: Backend op cms.materialdistrict.com + FacetWP uitgefaseerd

Hoi Claude,

Korte infrastructuur-update — **geen actie nodig aan jouw kant** voor bestaande frontend-code. Dit is ter context; oudere mails/docs die nog naar `materialdistrict.com/wp-json` of FacetWP verwijzen zijn achterhaald.

---

## Nieuwe backend-URL

WordPress draait nu op een **dedicated CMS-subdomein**:

| Wat | URL |
|-----|-----|
| **WP REST + `/md/v2/`** | `https://cms.materialdistrict.com/wp-json` |
| **wp-admin / dashboard** | `https://cms.materialdistrict.com/wp-admin` |
| **Media/uploads** | `https://cms.materialdistrict.com/wp-content/...` |
| **Publieke site (Next.js)** | `https://materialdistrict.com` (Vercel, ongewijzigd) |

`WP_API_URL` in `.env.local` / Vercel wijst naar cms. Publieke canonicals en OG-tags blijven op `materialdistrict.com`.

---

## FacetWP is uitgefaseerd

De **FacetWP-plugin** staat uit op cms (bewust, voor performance en minder plugin-last).

**Vervanging voor `/material`:**

| Was | Nu |
|-----|-----|
| `POST /facetwp/v1/fetch` | `POST /md/v2/materials/facet-query` |
| FacetWP-index + `facetwp-theme-facet.php` | Native WP taxonomy-queries in `rest-material-facets.php` |
| Labels uit `facetwp_facets` option | Statisch contract via `GET /md/v2/material-facets` |

**Frontend:** `src/lib/api/facetwp.ts` roept al de **nieuwe** endpoint aan (zelfde request/response-shape als voorheen). `listMaterialsWithFacets()`, filter-sidebar, channel-bar (`?channel=` → `theme` slug), zoeken en sortering werken ongewijzigd — geen zip of mapper-aanpassingen van jou nodig.

**Commits (al live):**

| Repo | Commit |
|------|--------|
| plugin `master` | `1c11e05` |
| frontend `main` | `97d7c29` |

**Rooktest cms (na deploy):** baseline 3244 materials; `renewable=yes` 1240; `theme=biobased` 714; sort + zoek OK.

---

## Wat jij wél moet weten (geen code-werk)

1. **Geen nieuwe FacetWP-facets** — blijft afgesloten. Nieuwe filters → REST of `/md/v2/`-endpoints (patroon: `rest-brand-facets.php`).
2. **Oude documentatie** — `facetwp-phase-out-policy.md`, `note-go-live-facetwp-uitfaseren.md` en mails over FacetWP op `/material` zijn **historisch**. Eindstaat is bereikt voor de headless stack.
3. **Bestandsnaam `facetwp.ts`** — legacy naam; inhoud praat met `/md/v2/materials/facet-query`. Hernoemen is optioneel, geen functionele impact.
4. **Legacy WP-theme** — `archive-material.php` gebruikte FacetWP shortcodes; dat theme staat niet meer op het publieke pad. Alleen relevant als iemand dat theme ooit weer activeert.

---

## Jouw kant — ongewijzigd

Geen open frontend-taken voor deze migratie. Blijf nieuw werk **FacetWP-vrij** en REST-first doen zoals eerder afgesproken.

Groet,  
Johan
