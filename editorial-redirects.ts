/**
 * Redactionele 301's — slugcorrecties, nieuwsbrief-URL's, inbound links.
 *
 * Yoast Redirects (Premium) en de WordPress Redirection-plugin bereiken de
 * publieke site niet: materialdistrict.com is Next.js op Vercel. Een WP-301
 * landt hooguit op cms.materialdistrict.com.
 *
 * Nieuwe regel: bron en doel zonder trailing slash (trailingSlash:true vult
 * die zelf aan). Daarna een frontend-deploy. Specifieke paden staan vóór de
 * generieke legacy-redirects in next.config.ts.
 *
 * Titelcorrecties ná publicatie (nieuwsbrief al verstuurd) hoeven hier niet
 * altijd in: WordPress onthoudt de oude post_name, en de frontend 301't die
 * vanzelf zodra de oude ISR-kopie is vervallen. Deze lijst is het vangnet
 * wanneer die kopie nóg live is, of wanneer de URL geen WP-post is.
 */

export const editorialRedirects = [
  {
    source:
      '/talk/nils-bader-marcus-vonhauser-john-penther-biobased-design-solutions-for-interior-insights-from-passionate-actors',
    destination:
      '/talk/nils-bader-marcus-vonhausen-john-penther-biobased-design-solutions-for-interior-insights-from-passionate-actors',
    permanent: true,
  },
  {
    source:
      '/talk/nils-bader-marcus-vonhauser-john-penther-biobased-design-solutions-for-interior-insights-from-passionate-actors/:path+',
    destination:
      '/talk/nils-bader-marcus-vonhausen-john-penther-biobased-design-solutions-for-interior-insights-from-passionate-actors/:path+',
    permanent: true,
  },
] as const
