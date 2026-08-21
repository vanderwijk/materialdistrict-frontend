# Redactie-dashboard — rechten op brand/material-content

> Supporting doc bij de mail. Analyse op `materialdistrict-plugin-master` (19-06).
> Doel: een redacteur mag ándermans brands + materialen bewerken via de bestaande
> dashboard-endpoints, zonder de eigenaar-flow voor gewone members te raken.

## Bevinding

De route-level autorisatie staat los van de inhoudelijke check: alle
`/dashboard/...`-routes registreren met `permission_callback => __return_true`
(`rest-dashboard.php` v.a. regel 1645). De échte toegangscontrole zit in één
centrale helper:

- **`md_dashboard_require_managed_brand( WP_User $user, $brand_id )`**
  (`rest-dashboard.php:62`) — bepaalt of de user de brand mag beheren via de
  `connected_brand_id` user-meta. Wordt aangeroepen door ~18 endpoints over
  `rest-dashboard.php` + `rest-dashboard-batch2/3/4.php` (profile, materials,
  media, materials/{id}, enz.).
- **`md_dashboard_require_brand_material( $brand_id, $material_id )`**
  (`rest-dashboard-batch3.php:561`) — is alléén een relatie-check
  (`_material_brand` == brand_id), geen ownership-check. Hoeft **niet** aangepast.

Eén plek aanpassen volstaat dus voor alle brand- en materiaal-endpoints.

## Voorstel

Capability-bypass vóór de `connected_brand_id`-check. Gebruik `edit_others_posts`
— exact de capability die je al gebruikt voor cross-author attachments in
`rest-dashboard-batch3.php:1351`. Een redacteur = WP-rol met die cap (standaard
de Editor-rol, of een custom "Redacteur"-rol).

```php
function md_dashboard_require_managed_brand( WP_User $user, $brand_id ) {
	$brand_id = absint( $brand_id );
	$brand    = md_get_brand_post( $brand_id );

	if ( ! $brand instanceof WP_Post ) {
		return new WP_Error(
			'md_dashboard_brand_not_found',
			__( 'Brand not found.', 'materiaplugin' ),
			array( 'status' => 404 )
		);
	}

	// Editors (edit_others_posts) may manage any brand — same capability already
	// used for cross-author attachments in rest-dashboard-batch3.php.
	if ( ! user_can( $user->ID, 'edit_others_posts' ) ) {
		$linked_ids = get_user_meta( $user->ID, 'connected_brand_id', false );
		$linked_ids = is_array( $linked_ids ) ? array_map( 'absint', $linked_ids ) : array();

		if ( ! in_array( $brand_id, $linked_ids, true ) ) {
			return new WP_Error(
				'md_dashboard_brand_not_found',
				__( 'Brand not found.', 'materiaplugin' ),
				array( 'status' => 404 )
			);
		}
	}

	if ( in_array( $brand->post_status, array( 'trash', 'auto-draft' ), true ) ) {
		return new WP_Error(
			'md_dashboard_brand_not_found',
			__( 'Brand not found.', 'materiaplugin' ),
			array( 'status' => 404 )
		);
	}

	return $brand;
}
```

Alleen de `if`-wrapper rond de bestaande check is nieuw; de eigenaar-flow voor
gewone members blijft byte-voor-byte gelijk.

## Wat dit wél en niet dekt

- **Wél (met deze ene patch):** brand-profiel, materials (CRUD), media — alles wat
  via `require_managed_brand` loopt, in één keer admin-breed.
- **Niet:** stories, events, talks, books en gebruikersbeheer hebben op dit moment
  **geen** dashboard-endpoints (worden nu in wp-admin gedaan). Een redactie-dashboard
  voor die entiteiten is nieuwbouw (nieuwe REST-endpoints), geen capability-bypass.

## Open punt voor jou

- Akkoord met `edit_others_posts`, of liever een eigen cap (bv. `md_manage_content`)
  voor een aparte Redacteur-rol zonder de bredere wp-admin-rechten van Editor?
