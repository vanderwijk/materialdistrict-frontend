#!/usr/bin/env bash
#
# MaterialDistrict — Stripe products & prices setup (direct API via curl)
#
# Creates 3 products and 9 prices in your Stripe account.
#
# Prerequisites
#   - jq installed:   brew install jq
#   - curl (already on macOS)
#
# Usage
#   1. Get your sandbox secret key from the Stripe dashboard:
#        Developers → API keys → Secret key   (sk_test_...)
#   2. Export it in your shell, then run the script:
#        export STRIPE_SECRET_KEY=sk_test_xxxxx
#        ./scripts/stripe-setup.sh
#
# Run this once.
# If you need to re-run, archive the existing products in the Stripe dashboard
# first — lookup keys must be unique, so a second run will error out.
#
# Spec summary:
#   Product 1 — MD Insider
#     insider_monthly                     €10   / month
#     insider_annual                      €100  / year
#   Product 2 — MD Brand Tier
#     brand_basic                         €750  / year
#     brand_plus                          €1500 / year
#     brand_partner                       €3000 / year
#     brand_plus_grandfathered_pro5       €995  / year
#     brand_plus_grandfathered_pro10      €1245 / year
#   Product 3 — MD Material Publication
#     material_publication_regular        €250  / year
#     material_publication_grandfathered  €100  / year
#
# All prices: EUR, recurring, tax_behavior=exclusive, standard pricing.

set -euo pipefail

API="https://api.stripe.com/v1"

# ---------- preflight ----------

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: '$1' is required but not installed." >&2
    exit 1
  }
}

require curl
require jq

if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
  echo "Error: STRIPE_SECRET_KEY is not set." >&2
  echo "Export your sandbox secret key first:" >&2
  echo "  export STRIPE_SECRET_KEY=sk_test_xxxxx" >&2
  exit 1
fi

# Safety: refuse live keys unless explicitly forced.
if [[ "$STRIPE_SECRET_KEY" == *"_live_"* && "${ALLOW_LIVE:-}" != "yes" ]]; then
  echo "Error: STRIPE_SECRET_KEY looks like a LIVE key." >&2
  echo "Refusing to run. Set ALLOW_LIVE=yes if this is really what you want." >&2
  exit 1
fi

echo "Using Stripe key: ${STRIPE_SECRET_KEY:0:12}…  (mode: $(
  [[ "$STRIPE_SECRET_KEY" == *"_test_"* ]] && echo test || echo live))"
read -r -p "Continue creating 3 products and 9 prices in this account? Type 'yes' to proceed: " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "Aborted."
  exit 1
fi

# ---------- helpers ----------

# stripe_post <path> <data args...>
#
# Posts to the Stripe API and returns the response body on stdout.
# Exits non-zero if Stripe returns an error.
stripe_post() {
  local path="$1"; shift
  local response http_code body
  response=$(curl -sS -w $'\n%{http_code}' \
    "${API}${path}" \
    -u "${STRIPE_SECRET_KEY}:" \
    "$@")
  http_code="${response##*$'\n'}"
  body="${response%$'\n'*}"
  if [[ "$http_code" != 2* ]]; then
    echo "Stripe API error (HTTP ${http_code}):" >&2
    echo "$body" >&2
    exit 1
  fi
  echo "$body"
}

create_product() {
  local name="$1"
  local description="$2"
  stripe_post /products \
    -d "name=${name}" \
    -d "description=${description}" \
    | jq -r '.id'
}

create_price() {
  local product_id="$1"
  local lookup_key="$2"
  local amount_cents="$3"
  local interval="$4"
  local nickname="$5"

  echo "  → price ${lookup_key} (${amount_cents}¢ / ${interval})"
  stripe_post /prices \
    -d "product=${product_id}" \
    -d "currency=eur" \
    -d "unit_amount=${amount_cents}" \
    -d "lookup_key=${lookup_key}" \
    -d "nickname=${nickname}" \
    -d "tax_behavior=exclusive" \
    -d "recurring[interval]=${interval}" \
    > /dev/null
}

# ---------- Product 1: MD Insider ----------

echo
echo "Creating Product 1: MD Insider"
INSIDER_ID=$(create_product \
  "MD Insider" \
  "Individuele Insider-abonnement op MaterialDistrict.")
echo "  product: $INSIDER_ID"

create_price "$INSIDER_ID" "insider_monthly"  1000  month "MD Insider — monthly"
create_price "$INSIDER_ID" "insider_annual"   10000 year  "MD Insider — annual"

# ---------- Product 2: MD Brand Tier ----------

echo
echo "Creating Product 2: MD Brand Tier"
BRAND_ID=$(create_product \
  "MD Brand Tier" \
  "Brand-abonnement op MaterialDistrict (Basic / Plus / Partner).")
echo "  product: $BRAND_ID"

create_price "$BRAND_ID" "brand_basic"                     75000  year "MD Brand — Basic (5 materialen)"
create_price "$BRAND_ID" "brand_plus"                      150000 year "MD Brand — Plus (15 materialen)"
create_price "$BRAND_ID" "brand_partner"                   300000 year "MD Brand — Partner (unlimited)"
create_price "$BRAND_ID" "brand_plus_grandfathered_pro5"   99500  year "MD Brand — Plus (grandfathered ex-PRO 5)"
create_price "$BRAND_ID" "brand_plus_grandfathered_pro10"  124500 year "MD Brand — Plus (grandfathered ex-PRO 10)"

# ---------- Product 3: MD Material Publication ----------

echo
echo "Creating Product 3: MD Material Publication"
MAT_ID=$(create_product \
  "MD Material Publication" \
  "Losse materiaalpublicatie op MaterialDistrict (per materiaal één subscription).")
echo "  product: $MAT_ID"

create_price "$MAT_ID" "material_publication_regular"       25000 year "MD Material Publication — regular"
create_price "$MAT_ID" "material_publication_grandfathered" 10000 year "MD Material Publication — grandfathered ex-MAT"

# ---------- summary ----------

echo
echo "Done. Created 3 products and 9 prices."
echo
echo "Product IDs:"
echo "  MD Insider:              $INSIDER_ID"
echo "  MD Brand Tier:           $BRAND_ID"
echo "  MD Material Publication: $MAT_ID"
echo
echo "Next steps:"
echo "  - Set up one webhook endpoint in the Stripe dashboard that listens to:"
echo "      customer.subscription.created"
echo "      customer.subscription.updated"
echo "      customer.subscription.deleted"
echo "      invoice.payment_failed"
echo "  - Make sure subscriptions are created with the required metadata:"
echo "      Insider:              wp_user_id"
echo "      Brand Tier:           wp_user_id, wp_brand_id"
echo "      Material Publication: wp_user_id, wp_brand_id, wp_material_id"
