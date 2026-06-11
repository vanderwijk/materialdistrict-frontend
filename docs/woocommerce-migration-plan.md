# WooCommerce Migration & Go-Live Plan

**Goal:** Duplicate the bookstore (books.materialdistrict.com, multisite blog 2) onto the main site (materialdistrict.com, blog 1) so the new NextJS frontend can use it — without ever touching the live bookstore. Then cut materialdistrict.com over to Vercel, move the WordPress backend to a subdomain, and eventually convert the multisite back to a single site.

**Context:** WP Engine hosting (SSH + WP-CLI available), shared user database, Stripe + PayPal, headless checkout via WooCommerce Store API.

---

## Guiding principles

1. **Blog 2 is read-only for us.** Every action is additive on blog 1 (or staging). No plugin changes, no settings changes, no DB writes on the books subsite.
2. **The main-site store stays dark until launch.** WooCommerce "Coming soon" mode (store pages only) + payment gateways in test/sandbox mode until cutover.
3. **Books subsite remains source of truth until cutover.** No manual catalog edits on the main store; everything flows through re-runnable sync scripts so drift is impossible.
4. **Rehearse everything on WP Engine staging first** (copy of production), and where useful on LocalWP.
5. **Order migration is deliberately kept off the critical path** (see analysis below) — it can be done after go-live without time pressure.

---

## Phase 0 — Inventory & audit

Before migrating anything, capture exactly what the books store consists of.

**Johan (SSH on WP Engine):**

```bash
wp plugin list --url=books.materialdistrict.com
wp option get woocommerce_version --url=books.materialdistrict.com
wp wc shipping_zone list --user=1 --url=books.materialdistrict.com
wp post list --post_type=product --format=count --url=books.materialdistrict.com
wp post list --post_type=shop_coupon --format=count --url=books.materialdistrict.com
wp db query "SELECT COUNT(*) FROM wp_2_posts WHERE post_type='shop_order'"  # legacy storage
wp option get woocommerce_custom_orders_table_enabled --url=books.materialdistrict.com  # HPOS?
```

### Audit results (10 June 2026) ✅

- WooCommerce **10.8.1**, **legacy order storage** (HPOS off). Blog 1's fresh install will default to HPOS — fine; any future order-migration script reads legacy posts and writes via the CRUD API, which is storage-agnostic.
- **46 products** (corrected 2026-06-11 via direct SQL; the earlier 4,627 figure from the audit was wrong), **3,497 orders**, 5 shipping zones. ✅ Duplicate "Netherlands" (zone 5) had 0 orders ever and was shadowed by zone 1 — **deleted from blog 2 on 2026-06-10**; source data is now clean. CSV product import is trivial at this scale (no batching concerns).
- **Blog 3 exists: dashboard.materialdistrict.com** — a test site, can be ignored; remove it during the multisite→single-site conversion (Phase 7).
- No subscriptions, no multilingual/multi-currency, reviews ignored, backend subdomain = **cms.materialdistrict.com**, DNS at **OpenProvider**.
- Extensions needing their own migration handling:
  - **Table Rate Shipping** — rates live in dedicated tables; folded into the shipping-zone copy script.
  - **Product Bundles** — bundle contents live in `woocommerce_bundled_items` (+itemmeta) tables and reference product IDs → dedicated copy script with SKU remap.
  - **SendCloud** — site-bound API connection; re-connect on blog 1. ✅ Confirmed consumer of the **Legacy REST API** plugin (API key "SendCloud API", last access 2026-06-10). **Decision: upgrade V1 (2.4.5, unmaintained) → V2 on books first** — see Phase 0.5. Then blog 1 never needs the Legacy REST API plugin.
  - **PDF Invoices & Packing Slips** — copy settings; at cutover set blog 1's invoice number sequence to continue from books' last invoice (fiscal continuity).
  - **Mailchimp for WooCommerce** — site-bound store connection; connect blog 1 to the audience **only at cutover** (two live stores syncing one audience = conflicts).
  - **Product Feed PRO** — feed URLs change with the domain; re-create feeds on blog 1, update Google Merchant Center at cutover.
  - **One Page Checkout, YITH added-to-cart popup** — frontend-only; irrelevant for headless. Skip on blog 1.
  - **Google Analytics integration** — measurement moves to the NextJS frontend; decide whether server-side purchase events are still wanted.
  - **Yoast product meta** — NextJS owns SEO on the new site; only migrate Yoast meta if the frontend will read it.
  - **Postmark** is network-active → transactional email works for blog 1 *for now*. ⚠️ Will be retired in favour of Amazon SES — see Phase 2 §5 for the migration order.
  - **SearchWP** — product search for the NextJS frontend is a separate decision (Store API search vs SearchWP over REST vs external).
