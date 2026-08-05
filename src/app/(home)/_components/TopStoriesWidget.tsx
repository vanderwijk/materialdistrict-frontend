'use client'

/**
 * TopStoriesWidget — sidebar-widget met een Articles/Materials-tab (sessie 10).
 *
 * Client-component vanwege de tab-toggle. Krijgt twee al-gemapte, serializeer-
 * bare lijsten van de server-page; doet zelf geen data-fetch. Hergebruikt de
 * `sw-card` + `story-item`-stijlen.
 */

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { normalizeMediaUrl } from '@/lib/utils/normalize-media-url'

export interface StoryListItem {
  href: string
  thumbUrl?: string
  label: string
  title: string
}

interface TopStoriesWidgetProps {
  articles: StoryListItem[]
  materials: StoryListItem[]
}

export function TopStoriesWidget({ articles, materials }: TopStoriesWidgetProps) {
  const [tab, setTab] = useState<'articles' | 'materials'>('articles')
  const items = tab === 'articles' ? articles : materials

  return (
    <div className="sw-card">
      <div className="sw-header">
        <span className="sw-title">Top stories</span>
        <div className="sw-tabs" role="tablist" aria-label="Top stories">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'articles'}
            className={`sw-tab${tab === 'articles' ? ' is-active' : ''}`}
            onClick={() => setTab('articles')}
          >
            Articles
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'materials'}
            className={`sw-tab${tab === 'materials' ? ' is-active' : ''}`}
            onClick={() => setTab('materials')}
          >
            Materials
          </button>
        </div>
      </div>

      <div className="sw-body">
        <div className="stories-list">
          {items.map((it) => {
            const thumbSrc = it.thumbUrl
              ? normalizeMediaUrl(it.thumbUrl) ?? it.thumbUrl
              : undefined
            return (
              <Link key={it.href} href={it.href} className="story-item">
                <span className="story-thumb" aria-hidden="true">
                  {thumbSrc && (
                    <Image
                      src={thumbSrc}
                      alt=""
                      fill
                      sizes="56px"
                      className="story-thumb-img"
                    />
                  )}
                </span>
                <span className="story-text">
                  <span className="story-label">{it.label}</span>
                  <span className="story-title">{it.title}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="sw-footer">
        <Link
          href={tab === 'articles' ? '/article' : '/material'}
          className="section-link"
        >
          {tab === 'articles' ? 'All articles →' : 'All materials →'}
        </Link>
      </div>
    </div>
  )
}
