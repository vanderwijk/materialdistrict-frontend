# Amazon SES templates — MaterialDistrict headless mail

These templates are used **only** by the Next.js frontend via WordPress REST endpoints.
Legacy Postmark flows (`postmark-email-send.php`, theme JS) are **not** affected.

Create all templates in **eu-central-1** (same region as `MD_SES_REGION`).

## wp-config.php

```php
define( 'MD_SES_REGION', 'eu-central-1' );
define( 'MD_SES_ACCESS_KEY_ID', '...' );
define( 'MD_SES_SECRET_ACCESS_KEY', '...' );
define( 'MD_SES_FROM_EMAIL', 'MaterialDistrict <requests@materialdistrict.com>' );
define( 'MD_SES_AUTH_FROM_EMAIL', 'MaterialDistrict <noreply@materialdistrict.com>' );
define( 'MD_SES_CONFIGURATION_SET', 'materialdistrict-transactional' );
define( 'MD_FRONTEND_URL', 'https://materialdistrict-frontend.vercel.app' );
// Later production cutover:
// define( 'MD_FRONTEND_URL', 'https://materialdistrict.com' );
```

Optional overrides for template names:

```php
define( 'MD_SES_TEMPLATE_TRANSACTIONAL', 'md-transactional' ); // shared layout — use for all new mail
define( 'MD_SES_TEMPLATE_LEAD_BRAND', 'md-lead-brand' );
define( 'MD_SES_TEMPLATE_LEAD_CONFIRMATION', 'md-lead-confirmation' );
define( 'MD_SES_TEMPLATE_SAMPLE_BRAND', 'md-sample-brand' );
define( 'MD_SES_TEMPLATE_SAMPLE_CONFIRMATION', 'md-sample-confirmation' );
define( 'MD_SES_TEMPLATE_PASSWORD_RESET', 'md-password-reset' ); // legacy; password reset now uses md-transactional
define( 'MD_SES_LOGO_URL', 'https://materialdistrict.com/wp-content/themes/materialdistrict-theme/img/material-district-logo-full.png' ); // optional override; PNG required for email clients
```

## Standard transactional layout (`md-transactional`)

**All new headless transactional emails must use this template** via `md_ses_send_transactional_email()` in `includes/md-ses-transactional.php`.

PHP assembles copy; SES renders the branded shell (logo, card, green CTA, footer).

| Variable | Description |
|----------|-------------|
| `email_subject` | Subject line |
| `preheader` | Inbox preview text (hidden in body) |
| `greeting` | Opening line, e.g. `Hi there,` |
| `body_html` | Main HTML fragment (paragraphs, lists) |
| `body_text` | Plain-text body |
| `cta_block` | Built in PHP from `cta_label` + `cta_url` (empty = hidden) |
| `secondary_block` | Optional HTML below CTA (e.g. Insider link) |
| `signoff` | Closing line (may include `<br>`) |
| `frontend_url` | Auto-filled from `MD_FRONTEND_URL` |
| `logo_url` | Auto-filled; override with `MD_SES_LOGO_URL` |
| `year` | Auto-filled copyright year |

**Greeting fallback:** `md_ses_email_greeting_name( $first_name )` → voornaam or `there` when the register form left first name empty.

**Deploy template to SES:**

```bash
php docs/ses/build-template.php /tmp/ses-out
aws sesv2 create-email-template --region eu-central-1 \
  --template-name md-transactional \
  --template-content file:///tmp/ses-out/md-transactional.aws.json
```

Or run `./docs/ses-cli-setup.sh` (builds + upserts `md-transactional`).

### Welcome emails (live on register)

| Variant | `account_type` | Subject |
|---------|----------------|---------|
| A — specifier | `specifier` (default) | Welcome to MaterialDistrict — what's new in materials, every day |
| B — manufacturer | `manufacturer` | Welcome to MaterialDistrict — let's get your materials specified |

Triggered in `POST /md/v2/auth/register` after user creation (`includes/md-welcome-mail.php`).

CTA URLs (production frontend):

- Profile → `/dashboard/profile`
- Become a partner → `/become-a-partner`
- Insider → `/membership` (marketing page; not dashboard)

