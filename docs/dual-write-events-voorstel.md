# Dual write — interactions-events naar RDS (counts) + WP (leads)

> Supporting doc bij de mail. Analyse op `materialdistrict-plugin-master` (19-06).
> Beantwoordt de twee open punten zelf: **wie splitst** en **welke bron telt**.

## Bevinding

- **Interactions-route** (`rest-interaction-events.php`) schrijft nu alleen WP:
  - `website_click` → `md_interaction_increment_brand_website_clicks()` → brand-meta
    `_brand_website_clicks` (aggregate-only).
  - `brochure_download` → attachment-meta `_brochure_downloads` +
    `md_interaction_create_brochure_download_lead()` (lead-CPT, status Download).
- **Analytics-laag** heeft alles al klaar:
  - `md_analytics_submit_event( array $event )` — stuurt een event de AWS/RDS-keten in.
  - `md_analytics_validate_event( $params, $user )` — bouwt + valideert het event-array.
  - `website_click` én `brochure_download` staan **al** in `md_analytics_event_types()`;
    `brand` en `material` in `md_analytics_object_types()`. De keten accepteert ze dus al.
  - `md_analytics_api_get_total_count( $object_type, $object_id, $event_type )` — leest
    een totaaltelling **uit RDS**.

Geen nieuwe event-types of endpoints nodig — alleen verbinden.

## Voorstel 1 — wie splitst: de backend

De interactions-route forwardt ná het WP-werk de count naar RDS. De **frontend verandert
niets** (blijft via `/api/interactions/events`). Eén helper, twee call-sites.

```php
/**
 * Mirror an interaction to the analytics chain (RDS) — counts/trends only.
 * Leads + manufacturer follow-up stay in WordPress.
 */
function md_interaction_forward_to_analytics( $event_type, $object_type, $object_id, WP_User $user ) {
	if ( ! function_exists( 'md_analytics_submit_event' ) || ! md_analytics_aws_api_enabled() ) {
		return;
	}

	$event = md_analytics_validate_event(
		array(
			'event_type'  => $event_type,
			'object_type' => $object_type,
			'object_id'   => (string) $object_id,
			'source'      => 'interactions',
		),
		$user
	);

	if ( ! is_wp_error( $event ) ) {
		md_analytics_submit_event( $event );
	}
}
```

Call-sites (ná het bestaande WP-werk, vóór de return):

```php
// in md_interaction_handle_website_click(), na increment_brand_website_clicks():
md_interaction_forward_to_analytics( 'website_click', 'brand', $brand_id, $user );

// in md_interaction_handle_brochure_download(), na het aanmaken van de lead:
md_interaction_forward_to_analytics( 'brochure_download', 'material', $material_id, $user );
```

## Voorstel 2 — welke bron telt: RDS

RDS wordt de bron voor de **statistiek**. Het manufacturer-dashboard leest de counts via
de bestaande `md_analytics_api_get_total_count()`:

- website-clicks: `md_analytics_api_get_total_count( 'brand', $brand_id, 'website_click' )`
- brochure-downloads: `md_analytics_api_get_total_count( 'material', $material_id, 'brochure_download' )`

De WP-meta `_brand_website_clicks` / `_brochure_downloads` kan vervallen, of als fallback
blijven voor als de keten down is — jouw keuze. De **lead-CPT blijft in WP** (operationeel /
CRM; hoort niet in RDS).

## Dubbeltelling vermijden

Deze twee events gaan **uitsluitend** via de interactions-route (die forwardt) — niet óók
rechtstreeks vanuit de frontend via `/md/v2/events`. Zolang dat zo blijft (nu het geval),
telt elke klik/download precies één keer in RDS.
