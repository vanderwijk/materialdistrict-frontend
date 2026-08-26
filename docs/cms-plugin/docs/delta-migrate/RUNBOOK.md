# WPE → CMS delta migratie — runbook

Cutoff: **`2026-06-22 12:10:39`** (lokaal WP Engine tijd / `post_date`).  
Bron: WP Engine productie — SSH-host en installpad staan in de password manager (niet in git).  
Doel: `cms-materialdistrict` (`/var/www/html`).  
Bundle (deze run): `docs/data/2026-08-05-delta/`.

## Beleid (kort)

| Regel | Gedrag |
|-------|--------|
| Nieuwe posts | Alleen `post_date >= cutoff` |
| Bestaande slug op CMS | Overslaan + loggen (CMS wint) |
| IDs | Niet bewaren; match op `post_type+slug` / e-mail |
| Users | Gefilterd (`keep` / `reject` / `review`) |
| Pre-cutoff edits | Alleen via diff-rapport, niet blind |

## Tooling

Alles onder `docs/delta-migrate/`:

| Script | Host | Rol |
|--------|------|-----|
| `md-delta-inventory.php` | WPE + CMS | Tellingen |
| `md-delta-export.php` | WPE | JSONL + file-manifest |
| `md-delta-user-filter.php` | CMS of lokaal WP | keep/reject/review |
| `md-delta-sync-files.sh` | Laptop | Ontbrekende uploads WPE→CMS |
| `md-delta-import.php` | CMS | Users → attachments → brand→material→article/event/talk |
| `md-delta-diff-report.php` | CMS | Modified-old diff |

**Let op WPE `/tmp`:** ephemeral tussen SSH-sessies. Export bewaren onder  
`wp-content/uploads/_md-delta-YYYY-MM-DD/` op de WPE-install, of direct naar laptop pullen.

## Volgorde

### 1. Inventarisatie

```bash
# WPE — $WPE_SSH en installroot uit password manager
ssh "$WPE_SSH"
cd "$WPE_ROOT"   # typisch /sites/<install>
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/delta-migrate/md-delta-inventory.php -- '2026-06-22 12:10:39'

# CMS
ssh cms-materialdistrict
cd /var/www/html
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/delta-migrate/md-delta-inventory.php --allow-root -- '2026-06-22 12:10:39'
```

### 2. Export (WPE)

```bash
OUT="$WPE_ROOT/wp-content/uploads/_md-delta-2026-08-05"
mkdir -p "$OUT"
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/delta-migrate/md-delta-export.php -- "$OUT" '2026-06-22 12:10:39'
# Pull naar laptop → docs/data/2026-08-05-delta/
```

### 3. Users filter

```bash
# Op CMS met gekopieerde delta:
wp eval-file …/md-delta-user-filter.php --allow-root -- /tmp/md-delta-2026-08-05
# Review: users-review.csv → zet import_yes_no=yes alleen na handmatige OK
```

Deze run: **keep 132 / reject 141 / review 3** (review niet geïmporteerd).

### 4. Media files

```bash
# Genereer files-missing t.o.v. CMS uploads, daarna:
./docs/delta-migrate/md-delta-sync-files.sh docs/data/2026-08-05-delta
```

Deze run: **603/603** manifest-files aanwezig op CMS; CDN HEAD samples **200**.

Import schakelt tijdelijk S3 *per-attachment* offload uit (te traag). Bestanden die
al op WPE/S3 stonden blijven via `media.materialdistrict.com` bereikbaar. Bij
nieuwe lokale-only files: bulk `aws s3 sync` van het manifest.

### 5. Import (CMS)

```bash
# Dry-run eerst
wp eval-file …/md-delta-import.php --allow-root -- /tmp/md-delta-2026-08-05 dry-run
# Apply
wp eval-file …/md-delta-import.php --allow-root -- /tmp/md-delta-2026-08-05
```

Idempotent: tweede run matched users/attachments/slugs en maakt geen duplicaten.

### 6. Diff-ronde (niet blind)

```bash
wp eval-file …/md-delta-diff-report.php --allow-root -- /tmp/md-delta-2026-08-05
# of lokaal: docs/data/2026-08-05-delta/modified-old-diff.md
```

Selectief mergen na redactionele review — zie diff-rapport.

### 7. Validatie

- Tellingen: article/brand/event/talk/attachment vs export-manifest  
- REST/Next: sample material/article/brand/event/talk + featured image  
- Users: geen reject-domeinen in CMS  
- Diff-kandidaten apart afhandelen vóór DNS-cutover  

## Resultaten run 2026-08-05

Zie [`../data/2026-08-05-delta/INVENTORY.md`](../data/2026-08-05-delta/INVENTORY.md).

| Object | WPE export | CMS na import |
|--------|-----------:|--------------:|
| users (keep) | 132 | 132 (1 bestond al) |
| brand (nieuw) | 2 | 2 (+ CMS-only) |
| material (nieuw) | 0 | 0 |
| article | 71 | 71 |
| event | 1 | 1 |
| talk | 9 | 9 |
| attachments | 606 | 606 gematcht |
| modified_old | 107 | diff: 96× wpe_newer (review) |

`import-conflicts.jsonl` na de tweede apply bevat **alle 83** posts als
“conflict” omdat ze al door de eerste apply bestonden — dat is idempotent
rematch, geen echte slug-botsing met CMS-only content.

## Valkuilen

1. **S3 offload per attachment** + meta_query lookups → import urenlang; vaste
   fix zit in `md-delta-import.php` (index + hooks uit).
2. **WPE `/tmp`** wisht tussen sessies; gebruik uploads `_md-delta-*`.
3. **Moneybird / ZZTEST / prospects** op CMS niet overschrijven.
4. **GUARDYL®** material kan nog naar gearchiveerde brand wijzen (aparte rollback).
5. Review-CSV users (`vexaluno.xyz` e.d.) blijven buiten import tot handmatige ja.
