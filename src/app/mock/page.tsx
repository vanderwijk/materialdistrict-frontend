'use client'

import { useState } from 'react'
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
            { label: 'Materials', href: '/materials' },
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
                <Card href="/materials/recycled-glass">
                  <Card.Thumb background="linear-gradient(135deg,#88a800,#4a5800)" />
                  <Card.Body>
                    <Tag contentType="material" />
                    <Card.Brand>Eternit</Card.Brand>
                    <Card.Title>Recycled Glass Composite</Card.Title>
                    <Card.Date>Added 12 days ago</Card.Date>
                  </Card.Body>
                </Card>
                <Card href="/articles/quiet-revolution">
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
                mode="modal"
                open={gateOpen}
                onClose={() => setGateOpen(false)}
                feature="compare"
              />
            </section>
          </div>
        </div>
    </>
  )
}
