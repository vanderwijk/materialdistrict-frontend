# WooCommerce migration scripts — books → main site

WP-CLI scripts that duplicate the bookstore configuration and data from
`books.materialdistrict.com` (blog 2) to `materialdistrict.com` (blog 1).
Companion to `docs/woocommerce-migration-plan.md` (Phases 2–4).

**Blog 2 is never written to by any script.** Every script defaults to
dry-run; nothing is written without the `apply` argument.

## Prerequisites

- WooCommerce + extensions active on blog 1 (done 2026-06-11)
- Rehearse the full sequence on a **WP Engine staging copy** before production
- Upload these scripts to the server (e.g. `~/wc-migration/`) or run from a
  checkout; run all commands from the WP install root

## Run order

```bash
cd ~/sites/materia          # WP install root
SCRIPTS=~/wc-migration

# 1. Config tables: tax, attributes, shipping classes/zones, table rates
wp eval-file $SCRIPTS/copy-config-tables.php --url=materialdistrict.com          # dry-run
wp eval-file $SCRIPTS/copy-config-tables.php apply --url=materialdistrict.com

# 2. Settings/options (Stripe forced to test mode; PayPal/SendCloud/Mailchimp excluded)
wp eval-file $SCRIPTS/copy-options.php --url=materialdistrict.com                # dry-run, review lists!
wp eval-file $SCRIPTS/copy-options.php apply --url=materialdistrict.com

# 3. Flush object cache (WP Engine object-cache drop-in is active)
wp cache flush --url=materialdistrict.com

# 4. Products: WooCommerce CSV export (books admin) → import (main-site admin).
#    Tick "export custom meta" on export; on re-runs tick "update existing
#    products" (matched by SKU). Images sideload from the live books site.

# 5. SKU map (after every product import/delta)
wp eval-file $SCRIPTS/build-sku-map.php /tmp/sku-map.json --url=materialdistrict.com

# 6. Coupons (idempotent — re-run any time for delta sync)
wp eval-file $SCRIPTS/migrate-coupons.php /tmp/sku-map.json --url=materialdistrict.com
wp eval-file $SCRIPTS/migrate-coupons.php /tmp/sku-map.json apply --url=materialdistrict.com

# 7. Product Bundles — ONLY if the CSV import did not already recreate
#    bundles correctly (check a few bundles in wp-admin first!)
wp eval-file $SCRIPTS/copy-bundles.php /tmp/sku-map.json --url=materialdistrict.com
wp eval-file $SCRIPTS/copy-bundles.php /tmp/sku-map.json apply --url=materialdistrict.com

wp cache flush --url=materialdistrict.com
```

## Delta sync (repeat until cutover; books remains source of truth)

1. Re-run product CSV export/import with "update existing products"
2. `build-sku-map.php` (new products get new IDs)
3. `migrate-coupons.php ... apply`
4. `copy-bundles.php ... apply` if bundles changed
5. `wp cache flush --url=materialdistrict.com`

## Verification checklist (after first full run, on staging)

- [ ] WooCommerce → Settings: currency EUR, base location, tax settings match books
- [ ] Shipping zones: NL / BE&DE / EU / Rest of world + fallback, with table rates + free shipping; rates show correct shipping classes
- [ ] Tax rates table matches books (Settings → Tax)
- [ ] Product count on blog 1 ≈ 4,627; spot-check 5 products (price, stock, images, categories, attributes)
- [ ] Coupons: count matches books; spot-check one with product restrictions (IDs must point at blog-1 products)
- [ ] Bundles: open 2–3 bundles, contents/prices correct
- [ ] Stripe gateway present and in TEST mode; PayPal NOT configured (manual onboarding); SendCloud NOT connected (manual)
- [ ] PDF invoice settings present (numbering sequence set at cutover, not now)
- [ ] books.materialdistrict.com untouched and working

## Known manual steps (not scripted, by design)

| What | When |
|---|---|
| PayPal PPCP onboarding (sandbox → live) | now → cutover |
| SendCloud V2 connect on blog 1 | pre-cutover |
| Stripe webhook endpoint for cms.materialdistrict.com | test now, live at cutover |
| Mailchimp for WooCommerce connect | at cutover only |
| Product Feed PRO feeds + Merchant Center | pre-cutover / at cutover |
| PDF invoice number sequence continuation | at cutover |
