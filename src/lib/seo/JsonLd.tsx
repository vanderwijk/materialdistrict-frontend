import type { StructuredData } from './types'

interface JsonLdProps {
  /**
   * Eén of meerdere Schema.org JSON-LD objecten. Meerdere worden in één
   * script-tag als een array gerenderd. `null`-waarden worden gefilterd
   * zodat builders veilig conditioneel mogen returnen.
   */
  data: StructuredData | Array<StructuredData | null | undefined>
}

/**
 * JsonLd — server component die structured data rendert in een
 * `<script type="application/ld+json">` tag.
 *
 * Zet hem in de page (Server Component) waar de data thuishoort. Voor de
 * homepage en root: één Organization + WebSite. Voor detail-pagina's:
 * de specifieke entity (Product/Article/Event/Book) plus optioneel een
 * BreadcrumbList.
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
  const items = Array.isArray(data) ? data.filter(Boolean) : [data]
  if (items.length === 0) return null

  // XSS-bescherming: HTML-special chars escapen in JSON-LD strings
  const json = JSON.stringify(items.length === 1 ? items[0] : items)
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
