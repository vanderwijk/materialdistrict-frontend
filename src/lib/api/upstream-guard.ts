/**
 * Upstream load shield for WordPress / WooCommerce fetches.
 *
 * When the CMS restarts, Vercel can stampede it: thousands of cache misses,
 * each firing multiple parallel REST calls with no timeout. The origin never
 * finishes booting.
 *
 * This module adds three protections on every guarded fetch:
 *  1. Hard timeout — fail fast instead of holding connections for 60s+
 *  2. Per-instance concurrency cap — limit parallel upstream calls
 *  3. Circuit breaker — after repeated failures, stop calling upstream for a
 *     cooldown window so a recovering CMS can actually come up
 *
 * Toggle aggressive mode in Vercel during an incident:
 *   WP_LOAD_SHIELD=true
 *
 * Optional tuning:
 *   WP_UPSTREAM_TIMEOUT_MS=8000
 *   WP_MAX_CONCURRENT_UPSTREAM=3
 *   WP_CIRCUIT_BREAKER_FAILURES=3
 *   WP_CIRCUIT_BREAKER_COOLDOWN_MS=120000
 *   WP_REVALIDATE_MULTIPLIER=4
 */

const LOAD_SHIELD = process.env.WP_LOAD_SHIELD === 'true'

const TIMEOUT_MS = parsePositiveInt(
  process.env.WP_UPSTREAM_TIMEOUT_MS,
  LOAD_SHIELD ? 8_000 : 12_000,
)

const MAX_CONCURRENT = parsePositiveInt(
  process.env.WP_MAX_CONCURRENT_UPSTREAM,
  LOAD_SHIELD ? 3 : 6,
)

const FAILURE_THRESHOLD = parsePositiveInt(
  process.env.WP_CIRCUIT_BREAKER_FAILURES,
  LOAD_SHIELD ? 3 : 5,
)

const FAILURE_WINDOW_MS = 30_000

const COOLDOWN_MS = parsePositiveInt(
  process.env.WP_CIRCUIT_BREAKER_COOLDOWN_MS,
  LOAD_SHIELD ? 120_000 : 60_000,
)

const REVALIDATE_MULTIPLIER = parsePositiveInt(
  process.env.WP_REVALIDATE_MULTIPLIER,
  LOAD_SHIELD ? 4 : 1,
)

// --------------------------------------------------------------------
// Circuit breaker (per serverless instance)
// --------------------------------------------------------------------

let circuitOpenUntil = 0
const recentFailureTimes: number[] = []

let activeRequests = 0
const waitQueue: Array<() => void> = []

export type UpstreamFailureReason = 'timeout' | 'circuit_open' | 'network'

export class UpstreamUnavailableError extends Error {
  readonly reason: UpstreamFailureReason

  constructor(message: string, reason: UpstreamFailureReason) {
    super(message)
    this.name = 'UpstreamUnavailableError'
    this.reason = reason
  }
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function pruneFailureWindow(now: number): void {
  while (
    recentFailureTimes.length > 0 &&
    now - recentFailureTimes[0] > FAILURE_WINDOW_MS
  ) {
    recentFailureTimes.shift()
  }
}

function recordSuccess(): void {
  recentFailureTimes.length = 0
}

function recordFailure(err: unknown): void {
  if (err instanceof UpstreamUnavailableError && err.reason === 'circuit_open') {
    return
  }

  const now = Date.now()
  pruneFailureWindow(now)
  recentFailureTimes.push(now)

  if (recentFailureTimes.length >= FAILURE_THRESHOLD) {
    circuitOpenUntil = now + COOLDOWN_MS
    recentFailureTimes.length = 0
    console.warn(
      `[upstream-guard] circuit open for ${COOLDOWN_MS}ms after ${FAILURE_THRESHOLD} failures`,
    )
  }
}

function isCircuitOpen(): boolean {
  if (Date.now() < circuitOpenUntil) return true
  circuitOpenUntil = 0
  return false
}

async function acquireSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT) {
    activeRequests += 1
    return
  }

  await new Promise<void>((resolve) => {
    waitQueue.push(resolve)
  })
  activeRequests += 1
}

function releaseSlot(): void {
  activeRequests = Math.max(0, activeRequests - 1)
  const next = waitQueue.shift()
  if (next) next()
}

function mergeAbortSignals(
  primary?: AbortSignal,
  secondary?: AbortSignal,
): AbortSignal | undefined {
  if (!primary && !secondary) return undefined
  if (primary && !secondary) return primary
  if (!primary && secondary) return secondary

  const controller = new AbortController()
  const abort = () => controller.abort()

  if (primary!.aborted || secondary!.aborted) {
    controller.abort()
    return controller.signal
  }

  primary!.addEventListener('abort', abort, { once: true })
  secondary!.addEventListener('abort', abort, { once: true })
  return controller.signal
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === 'AbortError'
  ) || (
    err instanceof Error &&
    (err.name === 'AbortError' || err.message.includes('aborted'))
  )
}

function isTransientNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('socket') ||
    msg.includes('timeout')
  )
}

/**
 * Scale ISR / data-cache revalidate intervals during an incident.
 */
export function scaleRevalidate(seconds: number): number {
  return Math.max(60, Math.round(seconds * REVALIDATE_MULTIPLIER))
}

/** Sitemap bulk reads use a separate concurrency knob. */
export function getSitemapPageConcurrency(): number {
  if (LOAD_SHIELD) {
    return parsePositiveInt(process.env.WP_SITEMAP_PAGE_CONCURRENCY, 2)
  }
  return parsePositiveInt(process.env.WP_SITEMAP_PAGE_CONCURRENCY, 8)
}

export function isUpstreamUnavailable(err: unknown): boolean {
  return err instanceof UpstreamUnavailableError || isTransientNetworkError(err)
}

/**
 * Run an upstream fetch with timeout, concurrency limiting, and circuit breaking.
 */
export async function guardUpstreamFetch<T>(
  label: string,
  fn: (signal: AbortSignal) => Promise<T>,
  options?: { signal?: AbortSignal },
): Promise<T> {
  if (isCircuitOpen()) {
    throw new UpstreamUnavailableError(
      `[${label}] WordPress circuit breaker open`,
      'circuit_open',
    )
  }

  await acquireSlot()

  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS)
  const signal = mergeAbortSignals(options?.signal, timeoutController.signal)

  try {
    const result = await fn(signal!)
    recordSuccess()
    return result
  } catch (err) {
    if (isAbortError(err)) {
      if (timeoutController.signal.aborted && !options?.signal?.aborted) {
        recordFailure(err)
        throw new UpstreamUnavailableError(
          `[${label}] WordPress timed out after ${TIMEOUT_MS}ms`,
          'timeout',
        )
      }
      throw err
    }

    if (isTransientNetworkError(err)) {
      recordFailure(err)
      throw new UpstreamUnavailableError(
        `[${label}] WordPress unreachable`,
        'network',
      )
    }

    recordFailure(err)
    throw err
  } finally {
    clearTimeout(timeoutId)
    releaseSlot()
  }
}
