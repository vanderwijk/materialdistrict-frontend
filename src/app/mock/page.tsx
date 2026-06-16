'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Badge,
  Tag,
  InsiderBadge,
  Skeleton,
  EmptyState,
  Card,
  ChannelBar,
  FilterSidebar,
  InsiderGate,
  type FilterSelection,
} from '@/components/ui'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useAuth } from '@/components/providers/AuthContext'
import styles from './page.module.css'

type FacetWpMaterialsFacetName =
  | 'search_materials'
  | 'order'
  | 'material_category'
  | 'glossiness'
  | 'translucence'
  | 'structure'
  | 'texture'
  | 'hardness'
  | 'temperature'
  | 'acoustics'
  | 'odeur'
  | 'fire_resistance'
  | 'uv_resistance'
  | 'weather_resistance'
  | 'scratch_resistance'
  | 'weight'
  | 'chemical_resistance'
  | 'renewable'

type FacetWpMaterialsRequest = {
  data: {
    facets: Record<FacetWpMaterialsFacetName, string[]>
    query_args: {
      post_type: 'material'
      posts_per_page: number
      paged: number
    }
  }
}

type FacetWpFacetChoice = {
  value: string
  label: string
  depth: number
  count: number
}

type FacetWpFacetResult = {
  name: string
  label: string
  type: string
  selected: string[]
  choices: FacetWpFacetChoice[]
}

type FacetWpMaterialsResponse = {
  results: number[]
  facets: Partial<Record<FacetWpMaterialsFacetName, FacetWpFacetResult>>
  pager: {
    page: number
    per_page: number
    total_rows: number
    total_pages: number
  }
}

const facetWpFetchEndpoint = 'https://materialdistrict.com/wp-json/facetwp/v1/fetch'

const facetWpMaterialsRequestExample: FacetWpMaterialsRequest = {
  data: {
    facets: {
      search_materials: ['hemp'],
      order: ['newest'],
      material_category: ['biobased'],
      glossiness: [],
      translucence: [],
      structure: ['fibrous'],
      texture: [],
      hardness: [],
      temperature: [],
      acoustics: [],
      odeur: [],
      fire_resistance: [],
      uv_resistance: [],
      weather_resistance: [],
      scratch_resistance: [],
      weight: ['lightweight'],
      chemical_resistance: [],
      renewable: ['yes'],
    },
    query_args: {
      post_type: 'material',
      posts_per_page: 12,
      paged: 1,
    },
  },
}

const facetWpMaterialsResponseExample: FacetWpMaterialsResponse = {
  results: [124, 398, 771],
  facets: {
    material_category: {
      name: 'material_category',
      label: 'Material Category',
      type: 'checkboxes',
      selected: ['biobased'],
      choices: [
        { value: 'biobased', label: 'Bio-based', depth: 0, count: 89 },
        { value: 'recycled', label: 'Recycled', depth: 0, count: 167 },
      ],
    },
    structure: {
      name: 'structure',
      label: 'Structure',
      type: 'checkboxes',
      selected: ['fibrous'],
      choices: [
        { value: 'fibrous', label: 'Fibrous', depth: 0, count: 24 },
        { value: 'granular', label: 'Granular', depth: 0, count: 11 },
      ],
    },
    weight: {
      name: 'weight',
      label: 'Weight',
      type: 'checkboxes',
      selected: ['lightweight'],
      choices: [
        { value: 'lightweight', label: 'Lightweight', depth: 0, count: 17 },
        { value: 'heavy', label: 'Heavy', depth: 0, count: 8 },
      ],
    },
    renewable: {
      name: 'renewable',
      label: 'Renewable',
      type: 'checkboxes',
      selected: ['yes'],
      choices: [
        { value: 'yes', label: 'Yes', depth: 0, count: 34 },
        { value: 'no', label: 'No', depth: 0, count: 12 },
      ],
    },
  },
  pager: {
    page: 1,
    per_page: 12,
    total_rows: 34,
    total_pages: 3,
  },
}

const facetWpMaterialsTypesSnippet = `type FacetWpMaterialsFacetName =
  | 'search_materials'
  | 'order'
  | 'material_category'
  | 'glossiness'
  | 'translucence'
  | 'structure'
  | 'texture'
  | 'hardness'
  | 'temperature'
  | 'acoustics'
  | 'odeur'
  | 'fire_resistance'
  | 'uv_resistance'
  | 'weather_resistance'
  | 'scratch_resistance'
  | 'weight'
  | 'chemical_resistance'
  | 'renewable'

type FacetWpMaterialsRequest = {
  data: {
    facets: Record<FacetWpMaterialsFacetName, string[]>
    query_args: {
      post_type: 'material'
      posts_per_page: number
      paged: number
    }
  }
}

type FacetWpFacetChoice = {
  value: string
  label: string
  depth: number
  count: number
}

type FacetWpFacetResult = {
  name: string
  label: string
  type: string
  selected: string[]
  choices: FacetWpFacetChoice[]
}

type FacetWpMaterialsResponse = {
  results: number[]
  facets: Partial<Record<FacetWpMaterialsFacetName, FacetWpFacetResult>>
  pager: {
    page: number
    per_page: number
    total_rows: number
    total_pages: number
  }
}`

