# Brand data 2026-08-04 (Claude → Johan)

Bron: `VoorJohan0408.zip`

## Spoor 1 — bestaande brands (kan meteen)

Volgorde:

1. `brands-terugdraaien-johan.csv` (14) — te-koop-domeinen terugzetten
2. `brands-opschonen-johan.csv` (299) — archiveren / url_bijwerken
3. `brands-contact-johan.csv` (196) — email / website / brand_name

```bash
# Op CMS, vanuit WP root:
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/apply-brand-field-cleanup.php --allow-root -- \
  wp-content/plugins/materialdistrict-plugin/docs/data/2026-08-04/brands-terugdraaien-johan.csv

wp eval-file wp-content/plugins/materialdistrict-plugin/docs/apply-brand-opschonen.php --allow-root -- \
  wp-content/plugins/materialdistrict-plugin/docs/data/2026-08-04/brands-opschonen-johan.csv

wp eval-file wp-content/plugins/materialdistrict-plugin/docs/apply-brand-field-cleanup.php --allow-root -- \
  wp-content/plugins/materialdistrict-plugin/docs/data/2026-08-04/brands-contact-johan.csv

# Na review: zelfde commands + trailing `apply`
```

### Apply CMS (2026-08-04) — gedaan

| Stap | Applied | Notes |
|------|---------|-------|
| 1 terugdraaien | 0 | Al correct (noop) |
| 2 opschonen | 4 | 2 archief + 2 URL |
| 3 contact | 182 | inclusief 2 soft conflicts |

**Opschonen toegepast:**

- `#111631` gabriele-daminaityte → archived/draft
- `#134489` growink → archived/draft
- `#3159` s-lvenstein-bv → `http://lovenstein.nl`
- `#31255` societe-dalsouple → `http://www.dalsouple.fr`

**Contact soft conflicts (toegepast):**

- `#41572` dreamway-technology email gewist
- `#3881` future-shape-gmbh → `sales@future-shape.com`

## Spoor 2 — import (uitgevoerd 2026-08-04)

- `import-md.csv` + `md-import.php` (aligned op `md_account_kind=contact` + `_brand_*` keys)
- Nieuwe meta geregistreerd in `rest-post-meta.php`

```bash
# Dry-run (WP-CLI vangt --dry-run af; gebruik env):
DRY_RUN=1 wp eval-file wp-content/plugins/materialdistrict-plugin/docs/data/2026-08-04/md-import.php --allow-root
# Apply:
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/data/2026-08-04/md-import.php --allow-root
```

### Apply CMS (2026-08-04)

| Type | Count |
|------|-------|
| brand_new | 268 |
| brand_update | 108 |
| person | 848 |
| event | 448 |
| gekoppeld | 508 |
| niet_gekoppeld | 331 |
| overgeslagen | 144 |
| overschreven | 177 |

### Verificatie CMS (na apply)

- Prospect-drafts sinds 2026-08-04: **268** (komt overeen met `brand_new`)
- Contact-users geregistreerd vandaag: **847**
- Users met `md_company_brand_id`: **508**
- Spoor 1 spot-checks OK (archief, URLs, soft-conflict emails)

**Niet gekoppeld (331 person-rijen) — oorzaken:**

| Reden | Count |
|-------|-------|
| geen `company_domain` | 129 |
| domain zonder unieke brand-website | 270 |
| ambigu domain (meerdere brands) | 60 |
| user ontbreekt (CSV multi-email cel) | 1 |
| wél gekoppeld | 508 |

Voorbeelden zonder brand-website-match: `oboros.nl`, `z-studio.nl` (merk bestaat soms wel, maar `_brand_website` leeg). Ambigu o.a. `hestus.nl`, `maiburg.nl`.

### Herkoppel-pass (2026-08-04, toegepast)

Script: `docs/apply-brand-person-relink.php`

| Actie | Count |
|-------|-------|
| Website fills | 2 (Oboros, SOL-R&D) |
| Nieuw gekoppeld | 95 |
| Al gekoppeld | 508 |
| Nog open | 365 |

Restant-export op CMS: `docs/data/2026-08-04/persons-niet-gekoppeld-20260804-141610.csv`

## Spoor 1d — dubbele brands (`brands-dubbel-johan.csv`, 37)

Uit compleet-zip `data-import-johan-compleet.zip` (ontbrak in VoorJohan0408).

```bash
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/apply-brand-dubbel.php --allow-root -- \
  wp-content/plugins/materialdistrict-plugin/docs/data/2026-08-04/brands-dubbel-johan.csv
# apply:
wp eval-file …/apply-brand-dubbel.php --allow-root -- …/brands-dubbel-johan.csv apply
```

### Dry-run CMS (2026-08-04)

| Actie | Rows | Notes |
|-------|------|-------|
| samenvoegen | 25 | materialen omhangen + bron archiveren |
| overname_omhangen | 6 | 4 ontbrekende doelen → prospect aanmaken (Avient, OrbMatter, Marlan, Microban) |
| url_corrigeren | 5 | |
| url_leegmaken | 1 | |
| **Totaal wijzigingen** | **37** | **32 materialen** te verplaatsen |

### Apply CMS (2026-08-04) — gedaan

37 wijzigingen, 0 errors, 32 materialen omgehangen, 4 prospect-doelen aangemaakt.
