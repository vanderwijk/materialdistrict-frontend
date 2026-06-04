/**
 * Dashboard mock fixtures.
 *
 * Typed sample data for every panel, ported from the mockup demo state
 * (`formState`, `materialRows`, `INTERACTIONS`, `boards`, `INVOICES`,
 * `leadRoutingList`, `BRAND_CANDIDATES`, `STORIES`). The data layer
 * (`data.ts`) returns these until Johan's endpoints exist; because every
 * fixture is typed to the datacontract (`src/types/dashboard.ts`), swapping
 * in the real endpoints is a change in `data.ts` only.
 *
 * Not for production: gated behind the data layer, never imported directly
 * by components.
 */

import type {
  UserProfile,
  BookmarkItem,
  Board,
  SavedSearch,
  InsightReport,
  MyRequest,
  Invoice,
  BrandProfile,
  MaterialListRow,
  MaterialFormData,
  Interaction,
  BrandStatistics,
  LeadRoutingConfig,
  FeaturedPlacement,
  BrandCandidate,
} from '@/types/dashboard'

// ------------------------------------------------------------
// Personal account
// ------------------------------------------------------------

export const MOCK_PROFILE: UserProfile = {
  firstName: 'Jeroen',
  lastName: 'van Oostveen',
  email: 'jeroen@materialdistrict.com',
  profession: 'Platform lead',
  company: 'MaterialDistrict',
  country: 'Netherlands',
  avatarUrl: null,
}

export const MOCK_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm1', itemId: 10001, type: 'materials', title: 'Acoustic wood panel', label: 'Material', href: '/materials/acoustic-wood-panel', imageUrl: null, gradient: 'linear-gradient(135deg,#d7e8b6,#eef6ff)', savedAt: '2026-04-12' },
  { id: 'bm2', itemId: 10002, type: 'materials', title: 'Circular facade panel', label: 'Material', href: '/materials/circular-facade-panel', imageUrl: null, gradient: 'linear-gradient(135deg,#d6e6f0,#eef2d8)', savedAt: '2026-04-10' },
  { id: 'bm3', itemId: 10003, type: 'articles', title: 'New circular insulation system enters large-scale projects', label: 'Article', href: '/articles/circular-insulation-system', imageUrl: null, gradient: 'linear-gradient(135deg,#d7e3ef,#f4f6f9)', savedAt: '2026-04-09' },
  { id: 'bm4', itemId: 10004, type: 'brands', title: 'MaterialDistrict', label: 'Brand', href: '/brands/materialdistrict', imageUrl: null, gradient: 'linear-gradient(135deg,#e7dfd2,#eef6ff)', savedAt: '2026-04-02' },
  { id: 'bm5', itemId: 10005, type: 'talks', title: 'Designing with biobased materials', label: 'Talk', href: '/talks/designing-with-biobased-materials', imageUrl: null, gradient: 'linear-gradient(135deg,#e5dde8,#f4f3f8)', savedAt: '2026-03-28' },
]

export const MOCK_BOARDS: Board[] = [
  { id: 'b1', name: 'Office renovation — Amsterdam', createdAt: '2026-04-02', materialCount: 3, articleCount: 2, coverGradient: 'linear-gradient(135deg,#d7e8b6,#eef6ff)' },
  { id: 'b2', name: 'Residential facade study', createdAt: '2026-03-15', materialCount: 5, articleCount: 1, coverGradient: 'linear-gradient(135deg,#d6e6f0,#eef2d8)' },
  { id: 'b3', name: 'Acoustic research', createdAt: '2026-02-01', materialCount: 2, articleCount: 4, coverGradient: 'linear-gradient(135deg,#e7dfd2,#eef6ff)' },
]

export const MOCK_SAVED_SEARCHES: SavedSearch[] = [
  { id: 's1', name: 'Biobased acoustic panels', summary: 'Channel: Biobased · Category: Acoustic · Sustainable', query: 'channel=biobased&category=acoustic', resultCount: 42, alertsEnabled: true, createdAt: '2026-04-05' },
  { id: 's2', name: 'Circular facade systems', summary: 'Category: Facade · Recycled content', query: 'category=facade&recycled=true', resultCount: 18, alertsEnabled: false, createdAt: '2026-03-20' },
]

export const MOCK_INSIGHTS: InsightReport[] = [
  { id: 'i1', title: 'Material trend report Q2 2026', summary: 'Biobased composites and circular facades lead the quarter.', date: '2026-04-01', category: 'Trend report', href: '/dashboard/insider-insights#q2-2026' },
  { id: 'i2', title: 'Acoustic materials forecast', summary: 'Demand shifts toward natural-fibre acoustic solutions.', date: '2026-03-10', category: 'Material forecast', href: '/dashboard/insider-insights#acoustics' },
  { id: 'i3', title: 'Curated: 12 facade innovations', summary: 'Editorial selection of facade systems gaining traction.', date: '2026-02-22', category: 'Curated', href: '/dashboard/insider-insights#facades' },
]

