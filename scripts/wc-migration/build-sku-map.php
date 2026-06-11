<?php
/**
 * build-sku-map.php
 *
 * Builds a JSON map of  { old blog-2 product ID  =>  new blog-1 product ID }
 * matched by SKU (ISBN). Covers products AND variations. Run AFTER the
 * product CSV import into blog 1.
 *
 * Output file: sku-map.json (in the current working directory), plus a
 * report of products that could not be matched.
 *
 * Usage:
 *   wp eval-file build-sku-map.php --url=materialdistrict.com
 *   wp eval-file build-sku-map.php /path/to/sku-map.json --url=materialdistrict.com
 */

if ( ! defined( 'WP_CLI' ) || ! is_multisite() ) {
	echo "Run via WP-CLI on the multisite.\n";
	exit( 1 );
}

global $wpdb;

$outfile = ! empty( $args[0] ) ? $args[0] : getcwd() . '/sku-map.json';

$src = $wpdb->get_blog_prefix( 2 );
$dst = $wpdb->get_blog_prefix( 1 );

$query = "
	SELECT p.ID AS id, m.meta_value AS sku, p.post_type AS type, p.post_status AS status
	FROM `%sposts` p
	JOIN `%spostmeta` m ON m.post_id = p.ID AND m.meta_key = '_sku'
	WHERE p.post_type IN ('product', 'product_variation')
	  AND p.post_status NOT IN ('trash', 'auto-draft')
	  AND m.meta_value <> ''
";

$src_rows = $wpdb->get_results( sprintf( $query, $src, $src ) );
$dst_rows = $wpdb->get_results( sprintf( $query, $dst, $dst ) );

WP_CLI::log( sprintf( 'Books products/variations with SKU: %d | Main-site: %d', count( $src_rows ), count( $dst_rows ) ) );

/* Index target by SKU; flag duplicates. */
$dst_by_sku = array();
$dup_dst    = array();
foreach ( $dst_rows as $r ) {
	if ( isset( $dst_by_sku[ $r->sku ] ) ) {
		$dup_dst[ $r->sku ] = true;
	}
	$dst_by_sku[ $r->sku ] = (int) $r->id;
}

$map      = array();
$missing  = array();
$dup_src  = array();
$seen_src = array();

foreach ( $src_rows as $r ) {
	if ( isset( $seen_src[ $r->sku ] ) ) {
		$dup_src[ $r->sku ] = true;
	}
	$seen_src[ $r->sku ] = true;

	if ( isset( $dst_by_sku[ $r->sku ] ) ) {
		$map[ (int) $r->id ] = $dst_by_sku[ $r->sku ];
	} else {
		$missing[] = array( 'id' => (int) $r->id, 'sku' => $r->sku, 'status' => $r->status );
	}
}

/* Fallback for products WITHOUT a SKU: match by slug (post_name).
 * The WC CSV importer preserves slugs, so this is reliable for products
 * imported from books. */
$no_sku_query = "
	SELECT p.ID AS id, p.post_name AS slug, p.post_title AS title, p.post_status AS status, p.post_type AS type
	FROM `%sposts` p
	LEFT JOIN `%spostmeta` m ON m.post_id = p.ID AND m.meta_key = '_sku'
	WHERE p.post_type IN ('product', 'product_variation')
	  AND p.post_status NOT IN ('trash', 'auto-draft')
	  AND ( m.meta_value IS NULL OR m.meta_value = '' )
";
$src_no_sku = $wpdb->get_results( sprintf( $no_sku_query, $src, $src ) );
$dst_no_sku = $wpdb->get_results( sprintf( $no_sku_query, $dst, $dst ) );

$dst_by_slug = array();
foreach ( $dst_no_sku as $r ) {
	if ( '' !== $r->slug ) {
		$dst_by_slug[ $r->slug ] = (int) $r->id;
	}
}

$dst_by_title = array();
foreach ( $dst_no_sku as $r ) {
	if ( '' !== trim( $r->title ) ) {
		$dst_by_title[ trim( $r->title ) ] = (int) $r->id;
	}
}

$no_sku     = array(); // truly unmatched
$slug_hits  = 0;
$title_hits = 0;
foreach ( $src_no_sku as $r ) {
	if ( isset( $map[ (int) $r->id ] ) ) {
		continue;
	}
	if ( '' !== $r->slug && isset( $dst_by_slug[ $r->slug ] ) ) {
		$map[ (int) $r->id ] = $dst_by_slug[ $r->slug ];
		$slug_hits++;
	} elseif ( '' !== trim( $r->title ) && isset( $dst_by_title[ trim( $r->title ) ] ) ) {
		// Fallback 2: exact title match (CSV import regenerates slugs from
		// titles, so customized books slugs won't slug-match).
		$map[ (int) $r->id ] = $dst_by_title[ trim( $r->title ) ];
		$title_hits++;
	} else {
		$no_sku[] = $r;
	}
}
if ( $slug_hits || $title_hits ) {
	WP_CLI::log( "Fallback matches: {$slug_hits} by slug, {$title_hits} by title." );
}

file_put_contents( $outfile, wp_json_encode( $map, JSON_PRETTY_PRINT ) );

WP_CLI::success( sprintf( 'Mapped %d products -> %s', count( $map ), $outfile ) );

if ( $dup_src ) {
	WP_CLI::warning( 'DUPLICATE SKUs on books (mapping ambiguous): ' . implode( ', ', array_keys( $dup_src ) ) );
}
if ( $dup_dst ) {
	WP_CLI::warning( 'DUPLICATE SKUs on main site: ' . implode( ', ', array_keys( $dup_dst ) ) );
}
if ( $missing ) {
	WP_CLI::warning( count( $missing ) . ' books products have no SKU match on the main site (not yet imported?):' );
	foreach ( array_slice( $missing, 0, 25 ) as $m ) {
		WP_CLI::log( "  #{$m['id']} [{$m['status']}] SKU {$m['sku']}" );
	}
	if ( count( $missing ) > 25 ) {
		WP_CLI::log( '  ... and ' . ( count( $missing ) - 25 ) . ' more' );
	}
}
if ( $no_sku ) {
	WP_CLI::warning( count( $no_sku ) . ' books products/variations have no SKU AND no slug match (unmappable):' );
	foreach ( array_slice( $no_sku, 0, 25 ) as $m ) {
		WP_CLI::log( "  #{$m->id} [{$m->type}/{$m->status}] slug='{$m->slug}' {$m->title}" );
	}
}
