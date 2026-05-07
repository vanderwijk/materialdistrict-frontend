import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export type BadgeVariant = 'green' | 'blue' | 'amber' | 'gray' | 'red'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

/**
 * Status badge — uit globals.css §11.
 * Variants: green (succes/paid), blue (info/request),
 * amber (pending/warning), gray (neutral/draft), red (error/failed).
 *
 * @example
 *   <Badge variant="green">Paid</Badge>
 *   <Badge variant="amber">Pending</Badge>
 */
export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn('badge', `b-${variant}`, className)}>
      {children}
    </span>
  )
}
