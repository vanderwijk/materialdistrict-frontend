# Mailsysteem — operator notes (fase 0/1)

Spec: frontend `docs/mailsysteem-spec.md` v7.

## wp-config constants

```php
define( 'MD_SES_NEWS_FROM_EMAIL', 'MaterialDistrict <news@materialdistrict.com>' );
define( 'MD_SES_NEWS_REPLY_TO', 'info@materialdistrict.com' );
define( 'MD_SES_MARKETING_CONFIGURATION_SET', 'materialdistrict-marketing' );
define( 'MD_SES_CONFIGURATION_SET', 'materialdistrict-transactional' );
define( 'MD_SES_REENGAGEMENT_CONFIGURATION_SET', 'materialdistrict-reengagement' );
define( 'MD_MAIL_TOKEN_SECRET', '…long random…' ); // optional; falls back to wp_salt
// Optional intro LLM:
// define( 'MD_MAIL_INTRO_API_URL', 'https://api.openai.com/v1/chat/completions' );
// define( 'MD_MAIL_INTRO_API_KEY', '…' );
```

## AWS

```bash
./docs/ses-mail-marketing-setup.sh
```

Add DKIM for `engage.materialdistrict.com`, create mailbox `news@`, update IAM from `docs/iam-md-wp-ses-policy.json`.

DKIM CNAMEs (OpenProvider) — each token `TOKEN` →:

```
TOKEN._domainkey.engage.materialdistrict.com  CNAME  TOKEN.dkim.amazonses.com
```

Tokens (created 2026-07-24):

- `tptp37wqgcm6hbjwklazqix34iko3kiv`
- `ryzdzxghjd3ly34rlgi2l2dfggkadwzh`
- `yuwsfajbg7yszz4et5ivx54nncidbiyc`

## Sendy harvest (time-critical)

Place the Sendy all-list export at `docs/sendy-exports/materialdistrict-all.csv`
(columns `Email` + `Status`). The harvest script takes **Bounced** + **Marked as spam** only.

```bash
export MD_DRY_RUN=1
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/mail-harvest-suppression.php
# then MD_DRY_RUN=0
```

Optional: `MD_SENDY_ALL_CSV=/other/path.csv`
## Contact import

```bash
export MD_ACTIVE_CSV=…/active-no-wp.csv
export MD_UNSUB_CSV=…/unsub-no-wp.csv
wp eval-file …/docs/mail-import-contacts.php
```

## Validation list

```bash
export MD_VALIDATION_OUT=/tmp/md-validate.csv
wp eval-file …/docs/mail-prepare-validation-list.php
```

## Worker / digests (system cron)

Assembler jobs are **chunked** (default 250 users), use a **shared content pool**,
flush caches between chunks, and **resume** via options `md_mail_digest_job_{freq}`.
Re-invoking the digest action on the same calendar day continues an incomplete job
(or no-ops when status is `done`).

Worker defaults to **100**/run with a MySQL `GET_LOCK`, reclaiming rows stuck in
`sending` for >15 minutes. Override batch with `MD_MAIL_WORKER_BATCH` (max 200).

```cron
# Drain queue (~1200/hr at batch 100). Use */2 for faster Tuesday drains if needed.
*/5 * * * * wp --path=/path eval 'print_r(md_mail_worker_run());'

# Digests — start at 07:00; continue every 5 min in the morning window if chunked.
0 7 * * *   wp --path=/path eval 'do_action("md_mail_digest_daily");'
*/5 7-11 * * * wp --path=/path eval 'do_action("md_mail_digest_daily");'
0 7 * * 2   wp --path=/path eval 'do_action("md_mail_digest_weekly");'
*/5 7-18 * * 2 wp --path=/path eval 'do_action("md_mail_digest_weekly");'
0 7 * * 2   wp --path=/path eval 'do_action("md_mail_digest_monthly");'
*/5 7-18 * * 2 wp --path=/path eval 'do_action("md_mail_digest_monthly");'
```

Optional `wp-config` tuning:

```php
define( 'MD_MAIL_ASSEMBLER_CHUNK_SIZE', 250 ); // users between cache flushes
define( 'MD_MAIL_WORKER_BATCH', 100 );         // SES sends per worker run
define( 'MD_MAIL_DEBUG', true );              // error_log assembler progress
```

Force a same-day re-run (rare):

```bash
wp eval 'md_mail_assembler_clear_job("weekly"); print_r(md_mail_assembler_run_frequency("weekly", null, ["resume"=>false]));'
```

## Follow-all migration + Sendy off

```bash
wp eval 'echo md_mail_migrate_follow_all();'
wp eval 'echo md_mail_content_backfill_first_approved(500);'
wp eval-file …/docs/mail-disable-sendy.php
```

## Re-engagement warm-up

Warm-up routes a % of weekly digests via `materialdistrict-reengagement`. Those mails
automatically use From `MD_SES_REENGAGEMENT_FROM` (`news@engage.materialdistrict.com`).

```bash
wp eval 'md_mail_reengagement_set_warm_percent(10);'  # 10% of weekly digests via materialdistrict-reengagement
# after 3–4 weeks, send batches of 2500 with md_mail_reengagement_enqueue_batch + gate
```

## REST (§11)

| Endpoint | Auth |
|----------|------|
| `GET/PATCH /md/v2/mail/preferences?token=` | token or JWT |
| `POST /md/v2/mail/unsubscribe` | token (one-click) |
| `POST /md/v2/mail/subscribe` | public |
| `GET/POST /md/v2/mail/campaigns` | editor |
| `POST /md/v2/mail/campaigns/{id}/test\|schedule` | editor |
| `GET/POST /md/v2/mail/banners` | editor |
| `POST /md/v2/mail/audience` | editor |
| `GET /md/v2/mail/preview/{queue_id}?token=` | token |