## SNS webhook

Subscribe an HTTPS endpoint to your configuration set event topic:

`POST https://materialdistrict.com/wp-json/md/v2/ses/notifications`

Events: Delivery, Open, Click, Bounce, Complaint.

## Deploy (WP Engine)

The AWS SDK lives in `includes/vendor/` (Composer). After every plugin deploy:

```bash
cd wp-content/plugins/materialdistrict-plugin/includes
composer install --no-dev
```

If you still see autoload fatals (`symfony/polyfill-ctype/bootstrap.php` etc.), the vendor tree is incomplete — reset and reinstall:

```bash
cd wp-content/plugins/materialdistrict-plugin/includes
rm -rf vendor
composer install --no-dev
```

Verify on the server:

```bash
php -r "require 'vendor/autoload.php'; echo class_exists('Aws\\SesV2\\SesV2Client') ? 'SES OK' : 'SES FAIL';"
ls vendor/symfony/polyfill-ctype/bootstrap.php
```

`composer install` alone is not enough when `vendor/composer/installed.json` exists but package files were never uploaded — use `rm -rf vendor` first.

---

## Template: `md-lead-brand`

**Used by:** `POST /md/v2/get-in-touch` → mail to brand contact  
**From:** `MD_SES_FROM_EMAIL`  
**Reply-To:** user email

| Variable | Description |
|----------|-------------|
| `firstname` | User first name |
| `lastname` | User last name |
| `full_name` | Combined name |
| `email` | User email |
| `profession` | User profession |
| `telephone` | Phone |
| `company` | Company |
| `address_street` | Street |
| `city` | City |
| `postcode` | Postcode |
| `country` | Country label |
| `material_name` | Material or brand title |
| `material_url` | Permalink |
| `brand_name` | Brand title |
| `request_labels` | Comma-separated selected options |
| `message` | Optional free-text message |
| `project` | Empty for get-in-touch |

---

## Template: `md-lead-confirmation`

**Used by:** `POST /md/v2/get-in-touch` → confirmation to user  
**From:** `MD_SES_FROM_EMAIL`

Same variables as `md-lead-brand`.

---

## Template: `md-sample-brand`

**Used by:** `POST /md/v2/sample-request` → mail to brand contact  
**From:** `MD_SES_FROM_EMAIL`  
**Reply-To:** email from the sample form

Same variables as `md-lead-brand`.  
`request_labels` is always `Send me a sample`.  
`project` contains the optional project field from the form.

---

## Template: `md-sample-confirmation`

**Used by:** `POST /md/v2/sample-request` → confirmation to user  
**From:** `MD_SES_FROM_EMAIL`

Same variables as `md-sample-brand`.

---

## Template: `md-password-reset` (legacy)

**Used by:** was `POST /md/v2/auth/forgot-password` — **now uses `md-transactional`** via `md_ses_send_transactional_email()`.

The standalone `md-password-reset` template in SES is kept for rollback only. New sends use the shared layout.

## REST endpoints (Next.js proxies)

| WordPress | Next.js proxy |
|-----------|---------------|
| `POST /md/v2/get-in-touch` | `POST /api/get-in-touch` |
| `POST /md/v2/sample-request` | `POST /api/sample-request` |
| `POST /md/v2/auth/forgot-password` | `POST /api/auth/forgot-password` |
| `POST /md/v2/auth/reset-password` | `POST /api/auth/reset-password` |

All lead/sample endpoints require `Authorization: Bearer <JWT>`.

## Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `md_ses_unconfigured` | 503 | Missing wp-config SES constants |
| `md_ses_send_failed` | 503 | SES API error (IAM, template, etc.) |
| `md_lead_no_recipient` | 503 | Brand has no routing email |
| `md_lead_country_blocked` | 403 | Country restriction |
| `md_lead_insider_required` | 403 | Sample gated to Insider |
| `md_lead_sample_disabled` | 403 | Material has samples disabled |
| `md_auth_invalid_token` | 400 | Reset token invalid/expired |
| `md_auth_rate_limited` | 429 | Max 3 forgot-password requests/hour per email |
