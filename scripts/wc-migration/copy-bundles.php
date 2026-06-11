<?php
/**
 * copy-bundles.php
 *
 * Copies WooCommerce Product Bundles composition data from the books
 * subsite (blog 2) to the main site (blog 1):
 *
 *   {prefix}woocommerce_bundled_items     (bundle_id + product_id remapped via SKU map)
 *   {prefix}woocommerce_bundled_itemmeta  (re-linked to the new bundled_item_id)
 *
 * FIRST check whether this script is even needed: Product Bundles has CSV
 * import/export support — if the product CSV round-trip already recreated
 * the bundles correctly on blog 1 (verify a few bundles in wp-admin),
 * skip this script entirely.
 *
 * Idempotency: in apply mode the blog-1 bundled-items tables are WIPED and
 * rebuilt from blog 2 (safe pre-launch: blog 1 catalog is a copy).
 *
 * BLOG 2 IS NEVER WRITTEN TO.
 *
 * Usage:
 *   wp eval-file copy-bundles.php /path/to/sku-map.json --url=materialdistrict.com         # dry-run
 *   wp eval-file copy-bundles.php /path/to/sku-map.json apply --url=materialdistrict.com   # execute
 */

if ( ! defined( 'WP_CLI' ) || ! is_multisite() ) {
	echo "Run via WP-CLI on the multisite.\n";
	exit( 1 );
}

global $wpdb;

$apply   = in_array( 'apply', $args ?? array(), true );
$mapfile = ! empty( $args[0] ) && 'apply' !== $args[0] ? $args[0] : getcwd() . '/sku-map.json';

if ( get_current_blog_id() !== 1 ) {
	WP_CLI::error( 'Run with --url=materialdistrict.com (current blog must be 1).' );
}
if ( ! file_exists( $mapfile ) ) {
	WP_CLI::error( "SKU map not found: {$mapfile} — run build-sku-map.php first." );
}
$sku_map = json_decode( file_get_contents( $mapfile ), true );

$src = $wpdb->get_blog_prefix( 2 );
$dst = $wpdb->get_blog_prefix( 1 );

$src_items = "{$src}woocommerce_bundled_items";
$src_meta  = "{$src}woocommerce_bundled_itemmeta";
$dst_items = "{$dst}woocommerce_bundled_items";
$dst_meta  = "{$dst}woocommerce_bundled_itemmeta";

foreach ( array( $src_items, $src_meta, $dst_items, $dst_meta ) as $t ) {
	if ( ! $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $t ) ) ) {
		WP_CLI::error( "Table {$t} not found. Is Product Bundles active on both sites?" );
	}
}

$items = $wpdb->get_results( "SELECT * FROM `{$src_items}` ORDER BY bundled_item_id", ARRAY_A );
WP_CLI::log( sprintf( 'Bundled items on books: %d | mode: %s', count( $items ), $apply ? 'APPLY' : 'DRY-RUN' ) );

if ( $apply ) {
	$wpdb->query( "DELETE FROM `{$dst_meta}`" );
	$wpdb->query( "DELETE FROM `{$dst_items}`" );
	WP_CLI::log( 'Cleared blog-1 bundled-items tables.' );
}

$copied  = 0;
$skipped = array();

foreach ( $items as $item ) {
	$old_item_id = (int) $item['bundled_item_id'];
	$old_product = (int) $item['product_id'];
	$old_bundle  = (int) $item['bundle_id'];

	if ( ! isset( $sku_map[ $old_product ], $sku_map[ $old_bundle ] ) ) {
		$skipped[] = "item #{$old_item_id} (product {$old_product} -> " . ( $sku_map[ $old_product ] ?? '?' ) . ", bundle {$old_bundle} -> " . ( $sku_map[ $old_bundle ] ?? '?' ) . ')';
		continue;
	}

	$new_item              = $item;
	$new_item['product_id'] = $sku_map[ $old_product ];
	$new_item['bundle_id']  = $sku_map[ $old_bundle ];
	unset( $new_item['bundled_item_id'] ); // new auto-increment

	if ( $apply ) {
		$ok = $wpdb->insert( $dst_items, $new_item );
		if ( false === $ok ) {
			WP_CLI::warning( "Insert failed for item #{$old_item_id}: " . $wpdb->last_error );
			continue;
		}
		$new_item_id = (int) $wpdb->insert_id;

		$metas = $wpdb->get_results( $wpdb->prepare( "SELECT meta_key, meta_value FROM `{$src_meta}` WHERE bundled_item_id = %d", $old_item_id ), ARRAY_A );
		foreach ( $metas as $m ) {
			$wpdb->insert( $dst_meta, array(
				'bundled_item_id' => $new_item_id,
				'meta_key'        => $m['meta_key'],
				'meta_value'      => $m['meta_value'],
			) );
		}
	}
	$copied++;
}

if ( $apply ) {
	WP_CLI::success( "Copied {$copied} bundled items (+meta)." );
	WP_CLI::log( 'Run: wp cache flush --url=materialdistrict.com — then spot-check a few bundles in wp-admin AND on a (coming-soon-bypassed) product page.' );
} else {
	WP_CLI::success( "Dry-run: {$copied} bundled items would be copied." );
}
if ( $skipped ) {
	WP_CLI::warning( count( $skipped ) . ' items skipped (no SKU mapping):' );
	foreach ( $skipped as $s ) {
		WP_CLI::log( '  ' . $s );
	}
}
