<?php
/**
 * MaterialDistrict — import van de redactionele contentpagina's
 * ======================================================================
 * Maakt of werkt de WP-pages bij die de headless frontend rendert:
 * About, Our Mission, Innovation Fund, FAQ en Privacy Statement.
 *
 * Draaien vanuit de WP-root:
 *
 *   wp eval-file scripts/wp-import-pages.php            # droogloop
 *   wp eval-file scripts/wp-import-pages.php --apply    # schrijft echt
 *
 * Zonder `--apply` verandert er niets: het script laat alleen zien wat het
 * zou doen. Hetzelfde patroon als de channel- en materiaaltype-migraties.
 *
 * Herhaalbaar: matcht op slug. Bestaat de pagina, dan wordt de inhoud
 * bijgewerkt; bestaat hij niet, dan wordt hij aangemaakt. Een tekstrevisie
 * is dus opnieuw draaien — geen knip- en plakwerk in de editor.
 *
 * LET OP — de slugs hieronder moeten gelijk blijven aan
 * `src/lib/config/static-pages.ts` (de allowlist van de frontend) en, voor
 * `faq`, aan de eigen route `src/app/faq/page.tsx`. Wijzigt een slug hier,
 * wijzig hem daar mee, anders geeft de route een 404.
 *
 * De FAQ-HTML moet de vorm `<h2>` = categorie, `<h3>` = vraag houden: de
 * frontend trekt daar de uitklapbare vragen en het FAQPage-schema uit.
 *
 * Bron: MaterialDistrict_Website_Content_EN_rev31-07.docx (31-07-2026).
 * Nog te bevestigen vóór publicatie: de aantallen in About (merken,
 * materialen, nieuwsbriefabonnees) en de juridische toets op de
 * privacyverklaring. Die staan hieronder als [TO CONFIRM] gemarkeerd.
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	echo "Dit script hoort via WP-CLI te draaien.\n";
	return;
}

// WP-CLI often strips leading `--` flags before they reach eval-file.
// Accept bare `apply` as well as `--apply` (same pattern as other MD scripts).
$argv_all = isset( $GLOBALS['argv'] ) && is_array( $GLOBALS['argv'] ) ? $GLOBALS['argv'] : array();
$cli_args = isset( $args ) && is_array( $args ) ? $args : array();
$apply    = in_array( '--apply', $argv_all, true )
	|| in_array( 'apply', $argv_all, true )
	|| in_array( '--apply', $cli_args, true )
	|| in_array( 'apply', $cli_args, true );

/**
 * De pagina's. `slug` is leidend en wordt gematcht; `title` en `html`
 * worden bij elke run overschreven.
 */
$pages = array();

// ---------------------------------------------------------------- About
$pages[] = array(
	'slug'  => 'about',
	'title' => 'About MaterialDistrict',
	'html'  => <<<'HTML'
<p class="lede">We help the people who design and build to find, understand and apply better materials.</p>

<h2>Where we come from</h2>
<p>MaterialDistrict was founded in 1998 in Naarden, the Netherlands, as Materia. It began as a pioneering materials archive at a time when finding a genuinely new material meant knowing someone who knew someone.</p>
<p>Since then the format has changed several times. A physical archive became a digital platform. A materials library became an editorial newsroom. A single exhibition became an annual event that draws the specification market to Utrecht each spring.</p>
<p>The purpose has not changed: helping better materials reach the people who can put them to use.</p>

<h2>What we do today</h2>
<h3>We publish</h3>
<p>Independent editorial coverage of material innovation — news, research, projects and the thinking behind new materials. Written by our own editors, not reprinted from press releases.</p>
<h3>We curate</h3>
<p>A database of materials and the brands behind them, built and maintained by our editors over more than two decades. Inclusion is a choice, not an upload.</p>
<h3>We bring people together</h3>
<p>MaterialDistrict Utrecht, our annual event at the Werkspoorkathedraal, plus curated material exhibitions at partner locations throughout the year.</p>
<h3>We publish books</h3>
<p>Books and thematic guides that turn specialist material knowledge into something a designer can actually use.</p>

<h2>Facts</h2>
<ul>
<li>Founded in 1998 in Naarden, the Netherlands</li>
<li>[TO CONFIRM] brands and [TO CONFIRM] materials in the curated database</li>
<li>[TO CONFIRM] professionals receive our newsletter</li>
<li>MaterialDistrict Utrecht: 10 – 12 March 2027, Werkspoorkathedraal, Utrecht</li>
</ul>

<p><em>MaterialDistrict is part of a wider family of initiatives that includes Sample.Store and Megosu.com.</em></p>
HTML
);

