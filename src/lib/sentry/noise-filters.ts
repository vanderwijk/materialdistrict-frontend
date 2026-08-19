import type { ErrorEvent, EventHint } from '@sentry/nextjs'

type ExceptionValue = {
  type?: string
  value?: string
  stacktrace?: {
    frames?: Array<{ filename?: string; in_app?: boolean; lineno?: number }>
  }
}

function exceptionValues(event: ErrorEvent): ExceptionValue[] {
  return event.exception?.values ?? []
}

function exceptionMessage(event: ErrorEvent): string {
  return exceptionValues(event)
    .map((v) => `${v.type ?? ''} ${v.value ?? ''}`)
    .join('\n')
}

function hasInAppFrames(event: ErrorEvent): boolean {
  return exceptionValues(event).some((v) =>
    (v.stacktrace?.frames ?? []).some(
      (f) => f.in_app && typeof f.lineno === 'number',
    ),
  )
}

function eventPageUrl(event: ErrorEvent): string {
  if (typeof event.request?.url === 'string') return event.request.url
  const tags = event.tags
  if (Array.isArray(tags)) {
    const hit = tags.find((t) => t.key === 'url')
    return typeof hit?.value === 'string' ? hit.value : ''
  }
  if (tags && typeof tags === 'object' && typeof tags.url === 'string') {
    return tags.url
  }
  return ''
}

/** WordPress/CMS upstream unavailable — infra, not an app bug. */
export function isWordPressUpstreamUnavailable(message: string): boolean {
  return /WordPress fetch failed \(50[23]|FacetWPError:.*\(50[23]|Material facet query failed \(50[23]/i.test(
    message,
  )
}

/** Browser extension, translator, or WebView noise — not actionable in our code. */
export function isBrowserExtensionNoise(
  event: ErrorEvent,
  message = exceptionMessage(event),
): boolean {
  const pageUrl = eventPageUrl(event)

  if (/translate\.goog|translate_http/i.test(pageUrl)) return true

  if (
    /MetaMask|Java object is gone|Failed to connect to MetaMask|runtime\.sendMessage\(\)|cross-extension messaging is not supported/i.test(
      message,
    )
  ) {
    return true
  }

  if (/captured as promise rejection/i.test(message)) return true

  // Stack-less RangeError on mobile WebViews — no in-app frames to act on.
  if (
    /Maximum call stack size exceeded/i.test(message) &&
    !hasInAppFrames(event)
  ) {
    return true
  }

  if (
    /Non-Error promise rejection captured with value:\s*(undefined|Object)/i.test(
      message,
    )
  ) {
    return true
  }

  // React DOM errors from third-party DOM rewrites (Translate, extensions).
  if (
    /removeChild|not a child of this node|The object can not be found here/i.test(
      message,
    ) &&
    !hasInAppFrames(event)
  ) {
    return true
  }

  // Safari / in-app browser network aborts with no app stack.
  if (/^TypeError: Load failed$/i.test(message.trim()) && !hasInAppFrames(event)) {
    return true
  }

  const filenames = exceptionValues(event)
    .flatMap((v) => v.stacktrace?.frames ?? [])
    .map((f) => f.filename ?? '')
    .join('\n')

  if (
    /chrome-extension:|moz-extension:|safari-extension:|webkit-masked-url:|scripts\/inpage\.js|navigation_performance_logger|translate_http|translate\.goog/i.test(
      filenames,
    )
  ) {
    return true
  }

  return false
}

/** Sentry failed to serialize locals/context — usually upstream Response objects. */
export function isSentrySerializationNoise(message: string): boolean {
  return /Converting circular structure to JSON/i.test(message)
}

export function shouldDropClientSentryEvent(event: ErrorEvent): boolean {
  const message = exceptionMessage(event)

  const browserName = event.contexts?.browser?.name
  if (typeof browserName === 'string' && /HeadlessChrome/i.test(browserName)) {
    return true
  }

  if (isBrowserExtensionNoise(event, message)) return true
  if (isSentrySerializationNoise(message) && !hasInAppFrames(event)) return true

  return false
}

export function shouldDropServerSentryEvent(
  event: ErrorEvent,
  hint?: EventHint,
): boolean {
  const message = exceptionMessage(event)
  const original =
    hint?.originalException instanceof Error ? hint.originalException.message : ''

  if (isWordPressUpstreamUnavailable(message) || isWordPressUpstreamUnavailable(original)) {
    return true
  }

  // Next.js wraps the underlying WP failure in a generic RSC digest in production.
  if (
    /An error occurred in the Server Components render/i.test(message) &&
    (isWordPressUpstreamUnavailable(original) ||
      /WordPress fetch failed|FacetWPError/i.test(original))
  ) {
    return true
  }

  if (isSentrySerializationNoise(message)) return true

  return false
}

export function shouldDropRequestError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return isWordPressUpstreamUnavailable(message)
}

export function serverBeforeSend(
  event: ErrorEvent,
  hint?: EventHint,
): ErrorEvent | null {
  if (shouldDropServerSentryEvent(event, hint)) return null
  return event
}

export function clientBeforeSend(event: ErrorEvent): ErrorEvent | null {
  if (shouldDropClientSentryEvent(event)) return null
  return event
}
