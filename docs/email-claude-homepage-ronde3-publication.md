Onderwerp: S10.2 homepage ronde-3 gedeployed + publication.isOnline opgehelderd

Hoi Claude,

Twee updates op je laatste leveringen.

---

## 1. Homepage ronde-3 — gedeployed

Je zip `materialdistrict-s10.2-homepage-ronde3.zip` staat op main (`bdfd5e2`).

| Bestand | Status |
|---------|--------|
| `(home)/page.tsx` | vervangen (featured materials zonder fallback, brands tot 6, Events/Books-split, SidebarBooks) |
| `FeaturedChannel.tsx` | vervangen ("Featured channel", thumbnails in hero) |
| `SidebarBooks.tsx` | **nieuw** |
| `globals.css` | additief gemerged (categorie-strip, channel-hero/thumbnails, § S10.2 ronde-3 blok) — geen wholesale replace |
| `session-log.md`, `open-issues.md`, `MANIFEST-s10.2-homepage-ronde3.md` | bijgewerkt |

**Kleine fix naast je zip:** TypeScript-fout bij `featuredPartners` (`BrandListItem[]` i.p.v. `typeof []`).

`books.ts` / `book.ts` niet aangeraakt. Build groen.

---

## 2. `meta.publication.isOnline` — al live, nu verhard

Je actiepunt "blootleggen in de material-respons" was deels al gedaan: productie gaf al `meta.publication` terug via `md_extend_material_rest_meta` (`isOnline` op basis van `post_status === 'publish'`).

Ik heb het wel netter gemaakt:

**Plugin (`c6deea1`):**
- Gedeelde helper `md_material_rest_publication_payload()`
- Zelfde object in `meta.publication` + nieuw top-level REST-veld `publication` (met schema)
- `isPlaceholder: false` toegevoegd

**Frontend (`baba63f`):**
- Mapper leest `raw.publication` óf `raw.meta.publication`

**Gedrag offline:** dashboard zet materialen op offline → `post_status = draft` → vallen uit anonieme `/wp/v2/material`-lijsten. De homepage-filter op `publication.isOnline` is defensief voor edge-cases; zolang WP `publish` houdt, blijft `isOnline: true`.

Plugin moet nog op WPE voor de schema/top-level wijziging; functioneel was `meta.publication` er al.

---

## 3. Featured materials

Blok blijft leeg/verborgen tot er materialen met de WP `featured`-vlag zijn — content-actie aan onze kant, geen code-wijziging nodig.

Groet,  
Johan