// ---------------------------------------------------------- Our Mission
$pages[] = array(
	'slug'  => 'our-mission',
	'title' => 'Our Mission',
	'html'  => <<<'HTML'
<p class="lede">Accelerating the adoption of sustainable material innovations. The future of the built environment depends on better material choices.</p>

<h2>Why MaterialDistrict exists</h2>
<p>Around the world, manufacturers, researchers and designers are developing materials that can help make buildings and interiors healthier, more circular and less harmful to the environment.</p>
<p>Yet even the most promising innovation creates no impact until it is discovered, understood, specified and applied.</p>
<p>That is why MaterialDistrict exists.</p>
<p>Since 1998 we have connected material innovation with the architects, interior designers, developers, engineers, contractors, public authorities and other professionals shaping the built environment.</p>

<h2>From innovation to application</h2>
<p>Innovation alone does not change the built environment. Application does.</p>
<p>MaterialDistrict bridges the gap between the people developing new materials and the people selecting and specifying them. We make relevant innovation visible, accessible and understandable, so that professionals can make better-informed material choices.</p>
<p>Every material that finds its way into a real project is a step towards a better built environment.</p>

<h2>What we mean by sustainable</h2>
<p>Sustainability is a word that can be made to mean almost anything. We have narrowed it to three themes, and we apply them to everything we select, publish and exhibit.</p>
<h3>Circularity</h3>
<p>Materials that keep their value. The biological cycle of renewable, biobased sources and their waste streams, and the technical cycle of finite materials that must be reused, recovered and upcycled rather than discarded.</p>
<h3>Wellbeing</h3>
<p>Materials that are good for the people who live and work with them. Healthy, breathable, acoustic, air-cleaning, free of harmful compounds — and beautiful.</p>
<h3>Energy Transition</h3>
<p>Materials that reduce the energy a building consumes, or that replace energy-hungry systems altogether. Insulation, smart materials, and materials that generate energy of their own.</p>

<h2>Our ambition for 2030</h2>
<p>In 2019 we made a commitment that still guides us: by 2030 at the latest, MaterialDistrict intends to give access to its platform only to circular material innovations.</p>
<p>We put our own money behind it. Since 2019, fifteen per cent of our turnover goes into the <a href="/innovation-fund">MaterialDistrict Innovation Fund</a>, which helps young companies with circular innovations take part in MaterialDistrict Utrecht when their own means fall short.</p>
<p>The shift is deliberate and gradual. Each year, the balance of what we present moves further towards circular solutions. It narrows what we show, and that is the point: a platform that shows everything helps no one choose.</p>

<h2>Independent by design</h2>
<p>Trust matters when professionals make choices that may shape a building for decades.</p>
<p>MaterialDistrict is an independent platform. We do not aim to present everything that enters the market. We select and contextualise developments based on their relevance to the built environment and to the professionals who use our platform.</p>
<p>Our role is to inform, inspire and connect. Commercial partnerships make our work possible, but they do not replace our editorial judgement.</p>

<h2>More than an online platform</h2>
<ul>
<li>Independent news and editorial coverage of material innovation.</li>
<li>A curated database of materials and the brands behind them.</li>
<li>Books and thematic guides that make specialist knowledge accessible.</li>
<li>MaterialDistrict Utrecht, our annual event dedicated to innovative materials.</li>
<li>Curated material exhibitions presented at events and partner locations.</li>
<li>Talks and knowledge programmes that connect research, industry and practice.</li>
</ul>
<p>Together, these activities help professionals discover what is possible, and help relevant innovations move closer to real-world application.</p>
HTML
);

