/**
 * Google Tag Manager — container ID and the official bootstrap snippet.
 * ----------------------------------------------------------------------
 * Consent Mode v2 defaults must run first (see `layout.tsx`). This snippet
 * reuses the existing `dataLayer`, so those defaults stay in effect when
 * `gtm.js` loads. Tags in the container still honour Consent Mode.
 */

export const GTM_ID = 'GTM-PBSFJ2H'

export const gtmInitScript = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
`
