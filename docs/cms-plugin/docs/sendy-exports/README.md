# Sendy exports (fase 0 gate)

Do not commit PII CSVs to git. Keep them local / secure storage only.

## Preferred: one all-list export

Place Sendy’s full list export here as:

`materialdistrict-all.csv`

Required columns: `Email`, `Status` (`Active` | `Bounced` | `Unsubscribed` | `Marked as spam`).

| Status | Used by |
|--------|---------|
| `Bounced` | `docs/mail-harvest-suppression.php` → suppression + `mail_suppressed` |
| `Marked as spam` | same |
| `Active` / `Unsubscribed` | later: contact-import / consent (separate script) |

## Run harvest

```bash
# From WP root; defaults to this folder’s materialdistrict-all.csv
export MD_DRY_RUN=1
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/mail-harvest-suppression.php

export MD_DRY_RUN=0
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/mail-harvest-suppression.php
```

Optional override: `MD_SENDY_ALL_CSV=/other/path.csv`
