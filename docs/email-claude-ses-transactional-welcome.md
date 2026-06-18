Onderwerp: SES standaard template + welkomstmails (10/11) — contract voor alle transactionele mail

Hoi Claude,

Jeroens akkoord op de welkomstcopy is verwerkt. Daarnaast hebben we nu **één gedeeld Amazon SES-layout** waar alle transactionele mails doorheen moeten. Graag alle nieuwe mail-work vanaf hier op dat contract bouwen.

---

## Standaard template: `md-transactional`

**Bron:** `materialdistrict-plugin/docs/ses/templates/md-transactional.html`  
**Deploy:** `php docs/ses/build-template.php` → `./docs/ses-cli-setup.sh` (eu-central-1)  
**PHP:** `md_ses_send_transactional_email()` in `includes/md-ses-transactional.php`

### Regel voor jou

| Doen | Niet doen |
|------|-----------|
| Copy in PHP/HTML-fragmenten (`body_html`, `body_text`) | Losse plaintext-only SES-templates per mail |
| Altijd via `md-transactional` + `md_ses_send_transactional_email()` | Nieuwe ad-hoc templates zonder layout |
| CTA via `cta_label` + `cta_url` | Inline-styling buiten de shell (lists/paragraphs in body wel ok) |

De shell levert: logo, witte kaart op crème achtergrond, groene CTA-knop (#007838), footer met copyright.

### Template-variabelen (SES)

`email_subject`, `preheader`, `greeting`, `body_html`, `body_text`, `cta_block` (auto), `secondary_block`, `signoff`, `frontend_url`, `logo_url`, `year`

### `{{first_name|there}}`

Geen pipe-syntax in SES — PHP doet de fallback:

```php
md_ses_email_greeting_name( $raw_form_first_name ); // → voornaam of "there"
md_ses_email_greeting_line( $raw_form_first_name ); // → "Hi there," / "Hi Johan,"
```

Bij register: alleen de **ingevulde** form-waarde telt; leeg laten = "there" (ook al vult WP intern een fallback voor display_name).

---

## Welkomstmails — live in plugin (punt 11)

Trigger: `POST /md/v2/auth/register` na user-create (`includes/md-welcome-mail.php`).

| Variant | `account_type` | Subject |
|---------|----------------|---------|
| **A — specifier** | `specifier` (default) | Welcome to MaterialDistrict — what's new in materials, every day |
| **B — manufacturer** | `manufacturer` | Welcome to MaterialDistrict — let's get your materials specified |

Copy = jouw goedgekeurde Engelse tekst (Jeroen akkoord).

### CTA-URLs (productie frontend)

| Link | URL |
|------|-----|
| Profiel | `/dashboard/profile` |
| Plan kiezen | `/become-a-partner` |
| **Insider** | `/membership` (marketing-pagina) |

Insider-link in Variant A wijst naar `/membership` — niet naar dashboard/insider-insights. Als je liever een andere URL wilt, laat het weten vóór de volgende copy-wijziging.

Fout bij versturen blokkeert registratie niet (error_log only).

---

## Al gemigreerd naar `md-transactional`

- Password reset (`md_auth_send_password_reset_email`)

## Nog te migreren (zelfde shell, lagere prioriteit)

- `md-lead-brand`, `md-lead-confirmation`, `md-sample-*` — werken nog via oude losse templates

---

## Jouw volgende stappen (als je mail aanraakt)

1. Geen nieuwe SES-templates aanmaken zonder overleg — gebruik `md-transactional`.
2. Copy-wijzigingen in `includes/md-welcome-mail.php` of nieuwe `md_*_mail_payload()` helpers.
3. Documentatie: `docs/ses-templates.md` in de plugin.

## Infra (mijn bord)

1. Plugin deployen naar WPE
2. `./docs/ses-cli-setup.sh` draaien (maakt/update `md-transactional` in SES)
3. Rooktest: register als specifier + manufacturer → mail in inbox

---

Groet,  
Johan
