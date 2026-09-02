import { isUpstreamUnavailable } from './upstream-guard'

/**
 * Degrade a server page fetch instead of failing the whole render when the CMS
 * is down. Keeps Vercel from retry-storming WordPress on every list/overview hit.
 */
export async function withUpstreamFallback<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (isUpstreamUnavailable(err)) {
      console.warn(`[upstream-page] ${label} using fallback`, err)
      return fallback
    }
    throw err
  }
}