// ------------------------------------------------------ Innovation Fund
$pages[] = array(
	'slug'  => 'innovation-fund',
	'title' => 'MaterialDistrict Innovation Fund',
	'html'  => <<<'HTML'
<p class="lede">Fifteen per cent of our turnover, invested in circular innovation.</p>

<p>Since 2019, MaterialDistrict has placed fifteen per cent of its turnover in the MaterialDistrict Innovation Fund. The fund exists for one reason: the companies developing the most interesting circular materials are often the ones least able to afford a stand at a trade event.</p>

<h2>What the fund offers</h2>
<p>Start-ups with a material innovation in Circularity, Wellbeing or Energy Transition can receive up to 75% towards their participation in MaterialDistrict Utrecht, to a maximum of &euro;3,500.</p>

<h2>Who can apply</h2>
<ul>
<li>Companies founded no more than five years ago</li>
<li>With a material innovation in Circularity, Wellbeing or Energy Transition</li>
<li>Applying to participate in MaterialDistrict Utrecht</li>
</ul>
<p>Applications are assessed by an independent advisory board.</p>

<h2>How to apply</h2>
<p>Get in touch through our <a href="/contact">contact page</a> and select the Innovation Fund as your subject. Tell us what you have developed, which of the three themes it belongs to, and when your company was founded.</p>

<p><em>The fund supports participation in MaterialDistrict Utrecht. It does not apply to platform memberships — see <a href="/become-a-partner">Brand Membership</a> for those.</em></p>
HTML
);

// ------------------------------------------------------------------ FAQ
// Structuur is functioneel: <h2> = categorie, <h3> = vraag. De frontend
// bouwt hier de uitklapbare vragen en het FAQPage-schema uit op.
$pages[] = array(
	'slug'  => 'faq',
	'title' => 'Frequently Asked Questions',
	'html'  => <<<'HTML'
<p class="lede">Answers about using MaterialDistrict, memberships, materials, brands, events and publications.</p>

<h2>General</h2>
<h3>What is MaterialDistrict?</h3>
<p>MaterialDistrict is an independent platform for material innovation in the built environment. We publish news, curate materials and brands, create books and guides, organise MaterialDistrict Utrecht and develop material exhibitions and knowledge programmes.</p>
<h3>Who is MaterialDistrict for?</h3>
<p>Architects, interior designers, developers, engineers, contractors, public authorities, students, manufacturers and anyone else working with innovative materials for architecture, interiors and construction.</p>
<h3>Is MaterialDistrict free to use?</h3>
<p>Yes. News, materials and brand profiles are open to everyone. A free account adds following channels, bookmarking and your weekly update. <a href="/membership">Insider Membership</a> adds comparison, downloads, boards, the Insider insights library and member benefits.</p>
<h3>How do I create an account?</h3>
<p>Select &ldquo;Join&rdquo; and follow the registration steps. Once you have confirmed your email address you can complete your profile and start following channels.</p>
<h3>How do I update or delete my account?</h3>
<p>Sign in and open your account settings to change your details. To request deletion, contact <a href="mailto:info@materialdistrict.com">info@materialdistrict.com</a>.</p>

<h2>For professionals and Insiders</h2>
<h3>What are channels?</h3>
<p>Channels are the themes we organise the platform around, from biobased materials to acoustics. Follow the ones relevant to your practice and everything new in them comes to you, on the platform and in your weekly update. Following is free with any account.</p>
<h3>What is an Insider?</h3>
<p>An Insider is a professional member of MaterialDistrict. Insider Membership is for architects, designers and other professionals who want in-depth content and member benefits alongside the open platform.</p>
<h3>Does MaterialDistrict sell materials?</h3>
<p>No. We help you discover materials and the companies behind them. Purchase, technical advice, availability and delivery are handled by the manufacturer or supplier.</p>
<h3>How do I request more information about a material?</h3>
<p>Use the contact option on the material page. Your request goes to the brand or supplier, who is responsible for responding.</p>
<h3>Can I request samples through MaterialDistrict?</h3>
<p>Yes. You can send a sample request to a brand from its material page, with any account. Whether a sample is available, and how quickly it arrives, is up to the supplier &mdash; telling them what your project needs makes a response far more likely. Some brands choose to accept sample requests from Insiders only.</p>
<h3>How do I receive the newsletter?</h3>
<p>Create an account or use the newsletter sign-up form. Every newsletter carries an unsubscribe link.</p>

<h2>For brands</h2>
<h3>Is my company already on MaterialDistrict?</h3>
<p>Possibly. Our editors have been adding relevant manufacturers and suppliers since 1998, so many brands have a profile they never created themselves. Search for your company name &mdash; if you find it, <a href="/contact">contact us</a> and we will hand the profile over to you.</p>
<h3>Why should my brand join MaterialDistrict?</h3>
<p>A <a href="/become-a-partner">Brand Membership</a> gives your company and materials year-round visibility among professionals who are actively researching material solutions for architecture, interiors and construction.</p>
<h3>Which Brand Membership should I choose?</h3>
<p>Free is pay-per-material and suits a brand with one or two products to show. Basic includes five materials, Plus fifteen with full statistics and lead routing, and Partner is unlimited with featured placement. Compare the current features on the Brand Membership page.</p>
<h3>What types of brands can join?</h3>
<p>Manufacturers, suppliers and distributors offering relevant materials or material-related products. Every submission is reviewed to protect the focus and quality of the platform.</p>
<h3>How do I add or update a material?</h3>
<p>Sign in to your brand account and use the tools in your dashboard.</p>
<h3>Can MaterialDistrict promote a product launch or campaign?</h3>
<p>Yes. Alongside memberships we offer editorial, newsletter, display, publication, exhibition and event opportunities. <a href="/contact">Contact our team</a> to discuss what suits your launch.</p>
<h3>Does MaterialDistrict support start-ups?</h3>
<p>Yes. Start-ups with circular material innovations can apply to the <a href="/innovation-fund">MaterialDistrict Innovation Fund</a> for up to 75% towards participation in MaterialDistrict Utrecht, to a maximum of &euro;3,500.</p>

<h2>Events, exhibitions and publications</h2>
<h3>Where can I experience materials in person?</h3>
<p>At MaterialDistrict Utrecht, our annual event, and at our curated material exhibitions. Current dates and locations are on the Events page.</p>
<h3>Does MaterialDistrict have a permanent showroom?</h3>
<p>No. Our material collections are presented through temporary exhibitions, events and partner locations.</p>
<h3>How can my company take part in MaterialDistrict Utrecht?</h3>
<p>Visit the MaterialDistrict Utrecht website for current participation options, or contact our team. Options include stands, tabletop presentations, curated material displays and programme partnerships.</p>
<h3>Where can I find MaterialDistrict books and guides?</h3>
<p>In the Books section of this website. Each product page lists language, format, price and ordering information.</p>
HTML
);

