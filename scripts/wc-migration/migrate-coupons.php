<?php
/**
 * migrate-coupons.php
 *
 * Migrates all shop_coupon posts from the books subsite (blog 2) to the
 * main site (blog 1). Idempotent: coupons are matched by coupon code
 * (post_title) — existing coupons on blog 1 are UPDATED, new ones created.
 * Safe to re-run for delta syncs.
 *
 * Product-ID references in coupon meta (product_ids, exclude_product_ids)
 * are remapped via sku-map.json (run build-sku-map.php first).
 * usage_count and per-user usage meta are copied so limits keep counting.
 *
 * BLOG 2 IS NEVER WRITTEN TO.
 *
 * Usage:
 *   wp eval-file migrate-coupons.php /path/to/sku-map.json --url=materialdistrict.com         # dry-run
 *   wp eval-file migrate-coupons.php /path/to/sku-map.json apply --url=materialdistrict.com   # execute
 */

if ( ! defined( 'WP_CLI' ) || ! is_multisite() ) {
	echo "Run via WP-CLI on the multisite.\n";
	exit( 1 );
}

$apply   = in_array( 'apply', $args ?? array(), true );
$mapfile = ! empty( $args[0] ) && 'apply' !== $args[0] ? $args[0] : getcwd() . '/sku-map.json';

if ( get_current_blog_id() !== 1 ) {
	WP_CLI::error( 'Run with --url=materialdistrict.com (current blog must be 1).' );
}
if ( ! file_exists( $mapfile ) ) {
	WP_CLI::error( "SKU map not found: {$mapfile} — run build-sku-map.php first." );
}

$sku_map = json_decode( file_get_contents( $mapfile ), true );
if ( ! is_array( $sku_map ) ) {
	WP_CLI::error( "Could not parse {$mapfile}." );
}
WP_CLI::log( sprintf( 'SKU map: %d products | mode: %s', count( $sku_map ), $apply ? 'APPLY' : 'DRY-RUN' ) );

/** Remap a comma-separated ID list (coupon meta format). */
function md_remap_id_list( $value, $sku_map, &$unmapped ) {
	if ( '' === $value || null === $value ) {
		return $value;
	}
	$ids     = is_array( $value ) ? $value : explode( ',', (string) $value );
	$remapped = array();
	foreach ( $ids as $id ) {
		$id = (int) trim( (string) $id );
		if ( ! $id ) {
			continue;
		}
		if ( isset( $sku_map[ $id ] ) ) {
			$remapped[] = $sku_map[ $id ];
		} else {
			$unmapped[] = $id;
		}
	}
	return implode( ',', $remapped );
}

/* ---- Read coupons from blog 2 ---- */
switch_to_blog( 2 );
$coupons = get_posts( array(
	'post_type'      => 'shop_coupon',
	'post_status'    => array( 'publish', 'draft', 'pending' ),
	'posts_per_page' => -1,
) );
$export = array();
foreach ( $coupons as $c ) {
	$meta = get_post_meta( $c->ID );
	// get_post_meta() returns arrays of raw (possibly serialized) strings.
	$flat = array();
	foreach ( $meta as $key => $values ) {
		if ( in_array( $key, array( '_edit_lock', '_edit_last' ), true ) ) {
			continue;
		}
		$flat[ $key ] = maybe_unserialize( $values[0] );
	}
	$export[] = array(
		'code'    => $c->post_title,
		'excerpt' => $c->post_excerpt,
		'status'  => $c->post_status,
		'meta'    => $flat,
	);
}
restore_current_blog();

WP_CLI::log( 'Coupons on books: ' . count( $export ) );

/* ---- Upsert into blog 1 ---- */
$created = 0;
$updated = 0;
$all_unmapped = array();

foreach ( $export as $coupon ) {
	$code = $coupon['code'];

	$existing = get_posts( array(
		'post_type'      => 'shop_coupon',
		'post_status'    => 'any',
		'title'          => $code,
		'posts_per_page' => 1,
		'fields'         => 'ids',
	) );
	$post_id = $existing ? (int) $existing[0] : 0;

	// Remap product-ID lists.
	$unmapped = array();
	foreach ( array( 'product_ids', 'exclude_product_ids' ) as $key ) {
		if ( isset( $coupon['meta'][ $key ] ) ) {
			$coupon['meta'][ $key ] = md_remap_id_list( $coupon['meta'][ $key ], $sku_map, $unmapped );
		}
	}
	if ( $unmapped ) {
		$all_unmapped[ $code ] = $unmapped;
	}

	WP_CLI::log( sprintf( '  %-20s %s%s', $code, $post_id ? "update #{$post_id}" : 'create', $unmapped ? ' (UNMAPPED product IDs: ' . implode( ',', $unmapped ) . ')' : '' ) );

	if ( ! $apply ) {
		continue;
	}

	$postarr = array(
		'post_title'   => $code,
		'post_excerpt' => $coupon['excerpt'],
		'post_status'  => $coupon['status'],
		'post_type'    => 'shop_coupon',
	);
	if ( $post_id ) {
		$postarr['ID'] = $post_id;
		$post_id = wp_update_post( $postarr, true );
	} else {
		$post_id = wp_insert_post( $postarr, true );
	}
	if ( is_wp_error( $post_id ) ) {
		WP_CLI::warning( "  FAILED {$code}: " . $post_id->get_error_message() );
		continue;
	}

	foreach ( $coupon['meta'] as $key => $value ) {
		update_post_meta( $post_id, $key, $value );
	}

	$existing ? $updated++ : $created++;
}

if ( $apply ) {
	WP_CLI::success( "Coupons migrated: {$created} created, {$updated} updated." );
	WP_CLI::log( 'Run: wp cache flush --url=materialdistrict.com' );
} else {
	WP_CLI::success( 'Dry-run complete. Re-run with: apply' );
}
if ( $all_unmapped ) {
	WP_CLI::warning( 'Coupons with product IDs that could not be remapped (product not yet on main site?): ' . implode( ', ', array_keys( $all_unmapped ) ) );
}
