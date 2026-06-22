'use client'

/**
 * ChannelsHub — het channeloverzicht als follow-hub (P9).
 *
 * Vervangt het vlakke 3-koloms grid door:
 *  - een featured-hero (het featured channel, groot, met cover + follow),
 *  - een sorteerbalk (Most materials / A–Z),
 *  - "Channels you follow" voor ingelogde gebruikers (uit de follow-cache),
 *  - "Discover more" / "All channels" als rijke kaarten met een follow-toggle
 *    per kaart.
 *
 * Hergebruik: `FollowToggle` (per kaart + hero) en de bestaande channel-data
 * (cover-thumbnail, description, count, featured). De gemengde content-
 * thumbnails, "new this week"-tellingen en de "Most active / Recently
 * updated"-sortering vragen activiteitsdata van de backend en volgen later.
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FollowToggle } from '@/components/ui/FollowToggle'
import { useAuth } from '@/components/providers/AuthContext'
import { getFollowsCache, loadFollows } from '@/lib/api/follows'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import type { ChannelIndexItem } from '@/lib/api'

type SortKey = 'materials' | 'az'

function toPlainText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function countLabel(n: number): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? 'material' : 'materials'}`
}

function ChannelHubCard({ channel }: { channel: ChannelIndexItem }) {
  const href = `/channel/${channel.slug}`
  const desc = channel.description ? toPlainText(channel.description) : ''
  return (
    <div className="ch-hub-card">
      <Link
        href={href}
        className="ch-hub-card-media"
        aria-label={`${channel.label} channel`}
      >
        {channel.thumbnailUrl ? (
          <img
            src={channel.thumbnailUrl}
            alt=""
            className="ch-hub-card-img"
            loading="lazy"
          />
        ) : (
          <span className="ch-hub-card-img ch-hub-card-img--empty" aria-hidden="true" />
        )}
      </Link>
      <div className="ch-hub-card-body">
        {channel.featured && <span className="ch-hub-card-eyebrow">Featured</span>}
        <Link href={href} className="ch-hub-card-title">
          {channel.label}
        </Link>
        {desc && <p className="ch-hub-card-desc">{desc}</p>}
        <div className="ch-hub-card-foot">
          <span className="ch-hub-card-count">{countLabel(channel.count)}</span>
          <FollowToggle
            entityType="channel"
            entityId={channel.id}
            entityName={channel.label}
          />
        </div>
      </div>
    </div>
  )
}

export function ChannelsHub({ channels }: { channels: ChannelIndexItem[] }) {
  const { isLoggedIn } = useAuth()
  const [sort, setSort] = useState<SortKey>('materials')
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isLoggedIn) {
      setFollowedIds(new Set())
      return
    }
    const apply = () => {
      const cache = getFollowsCache()
      if (!cache) return
      setFollowedIds(
        new Set(
          cache.follows
            .filter((r) => r.entityType === 'channel')
            .map((r) => Number(r.entityId)),
        ),
      )
    }
    apply()
    void loadFollows().then(apply).catch(() => {})
  }, [isLoggedIn])

  // Featured-keuze staat los van de sortering (altijd het featured channel,
  // anders het eerste = hoogste telling uit de server-volgorde).
  const featured = useMemo(
    () => channels.find((c) => c.featured) ?? channels[0],
    [channels],
  )

  const rest = useMemo(() => {
    const list = channels.filter((c) => c.id !== featured?.id)
    if (sort === 'az') {
      return [...list].sort((a, b) => a.label.localeCompare(b.label))
    }
    return list
  }, [channels, featured, sort])

  const followed = useMemo(
    () => (isLoggedIn ? rest.filter((c) => followedIds.has(c.id)) : []),
    [rest, followedIds, isLoggedIn],
  )
  const discover = useMemo(
    () =>
      followed.length > 0 ? rest.filter((c) => !followedIds.has(c.id)) : rest,
    [rest, followed, followedIds],
  )

  if (!featured) return null

  const featuredHref = `/channel/${featured.slug}`
  const featuredDesc = featured.description
    ? toPlainText(featured.description)
    : ''

  return (
    <div className="ch-hub">
      <div className="ch-hub-featured">
        {featured.thumbnailUrl && (
          <img
            src={featured.thumbnailUrl}
            alt=""
            className="ch-hub-featured-img"
            aria-hidden="true"
          />
        )}
        <div className="ch-hub-featured-overlay" />
        <div className="ch-hub-featured-content">
          <span className="ch-hub-eyebrow">Featured channel</span>
          <h2 className="ch-hub-featured-title">{featured.label}</h2>
          {featuredDesc && <p className="ch-hub-featured-desc">{featuredDesc}</p>}
          <div className="ch-hub-featured-actions">
            <Link href={featuredHref} className="ch-hub-featured-cta">
              Explore channel →
            </Link>
            <FollowToggle
              entityType="channel"
              entityId={featured.id}
              entityName={featured.label}
            />
          </div>
        </div>
      </div>

      <div className="ch-hub-sort" role="group" aria-label="Sort channels">
        <button
          type="button"
          className={sort === 'materials' ? 'is-active' : ''}
          onClick={() => setSort('materials')}
        >
          Most materials
        </button>
        <button
          type="button"
          className={sort === 'az' ? 'is-active' : ''}
          onClick={() => setSort('az')}
        >
          A–Z
        </button>
      </div>

      {followed.length > 0 && (
        <section className="ch-hub-section">
          <div className="ch-hub-section-head">
            <h2 className="ch-hub-section-title">Channels you follow</h2>
            <span className="ch-hub-section-meta">{followed.length} followed</span>
          </div>
          <div className="ch-hub-grid">
            {followed.map((c) => (
              <ChannelHubCard key={c.id} channel={c} />
            ))}
          </div>
        </section>
      )}

      <section className="ch-hub-section">
        <div className="ch-hub-section-head">
          <h2 className="ch-hub-section-title">
            {followed.length > 0 ? 'Discover more' : 'All channels'}
          </h2>
          <span className="ch-hub-section-meta">{discover.length} channels</span>
        </div>
        <div className="ch-hub-grid">
          {discover.map((c) => (
            <ChannelHubCard key={c.id} channel={c} />
          ))}
        </div>
      </section>
    </div>
  )
}
