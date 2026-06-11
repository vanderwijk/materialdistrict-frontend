<?php
/**
 * copy-options.php
 *
 * Copies WooCommerce settings (options) from the books subsite (blog 2)
 * to the main site (blog 1). Serialized values are copied verbatim
 * (raw option_value strings), so there is no double-serialization risk.
 *
 * Included option prefixes:
 *   - woocommerce%          (core WC settings, gateway settings, shipping
 *                            method instance settings, email settings, GA integration)
 *   - wpo_wcpdf%            (PDF Invoices & Packing Slips settings)
 *
 * Excluded (kept as blog 1 defaults / handled manually):
 *   - page IDs, versions/db state, coming-soon & visibility flags
 *   - HPOS settings (blog 1 keeps HPOS; books is legacy)
 *   - WC Admin/onboarding/task state
 *   - PayPal (PPCP): site-bound onboarding -> reconnect manually
 *   - SendCloud: site-bound -> reconnect V2 manually
 *   - Mailchimp: site-bound -> connect at cutover
 *
 * Special handling:
 *   - woocommerce_stripe_settings is copied with testmode FORCED ON.
 *     Switch to live mode only at cutover (see runbook).
 *
 * Usage:
 *   wp eval-file copy-options.php --url=materialdistrict.com          # dry-run
 *   wp eval-file copy-options.php apply --url=materialdistrict.com    # execute
 *
 * Afterwards ALWAYS run:  wp cache flush --url=materialdistrict.com
 */

if ( ! defined( 'WP_CLI' ) || ! is_multisite() ) {
	echo "Run via WP-CLI on the multisite.\n";
	exit( 1 );
}

global $wpdb;

$apply = in_array( 'apply', $args ?? array(), true );

if ( get_current_blog_id() !== 1 ) {
	WP_CLI::error( 'Run with --url=materialdistrict.com (current blog must be 1).' );
}

$src = $wpdb->get_blog_prefix( 2 ) . 'options';
$dst = $wpdb->get_blog_prefix( 1 ) . 'options';

$include_patterns = array(
	'woocommerce%',
	'wpo_wcpdf%',
);

$exclude_exact = array(
	'woocommerce_db_version',
	'woocommerce_version',
	'woocommerce_schema_version',
	'woocommerce_store_id',                              // unique per store
	'woocommerce_helper_data',                           // WooCommerce.com account connection (site-bound)
	'woocommerce_feature_custom_order_tables_enabled',   // HPOS feature flag: keep blog 1 defaults
	'woocommerce_admin_install_timestamp',
	'woocommerce_newly_installed',
	'woocommerce_coming_soon',
	'woocommerce_store_pages_only',
	'woocommerce_private_link',
	'woocommerce_share_key',
	'woocommerce_demo_store',
	'woocommerce_maybe_regenerate_images_hash',
	'woocommerce_queue_flush_rewrite_rules',
	'woocommerce_permalinks', // set deliberately on blog 1; books permalinks may clash with main-site content rewrites
);

$exclude_regexes = array(
	'/_page_id$/',                        // shop/cart/checkout/myaccount/terms/refund pages: keep blog 1's own
	'/^woocommerce_custom_orders_table/', // HPOS: keep blog 1 defaults
	'/^woocommerce_admin_/',              // WC Admin state/notes
	'/^woocommerce_onboarding/',
	'/^woocommerce_task_list/',
	'/^woocommerce_marketplace/',
	'/ppcp/i',                            // PayPal Payments: re-onboard manually
	'/paypal/i',                          // belt & braces for older PayPal option names
	'/ppec/i',                            // legacy PayPal Express Checkout leftovers
	'/postnl/i',                          // woo-postnl is inactive — skip its leftovers
	'/sendcloud/i',                       // SendCloud V2: reconnect manually
	'/mailchimp/i',                       // Mailchimp: connect at cutover
	'/_transient_/',
	'/^woocommerce_meta_box_errors/',
	'/^woocommerce_tracker/',
	'/^woocommerce_allow_tracking$/',
);

/* Build query. */
$where_inc = array();
foreach ( $include_patterns as $p ) {
	$where_inc[] = $wpdb->prepare( 'option_name LIKE %s', $p );
}
$sql  = "SELECT option_name, option_value, autoload FROM `{$src}` WHERE (" . implode( ' OR ', $where_inc ) . ')';
$rows = $wpdb->get_results( $sql );

$skipped = array();
$copied  = array();

foreach ( $rows as $row ) {
	$name = $row->option_name;

	if ( in_array( $name, $exclude_exact, true ) ) {
		$skipped[] = $name;
		continue;
	}
	$excluded = false;
	foreach ( $exclude_regexes as $regex ) {
		if ( preg_match( $regex, $name ) ) {
			$excluded = true;
			break;
		}
	}
	if ( $excluded ) {
		$skipped[] = $name;
		continue;
	}

	$value = $row->option_value;

	// Force Stripe into test mode on the main site.
	if ( 'woocommerce_stripe_settings' === $name ) {
		$settings = maybe_unserialize( $value );
		if ( is_array( $settings ) ) {
			$settings['testmode'] = 'yes';
			$value = maybe_serialize( $settings );
			WP_CLI::log( '  -> woocommerce_stripe_settings: testmode forced to YES' );
		} else {
			WP_CLI::warning( 'Could not parse woocommerce_stripe_settings — copied verbatim; CHECK TEST MODE MANUALLY.' );
		}
	}

	$copied[] = $name;

	if ( $apply ) {
		$wpdb->query( $wpdb->prepare(
			"INSERT INTO `{$dst}` (option_name, option_value, autoload) VALUES (%s, %s, %s)
			 ON DUPLICATE KEY UPDATE option_value = VALUES(option_value), autoload = VALUES(autoload)",
			$name,
			$value,
			$row->autoload
		) );
	}
}

WP_CLI::log( sprintf( 'Options matched: %d | copied: %d | skipped: %d | mode: %s', count( $rows ), count( $copied ), count( $skipped ), $apply ? 'APPLY' : 'DRY-RUN' ) );
WP_CLI::log( "--- Copied ---\n" . implode( "\n", $copied ) );
WP_CLI::log( "--- Skipped (excluded) ---\n" . implode( "\n", $skipped ) );

if ( $apply ) {
	WP_CLI::success( 'Options copied.' );
	WP_CLI::log( 'NOW RUN: wp cache flush --url=materialdistrict.com  (object cache drop-in is active!)' );
	WP_CLI::log( 'Then verify in wp-admin: WooCommerce -> Settings (General/Products/Shipping/Payments/Emails).' );
	WP_CLI::log( 'Manual follow-ups: PayPal onboarding (sandbox), SendCloud V2 connect, Stripe webhook (test).' );
} else {
	WP_CLI::success( 'Dry-run complete — review the lists above, then re-run with: apply' );
}
