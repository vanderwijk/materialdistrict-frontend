/**
 * UI components barrel
 * ----------------------------------------------------------------------
 * Centrale re-export voor alle UI-componenten:
 *
 *   import { Button, ContentCard, MaterialCard } from '@/components/ui'
 *
 * Volgorde aangehouden: layout-primitives, content, action, indicators,
 * gates, dev-utility, form. De vroegere `FieldGroupProps`/`FieldRenderProps`
 * type-exports zijn weggehaald omdat ze nergens werden geconsumed en in
 * het onderliggende module nooit als public type bestonden.
 */

// --- Buttons & links ---
export { Button } from './Button'
export type { ButtonVariant, ButtonSize, ButtonProps } from './Button'

export { ActionButton } from './ActionButton'
export type { ActionButtonSize } from './ActionButton'

export { IconButton } from './IconButton'
export { TextLink } from './TextLink'

// --- Tabs ---
export { Tabs, TabItem } from './Tabs'

// --- Indicators ---
export { Badge } from './Badge'
export type { BadgeVariant } from './Badge'

export { Tag } from './Tag'
export type { ContentType } from './Tag'

export { InsiderBadge } from './InsiderBadge'
export { InsiderMark } from './InsiderMark'

export { Skeleton } from './Skeleton'
export type { SkeletonVariant } from './Skeleton'

export { EmptyState } from './EmptyState'

// --- Cards & content ---
export { Card } from './Card'
export type { CardProps } from './Card'

export { HoverPrefetchLink } from './HoverPrefetchLink'

export { ContentCard } from './ContentCard'
export type { ContentCardThumbRatio } from './ContentCard'

// --- §F2.7: gedeelde bookmark-knop + gating-melding ---
export { CardBookmarkButton } from './CardBookmarkButton'
export type { CardBookmarkButtonProps } from './CardBookmarkButton'
export { CardCompareButton } from './CardCompareButton'
export type { CardCompareButtonProps } from './CardCompareButton'
export { GateNoticeProvider, useGateNotice } from './GateNotice'
export { RecentlyViewedRail } from './RecentlyViewedRail'
export type { RecentlyViewedRailProps } from './RecentlyViewedRail'

export { VideoEmbed } from './VideoEmbed'

// --- Gates & preview ---
export { InsiderGate } from './InsiderGate'
export type { InsiderFeature } from './InsiderGate'

export { BrandTierGate } from './BrandTierGate'

export { PreviewModeIndicator } from './PreviewModeIndicator'

// --- Filtering & nav ---
export { ChannelBar, DEFAULT_CHANNELS, ALL_CHANNELS } from './ChannelBar'
export { ChannelBarNav } from './ChannelBarNav'

export { FilterSidebar } from './FilterSidebar'
export type { FilterOption, FilterSection, FilterSelection } from './FilterSidebar'

export { DetailActions } from './DetailActions'
export { Pagination } from './Pagination'

// --- Icons (re-export voor gemak) ---
export { InsiderIcon } from './icons/InsiderIcon'

// --- Sessie 4 — Materials components ---
export { MaterialCard } from './MaterialCard'
export type { MaterialCardProps } from './MaterialCard'
export { BrandTile } from './BrandTile'
export type { BrandTileProps } from './BrandTile'

export { CompareBar } from './CompareBar'
export type { CompareBarProps } from './CompareBar'

// --- Form components ---
export {
  FieldGroup,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  SubmitButton,
  FormStateProvider,
  useFormState,
  useFieldValidation,
} from './form'
export type { SelectOption } from './form'
