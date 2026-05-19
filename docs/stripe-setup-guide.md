# Stripe setup — MaterialDistrict (manual dashboard guide)

End result: **3 products, 9 prices**. All prices in EUR, recurring, tax behavior **Exclusive**, with the lookup keys exactly as listed.

---

## Before you start

1. Open the Stripe dashboard and confirm you're in the **right sandbox** (the workspace switcher is top-left).
2. Make sure the **Test mode** toggle in the top-right is **ON**.
3. Go to **Product catalog → Products**.

For every price you create, the steps inside the price block are always the same:

- **Pricing model:** Standard pricing
- **Price:** the amount in euros
- **Currency:** EUR
- **Recurring:** Yes → pick **Monthly** or **Yearly**
- Open **More pricing options** and set:
  - **Lookup key** (the exact string from the spec)
  - **Tax behavior:** Exclusive of tax
  - **Price description** (optional but handy — values listed below)

I'll stop repeating these and just give you the variable bits per product.

---

## Product 1 — MD Insider

Click **+ Create product** (top right).

**Product info**
- Name: `MD Insider`
- Description: `Individuele Insider-abonnement op MaterialDistrict.`

**Price 1 of 2** (already in the form)
- Amount: `10.00` EUR — Recurring **Monthly**
- Lookup key: `insider_monthly`
- Tax behavior: Exclusive
- Price description: `MD Insider — monthly`

Click **+ Add another price**.

**Price 2 of 2**
- Amount: `100.00` EUR — Recurring **Yearly**
- Lookup key: `insider_annual`
- Tax behavior: Exclusive
- Price description: `MD Insider — annual`

Click **Add product** at the bottom.

---

## Product 2 — MD Brand Tier

Back on the Products page, click **+ Create product**.

**Product info**
- Name: `MD Brand Tier`
- Description: `Brand-abonnement op MaterialDistrict (Basic / Plus / Partner).`

Add the 5 prices below. All are **Yearly**, **EUR**, **Exclusive**.

| # | Amount   | Lookup key                         | Description                                 |
|---|----------|------------------------------------|---------------------------------------------|
| 1 | `750.00` | `brand_basic`                      | MD Brand — Basic (5 materialen)             |
| 2 | `1500.00`| `brand_plus`                       | MD Brand — Plus (15 materialen)             |
| 3 | `3000.00`| `brand_partner`                    | MD Brand — Partner (unlimited)              |
| 4 | `995.00` | `brand_plus_grandfathered_pro5`    | MD Brand — Plus (grandfathered ex-PRO 5)    |
| 5 | `1245.00`| `brand_plus_grandfathered_pro10`   | MD Brand — Plus (grandfathered ex-PRO 10)   |

Use **+ Add another price** between each one. Click **Add product** at the bottom.

---

## Product 3 — MD Material Publication

Click **+ Create product**.

**Product info**
- Name: `MD Material Publication`
- Description: `Losse materiaalpublicatie op MaterialDistrict (per materiaal één subscription).`

Add the 2 prices below. Both **Yearly**, **EUR**, **Exclusive**.

| # | Amount   | Lookup key                            | Description                                       |
|---|----------|---------------------------------------|---------------------------------------------------|
| 1 | `250.00` | `material_publication_regular`        | MD Material Publication — regular                 |
| 2 | `100.00` | `material_publication_grandfathered`  | MD Material Publication — grandfathered ex-MAT    |

Click **Add product**.

---

## After all 3 products exist

**Check yourself:** the Products page should show 3 rows, each one expandable to show its prices. Spot-check that one price (any one) has the right lookup key, amount, interval, and "Exclusive" tax behavior — if that one is right, the rest probably are too.

**Set up the webhook endpoint.** In the dashboard go to **Developers → Webhooks → + Add endpoint**. Point it at your WordPress webhook URL and subscribe to:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Stripe will show you a **Signing secret** (starts with `whsec_…`). Copy it — you need it in WordPress to verify webhook signatures.

**Remember the metadata convention.** When subscriptions are created (from WordPress, not in the dashboard), they must carry:

- Insider subscription: `wp_user_id`
- Brand Tier subscription: `wp_user_id`, `wp_brand_id`
- Material Publication subscription: `wp_user_id`, `wp_brand_id`, `wp_material_id`

That's how the webhook handler knows which WordPress record to update.

---

## If you get stuck

- **No "Tax behavior" or "Lookup key" field?** Click the small **More pricing options** link inside the price block — it's collapsed by default.
- **Lookup key already exists error?** A price with that key was created before. Either reuse the existing price or archive the old one first (Products → click the price → … → Archive).
- **Dashboard layout looks different from these instructions?** Stripe sometimes A/B-tests the product form. The field names ("Lookup key", "Tax behavior", "Recurring") stay the same even if the layout shifts.