const facetWpMaterialsPayloadSnippet = JSON.stringify(facetWpMaterialsRequestExample, null, 2)
const facetWpMaterialsResponseSnippet = JSON.stringify(facetWpMaterialsResponseExample, null, 2)

const facetWpMaterialsFetchSnippet = `const payload: FacetWpMaterialsRequest = ${facetWpMaterialsPayloadSnippet}

const response = await fetch('${facetWpFetchEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const result: FacetWpMaterialsResponse = await response.json()`

/**
 * Smoke-test pagina — `/mock`
 *
 * Combineert alle Sessie 3 componenten in één page om te bewijzen dat ze
 * samen netjes renderen, dat hun klassen niet conflicteren en dat de
 * styling uit globals.css volledig dekkend is.
 *
 * Niet bedoeld voor productie. Verwijderen of vervangen in sessie 4.
 */
export default function MockPage() {
  const [channel, setChannel] = useState('All')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterSelection>({})
  const [gateOpen, setGateOpen] = useState(false)

  return (
    <>
      <DevAuthPanel />
      <ChannelBar
        activeChannel={channel}
        onChannelChange={setChannel}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search materials…"
      />

      {/* Breadcrumb + title — boven de overzichts-layout */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '24px 32px 0',
        }}
      >
        <Breadcrumb
          items={[
            { label: 'Materials', href: '/material' },
            { label: 'Smoke test' },
          ]}
        />
        <h1 className="page-title" style={{ marginTop: 8 }}>
          Sessie 3 smoke test
        </h1>
      </div>

      {/* Sidebar + content — gebruikt eigen layout */}
      <div className="ov-wrap">
        <FilterSidebar
            sections={[
              {
                key: 'material_type',
                title: 'Material type',
                defaultOpen: true,
                searchable: true,
                options: [
                  { value: 'wood', label: 'Wood', count: 932 },
                  { value: 'natural-stones', label: 'Natural stones', count: 907 },
                  { value: 'composites', label: 'Composites', count: 280 },
                  { value: 'glass', label: 'Glass', count: 241 },
                  { value: 'metals', label: 'Metals', count: 89 },
                ],
              },
              {
                key: 'sustainability',
                title: 'Sustainability',
                options: [
                  { value: 'biobased', label: 'Bio-based', count: 89 },
                  { value: 'recycled', label: 'Recycled content', count: 167 },
                ],
              },
            ]}
            selected={filters}
            onChange={setFilters}
            onClearAll={() => setFilters({})}
          />

          <div>
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
                Buttons & badges
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <Button>Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="green">Green</Button>
                <Button variant="member">Member</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <Badge variant="green">Paid</Badge>
                <Badge variant="amber">Pending</Badge>
                <Badge variant="blue">Request</Badge>
                <Tag contentType="material" />
                <Tag contentType="article" />
                <InsiderBadge />
                <InsiderBadge size="sm" />
              </div>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
                Cards grid
              </h2>
              <div className="grid-3">
                <Card href="/material/recycled-glass">
                  <Card.Thumb background="linear-gradient(135deg,#88a800,#4a5800)" />
                  <Card.Body>
                    <Tag contentType="material" />
                    <Card.Brand>Eternit</Card.Brand>
                    <Card.Title>Recycled Glass Composite</Card.Title>
                    <Card.Date>Added 12 days ago</Card.Date>
                  </Card.Body>
                </Card>
                <Card href="/article/quiet-revolution">
                  <Card.Thumb background="linear-gradient(135deg,#dce8f8,#4070b0)" />
                  <Card.Body>
                    <Tag contentType="article" />
                    <Card.Title>The Quiet Revolution in Bio-based Insulation</Card.Title>
                    <Card.Date>3 May 2026</Card.Date>
                  </Card.Body>
                </Card>
                <Card href="/books/material-atlas">
                  <Card.Thumb background="linear-gradient(135deg,#f8f5d0,#706800)" />
                  <Card.Body>
                    <Tag contentType="book" />
                    <Card.Title>Material Innovation Atlas</Card.Title>
                    <Card.Date>256 pages · 2025</Card.Date>
                  </Card.Body>
                </Card>
              </div>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
                Loading state
              </h2>
              <div className="grid-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="card">
                    <Skeleton variant="thumb" />
                    <div className="card-body">
                      <Skeleton width="30%" />
                      <Skeleton variant="title" width="90%" />
                      <Skeleton width="50%" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
                Empty state
              </h2>
              <EmptyState
                title="No materials found"
                description="Try removing some filters or broadening your search."
                actions={
                  <>
                    <Button variant="outline" size="sm" onClick={() => setFilters({})}>
                      Clear filters
                    </Button>
                    <Button size="sm">Browse all</Button>
                  </>
                }
              />
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>
                Insider gate
              </h2>
              <Button variant="outline" onClick={() => setGateOpen(true)}>
                Open Insider modal
              </Button>
              <InsiderGate
                variant="modal"
                open={gateOpen}
                onClose={() => setGateOpen(false)}
                feature="compare"
              />
            </section>

            <section className={styles.contractSection}>
              <h2 className={styles.contractTitle}>
                FacetWP materials contract
              </h2>
              <div className={styles.contractCard}>
                <div className={styles.contractEndpointRow}>
                  <Badge variant="blue">POST</Badge>
                  <code className={styles.contractEndpoint}>{facetWpFetchEndpoint}</code>
                </div>

                <p className={styles.contractIntro}>
                  Deze mock laat precies zien hoe de frontend de Materials FacetWP endpoint kan aanroepen.
                  De request body moet altijd een top-level <code>data</code> object bevatten.
                </p>

                <div>
                  <h3 className={styles.contractHeading}>TypeScript types</h3>
                  <CodeBlock code={facetWpMaterialsTypesSnippet} />
                </div>

                <div>
                  <h3 className={styles.contractHeading}>Request payload</h3>
                  <CodeBlock code={facetWpMaterialsPayloadSnippet} />
                </div>

                <div>
                  <h3 className={styles.contractHeading}>Fetch example</h3>
                  <CodeBlock code={facetWpMaterialsFetchSnippet} />
                </div>

                <div>
                  <h3 className={styles.contractHeading}>Response example</h3>
                  <CodeBlock code={facetWpMaterialsResponseSnippet} />
                </div>

                <ul className={styles.contractList}>
                  <li>Facetnamen zijn gebaseerd op de bestaande materials archive in WordPress.</li>
                  <li>De value strings zoals <code>biobased</code> en <code>newest</code> moeten exact matchen met de FacetWP configuratie.</li>
                  <li>De response geeft zowel de gevonden result IDs als vernieuwde facet choices en pager info terug.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
    </>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className={styles.codeBlock}>
      <code>{code}</code>
    </pre>
  )
}

