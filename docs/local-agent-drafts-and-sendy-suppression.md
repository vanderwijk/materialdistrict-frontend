# Lokale agent — draft testposts wissen + Sendy-suppressie checken

**Voor:** lokale Cursor-agent met WP-CLI op CMS (en desgewenst production).  
**Context:** launch-punten Claude → Johan (29-07-2026). Cloud-agent had geen CMS-shell; dit is ops op de database.

**Status 29-07-2026 (CMS):** ✅ afgerond  
- Testposts `133915` / `137173` / `137213` permanent verwijderd (`material` CPT heeft geen trash → direct `--force`).  
- Suppressie: `wp_md_mail_suppression` = **41.277** rijen, allemaal `source=sendy_export` (bounce 39.581 / complaint 1.696; geoogst 24-07-2026 14:24–14:25 UTC). `mail_suppressed=1` op 1.623 users. Geen nabewerking.

Voer uit op **CMS eerst** (`cms.materialdistrict.com`). Production alleen als die DB al dezelfde content/mail-schema heeft of na expliciete go.  
Onderstaande stappen blijven staan als naslag / herhaalcheck.

---

## A. Drie draft testmaterials verwijderen

IDs (alle draft; geen runtime-code hangt eraan):

| ID | Titel | Opmerking |
|----|--------|-----------|
| `133915` | Test material jajaja… | Alleen oude dashboard-handoff-voorbeelden |
| `137173` | E2E Featured Slot Test | Geen code-referenties meer |
| `137213` | Props test | Idem |

### 1. Verifiëren (dry)

```bash
# Pas --path / URL aan naar jullie WP-root / SSH-alias
wp post get 133915 --field=post_title,post_status,post_type --url=cms.materialdistrict.com
wp post get 137173 --field=post_title,post_status,post_type --url=cms.materialdistrict.com
wp post get 137213 --field=post_title,post_status,post_type --url=cms.materialdistrict.com
```

Verwacht: `post_type=material`, `post_status=draft`. Als een ID ontbreekt of gepubliceerd is: **stop** en meld het.

### 2. Naar trash, dan permanent (veiligste volgorde)

```bash
wp post delete 133915 137173 137213 --url=cms.materialdistrict.com
# bevestig trash:
wp post list --post_type=material --post_status=trash --include=133915,137173,137213 --fields=ID,post_title,post_status --url=cms.materialdistrict.com

# permanent:
wp post delete 133915 137173 137213 --force --url=cms.materialdistrict.com
```

### 3. Bevestigen weg

```bash
wp post get 133915 --url=cms.materialdistrict.com || true
wp post get 137173 --url=cms.materialdistrict.com || true
wp post get 137213 --url=cms.materialdistrict.com || true
```

Verwacht: “Error: Invalid post ID” / not found voor alle drie.

**Niet doen:** bulk-delete van brands of andere testbrands (137159 / 137153 e.d.) — die horen bij het aparte dode-brands-controlebestand.

---

## B. Check: is Sendy-suppressie geoogst in de DB?

Doel: bevestigen dat bounce/complaint-adressen in `wp_md_mail_suppression` staan (source bij voorkeur `sendy_export`). Johan verwacht dat dit al gedaan is.

Schema: tabel `{prefix}md_mail_suppression` — kolommen o.a. `email`, `reason` (`bounce` / `complaint` / …), `source` (`sendy_export` / `ses_event` / …), `user_id`, `created_at`.  
Helper in code: `md_mail_suppression_table()` → meestal `wp_md_mail_suppression`.

### 1. Tabel bestaat + totalen

```bash
wp db query "SHOW TABLES LIKE '%md_mail_suppression';" --url=cms.materialdistrict.com

wp eval '
$table = md_mail_suppression_table();
global $wpdb;
$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );
$by_source = $wpdb->get_results( "SELECT source, COUNT(*) AS n FROM {$table} GROUP BY source ORDER BY n DESC", ARRAY_A );
$by_reason = $wpdb->get_results( "SELECT reason, COUNT(*) AS n FROM {$table} GROUP BY reason ORDER BY n DESC", ARRAY_A );
$sendy = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE source = %s", "sendy_export" ) );
$oldest = $wpdb->get_var( "SELECT MIN(created_at) FROM {$table}" );
$newest = $wpdb->get_var( "SELECT MAX(created_at) FROM {$table}" );
WP_CLI::log( "table={$table}" );
WP_CLI::log( "total={$total}" );
WP_CLI::log( "sendy_export={$sendy}" );
WP_CLI::log( "oldest={$oldest} newest={$newest}" );
WP_CLI::log( "by_source=" . wp_json_encode( $by_source ) );
WP_CLI::log( "by_reason=" . wp_json_encode( $by_reason ) );
' --url=cms.materialdistrict.com
```

### 2. Interpretatie (pass/fail)

| Signaal | Betekenis |
|---------|-----------|
| Tabel ontbreekt of `total=0` | Suppressie **niet** uitgevoerd (of schema nooit geïnstalleerd) → harvest nog draaien |
| `sendy_export` ≫ 0 (orde **duizenden tot ~tienduizenden**) | Harvest **wel** gelukt; spec noemde ~38k historische bounces + ~2k bounce/spam zonder WP-record — exacte totalen hangen van de Sendy-export af |
| Alleen `ses_event` / `manual`, `sendy_export=0` | Nieuwere SES-suppressies wel, **Sendy-oogst nog niet** (of onder andere `source`) |
| `reason` heeft `bounce` én `complaint` | Past bij Sendy Status `Bounced` + `Marked as spam` |

Optioneel user-meta steekproef:

```bash
wp eval '
global $wpdb;
$n = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->usermeta} WHERE meta_key = \"mail_suppressed\" AND meta_value = \"1\"" );
WP_CLI::log( "users_with_mail_suppressed={$n}" );
' --url=cms.materialdistrict.com
```

(Harvest zet `mail_suppressed` alleen op matching WP-users; de bulk van Sendy-bounces kan **alleen** in de suppression-tabel staan.)

### 3. Als harvest wél nog moet (alleen als check faalt)

Zie `docs/mail-harvest-suppression.php` + `docs/sendy-exports/README.md`:

1. Sendy all-list CSV lokaal: kolommen `Email` + `Status`.
2. Niet committen (PII).
3. Dry-run, daarna live:

```bash
export MD_DRY_RUN=1
export MD_SENDY_ALL_CSV=/pad/naar/materialdistrict-all.csv
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/mail-harvest-suppression.php --url=cms.materialdistrict.com

export MD_DRY_RUN=0
wp eval-file wp-content/plugins/materialdistrict-plugin/docs/mail-harvest-suppression.php --url=cms.materialdistrict.com
```

Daarna check B.1 opnieuw.

---

## Rapportage terug naar Johan

Kort melden:

1. Welke van 133915 / 137173 / 137213 verwijderd (trash + force), of waarom niet.
2. Suppressie: `total`, `sendy_export` count, `by_reason`, `oldest`/`newest` — conclusie **wel / niet** geoogst.
3. Of production apart gecheckt is of alleen CMS.
