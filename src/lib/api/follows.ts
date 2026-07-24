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

export type MailFrequency = 'daily' | 'weekly' | 'monthly' | 'none'

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

// ---------------------------------------------------------------------------
// In-memory cache — één GET per pageload, gedeeld tussen toggles/digest.
// ---------------------------------------------------------------------------

let followsCache: FollowsResponse | null = null
let followsInflight: Promise<FollowsResponse> | null = null
const followsListeners = new Set<() => void>()

function notifyFollowsListeners(): void {
  followsListeners.forEach((listener) => listener())
}

export function subscribeFollows(listener: () => void): () => void {
  followsListeners.add(listener)
  return () => followsListeners.delete(listener)
}

export function getFollowsCache(): FollowsResponse | null {
  return followsCache
}

export function invalidateFollowsCache(): void {
  followsCache = null
  followsInflight = null
  notifyFollowsListeners()
}

export function entityIdsMatch(a: number | string, b: number | string): boolean {
  return String(a) === String(b)
}

export function findFollow(
  data: FollowsResponse,
  entityType: FollowEntityType,
  entityId: number | string,
): FollowRecord | undefined {
  return data.follows.find(
    (row) => row.entityType === entityType && entityIdsMatch(row.entityId, entityId),
  )
}

function upsertFollowCache(record: FollowRecord): void {
  if (!followsCache) return
  const index = followsCache.follows.findIndex(
    (row) =>
      row.entityType === record.entityType && entityIdsMatch(row.entityId, record.entityId),
  )
  if (index >= 0) followsCache.follows[index] = record
  else followsCache.follows.push(record)
  notifyFollowsListeners()
}

function removeFollowCache(entityType: FollowEntityType, entityId: number | string): void {
  if (!followsCache) return
  followsCache.follows = followsCache.follows.filter(
    (row) => !(row.entityType === entityType && entityIdsMatch(row.entityId, entityId)),
  )
  notifyFollowsListeners()
}

/** Gedeelde loader — dedupliceert parallelle GET-calls. */
export async function loadFollows(): Promise<FollowsResponse> {
  if (followsCache) return followsCache
  if (followsInflight) return followsInflight

  followsInflight = getFollows()
    .then((data) => {
      followsCache = data
      followsInflight = null
      notifyFollowsListeners()
      return data
    })
    .catch((err) => {
      followsInflight = null
      throw err
    })

  return followsInflight
}

export async function followEntity(input: FollowInput): Promise<void> {
  const res = await fetch('/api/follows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Follow failed')
  upsertFollowCache({
    entityType: input.entityType,
    entityId: input.entityId,
    types: input.types,
  })
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
  removeFollowCache(entityType, entityId)
}

export async function getFollows(): Promise<FollowsResponse> {
  const res = await fetch('/api/follows', { credentials: 'same-origin' })
  if (!res.ok) throw new Error('Could not load follows')
  return res.json()
}

/**
 * Zet de globale mail-frequentie (één per gebruiker).
 *   PATCH /api/follows  { mailFrequency }  → WordPress PATCH /md/v2/follows/mail-frequency
 */
export async function setMailFrequency(frequency: MailFrequency): Promise<void> {
  const res = await fetch('/api/follows', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ mailFrequency: frequency }),
  })
  if (!res.ok) throw new Error('Could not update mail frequency')
  if (followsCache) {
    followsCache = { ...followsCache, mailFrequency: frequency }
    notifyFollowsListeners()
  }
}
