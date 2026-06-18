'use client'

/**
 * useFollow — follow-state voor één entiteit (channel of brand).
 * ----------------------------------------------------------------------
 * Optimistisch: de UI schakelt direct, de call gaat op de achtergrond; mislukt
 * die, dan rollen we de state terug. Follow-events worden server-side gelogd
 * (bij POST/DELETE /follows), niet vanuit de client — geen dubbele events.
 *
 * Login-check via `useAuth`. Niet ingelogd? Dan doet `follow()` niets en geeft
 * `false` terug — de UI toont in dat geval de account-catch (zie FollowToggle).
 */

import { useCallback, useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import {
  followEntity,
  unfollowEntity,
  type FollowContentType,
  type FollowEntityType,
} from '@/lib/api/follows'

/** Defaults bij een nieuwe follow: Materials, Stories, Talks aan. */
export const DEFAULT_FOLLOW_TYPES: FollowContentType[] = ['material', 'story', 'talk']

export interface UseFollowOptions {
  entityType: FollowEntityType
  entityId: number | string
  initialFollowing?: boolean
  initialTypes?: FollowContentType[]
}

export function useFollow({
  entityType,
  entityId,
  initialFollowing = false,
  initialTypes,
}: UseFollowOptions) {
  const { isLoggedIn } = useAuth()
  const [following, setFollowing] = useState(initialFollowing)
  const [types, setTypes] = useState<FollowContentType[]>(
    initialTypes ?? DEFAULT_FOLLOW_TYPES,
  )
  const [busy, setBusy] = useState(false)

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
        setFollowing(false) // rollback
        return false
      } finally {
        setBusy(false)
      }
    },
    [entityType, entityId, types, isLoggedIn],
  )

  const unfollow = useCallback(async (): Promise<void> => {
    setFollowing(false)
    setBusy(true)
    try {
      await unfollowEntity(entityType, entityId)
    } catch {
      setFollowing(true) // rollback
    } finally {
      setBusy(false)
    }
  }, [entityType, entityId])

  const updateTypes = useCallback(
    async (next: FollowContentType[]): Promise<void> => {
      setTypes(next)
      if (following) {
        try {
          await followEntity({ entityType, entityId, types: next })
        } catch {
          // best-effort; de toggle-state blijft staan
        }
      }
    },
    [entityType, entityId, following],
  )

  return { isLoggedIn, following, types, busy, follow, unfollow, updateTypes }
}