export const MOCK_MY_REQUESTS: MyRequest[] = [
  { id: 'r1', kind: 'sample', subject: 'Acoustic wood panel', brandName: 'MaterialDistrict', date: '2026-04-11', status: 'Answered', message: 'Requested a sample for an interior project.' },
  { id: 'r2', kind: 'brochure', subject: 'Glass Tile', brandName: 'Gold-Mosaics Willems GmbH', date: '2026-04-03', status: 'Sent', message: 'Downloaded the brochure and asked for pricing.' },
]

export const MOCK_USER_INVOICES: Invoice[] = [
  { id: 'inv-u-1', date: '2026-04-01', description: 'Insider membership — annual', amount: 100, currency: 'EUR', status: 'paid', pdfUrl: null },
  { id: 'inv-u-2', date: '2025-04-01', description: 'Insider membership — annual', amount: 100, currency: 'EUR', status: 'paid', pdfUrl: null },
]

// ------------------------------------------------------------
// Brand scope — keyed by slug (multi-brand)
// ------------------------------------------------------------

export const MOCK_BRAND_PROFILES: Record<string, BrandProfile> = {
  materialdistrict: {
    brandId: 1,
    slug: 'materialdistrict',
    brandName: 'MaterialDistrict',
    description:
      'MaterialDistrict is the leading platform for innovative, sustainable and biobased materials for architecture and interior design.',
    website: 'https://materialdistrict.com',
    email: 'info@materialdistrict.com',
    phone: '+31 (0)20 713 06 41',
    country: 'Netherlands',
    address: 'Keizersgracht 174',
    postcode: '1016 DW',
    city: 'Amsterdam',
    vatNumber: 'NL123456789B01',
    chamberNumber: '34123456',
    social: {
      twitter: 'https://x.com/materialdistrict',
      instagram: 'https://instagram.com/materialdistrict',
      linkedin: 'https://linkedin.com/company/materialdistrict',
      youtube: '',
      pinterest: 'https://pinterest.com/materialdistrict',
      facebook: 'https://facebook.com/materialdistrict',
    },
    logoUrl: null,
    logoName: 'materialdistrict-logo.svg',
    channels: ['Biobased', 'Sustainable'],
    keywords: ['acoustic', 'biobased', 'facade', 'circular'],
  },
  'second-brand': {
    brandId: 2,
    slug: 'second-brand',
    brandName: 'Second Brand',
    description: 'A second manufacturer account managed by the same person — used to validate multi-brand handling.',
    website: 'https://example.com',
    email: 'hello@example.com',
    phone: '',
    country: 'Netherlands',
    address: '',
    postcode: '',
    city: 'Rotterdam',
    vatNumber: '',
    chamberNumber: '',
    social: { twitter: '', instagram: '', linkedin: '', youtube: '', pinterest: '', facebook: '' },
    logoUrl: null,
    logoName: null,
    channels: [],
    keywords: [],
  },
}

export const MOCK_BRAND_MATERIALS: Record<string, MaterialListRow[]> = {
  materialdistrict: [
    { id: 101, name: 'Acoustic wood panel', category: 'Wood', status: 'online', updatedAt: '2026-04-12', countsAgainstQuota: true, featuredState: null, featuredWeekStart: null },
    { id: 102, name: 'Textile insulation board', category: 'Other naturals', status: 'offline', updatedAt: '2026-04-10', countsAgainstQuota: true, featuredState: null, featuredWeekStart: null },
    { id: 103, name: 'Circular facade panel', category: 'Facade', status: 'online', updatedAt: '2026-04-08', countsAgainstQuota: true, featuredState: 'scheduled', featuredWeekStart: '2026-07-13' },
    { id: 104, name: 'Recycled composite tile', category: 'Composite', status: 'online', updatedAt: '2026-04-05', countsAgainstQuota: false, featuredState: null, featuredWeekStart: null },
  ],
  'second-brand': [],
}

export const MOCK_MATERIAL_FORM: MaterialFormData = {
  mode: 'edit',
  id: 101,
  name: 'Acoustic wood panel',
  description:
    'High-performance acoustic panel made from responsibly sourced wood fibers for interior applications.',
  type: 'Wood',
  featuredImage: { id: 'feat', name: 'acoustic-wood-panel-featured.jpg', url: null },
  categories: [
    { id: 'c1', l1: 'Interior', l2: 'Walls', l3: 'Wall panel' },
    { id: 'c2', l1: 'Building', l2: 'Insulation', l3: 'Acoustic insulation' },
  ],
  channels: ['Biobased', 'Acoustic'],
  gallery: [
    { id: 'g1', name: 'gallery-image-01.jpg', url: null },
    { id: 'g2', name: 'gallery-image-02.jpg', url: null },
  ],
  videos: [],
  downloads: [],
  keywords: ['acoustic', 'wood', 'interior'],
}