// ---------------------------------------------------- Privacy Statement
$pages[] = array(
	'slug'  => 'privacy-statement',
	'title' => 'Privacy Statement',
	'html'  => <<<'HTML'
<p><em>Last updated: [TO CONFIRM — publication date]</em></p>
<p>MaterialDistrict respects your privacy and handles personal data with care. This Privacy Statement explains what information we collect, why we use it, how long we keep it, with whom it may be shared and what rights you have.</p>

<h2>1. Who is responsible for your data?</h2>
<p>MaterialDistrict B.V. is responsible for the processing of personal data described in this statement.</p>
<p>MaterialDistrict B.V.<br>Amsterdamsestraatweg 43-A2<br>1411 AX Naarden, The Netherlands<br><a href="mailto:info@materialdistrict.com">info@materialdistrict.com</a> &middot; +31 (0)20 71 30 650</p>

<h2>2. What data do we collect?</h2>
<ul>
<li>Identity and contact details: name, email address, telephone number, postal address and company.</li>
<li>Account and profile information: profession, interests, followed channels, saved items, preferences and account settings.</li>
<li>Membership, order, payment and billing information.</li>
<li>Information you provide in contact, information or sample requests.</li>
<li>Event registration and attendance information.</li>
<li>Communication preferences and newsletter subscriptions.</li>
<li>Technical and usage data: IP address, browser type, device information, pages visited, links used and referring website.</li>
<li>Behavioural data about how the platform is used: which materials and articles are viewed, what is searched for, saved, shared or downloaded, and which brand links are followed.</li>
<li>Photographs and video recordings made at MaterialDistrict events.</li>
</ul>

<h2>3. Why do we use personal data?</h2>
<ul>
<li>To create and manage your account.</li>
<li>To provide memberships, orders, event registrations and other requested services.</li>
<li>To assemble your personal update from the channels you follow.</li>
<li>To process and route information, contact and sample requests.</li>
<li>To send newsletters and other marketing communication where permitted.</li>
<li>To respond to questions and provide support.</li>
<li>To administer events, publications, exhibitions and commercial partnerships.</li>
<li>To produce aggregated statistics for the brands whose materials are shown on the platform.</li>
<li>To improve the website, understand how it is used and protect the security of our services.</li>
<li>To comply with legal obligations and establish, exercise or defend legal claims.</li>
</ul>

<h2>4. Legal bases</h2>
<p>We process personal data only where we have a valid legal basis: performance of an agreement; your consent; compliance with a legal obligation; or our legitimate interest in operating, securing and improving MaterialDistrict and communicating with relevant professional audiences. Where processing rests on consent, you can withdraw that consent at any time.</p>

<h2>5. Analytics and platform statistics</h2>
<p>We record how the platform is used &mdash; which materials and articles are viewed, what is searched for, and which links are followed &mdash; in a separate analytics environment. We use this to improve the platform, to guide our editorial choices, and to give brands aggregated insight into how their materials are found and viewed.</p>

<h2>6. Advertising</h2>
<p>Some pages carry advertising served through Google Ad Manager. Depending on your cookie choices, this may involve cookies or similar technologies set by Google, and information about the page you are viewing may be shared with Google as the advertising provider.</p>

<h2>7. Payments</h2>
<p>Payments for memberships and orders are processed by our payment provider. Your payment details are handled by that provider under its own privacy policy; we receive only the information needed to administer your order, membership or invoice.</p>

<h2>8. Information and sample requests</h2>
<p>When you contact a brand or supplier through MaterialDistrict, the information you submit is shared with that organisation so it can respond. That organisation then processes the data under its own privacy policy. MaterialDistrict is not responsible for whether a brand accepts a request, provides a sample or responds within a particular period.</p>

<h2>9. Events and badge scanning</h2>
<p>When you register for a MaterialDistrict event we use your data to administer your registration, communicate practical information and manage the event. If you allow an exhibitor or partner to scan your badge, the relevant registration details are shared with that organisation so it can follow up. That organisation then processes the data under its own privacy policy.</p>

<h2>10. Photography and video at events</h2>
<p>Photographs and video may be recorded at MaterialDistrict events for editorial, archival and promotional purposes. We inform attendees where recording takes place. Contact us if you have a specific concern about the use of an identifiable image.</p>

<h2>11. Newsletters and marketing</h2>
<p>We send newsletters and other relevant communication when you have subscribed, requested information, or where another legal basis allows. You can unsubscribe at any time using the link in the message or by contacting us. Service messages necessary for an account, membership, order or event registration may still be sent.</p>

<h2>12. Cookies and similar technologies</h2>
<p>MaterialDistrict uses cookies and similar technologies to make the website work, remember your preferences, understand how the site is used and &mdash; where you have given consent &mdash; support personalised content and advertising. You can manage non-essential cookies through the cookie preference tool. Full details are in our cookie notice.</p>

<h2>13. Service providers and other recipients</h2>
<p>We use service providers for website hosting, email delivery, analytics, advertising, payments, customer support, event registration and administration. These parties may process personal data only as far as necessary to provide their services, and under appropriate contractual and security obligations. We may also share data where required by law, to protect legal rights, or in connection with a business reorganisation.</p>

<h2>14. International transfers</h2>
<p>Some service providers process data outside the European Economic Area. Where that happens we rely on an appropriate transfer mechanism and safeguards as required by data protection law.</p>

<h2>15. How long do we keep data?</h2>
<p>We keep personal data only as long as necessary for the purpose it was collected for, to provide our services, to meet legal and administrative obligations and to protect against legal claims. Retention periods differ by category of data. Data that is no longer needed is deleted or anonymised.</p>

<h2>16. How do we protect data?</h2>
<p>We use appropriate technical and organisational measures to protect personal data against loss, misuse, unauthorised access, disclosure or alteration. No online service can guarantee absolute security, but we review and improve our safeguards.</p>

<h2>17. Your rights</h2>
<p>Subject to applicable law you may have the right to access, correct or delete your personal data; to restrict or object to processing; to receive certain data in a portable format; and to withdraw consent. You may also lodge a complaint with the Dutch Data Protection Authority or another competent supervisory authority.</p>
<p>To exercise your rights, contact <a href="mailto:info@materialdistrict.com">info@materialdistrict.com</a>. We may ask for information needed to verify your identity.</p>

<h2>18. Account and membership cancellation</h2>
<p>You can manage your account settings after signing in. To request deletion of your account or to cancel a membership, use the option in your account or contact <a href="mailto:info@materialdistrict.com">info@materialdistrict.com</a>. Contractual notice periods and payment obligations may still apply.</p>

<h2>19. Third-party websites</h2>
<p>MaterialDistrict links to websites operated by brands, partners and other third parties. Their privacy practices are governed by their own statements. We recommend reading those before providing personal data.</p>

<h2>20. Changes to this statement</h2>
<p>We may update this Privacy Statement when our services, systems or legal obligations change. The current version and its revision date are always published on this page.</p>

<h2>21. Questions</h2>
<p>For questions about privacy or the use of your personal data, contact MaterialDistrict B.V. at <a href="mailto:info@materialdistrict.com">info@materialdistrict.com</a>.</p>
HTML
);