- Image note: 4,627 products means the CSV import sideloads thousands of images — run on staging first to time it, then production off-peak, importer in batches.

**Johan (WP Engine portal):** create/refresh a **staging copy of production**. All scripts below get rehearsed there first.

---

## Phase 0.5 — SendCloud V1 → V2 upgrade on books (pre-project)

The V1 plugin (2.4.5) is unmaintained, requires the Legacy REST API, and is a liability on blog 1's HPOS-default install. Sendcloud supports running V1 and V2 side by side with V1 as instant rollback, so this is safe to do on the live store. Bonus: the books zones contain no Sendcloud service-point checkout methods (only table_rate + free_shipping), so the fiddly service-point migration doesn't apply — Sendcloud only does order sync + labels here.

**Status: ✅ COMPLETED 2026-06-11.** V2 installed, connected, and verified via test order; V1 integration disconnected and plugin removed; Legacy REST API plugin deactivated/removed; stale "SendCloud API" keys revoked. The "Webhook feedback" fields in the Sendcloud panel were deliberately left empty (custom-API-integration feature; tracking/status feedback runs through the V2 integration itself).

Remaining note for blog 1 later: Sendcloud docs state HPOS **compatibility mode** must be enabled for V2 to retrieve orders — verify on staging; alternatively start blog 1 on legacy order storage.

