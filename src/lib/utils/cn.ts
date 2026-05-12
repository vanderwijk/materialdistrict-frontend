/**
 * cn — class-name combiner. Filtert falsy waarden en joint met spatie.
 *
 * Accepteert alles. Wat een string is wordt gebruikt; al het andere
 * (false, null, undefined, 0, ReactNode, etc.) wordt gefilterd. Dit maakt
 * patterns als `cn('btn', isActive && 'is-active')` of
 * `cn('field', icon && 'has-icon')` veilig, ongeacht het type van `icon`.
 */
export function cn(...args: unknown[]): string {
  return args
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ')
}
