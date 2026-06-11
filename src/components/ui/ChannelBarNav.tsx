'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChannelBar, ALL_CHANNELS } from './ChannelBar'
import { useDebouncedValue } from '@/lib/utils/debounce'
import type { Channel } from '@/lib/api/channels'

export interface ChannelBarNavProps {
  /** Canonieke channel-catalogus (label + slug) — zelfde op elke overzichtspagina. */
  channels: Channel[]
  /** Actief channel-slug uit `?channel=`, of undefined voor "All". */
  activeSlug?: string
  /** Initiële zoekterm uit `?q=` (server-rendered). */
  initialSearch?: string
  searchPlaceholder?: string
  debounceMs?: number
}

/**
 * ChannelBarNav — URL-gestuurde wrapper rond de presentational `ChannelBar`.
 *
 * Eén component, identiek bruikbaar op elke overzichtspagina (materials,
 * brands, events, talks, books). Vertaalt tab-clicks naar `?channel=<slug>` en
 * de zoekterm naar `?q=`, reset `?page=`, en behoudt overige params. De pagina
 * leest `?channel=` server-side, resolvet naar een `theme` term-id en filtert.
 * Zo is de bar overal pixel- en gedrag-identiek; alleen de fetch erachter
 * verschilt per pagina.
 */
export function ChannelBarNav({
  channels,
  activeSlug,
  initialSearch = '',
  searchPlaceholder = 'Search…',
  debounceMs = 300,
}: ChannelBarNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const labels = channels.map((c) => c.label)
  const activeLabel =
    channels.find((c) => c.slug === activeSlug)?.label ?? ALL_CHANNELS

  // Search — controlled + debounced (zelfde patroon als de losse search-inputs).
  const [search, setSearch] = useState(initialSearch)
  const debounced = useDebouncedValue(search, debounceMs)
  const lastPushedRef = useRef(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
    lastPushedRef.current = initialSearch
  }, [initialSearch])

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : '',
    )
    mutate(params)
    params.delete('page')
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  useEffect(() => {
    if (debounced === lastPushedRef.current) return
    lastPushedRef.current = debounced
    pushParams((params) => {
      const v = debounced.trim()
      if (v) params.set('q', v)
      else params.delete('q')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  function handleChannelChange(label: string) {
    // Punt 3: klik op het al-actieve channel → terug naar All (deselect).
    // ChannelBar vuurt onChannelChange ook voor de actieve tab, dus we
    // vangen die hier af.
    if (label === activeLabel && label !== ALL_CHANNELS) {
      pushParams((params) => params.delete('channel'))
      return
    }
    const slug = channels.find((c) => c.label === label)?.slug
    pushParams((params) => {
      if (slug) params.set('channel', slug)
      else params.delete('channel') // "All" → geen filter
    })
  }

  return (
    <ChannelBar
      channels={labels}
      activeChannel={activeLabel}
      onChannelChange={handleChannelChange}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder={searchPlaceholder}
    />
  )
}
