'use client'

/**
 * ViewLogger — vuurt één view-event af bij het bekijken van een detailpagina.
 * ----------------------------------------------------------------------
 * Mount dit (onzichtbare) client-component in een server-detailpagina met het
 * object-type en het post-ID. Het stuurt eenmalig `<type>_viewed` via de
 * gedeelde eventlaag (`logEvent` → `/api/events` → WordPress `/md/v2/events`).
 *
 * Contract (zie Johans analytics-database.md):
 *   event_type = `${objectType}_viewed`  (material_viewed, story_viewed, …)
 *   object_type = material|story|brand|talk|event|book|channel
 *   object_id   = post-ID
 *   source      = default 'organic'
 *
 * Eénmalig: een ref voorkomt een dubbele log bij Reacts strict-mode double-
 * invoke in dev. Best-effort: `logEvent` slikt fouten, dus dit raakt de UI nooit.
 *
 * NB: `article` mapt op object_type `story` — geef bij artikelen dus
 * `objectType="story"` mee (zie de detailpagina's).
 */

import { useEffect, useRef } from 'react'
import { logEvent } from '@/lib/api/events'

export type ViewObjectType =
  | 'material'
  | 'story'
  | 'brand'
  | 'talk'
  | 'event'
  | 'book'
  | 'channel'

export interface ViewLoggerProps {
  objectType: ViewObjectType
  objectId: number | string
  /** Herkomst; default 'organic'. */
  source?: string
}

export function ViewLogger({ objectType, objectId, source = 'organic' }: ViewLoggerProps) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    void logEvent({
      eventType: `${objectType}_viewed`,
      objectType,
      objectId,
      source,
    })
  }, [objectType, objectId, source])

  return null
}
