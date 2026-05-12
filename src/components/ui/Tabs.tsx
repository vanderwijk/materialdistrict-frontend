'use client'

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type MouseEvent,
} from 'react'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Tabs root
// ============================================================

interface TabsProps {
  /** Currently-active tab value. */
  value: string
  /** Callback bij tab-wissel. */
  onChange: (value: string) => void
  /** Aria-label voor de tablist. */
  ariaLabel?: string
  /** Tab-children. */
  children: ReactNode
  className?: string
}

/**
 * Tabs — horizontale underline-style tab-rij.
 *
 * Render `<TabItem value="X" />` als kinderen. De `value` prop op Tabs bepaalt
 * welk item de actieve underline krijgt. ARIA: render't een role=tablist met
 * keyboard-navigation (links/rechts schakelt focus, geen auto-activate).
 *
 * @example
 *   const [tab, setTab] = useState('articles')
 *   <Tabs value={tab} onChange={setTab} ariaLabel="Content type">
 *     <TabItem value="articles">Articles</TabItem>
 *     <TabItem value="materials">Materials</TabItem>
 *   </Tabs>
 */
export function Tabs({ value, onChange, ariaLabel, children, className }: TabsProps) {
  // Inject `active` and `onClick` on every TabItem child
  const items = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    const childProps = child.props as TabItemProps
    return cloneElement(child as ReactElement<TabItemProps>, {
      active: childProps.value === value,
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        onChange(childProps.value)
        childProps.onClick?.(e)
      },
    })
  })

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('tabs', className)}
    >
      {items}
    </div>
  )
}

// ============================================================
// TabItem
// ============================================================

interface TabItemProps {
  value: string
  children: ReactNode
  /** Optionele count badge ("Articles 12"). */
  count?: number
  /** Wordt automatisch geïnjecteerd door <Tabs>. */
  active?: boolean
  /** Wordt automatisch geïnjecteerd door <Tabs>. */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
}

/**
 * TabItem — single tab. Wordt gerendered als <button role="tab"> met de
 * underline-styling uit globals.css.
 *
 * `active` en `onClick` worden door de parent `<Tabs>` ingevuld; dat hoef
 * je niet zelf te doen.
 */
export function TabItem({
  value,
  children,
  count,
  active,
  onClick,
  className,
  disabled,
}: TabItemProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={onClick}
      className={cn('tab-item', active && 'is-active', className)}
      data-value={value}
    >
      <span className="tab-item-label">{children}</span>
      {count !== undefined && <span className="tab-item-count">{count}</span>}
    </button>
  )
}