export const MOCK_INTERACTIONS: Record<string, Interaction[]> = {
  materialdistrict: [
    {
      id: 1, type: 'request', page: 'Acoustic wood panel', person: 'Eva Jansen', role: 'Designer',
      industry: 'Interior design', company: 'Studio EVA', email: 'eva@studioeva.nl', phone: '+31 6 12345678',
      address: 'Keizersgracht 214', postcode: '1016 DZ', city: 'Amsterdam', country: 'Netherlands',
      date: '2026-04-12', timeAgo: '2 min ago', status: 'Request',
      message: 'Hi, I would like to receive more information and a sample for an upcoming project.',
      requestOptions: ['Call me', 'Send me a sample'],
    },
    {
      id: 2, type: 'brochure-download', page: 'Glass Tile', person: 'Maria Keller', role: 'Interior Designer',
      industry: 'Interior design', company: 'MK Interiors', email: 'maria@mk-interiors.de', phone: '+49 30 123456',
      address: 'Alexanderplatz 11', postcode: '10178', city: 'Berlin', country: 'Germany',
      date: '2026-04-11', timeAgo: '5 min ago', status: 'Download', message: '', requestOptions: [],
    },
  ],
  'second-brand': [],
}

export const MOCK_BRAND_STATS: Record<string, BrandStatistics> = {
  materialdistrict: {
    metrics: [
      { label: 'Page views', value: 4820, note: '+12% vs last month' },
      { label: 'Sample requests', value: 36, note: '+4 this week' },
      { label: 'Brochure downloads', value: 58, note: null },
      { label: 'Profile visits', value: 912, note: '+8% vs last month' },
    ],
    materials: [
      { materialId: 101, name: 'Acoustic wood panel', views: 1820, requests: 18, downloads: 22 },
      { materialId: 103, name: 'Circular facade panel', views: 1340, requests: 11, downloads: 19 },
      { materialId: 104, name: 'Recycled composite tile', views: 980, requests: 7, downloads: 17 },
    ],
  },
  'second-brand': { metrics: [], materials: [] },
}

export const MOCK_LEAD_ROUTING: Record<string, LeadRoutingConfig> = {
  materialdistrict: {
    defaultName: 'Jeroen van Oostveen',
    defaultEmail: 'info@materialdistrict.com',
    routes: [
      { id: 1, country: 'Netherlands', name: 'Jeroen van Oostveen', email: 'nl@materialdistrict.com' },
      { id: 2, country: 'Germany', name: 'Lukas Meyer', email: 'de@materialdistrict.com' },
    ],
  },
  'second-brand': { defaultName: '', defaultEmail: '', routes: [] },
}

export const MOCK_FEATURED: Record<string, FeaturedPlacement[]> = {
  materialdistrict: [
    { id: 'f1', slot: 'Homepage hero', status: 'active', startsAt: '2026-04-01', endsAt: '2026-04-30', subject: 'Acoustic wood panel' },
    { id: 'f2', slot: 'Category top — Facade', status: 'scheduled', startsAt: '2026-05-01', endsAt: '2026-05-31', subject: 'Circular facade panel' },
    { id: 'f3', slot: 'Newsletter feature', status: 'available', startsAt: null, endsAt: null, subject: null },
  ],
  'second-brand': [],
}

export const MOCK_BRAND_INVOICES: Record<string, Invoice[]> = {
  materialdistrict: [
    { id: 'inv-b-1', date: '2026-04-01', description: 'Membership invoice — Plus', amount: 1500, currency: 'EUR', status: 'paid', pdfUrl: null },
    { id: 'inv-b-2', date: '2026-03-01', description: 'Featured placement — Homepage hero', amount: 450, currency: 'EUR', status: 'paid', pdfUrl: null },
    { id: 'inv-b-3', date: '2026-02-01', description: 'Membership invoice — Plus', amount: 1500, currency: 'EUR', status: 'open', pdfUrl: null },
  ],
  'second-brand': [],
}

export const MOCK_BRAND_CANDIDATES: BrandCandidate[] = [
  { id: 101, name: 'MaterialDistrict', domain: 'materialdistrict.com', website: 'https://materialdistrict.com', email: 'info@materialdistrict.com', logoLabel: 'MD' },
  { id: 102, name: 'Mandy den Elzen', domain: 'materialdistrict.com', website: 'http://www.mandydenelzen.com', email: 'e.zijlstra@materialdistrict.com', logoLabel: 'ME' },
  { id: 103, name: 'Gold-Mosaics Willems GmbH', domain: 'gold-mosaics.de', website: 'https://gold-mosaics.de', email: 'info@gold-mosaics.de', logoLabel: 'GM' },
]
