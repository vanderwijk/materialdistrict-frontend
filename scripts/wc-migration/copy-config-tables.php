<?php
/**
 * copy-config-tables.php
 *
 * Copies WooCommerce configuration tables from the books subsite (blog 2)
 * to the main site (blog 1) of the MaterialDistrict multisite:
 *
 *   1. Tax rate classes        ({prefix}wc_tax_rate_classes)
 *   2. Tax rates + locations   ({prefix}woocommerce_tax_rates, _tax_rate_locations)
 *   3. Product attributes      ({prefix}woocommerce_attribute_taxonomies)
 *   4. Shipping classes        (product_shipping_class terms, slug-matched, ID-remapped)
 *   5. Shipping zones          ({prefix}woocommerce_shipping_zones, _zone_locations, _zone_methods)
 *   6. Table rates             ({prefix}woocommerce_shipping_table_rate* — rate_class remapped)
 *
 * BLOG 2 IS NEVER WRITTEN TO. The script aborts if any target table is
 * non-empty (use "force" to wipe target config tables first — never use
 * force after the main store has gone live).
 *
 * Usage (always rehearse on staging first):
 *   wp eval-file copy-config-tables.php --url=materialdistrict.com           # dry-run
 *   wp eval-file copy-config-tables.php apply --url=materialdistrict.com    # execute
 *   wp eval-file copy-config-tables.php apply force --url=materialdistrict.com
 *
 * Afterwards ALWAYS run:  wp cache flush --url=materialdistrict.com
 */

if ( ! defined( 'WP_CLI' ) || ! is_multisite() ) {
	echo "Run via WP-CLI on the multisite.\n";
	exit( 1 );
}

global $wpdb;

$apply = in_array( 'apply', $args ?? array(), true );
$force = in_array( 'force', $args ?? array(), true );

$src = $wpdb->get_blog_prefix( 2 ); // wp_2_
$dst = $wpdb->get_blog_prefix( 1 ); // wp_

if ( get_current_blog_id() !== 1 ) {
	WP_CLI::error( 'Run with --url=materialdistrict.com (current blog must be 1).' );
}

WP_CLI::log( sprintf( 'Source prefix: %s | Target prefix: %s | Mode: %s', $src, $dst, $apply ? 'APPLY' : 'DRY-RUN' ) );

/** Helper: does a table exist? */
function md_table_exists( $table ) {
	global $wpdb;
	return (bool) $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
}

