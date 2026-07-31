/**
 * Contact form topics — shared by the contact page, form, and API proxy.
 * Subject strings must stay in sync with `md_contact_allowed_subjects()`
 * in the WordPress plugin (`rest-contact.php`).
 */

export interface ContactTopic {
  id: string
  title: string
  desc: string
  /** Mailto / SES subject line. */
  subject: string
}

export const CONTACT_TOPICS: readonly ContactTopic[] = [
  {
    id: 'editorial',
    title: 'Editorial and news',
    desc: 'Share a relevant press release, research development, project or material innovation with our editorial team.',
    subject: 'Editorial submission',
  },
  {
    id: 'membership',
    title: 'Brand Membership',
    desc: 'Ask about listing a material, a Basic, Plus or Partner membership, and the best way to present your brand.',
    subject: 'Brand Membership',
  },
  {
    id: 'insider',
    title: 'Insider Membership',
    desc: 'Get help with your membership, benefits, billing or access.',
    subject: 'Insider Membership',
  },
  {
    id: 'event',
    title: 'MaterialDistrict Utrecht',
    desc: 'Ask about visiting, exhibiting, partnerships, the programme or practical event information.',
    subject: 'MaterialDistrict Utrecht',
  },
  {
    id: 'innovation-fund',
    title: 'Innovation Fund',
    desc: 'Apply for support, or ask whether your innovation qualifies.',
    subject: 'Innovation Fund application',
  },
  {
    id: 'books',
    title: 'Books and publications',
    desc: 'Ask about orders, deliveries, bulk purchases or taking part in a publication.',
    subject: 'Books and publications',
  },
  {
    id: 'exhibitions',
    title: 'Material exhibitions',
    desc: 'Discuss taking part in a curated exhibition, or a collaboration at another location.',
    subject: 'Material exhibitions',
  },
  {
    id: 'support',
    title: 'Technical support',
    desc: 'Get help with signing in, account access, profiles or website functionality.',
    subject: 'Technical support',
  },
  {
    id: 'general',
    title: 'General enquiry',
    desc: 'Use this when none of the subjects above applies.',
    subject: 'General enquiry',
  },
] as const

export const CONTACT_INBOX = 'info@materialdistrict.com'

export function contactTopicById(id: string | undefined | null): ContactTopic | null {
  if (!id) return null
  return CONTACT_TOPICS.find((topic) => topic.id === id) ?? null
}

/** Build subject for become-a-partner deep links (`?subject=membership&tier=plus`). */
export function membershipContactSubject(tier: string | undefined): string {
  if (!tier) return 'Brand Membership'
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return `Brand Membership — ${label}`
}

export function resolveContactTopicId(
  subjectParam: string | undefined,
): string | null {
  const key = (subjectParam ?? '').toLowerCase()
  if (!key) return null
  if (key === 'membership' || key === 'brand-membership') return 'membership'
  return CONTACT_TOPICS.some((t) => t.id === key) ? key : null
}
