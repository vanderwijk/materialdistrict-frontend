import type { StructuredData } from './types'

interface JsonLdProps {
  /**
   * Eén of meerdere Schema.org JSON-LD objecten. Meerdere worden als één
   * document met `@graph` gerenderd (Google's aanbevolen multi-entity
   * formaat). `null`-waarden worden gefilterd zodat builders veilig
   * conditioneel mogen returnen.
   */
  data: StructuredData | Array<StructuredData | null | undefined>
}

/**
 * JsonLd — server component die structured data rendert in een
 * `<script type="application/ld+json">` tag.
 *
 * Zet hem in de page (Server Component) waar de data thuishoort. Voor de
 * homepage en root: één Organization + WebSite. Voor detail-pagina's:
 * de specifieke entity (ItemPage/Article/Event/Book) plus optioneel een
 * BreadcrumbList.
 *
 * **Waarom `@graph` i.p.v. een top-level array:** een bare JSON-array
 * mist `@context` op het root-object. Sommige clients (o.a. Safari /
 * extensions) doen `parsed["@context"].toLowerCase()` en crashen dan
 * met `undefined is not an object`. `@graph` is één object met context.
 *
 * **Veiligheid:** JSON.stringify ontsnapt automatisch `<` en `>` niet, dus
 * we vervangen ze om script-tag-injectie te voorkomen wanneer user-content
 * in de data zit (bv. een artikel-titel met `</script>` als typo).
 *
 * @example
 *   <JsonLd data={[buildOrganization(), buildWebSite()]} />
 *
 * @example
 *   <JsonLd data={buildProduct(material)} />
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = (
    Array.isArray(data) ? data.filter(Boolean) : [data]
  ) as StructuredData[]
  if (items.length === 0) return null

  const payload =
    items.length === 1
      ? items[0]
      : {
          '@context': 'https://schema.org' as const,
          '@graph': items.map(stripContext),
        }

  // XSS-bescherming: HTML-special chars escapen in JSON-LD strings
  const json = JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

/** Nested `@graph`-nodes erven context van de parent — strip duplicaat. */
function stripContext(item: StructuredData): Omit<StructuredData, '@context'> {
  const { '@context': _context, ...rest } = item
  return rest
}
