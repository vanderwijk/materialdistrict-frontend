# Frontend handoff — channels + featured slots

Datum: 2026-06-04

Backend commit:
- `a130c07` — `Add theme channels and featured slot APIs`

Deploy:
- push naar `master` in `materialdistrict-plugin` triggert automatisch de WP Engine deploy via `.github/workflows/main.yml`
- live deploy is bevestigd op `materialdistrict.com`

## 1. Channels

Afspraak is nu live:
- frontend blijft lezen op `meta.channels`
- `meta.channels` geeft nu de `theme`-taxonomie terug
- `meta.themes` wordt niet meer opgebouwd in de publieke single-item REST response

Live gecontroleerd op:

```bash
curl -s 'https://cms.materialdistrict.com/wp-json/wp/v2/material/136960?_fields=id,slug,meta.channels'
```

Response-vorm:

```json
{
  "id": 136960,
  "slug": "mush-surfaces-bio-lithic-edition",
  "meta": {
    "channels": [
      {
        "id": 79,
        "slug": "biobased",
        "label": "Biobased"
      },
      {
        "id": 920,
        "slug": "biodegradable",
        "label": "Biodegradable"
      }
    ]
  }
}
```

Opmerking:
- bij een eerste collection-call kwam nog kort een oude cached response langs met `meta.themes`
- single-item checks gaven direct de nieuwe live shape terug
- voor verificatie dus liever een single-item endpoint gebruiken dan een collection endpoint

## 2. Featured slots

Nieuw dashboard-contract staat live:

- `GET /wp-json/md/v2/dashboard/brands/{brandId}/featured-slots`
- `POST /wp-json/md/v2/dashboard/brands/{brandId}/featured-slots`
- `DELETE /wp-json/md/v2/dashboard/brands/{brandId}/featured-slots/{slotId}`

Regels in backend:
- alleen voor Partner brands
- max `4` slots per membership-periode
- 1 slot = 1 kalenderweek, maandag t/m zondag
- minimaal 7 dagen vooruit boeken
- reset op Stripe membership end date (`_brand_membership_valid_until`)
- geen featured WooCommerce-flow in v1

Live route-bestaan gecontroleerd op:

```bash
curl -s 'https://cms.materialdistrict.com/wp-json/md/v2/dashboard/brands/1/featured-slots'
```

Response:

```json
{
  "code": "md_auth_unauthenticated",
  "message": "Not authenticated.",
  "data": {
    "status": 401
  }
}
```

Dat is hier correct: de route bestaat live en vraagt auth.

### Verwachte response-shape

`GET /featured-slots` retourneert:

```json
{
  "featured_slots_total": 4,
  "featured_slots_used": 0,
  "featured_slots_reset_date": null,
  "slots": [
    {
      "id": "slot_uuid",
      "material_id": 123,
      "material_name": "Example material",
      "material_slug": "example-material",
      "week_start": "2026-07-13",
      "week_end": "2026-07-19",
      "status": "scheduled",
      "is_featured_now": false,
      "created_at": "2026-06-04T10:00:00+00:00"
    }
  ]
}
```

### POST body

```json
{
  "material_id": 123,
  "week_start": "2026-07-13"
}
```

### DELETE

```text
DELETE /wp-json/md/v2/dashboard/brands/{brandId}/featured-slots/{slotId}
```

Alleen `scheduled` slots zijn annuleerbaar.

## 3. Featured fields op publieke content

Op material staat nu ook live:
- `meta.is_featured_now`
- `meta.featured_week_start`

Live gecontroleerd op:

```bash
curl -s 'https://cms.materialdistrict.com/wp-json/wp/v2/material/136960?_fields=id,slug,meta.brand_id,meta.channels,meta.is_featured_now,meta.featured_week_start'
```

Response:

```json
{
  "id": 136960,
  "slug": "mush-surfaces-bio-lithic-edition",
  "meta": {
    "brand_id": 133964,
    "is_featured_now": false,
    "featured_week_start": null,
    "channels": [
      {
        "id": 79,
        "slug": "biobased",
        "label": "Biobased"
      },
      {
        "id": 920,
        "slug": "biodegradable",
        "label": "Biodegradable"
      }
    ]
  }
}
```

## 4. Membership fields voor dashboard

Via de membership-payload zijn nu beschikbaar:
- `featured_slots_total`
- `featured_slots_used`
- `featured_slots_reset_date`

Publiek gecontroleerd op de brand uit bovenstaand material:

```bash
curl -s 'https://cms.materialdistrict.com/wp-json/wp/v2/brand/133964?_fields=id,slug,meta.membership'
```

Response:

```json
{
  "id": 133964,
  "slug": "mush-composites",
  "meta": {
    "membership": {
      "tier": "free",
      "tier_grandfathered": null,
      "membership_status": "inactive",
      "valid_until": null,
      "cancel_at_period_end": false,
      "stripe_customer_id": null,
      "stripe_subscription_id": null,
      "has_active_membership": false,
      "is_member": false,
      "period_end_date": null,
      "status": "inactive",
      "featured_slots_total": 4,
      "featured_slots_used": 0,
      "featured_slots_reset_date": null
    }
  }
}
```

## 5. Featured + offline materiaal

Live (plugin commit `3e9d10f`):

- `is_featured_now` = kalenderweek **active** én materiaal **publish** (online).
- Offline tijdens geboekte week: niet zichtbaar op site; week blijft geboekt; quota telt door.
- Geen blokkade op offline/draft/delete.

Dashboard materials-lijst (`GET …/brands/{brandId}/materials`):

- `featured_state`: `active` | `scheduled` | `null` (kalender, niet zichtbaarheid).
- `featured_week_start`: ISO-maandag of `null`.

Zie ook `handoff-claude.md` (frontend/test-samenvatting).

## 6. Niet live end-to-end getest

Nog niet live functioneel getest:
- authenticated `GET/POST/DELETE /featured-slots`
- `/md/v2/auth/me` met de nieuwe featured slot velden op `connected_brands[]`

Daarvoor is een geldige Bearer token nodig.