// ─────────────────────────────────────────────────────────────────────
// DEV-ONLY: tijdelijk auth-panel
//
// Klein form om login/refresh/logout direct via `/api/auth/*` te
// triggeren, plus een dump van de huidige user-state. Verwijderen
// zodra de echte `/login`-pagina bestaat (sessie 11).
//
// Login en refresh gaan NIET via AuthContext (die kent alleen
// `signOut`). De server-side hydratie in `app/layout.tsx` haalt de
// nieuwe user op zodra we `router.refresh()` aanroepen.
// ─────────────────────────────────────────────────────────────────────
function DevAuthPanel() {
  const { user, isLoggedIn, isMember, signOut } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { message?: string }
          | null
        setError(body?.message ?? `Login failed (${res.status})`)
      } else {
        setPassword('')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setPending(false)
    }
  }

  function handleRefresh() {
    router.refresh()
  }

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '16px 32px 0',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          fontSize: 14,
        }}
      >
        <div style={{ minWidth: 180 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>
            Dev auth panel
          </strong>
          <span style={{ opacity: 0.6, fontSize: 12 }}>
            Tijdelijk — vervangen door /login
          </span>
        </div>

        {isLoggedIn ? (
          <>
            <div style={{ flex: '1 1 240px' }}>
              <div>
                <strong>{user?.name}</strong>{' '}
                <span style={{ opacity: 0.7 }}>· {user?.email}</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                Membership: {user?.membership.tier}
                {isMember && ' (Insider)'}
                {' · '}roles: {user?.roles.join(', ') || '—'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Refresh
              </Button>
              <Button variant="danger" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          </>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
              flex: '1 1 auto',
            }}
          >
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 14,
                minWidth: 200,
              }}
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 14,
                minWidth: 160,
              }}
            />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
            {error && (
              <span style={{ color: 'var(--ct-red, #c0392b)', fontSize: 12 }}>
                {error}
              </span>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