// ---------------------------------------------------------------- Uitvoer
WP_CLI::line( '' );
WP_CLI::line( $apply
	? '== MaterialDistrict — paginaimport (SCHRIJFMODUS) =='
	: '== MaterialDistrict — paginaimport (DROOGLOOP, niets wordt gewijzigd) ==' );
WP_CLI::line( '' );

$created = 0;
$updated = 0;
$same    = 0;

foreach ( $pages as $page ) {
	$existing = get_page_by_path( $page['slug'], OBJECT, 'page' );
	$bytes    = strlen( $page['html'] );

	if ( ! $existing ) {
		WP_CLI::line( sprintf( '  NIEUW    /%-20s  %-38s  %6d bytes', $page['slug'], $page['title'], $bytes ) );
		if ( $apply ) {
			$id = wp_insert_post( array(
				'post_type'    => 'page',
				'post_name'    => $page['slug'],
				'post_title'   => $page['title'],
				'post_content' => $page['html'],
				'post_status'  => 'publish',
			), true );
			if ( is_wp_error( $id ) ) {
				WP_CLI::warning( sprintf( '    aanmaken mislukt: %s', $id->get_error_message() ) );
				continue;
			}
		}
		$created++;
		continue;
	}

	$unchanged = trim( $existing->post_content ) === trim( $page['html'] )
		&& $existing->post_title === $page['title'];

	if ( $unchanged ) {
		WP_CLI::line( sprintf( '  GELIJK   /%-20s  %-38s  (ongewijzigd)', $page['slug'], $page['title'] ) );
		$same++;
		continue;
	}

	WP_CLI::line( sprintf( '  BIJWERK  /%-20s  %-38s  %6d bytes  (was %d)',
		$page['slug'], $page['title'], $bytes, strlen( $existing->post_content ) ) );

	if ( $apply ) {
		$res = wp_update_post( array(
			'ID'           => $existing->ID,
			'post_title'   => $page['title'],
			'post_content' => $page['html'],
			'post_status'  => 'publish',
		), true );
		if ( is_wp_error( $res ) ) {
			WP_CLI::warning( sprintf( '    bijwerken mislukt: %s', $res->get_error_message() ) );
			continue;
		}
	}
	$updated++;
}

WP_CLI::line( '' );
WP_CLI::line( sprintf( '  %d nieuw · %d bijgewerkt · %d ongewijzigd', $created, $updated, $same ) );

if ( ! $apply ) {
	WP_CLI::line( '' );
	WP_CLI::line( '  Droogloop — er is niets weggeschreven.' );
	WP_CLI::line( '  Uitvoeren met:  wp eval-file scripts/wp-import-pages.php --apply' );
}
WP_CLI::line( '' );
