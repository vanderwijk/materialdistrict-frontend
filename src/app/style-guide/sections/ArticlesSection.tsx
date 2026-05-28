/**
 * ArticlesSection — style-guide section voor de sessie-6-componenten
 * (Articles / Stories).
 *
 * Toegevoegd in sessie 6 batch 4. Demonstreert het nieuwe, distinctieve
 * deel van de articles-UI dat routing-vrij te tonen is:
 *  - Het **story-type-palet** (`STORY_TYPE_META`): de vijf types met hun
 *    accentkleur, pale-achtergrond, icoon en omschrijving. Dit is de
 *    bron-van-waarheid die zowel de type-filter, de type-pills als de
 *    type-intro-banner aanstuurt.
 *  - Een voorbeeld-article-`<ContentCard>` zoals in het overzicht-grid.
 *
 * Bewust NIET opgenomen (zelfde reden als BrandsSection):
 *  - `<ArticlesTypeFilter>`, `<ArticlesSearchInput>`, `<ArticlesPagination>`
 *    hangen aan `usePathname`/`useRouter` (URL-state) en renderen niet
 *    representatief zonder routing-context.
 *  - De detail-componenten (`ArticleBodyGate`, `ArticleDetailSidebar`,
 *    `ArticleDetailActions`) hangen aan `useAuth()`. Te zien op een echte
 *    `/articles/[slug]`-pagina.
 *
 * Mock-data only. Inline styles alleen voor style-guide-layout
 * (design-system §8 uitzondering 3); component-styling komt uit
 * globals.css.
 */

'use client'

import { ContentCard } from '@/components/ui'
import { STORY_TYPES, STORY_TYPE_META } from '@/lib/config/story-types'

export function ArticlesSection() {
  return (
    <section className="sg-section" id="articles" aria-labelledby="articles-heading">
      <div className="sg-section-header">
        <h2 id="articles-heading" className="t-display-md">
          Articles / Stories components
        </h2>
        <p className="t-body sg-section-desc">
          Sessie 6. Het story-type-systeem segmenteert articles in vijf types
          (<code>news</code>, <code>people</code>, <code>collaborations</code>,{' '}
          <code>projects</code>, <code>partner</code>). Het palet hieronder is
          de bron-van-waarheid (<code>STORY_TYPE_META</code>) voor de
          type-filter, de type-pills en de type-intro-banner. Het overzicht
          gebruikt de universele <code>&lt;ContentCard&gt;</code> met
          content-type <code>article</code>. De type-filter, search en
          paginatie zijn URL-gestuurd, en de detail-componenten (gating,
          sidebar, actions) zijn auth-afhankelijk — alleen te zien op een
          echte <code>/articles</code>- of <code>/articles/[slug]</code>-pagina.
        </p>
      </div>

      {/* Story-type-palet */}
      <h3 className="t-display-xs sg-subsection-title">Story types</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
          maxWidth: 920,
          marginBottom: 32,
        }}
      >
        {STORY_TYPES.map((type) => {
          const meta = STORY_TYPE_META[type]
          return (
            <div
              key={type}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  background: meta.pale,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: meta.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: meta.icon }}
                />
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  padding: '12px 14px',
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                }}
              >
                {meta.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Voorbeeld article-card */}
      <h3 className="t-display-xs sg-subsection-title">Article card</h3>
      <div className="ov-grid-3" style={{ maxWidth: 920 }}>
        <ContentCard
          href="#"
          contentType="article"
          thumbBackground="linear-gradient(135deg,#c8d8b8,#e0ead0)"
          eyebrow="4 Mar 2026"
          title="Biophilic timber: where material meets wellbeing"
          meta="People"
          tagLabel="People"
        />
        <ContentCard
          href="#"
          contentType="article"
          thumbBackground="linear-gradient(135deg,#d6e8f0,#e8f0f8)"
          eyebrow="28 Feb 2026"
          title="Closing loops in interior fit-outs"
          meta="Collaborations"
          tagLabel="Collaborations"
          isInsiderOnly
        />
      </div>
    </section>
  )
}