/** Helper: row count. */
function md_count( $table ) {
	global $wpdb;
	return (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$table}`" );
}

/**
 * Straight table copy preserving IDs. Aborts when target is non-empty
 * unless $force. Returns rows copied (or would-copy in dry-run).
 */
function md_copy_table( $src_table, $dst_table, $apply, $force ) {
	global $wpdb;

	if ( ! md_table_exists( $src_table ) ) {
		WP_CLI::warning( "Source table {$src_table} does not exist — skipped." );
		return 0;
	}
	if ( ! md_table_exists( $dst_table ) ) {
		WP_CLI::error( "Target table {$dst_table} does not exist. Is the relevant plugin active on blog 1?" );
	}

	$n_src = md_count( $src_table );
	$n_dst = md_count( $dst_table );

	if ( $n_dst > 0 ) {
		if ( ! $force ) {
			WP_CLI::error( "Target {$dst_table} has {$n_dst} rows. Aborting (re-run with 'force' to wipe targets — only safe pre-launch)." );
		}
		WP_CLI::warning( "Wiping {$n_dst} rows from {$dst_table} (force)." );
		if ( $apply ) {
			$wpdb->query( "DELETE FROM `{$dst_table}`" );
		}
	}

	WP_CLI::log( sprintf( '%s -> %s : %d rows', $src_table, $dst_table, $n_src ) );
	if ( $apply && $n_src > 0 ) {
		$ok = $wpdb->query( "INSERT INTO `{$dst_table}` SELECT * FROM `{$src_table}`" );
		if ( false === $ok ) {
			WP_CLI::error( "Copy failed for {$dst_table}: " . $wpdb->last_error );
		}
	}
	return $n_src;
}

/* -------------------------------------------------- *
 * 1 + 2. Tax classes & rates
 * -------------------------------------------------- */
md_copy_table( "{$src}wc_tax_rate_classes", "{$dst}wc_tax_rate_classes", $apply, $force );
md_copy_table( "{$src}woocommerce_tax_rates", "{$dst}woocommerce_tax_rates", $apply, $force );
md_copy_table( "{$src}woocommerce_tax_rate_locations", "{$dst}woocommerce_tax_rate_locations", $apply, $force );

/* -------------------------------------------------- *
 * 3. Product attribute taxonomies
 * -------------------------------------------------- */
md_copy_table( "{$src}woocommerce_attribute_taxonomies", "{$dst}woocommerce_attribute_taxonomies", $apply, $force );
if ( $apply ) {
	delete_transient( 'wc_attribute_taxonomies' );
	WP_CLI::log( 'Flushed wc_attribute_taxonomies transient on blog 1.' );
}
WP_CLI::log( 'NOTE: attribute *terms* (the values) are created by the product CSV import — attributes must exist first, which this script ensures.' );

/* -------------------------------------------------- *
 * 4. Shipping classes (terms) — slug-matched, build old->new ID map
 * -------------------------------------------------- */
switch_to_blog( 2 );
$src_classes = get_terms( array(
	'taxonomy'   => 'product_shipping_class',
	'hide_empty' => false,
) );
restore_current_blog();

$class_map = array(); // old term_id => new term_id
if ( is_wp_error( $src_classes ) ) {
	WP_CLI::warning( 'Could not read shipping classes from blog 2: ' . $src_classes->get_error_message() );
	$src_classes = array();
}

WP_CLI::log( sprintf( 'Shipping classes on books: %d', count( $src_classes ) ) );

foreach ( $src_classes as $term ) {
	$existing = get_term_by( 'slug', $term->slug, 'product_shipping_class' );
	if ( $existing ) {
		$class_map[ $term->term_id ] = (int) $existing->term_id;
		WP_CLI::log( "  class '{$term->slug}': exists on blog 1 (#{$existing->term_id})" );
		continue;
	}
	if ( $apply ) {
		$new = wp_insert_term( $term->name, 'product_shipping_class', array(
			'slug'        => $term->slug,
			'description' => $term->description,
		) );
		if ( is_wp_error( $new ) ) {
			WP_CLI::error( "Failed to create shipping class '{$term->slug}': " . $new->get_error_message() );
		}
		$class_map[ $term->term_id ] = (int) $new['term_id'];
		WP_CLI::log( "  class '{$term->slug}': created as #{$new['term_id']}" );
	} else {
		$class_map[ $term->term_id ] = -1; // placeholder in dry-run
		WP_CLI::log( "  class '{$term->slug}': would be created" );
	}
}

/* -------------------------------------------------- *
 * 5. Shipping zones (zone 5 was already deleted at source 2026-06-10)
 * -------------------------------------------------- */
md_copy_table( "{$src}woocommerce_shipping_zones", "{$dst}woocommerce_shipping_zones", $apply, $force );
md_copy_table( "{$src}woocommerce_shipping_zone_locations", "{$dst}woocommerce_shipping_zone_locations", $apply, $force );
md_copy_table( "{$src}woocommerce_shipping_zone_methods", "{$dst}woocommerce_shipping_zone_methods", $apply, $force );

/* -------------------------------------------------- *
 * 6. Table Rate Shipping tables (discovered dynamically) + rate_class remap
 * -------------------------------------------------- */
$tr_tables = $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $src . 'woocommerce_shipping_table_rate' ) . '%' ) );
if ( empty( $tr_tables ) ) {
	WP_CLI::warning( 'No table-rate tables found on blog 2.' );
}
foreach ( $tr_tables as $src_table ) {
	$dst_table = $dst . substr( $src_table, strlen( $src ) );
	md_copy_table( $src_table, $dst_table, $apply, $force );

	// Remap shipping-class IDs in the rates table (column: rate_class).
	if ( $apply && false !== strpos( $src_table, 'table_rates' ) ) {
		$has_col = $wpdb->get_var( "SHOW COLUMNS FROM `{$dst_table}` LIKE 'rate_class'" );
		if ( $has_col ) {
			foreach ( $class_map as $old_id => $new_id ) {
				if ( $new_id > 0 && $old_id !== $new_id ) {
					$wpdb->query( $wpdb->prepare(
						"UPDATE `{$dst_table}` SET rate_class = %s WHERE rate_class = %s",
						(string) $new_id,
						(string) $old_id
					) );
				}
			}
			WP_CLI::log( "Remapped rate_class IDs in {$dst_table} (" . count( $class_map ) . ' classes).' );
		}
	}
}

/* -------------------------------------------------- *
 * Done
 * -------------------------------------------------- */
WP_CLI::success( ( $apply ? 'Config tables copied.' : 'Dry-run complete — nothing written.' ) );
WP_CLI::log( 'NEXT: run copy-options.php, then: wp cache flush --url=materialdistrict.com' );
WP_CLI::log( 'Then verify zones/methods/rates in wp-admin on the main site.' );