Refs: [V2 Migration guide](https://support.sendcloud.com/hc/en-us/articles/29252845840401-WooCommerce-V2-Migration-guide), [V2 Integration](https://support.sendcloud.com/hc/en-us/articles/34955558577297-WooCommerce-V2-Integration), [V2 Troubleshooter](https://support.sendcloud.com/hc/en-us/articles/34953204906385-WooCommerce-V2-Troubleshooter).

---

## Phase 1 — WooCommerce live (but dark) on the main site

**Johan (wp-admin / WP-CLI):**

1. ~~Activate WooCommerce on blog 1.~~ ✅ done 2026-06-11
2. ~~Enable Coming soon mode → "Store pages only".~~ ✅ done 2026-06-11 — verified logged-out: homepage normal, /shop/ shows coming-soon. Shop/Cart/Checkout/My account set to noindex via Yoast (undo at launch — covered in runbook).
3. Let WooCommerce create its pages (shop/cart/checkout/my-account). For a headless build these are mostly placeholders, but the Store API and account endpoints rely on some of them existing.
4. ~~Activate the same WooCommerce extensions the audit found, on blog 1.~~ ✅ done 2026-06-11 (One Page Checkout & YITH popup skipped).

**Claude:** provide a settings-diff checklist (currency, base country, tax options, account & privacy settings, email settings) — or better, the options-copy script in Phase 2 handles this wholesale.

---

## Phase 2 — Configuration migration (settings, shipping, tax, gateways)

**Status: ✅ COMPLETED 2026-06-11 (directly on production — staging copy failed; WP Engine backup-point taken first).** Config tables copied via `copy-config-tables.php` (tax classes/rates, 3 attributes, shipping classes bbp/pkt remapped, 4 zones + fallback, 8 methods, 11 table rates). Options copied via `copy-options.php` (219 options; Stripe forced to test mode; PayPal/SendCloud/Mailchimp/HPOS/page-IDs excluded). PayPal re-onboarded manually by Johan.

Almost all WooCommerce configuration lives in the options table; shipping zones and tax rates live in dedicated tables. Because blog 1's WooCommerce is brand-new (empty zones, empty rates), these can be copied directly.

**Claude writes, Johan runs (staging first):**

1. **Options-copy script** (WP-CLI/PHP): copy all `woocommerce_*` options from blog 2 → blog 1 with an exclusion list: `woocommerce_db_version`, all `*_page_id` options, webhook/job state, `woocommerce_store_pages_only`/coming-soon flags, and anything containing site URLs. Serialized data handled in PHP, never raw SQL string-replace.
2. **Shipping zones** — SQL copy of `wp_2_woocommerce_shipping_zones`, `_zone_locations`, `_shipping_zone_methods` **plus the Table Rate Shipping tables** (`wp_2_woocommerce_shipping_table_rates` etc.) → `wp_` equivalents, plus the per-instance options (`woocommerce_table_rate_{instance_id}_settings` etc.), which the options script picks up. Instance IDs are preserved because the target tables are empty. (The dead duplicate "Netherlands" zone was already deleted at the source.)
3. **Tax rates** — copy `wp_2_woocommerce_tax_rates` + `_tax_rate_locations`, or simply use WooCommerce's built-in tax CSV export/import (wp-admin) if rates are few.
4. **Payment gateways — special care:**
   - **Stripe:** the settings option (incl. keys) can be copied, but the main store runs in **test mode** until cutover. The live keys belong to the existing account `acct_15875kLbBd2st6kq`. Webhooks are per-endpoint-URL: a *new* webhook endpoint for the main site gets added in the Stripe dashboard (can be created ahead of cutover, pointing at the future `cms.materialdistrict.com` URL). The books-site webhook is never touched.
   - **PayPal:** the PayPal Payments plugin stores site-bound onboarding tokens — copying the option usually does **not** work. Plan for Johan to re-run PayPal onboarding (Connect flow) on blog 1, sandbox first, live credentials at cutover.
5. **Emails:** templates/settings copied by the options script. ⚠️ **Mail transport changes (decided 2026-06-11): Postmark will be retired; transactional mail moves to Amazon SES.** Order of operations: (a) verify the SES domain identity for materialdistrict.com (DKIM CNAMEs + SPF in OpenProvider, DMARC alignment — Sendy already uses SES, check if the domain identity covers wp_mail sending too); (b) **Gravity SMTP** (chosen 2026-06-11) with the SES integration, network-wide — never run it alongside Postmark on the same site (both intercept wp_mail); (c) test mail on BOTH sites + a full order email cycle; (d) only THEN deactivate Postmark network-wide. IAM key needs `ses:SendRawEmail`; check the SES identity isn't in sandbox mode.

---

## Phase 3 — Catalog migration (products, coupons)

**Status: ✅ COMPLETED 2026-06-11.** Products via CSV export/import (31 published + drafts; `csv` had to be added to the network upload-filetypes). SKU map: 46 mapped (SKU + slug + title fallbacks — note: the WC CSV exporter does NOT preserve slugs; 18 products had no SKU despite the earlier audit answer). 27 coupons migrated with product-ID remap. Bundles: 2 bundled items copied for bundle #42→#137404; 3 orphan rows of a deleted bundle (#1925) correctly skipped. Unmappable leftovers: 3 nameless S/M/L variations (nothing references them).

**Products — recommended: WooCommerce built-in CSV exporter/importer.**

- Export on blog 2 (tick "export custom meta" if the audit found extra product meta), import on blog 1.
- Images are sideloaded by URL — works because the books site stays online; media gets duplicated into blog 1's uploads, which is exactly what we want for the future single-site install.
- Handles categories, tags, attributes, variations, stock, prices.
- **Crucial:** products get *new IDs* on blog 1. Everything that references product IDs must be remapped **via SKU** (confirmed: all products have ISBNs/SKUs ✓).

**Product Bundles — Claude writes a dedicated copy script:** bundle composition lives in `woocommerce_bundled_items` (+ `woocommerce_bundled_itemmeta`) and references product IDs on both sides (bundle + contents). Script copies rows with the SKU remap applied. Verify a sample bundle on staging end-to-end (price, contents, stock behaviour).

**Coupons — Claude writes a WP-CLI migration script** (the CSV exporter doesn't cover coupons):

- Export all `shop_coupon` posts + meta from blog 2 to JSON, import to blog 1.
- Remap `product_ids` / `excluded_product_ids` meta via the SKU map above.
- Idempotent by coupon code, so it's safely re-runnable for delta syncs.
- Decide whether to copy `usage_count` (yes, if per-customer/total usage limits must keep counting correctly — recommended).

**Reviews (if keeping):** Claude writes a small script copying product comments + ratings with post-ID remap, then recounts rating meta.

---

## Phase 4 — Keeping the stores in sync until go-live

**✅ DECISION (2026-06-11): no automated delta-sync.** Product changes are rare
and the catalog is small (46 products). Approach instead:

- Books is **completely hands-off** for the development of the new site from
  now on — no scripts read from it, no tooling touches it. It just keeps
  selling until cutover.
- Catalog changes on books between now and cutover (price/title/stock) are
  applied **manually on the main site** as they happen, or at the latest
  during the cutover freeze.
- **At cutover:** manual stock correction on the main site (compare against
  books' stock report, ~15 min at this scale) inside the order freeze.
- The sync scripts (`build-sku-map.php`, `migrate-coupons.php`,
  `copy-bundles.php`) remain available as fallback should a bulk re-sync ever
  be needed, but are not part of the process.

---

## Order history — analysis (decision pending)

**What makes it easier than it looks:**

- Users are shared across the network, and orders link to customers by user ID. Copied orders re-attach to the correct accounts automatically — no email/user matching needed.
- Orders on blog 2 become **frozen at cutover** (store closes). So migration can run *after* go-live, calmly, from a static dataset. **It is not on the critical path.**

**What makes it harder than it looks:**

- **ID collisions:** order IDs from blog 2 cannot be preserved — blog 1's posts table (and/or HPOS tables) already uses overlapping IDs. Orders get new IDs → order *numbers* change unless we store the original number in meta and display it (small snippet) or use a sequential-order-number plugin.
- **Line items reference product IDs** → remap via the SKU map (order item meta `_product_id`, `_variation_id`).
- **HPOS vs legacy:** the script differs depending on storage mode (audit Phase 0). Cleanest path: migrate via `wc_create_order()`-style PHP (storage-agnostic) rather than raw SQL.
- Refunds, order notes (comments), and downloadable permissions each need explicit handling.

**What you'd get / lose:**

| | Migrate orders | Keep subsite as archive |
|---|---|---|
| Customers see old orders in My Account | ✅ | ❌ (new store starts clean) |
| Admin lookup of history | in one place | via archived subsite/DB dump |
| Fiscal retention (NL, 7 yr) | ✅ | ✅ (DB archive suffices) |
| Effort/risk | Medium (scripted, testable) | Zero |

**✅ DECISION (2026-06-11): orders are NOT migrated.** Books' database remains the read-only archive (satisfies fiscal retention); the new store starts clean. Revisitable later — the dataset freezes at cutover. Original recommendation below for context.

**Recommendation:** launch **without** migrating orders. Keep blog 2 intact (read-only) after cutover. Decide within the following weeks whether customer-facing history matters enough; if yes, Claude writes the migration script and it runs against the frozen dataset. Either way, take a final full export/dump of blog 2 before the multisite conversion (Phase 7).

---

## Phase 5 — Domain architecture at go-live (the Vercel question)

The standard headless pattern, and what I recommend:

```
materialdistrict.com        →  Vercel (NextJS)         A 76.76.21.21 (apex)
www.materialdistrict.com    →  Vercel                  CNAME cname.vercel-dns.com
cms.materialdistrict.com     →  WP Engine (WordPress)   CNAME <env>.wpengine.com
books.materialdistrict.com  →  WP Engine (redirects)   unchanged, until decommission
```

- **WordPress doesn't disappear — it moves to a subdomain.** `cms.materialdistrict.com` (or `cms.`/`admin.`) serves wp-admin, the REST/Store API, and all media (`/wp-content/uploads/...`). Add the domain in the WP Engine portal (SSL is auto-provisioned), and in Vercel add the apex + www domains to the project.
- **Multisite URL-change pitfall:** changing the primary site's domain means updating `DOMAIN_CURRENT_SITE` in wp-config, `wp_site`/`wp_blogs` rows, and `home`/`siteurl`, plus a `wp search-replace`. ⚠️ A naive search-replace of `materialdistrict.com` → `cms.materialdistrict.com` would also corrupt every `books.materialdistrict.com` string (it contains the search term). Use protocol-anchored patterns (`//materialdistrict.com`, `//www.materialdistrict.com`) and verify on staging. WP Engine support can assist with multisite primary-domain changes.
- **Media & old image URLs:** after the apex points to Vercel, previously indexed `materialdistrict.com/wp-content/uploads/...` URLs would 404. Fix in NextJS config: permanent redirect `/wp-content/:path*` → `https://cms.materialdistrict.com/wp-content/:path*` (308). Same for `/wp-admin` and `/wp-login.php` as a convenience. New pages reference `cms.` URLs directly; `next.config` gets `images.remotePatterns` for `cms.materialdistrict.com`.
- **Backend stays noindex after go-live:** all HTML pages on `cms.materialdistrict.com` must be noindexed permanently (duplicate-content risk vs the NextJS site) — but media files (`/wp-content/uploads/`) stay crawlable for image SEO.
- **Content URL parity:** the NextJS site should mirror existing permalinks or ship a redirect map, and the books store URLs (`books.materialdistrict.com/product/...`) get a **301 map to the new product URLs** — those pages carry years of link equity. The subsite keeps running purely as a redirect/archive host for 6–12 months.
- **Headless Store API specifics (NextJS workstream):**
  - **CORS:** the Store API on `cms.materialdistrict.com` must allow origin `https://materialdistrict.com` and expose the `Cart-Token` / `Nonce` headers. Claude writes a small mu-plugin for this.
  - **Cart sessions:** use the Store API's Cart-Token header flow (no cross-domain cookies needed for guest carts).
  - **Payments:** Stripe works with the Store API checkout endpoint (Blocks-compatible gateway). **PayPal headless is the risky one** — its redirect/approval flow through the Store API needs an early technical spike. Fallback: render PayPal buttons against the PPCP order-capture endpoints.
  - **Logged-in account area:** cookies don't cross `materialdistrict.com` ↔ `cms.materialdistrict.com` origins by default. Options: cookie on parent domain `.materialdistrict.com`, a JWT/token auth layer, or keep My Account on the wp subdomain initially. Decide during NextJS build.
- **DNS prep:** find out where DNS is hosted (registrar?) and lower TTLs to 300s a week before cutover.

---

## Phase 6 — Cutover runbook (draft)

Rehearse end-to-end on staging first. On the day:

1. T-7d: TTLs lowered at OpenProvider; staging rehearsal signed off; Stripe live webhook endpoint for `cms.materialdistrict.com` created; PayPal live onboarding completed on blog 1 (gateways still disabled); SendCloud connected to blog 1; Product Feed PRO feeds created on blog 1; NextJS production deploy ready on Vercel preview domain.
2. Announce/start a short checkout freeze on books (notice bar or pause new orders, ~30–60 min).
3. Manual stock correction on the main site against books' stock report (no scripted sync — decision 2026-06-11). Check for any price/coupon changes since migration. Set PDF invoice number sequence on blog 1 to continue from books' last invoice.
4. Switch blog 1 gateways to live mode; place one real Stripe and one real PayPal test order against the wp backend (refund after).
5. Change WordPress primary domain to `cms.materialdistrict.com` (wp-config + DB, per Phase 5). WP Engine still serves the old domain at this moment, so nothing is down.
6. Point apex + www DNS to Vercel. Disable Coming-soon mode flags as needed. NextJS goes live.
7. Activate the 301 redirect map on books.materialdistrict.com (subsite becomes redirect/archive host); end freeze.
8. Post-flip connections: connect Mailchimp for WooCommerce on blog 1 (and disconnect on books); point Google Merchant Center at the new feed URLs.
9. Smoke tests: live purchase on the new site (Stripe + PayPal + iDEAL if offered), webhook delivery logs in Stripe/PayPal dashboards, SendCloud label creation for a test order, PDF invoice numbering, transactional emails (Postmark), image loading, top-20 URL redirects, Search Console.
10. Monitor for 1–2 weeks: 404 logs (Vercel + WP Engine), failed webhooks, order emails, Merchant Center feed status.

**Rollback plan:** DNS back to WP Engine + revert wp-config domain change (scripted, rehearsed). Orders placed on the new store during the window remain in blog 1 — same backend either way, so no data loss.

---

## Phase 7 — Post-launch: multisite → single site

After the redirects have matured and (if chosen) orders are migrated:

1. Final full archive of blog 2: DB tables `wp_2_*` + `wp-content/uploads/sites/2` + a `wp export`. Store offline. Also remove test blog 3 (dashboard.materialdistrict.com) and its `wp_3_*` tables.
2. Keep books.materialdistrict.com redirects alive ≥6–12 months (can later be served by a tiny redirect config instead of the subsite).
3. Convert to single site (on a staging copy first; WP Engine support can assist): remove `MULTISITE`/`SUBDOMAIN_INSTALL`/`DOMAIN_CURRENT_SITE` etc. from wp-config; drop `wp_2_*` tables and network tables (`wp_blogs`, `wp_site`, `wp_blogmeta`, `wp_registration_log`, `wp_signups`); port any needed `wp_sitemeta` values into `wp_options`; clean `wp_2_capabilities` usermeta; update rewrite rules.
4. Verify users, roles, media, WooCommerce all intact; then repeat on production.

---

## Task split

### Claude (I build/write these)

- [ ] Options-copy WP-CLI/PHP script (blog 2 → blog 1, with exclusion list)
- [ ] Shipping zones + table rates + tax rates SQL/WP-CLI copy script
- [ ] Coupon migration script (JSON export/import, SKU remap, idempotent)
- [ ] SKU-based product ID remap utility (shared by coupon/bundle/order scripts)
- [ ] Product Bundles copy script (`woocommerce_bundled_items` + itemmeta, SKU remap)
- [ ] One-command delta-sync wrapper (products CSV + coupons)
- [ ] Order-migration script (only if/when decided; reads legacy posts, writes via CRUD)
- [ ] CORS/headers mu-plugin for the Store API on the wp subdomain
- [ ] NextJS: `next.config` redirects (`/wp-content/*`, `/wp-admin`), `images.remotePatterns`, redirect-map generator for books product URLs
- [ ] PayPal-headless technical spike writeup (Store API vs PPCP buttons)
- [ ] Final detailed cutover runbook + test checklist (from the draft above)
- [ ] Multisite→single-site conversion script/checklist (Phase 7)

### Johan (wp-admin / WP Engine / dashboards)

- [ ] ~~Phase 0 audit~~ ✅ done 2026-06-10
- [x] ~~Check duplicate "Netherlands" shipping zone~~ ✅ zone 5 unused (0 orders) — excluded from copy
- [x] ~~Confirm what consumes the Legacy REST API plugin~~ ✅ SendCloud (key last accessed 2026-06-10)
- [ ] Create WP Engine staging copy (and refresh before each rehearsal)
- [ ] Activate WooCommerce + relevant extensions on blog 1 (skip One Page Checkout, YITH popup); enable Coming-soon (store pages only)
- [ ] Run Claude's scripts via SSH (staging → production)
- [ ] Run product CSV export/import (first full + delta re-runs)
- [ ] Stripe dashboard: create main-site webhook endpoint (test now, live at cutover) on `acct_15875kLbBd2st6kq`
- [ ] PayPal: re-onboard plugin on blog 1 (sandbox now, live at cutover)
- [x] ~~SendCloud V1→V2 upgrade on books (Phase 0.5)~~ ✅ done 2026-06-11; still to do: connect V2 on blog 1 pre-cutover
- [ ] Product Feed PRO: re-create feeds on blog 1; update Google Merchant Center at cutover
- [ ] Mailchimp for WooCommerce: connect blog 1 at cutover, disconnect books
- [ ] PDF invoices: set continuing invoice number sequence at cutover
- [ ] Add `cms.materialdistrict.com` in WP Engine portal; add apex/www in Vercel
- [ ] OpenProvider DNS: lower TTLs at T-7d, flip records at cutover
- [ ] SES via Gravity SMTP: verify domain identity (DKIM/SPF in OpenProvider), configure Gravity SMTP network-wide, test mail on both sites + order email cycle, then retire Postmark (not before — and never both active on one site)
- [ ] Place live test orders at cutover; refund them
- [x] ~~Decide: order history migration~~ ✅ 2026-06-11: NOT migrating; books DB = archive

---

## Open questions

*(Original questions 1–8 answered by the 2026-06-10 audit — see Phase 0.)*

1. ~~Duplicate "Netherlands" shipping zone~~ ✅ Resolved: zone 5 never used (0 orders), shadowed by zone 1 — excluded from migration.
2. ~~What consumes the Legacy REST API plugin?~~ ✅ Resolved: SendCloud (API key with read_write, last access 2026-06-10). Activate Legacy REST API on blog 1 alongside SendCloud.
3. Google Analytics: keep server-side purchase events from WooCommerce, or move all measurement to the NextJS frontend?
4. Does the NextJS frontend need the Yoast product meta (titles/descriptions), or does it generate its own SEO data?
5. Product search on the new site: Store API search, SearchWP over REST, or external (e.g., Typesense/Algolia)?
6. **Memberships & non-book products** (advertising slots, promoted content): WooCommerce vs Stripe-direct is still open. Note: one-off purchases like ad slots fit WooCommerce trivially (simple products, same checkout); recurring memberships via Stripe Billing can coexist with WooCommerce on the same Stripe account. The two paths aren't mutually exclusive — decide per product type during the NextJS build. Nothing in this migration blocks either choice.
