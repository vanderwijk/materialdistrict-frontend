/**
 * Combineer class names. Falsy waarden (undefined, false, null, '') worden weggefilterd.
 * Lichtgewicht alternatief voor `clsx` — geen extra dependency nodig.
 *
 * @example
 *   cn('btn', 'btn-primary', isActive && 'is-active')
 *   // => "btn btn-primary is-active"
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
