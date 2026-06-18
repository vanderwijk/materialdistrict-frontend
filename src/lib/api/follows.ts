/**
 * Follows — client (ingelogd)
 * ----------------------------------------------------------------------
 * Dunne client rond de `/api/follows`-proxy → WordPress `/md/v2/follows`.
 * Bewust geïsoleerd: als Johan een endpoint-detail aanpast, verandert alleen
 * deze module en de proxy — niet de UI-componenten die erop leunen.
 *
 * Contract (zie backend-spec):
 *   POST   /api/follows   { entityType, entityId, types }   → volg/upsert
 *   DELETE /api/follows   { entityType, entityId }           → ontvolg
 *   GET    /api/follows                                       → eigen follows + mailFrequency
 */

export type FollowEntityType = 'channel' | 'brand'

export type FollowContentType =
  | 'material'
  | 'story'
  | 'talk'
  | 'book'
  | 'event'
  | 'brand'

export type MailFrequency = 'daily' | 'weekly' | 'monthly'

export interface FollowInput {
  entityType: FollowEntityType
  entityId: number | string
  types: FollowContentType[]
}

export interface FollowRecord {
  entityType: FollowEntityType
  entityId: number | string
  types: FollowContentType[]
}

export interface FollowsResponse {
  follows: FollowRecord[]
  mailFrequency: MailFrequency
}

export async function followEntity(input: FollowInput): Promise<void> {
  const res = await fetch('/api/follows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Follow failed')
}

export async function unfollowEntity(
  entityType: FollowEntityType,
  entityId: number | string,
): Promise<void> {
  const res = await fetch('/api/follows', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ entityType, entityId }),
  })
  if (!res.ok) throw new Error('Unfollow failed')
}

export async function getFollows(): Promise<FollowsResponse> {
  const res = await fetch('/api/follows', { credentials: 'same-origin' })
  if (!res.ok) throw new Error('Could not load follows')
  return res.json()
}
