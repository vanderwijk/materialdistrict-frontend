'use client'

/**
 * useFollow — follow-state voor één entiteit (channel of brand).
 * ----------------------------------------------------------------------
 * Bij mount laadt ingelogde gebruikers hun follows via GET /api/follows
 * (gedeeld cache in follows.ts). Optimistisch: de UI schakelt direct,
 * de call gaat op de achtergrond; mislukt die, dan rollen we terug.
 * Follow-events worden server-side gelogd (bij POST/DELETE /follows).
 *
 * Login-check via `useAuth`. Niet ingelogd? Dan doet `follow()` niets en geeft
 * `false` terug — de UI toont in dat geval de account-catch (zie FollowToggle).
 */

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import {
  followEntity,
  unfollowEntity,
  loadFollows,
  subscribeFollows,
  getFollowsCache,
  findFollow,
  type FollowContentType,
  type FollowEntityType,
  type FollowsResponse,
  type MailFrequency,
} from '@/lib/api/follows'

/** Defaults bij een nieuwe follow: Materials, Stories, Talks aan. */
export const DEFAULT_FOLLOW_TYPES: FollowContentType[] = ['material', 'story', 'talk']

export interface UseFollowOptions {
  entityType: FollowEntityType
  entityId: number | string
  initialFollowing?: boolean
  initialTypes?: FollowContentType[]
}

function applyFollowRecord(
  data: FollowsResponse,
  entityType: FollowEntityType,
  entityId: number | string,
  initialFollowing: boolean,
  initialTypes: FollowContentType[],
): { following: boolean; types: FollowContentType[] } {
  const record = findFollow(data, entityType, entityId)
  if (record) {
    return {
      following: true,
      types: record.types.length > 0 ? record.types : initialTypes,
    }
  }
  return { following: initialFollowing, types: initialTypes }
}

export function useFollow({
  entityType,
  entityId,
  initialFollowing = false,
  initialTypes,
}: UseFollowOptions) {
  const { isLoggedIn } = useAuth()
  const resolvedInitialTypes = initialTypes ?? DEFAULT_FOLLOW_TYPES
  const [following, setFollowing] = useState(initialFollowing)
  const [types, setTypes] = useState<FollowContentType[]>(resolvedInitialTypes)
  const [busy, setBusy] = useState(false)

  const syncFromCache = useCallback(() => {
    if (!isLoggedIn) {
      setFollowing(false)
      setTypes(resolvedInitialTypes)
      return
    }
    const cache = getFollowsCache()
    if (!cache) return
    const next = applyFollowRecord(
      cache,
      entityType,
      entityId,
      initialFollowing,
      resolvedInitialTypes,
    )
    setFollowing(next.following)
    setTypes(next.types)
  }, [isLoggedIn, entityType, entityId, initialFollowing, resolvedInitialTypes])

  useEffect(() => {
    if (!isLoggedIn) {
      setFollowing(false)
      setTypes(resolvedInitialTypes)
      return
    }
    let cancelled = false
    void loadFollows()
      .then((data) => {
        if (cancelled) return
        const next = applyFollowRecord(
          data,
          entityType,
          entityId,
          initialFollowing,
          resolvedInitialTypes,
        )
        setFollowing(next.following)
        setTypes(next.types)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isLoggedIn, entityType, entityId, initialFollowing, resolvedInitialTypes])

  useEffect(() => subscribeFollows(syncFromCache), [syncFromCache])

  const follow = useCallback(
    async (withTypes?: FollowContentType[]): Promise<boolean> => {
      if (!isLoggedIn) return false
      const nextTypes = withTypes ?? types
      setFollowing(true)
      setBusy(true)
      try {
        await followEntity({ entityType, entityId, types: nextTypes })
        setTypes(nextTypes)
        return true
      } catch {
        syncFromCache()
        return false
      } finally {
        setBusy(false)
      }
    },
    [entityType, entityId, types, isLoggedIn, syncFromCache],
  )

  const unfollow = useCallback(async (): Promise<void> => {
    setFollowing(false)
    setBusy(true)
    try {
      await unfollowEntity(entityType, entityId)
    } catch {
      syncFromCache()
    } finally {
      setBusy(false)
    }
  }, [entityType, entityId, syncFromCache])

  const updateTypes = useCallback(
    async (next: FollowContentType[]): Promise<void> => {
      setTypes(next)
      if (following) {
        try {
          await followEntity({ entityType, entityId, types: next })
        } catch {
          syncFromCache()
        }
      }
    },
    [entityType, entityId, following, syncFromCache],
  )

  return { isLoggedIn, following, types, busy, follow, unfollow, updateTypes }
}

/** Globale mail-frequentie — gedeeld via de follows-cache. */
export function useMailFrequency(defaultFrequency: MailFrequency = 'weekly'): MailFrequency {
  const { isLoggedIn } = useAuth()
  const [frequency, setFrequency] = useState<MailFrequency>(defaultFrequency)

  useEffect(() => {
    if (!isLoggedIn) {
      setFrequency(defaultFrequency)
      return
    }
    const apply = () => {
      const cache = getFollowsCache()
      if (cache) setFrequency(cache.mailFrequency)
    }
    void loadFollows().then(apply).catch(() => {})
    return subscribeFollows(apply)
  }, [isLoggedIn, defaultFrequency])

  return frequency
}
