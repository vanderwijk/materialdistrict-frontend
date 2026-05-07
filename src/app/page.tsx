/**
 * Smoke test homepage (tijdelijk)
 * ----------------------------------------------------------------------
 * Wordt vervangen in stap 10 (definitieve homepage).
 *
 * Doel: bewijzen dat de complete data-stack werkt tegen live WP REST API:
 *  - /wp/v2/material/<slug> → raw response
 *  - /wp/v2/media?parent=<id> → attachments
 *  - mapper → Material domain-type met opgeloste gallery
 *  - render in een server component zonder client-side JS
 *
 * Kijkt naar het OBRO material (slug `obro-leather-infused-translucent-pvc-composite`).
 * Toont titel, hero-image, gallery-thumbnails, brand-naam (als brand_id is ingevuld),
 * en een paar eigenschap-tags.
 *
 * Als ergens een fetch faalt of het material niet bestaat: toont een nette
 * foutmelding zonder de hele pagina te crashen.
 */

import { getMaterial } from '@/lib/api'
import {
  humanizeFacet,
  toMaterialTags,
} from '@/lib/utils/material-properties'

export const dynamic = 'force-dynamic' // smoke test — altijd verse fetch

export default async function HomePage() {
  // Probeer OBRO; als die er niet is/het werkt niet, vangen we netjes op.
  let error: string | null = null
  let material: Awaited<ReturnType<typeof getMaterial>> = null

  try {
    material = await getMaterial('obro-leather-infused-translucent-pvc-composite')
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <main className="container">
      <header className="smoke-header">
        <p className="smoke-eyebrow">MaterialDistrict — smoke test</p>
        <h1>Sessie 2: API & datamodel</h1>
        <p>
          Live data via <code>WP REST API</code>. Wordt vervangen in stap 10.
        </p>
      </header>

      {error ? (
        <section className="smoke-error">
          <h2>Fetch failed</h2>
          <pre>{error}</pre>
          <p>
            Controleer <code>WP_API_URL</code> in <code>.env.local</code> en
            of <code>/wp-json/wp/v2/material</code> bereikbaar is.
          </p>
        </section>
      ) : !material ? (
        <section className="smoke-error">
          <h2>Material not found</h2>
          <p>
            Slug <code>obro-leather-infused-translucent-pvc-composite</code> kon
            niet worden gevonden.
          </p>
        </section>
      ) : (
        <article>
          <h2 dangerouslySetInnerHTML={{ __html: material.title }} />

          {material.gallery.hero && (
            <figure className="smoke-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  material.gallery.hero.sizes.large?.url ??
                  material.gallery.hero.sourceUrl
                }
                alt={material.gallery.hero.alt || material.title}
                width={material.gallery.hero.width}
                height={material.gallery.hero.height}
              />
              {material.gallery.hero.caption && (
                <figcaption
                  dangerouslySetInnerHTML={{
                    __html: material.gallery.hero.caption,
                  }}
                />
              )}
            </figure>
          )}

          {material.gallery.thumbs.length > 0 && (
            <div className="smoke-thumbs">
              {material.gallery.thumbs.map((img) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={img.id}
                  src={img.sizes.thumbnail?.url ?? img.sizes.medium?.url ?? img.sourceUrl}
                  alt={img.alt || ''}
                  width={img.sizes.thumbnail?.width ?? 320}
                  height={img.sizes.thumbnail?.height ?? 200}
                />
              ))}
            </div>
          )}

          <ul className="smoke-tags">
            {toMaterialTags(material.properties).map((tag) => (
              <li key={tag.facet} className="ct-tag">
                <strong>{humanizeFacet(tag.facet)}:</strong> {tag.label}
              </li>
            ))}
          </ul>

          <section
            className="smoke-content"
            dangerouslySetInnerHTML={{ __html: material.excerptHtml }}
          />

          <dl className="smoke-meta">
            <dt>ID</dt>
            <dd>{material.id}</dd>
            <dt>Slug</dt>
            <dd>{material.slug}</dd>
            <dt>Brand ID</dt>
            <dd>{material.brandId ?? '—'}</dd>
            <dt>Sample-aanvraag uitgeschakeld</dt>
            <dd>{material.disableSampleRequest ? 'ja' : 'nee'}</dd>
            <dt>Featured</dt>
            <dd>{material.featured ? 'ja' : 'nee'}</dd>
            <dt>Gallery</dt>
            <dd>{material.gallery.total} afbeeldingen</dd>
            <dt>Datasheet</dt>
            <dd>{material.datasheetUrl ? <a href={material.datasheetUrl}>download</a> : '—'}</dd>
            <dt>EPD</dt>
            <dd>{material.epdUrl ? <a href={material.epdUrl}>download</a> : '—'}</dd>
            <dt>Video</dt>
            <dd>{material.videoUrl ?? '—'}</dd>
          </dl>
        </article>
      )}
    </main>
  )
}
