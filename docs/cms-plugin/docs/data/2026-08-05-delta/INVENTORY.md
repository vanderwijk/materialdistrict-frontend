# Inventarisatie & importresultaat — 2026-08-05

**Cutoff:** `2026-06-22 12:10:39`  
**Export source:** materialdistrict.com (WP Engine)  
**Exported at:** `2026-08-05T11:10:43+00:00` (manifest)

## WPE export counts

| Object | Count |
|--------|------:|
| users (registered ≥ cutoff) | 276 |
| users keep (na filter) | 132 |
| users reject | 141 |
| users review (niet geïmporteerd) | 3 |
| brand (nieuw) | 2 |
| material (nieuw) | 0 |
| article | 71 |
| event | 1 |
| talk | 9 |
| attachments (in export) | 606 |
| files in manifest | 603 |
| modified_old (pre-cutoff, edited ≥ cutoff) | 107 |

## Users filter

- Automatisch keep: bedrijfs-/edu-domeinen of free-mail met login/order/brand/authored content.
- Reject: wegwerpdomeinen, bot-TLD’s, nooit-actieve accounts zonder signalen.
- Review CSV: 3 rijen (`vexaluno.xyz` / `b-styles.xyz`) — **niet** geïmporteerd.

Bestanden: `users-keep.jsonl`, `users-reject.jsonl`, `users-review.csv`.

## Media

| Check | Resultaat |
|-------|-----------|
| Files op CMS disk vs manifest | 603/603 present |
| CDN sample HEAD | 200 (media.materialdistrict.com) |
| Attachment import | 606 matched (geen missing_file) |
| Featured images steekproef articles | 71/71 met thumbnail |

## CMS na apply

| CPT (≥ cutoff, niet trash) | Count |
|----------------------------|------:|
| article | 71 |
| brand | 12 (2 geïmporteerd + CMS-only) |
| event | 1 |
| talk | 9 |
| material | 2 (CMS-only; WPE had 0 nieuw) |
| attachment | ~1011 (≥ cutoff; inclusief bestaande) |

ID-map: `import-id-map.json` (users 132, attachments 606, posts 83).

## Conflictbeleid ronde 1

Echte slug-botsingen met pre-bestaande CMS content: geen blokkerende gevonden
voor de WPE-nieuwe set. Tweede apply logde 83× “conflict” = idempotent rematch
van reeds geïmporteerde posts.

## Modified-old (ronde 2 — niet toegepast)

Zie `modified-old-diff.md` / `modified-old-diff.json` (CMS WP-CLI report).

| Status | Count |
|--------|------:|
| wpe_newer (review_merge) | 96 |
| cms_newer (skip) | 5 |
| same_modified | 3 |
| missing_on_cms | 3 |

Breakdown WPE modified_old: material 75, talk 19, brand 11, article 1, event 1.

**Actie:** selectief mergen na redactionele review; geen automatische overwrite.

## Steekproef REST (CMS)

| Type | Slug | CMS ID | Status |
|------|------|-------:|--------|
| article | high-performance-panels-find-new-purpose-in-skatepark-renovation | 139499 | publish |
| article | wood-for-the-trees-explored-the-future-of-responsible-hardwood-use | 137856 | publish |
| brand | steni | 139497 | publish |
| event | materialdistrict-expo-beyond-plastics | 139569 | publish |
| talk | michiel-dekkers-five-keys-to-a-successful-circular-business-model | 139570 | publish |

Featured media article 139499 → `https://media.materialdistrict.com/wp-content/uploads/2026/06/high-performance-panels-find-new-purpose-in-skatepark-renovation-materialdistrict-1.jpg`
