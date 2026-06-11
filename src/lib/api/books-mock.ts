/**
 * Mock-fixtures voor de books-shop (rauwe WooCommerce-product-shape).
 * ----------------------------------------------------------------------
 * Spiegelt wat `/wp/v2/product?product_cat=books&_embed` met Johans
 * register_rest_field straks teruggeeft: native product-velden + top-level
 * boek-metadata (geen `acf`-blok). De fixtures lopen door dezelfde mapper als
 * live-data (`mapBook*`), dus de UI ziet exact de productie-output.
 *
 * Bewust gevarieerd:
 *  - in/uit voorraad (Light, Glass, Form is uitverkocht)
 *  - met/zonder cover (Textile Thinking heeft geen featured image)
 *  - met/zonder auteur (Textile Thinking heeft geen author_name — zoals live,
 *    waar auteur/pagina's voorlopig leeg blijven)
 *
 * Koop-URL (`buy_url`): een placeholder op het apex-domein
 * (`materialdistrict.com`). Het books-subdomain verdwijnt bij de cutover, dus
 * dat bakken we hier niet in; de definitieve per-fase-URL komt van Johan. Nooit
 * een cms-URL. Alleen de reguliere `price` staat erop; de Insider-prijs leidt
 * de UI af via `getBookPrice()`.
 *
 * Verwijderbaar zodra `BOOKS_LIVE=true` standaard is. Titels/auteurs zijn
 * fictief (MaterialDistrict Press) — geen echte personen of werken.
 */

import type { WPMediaResponse } from './wordpress'
import type { WPBookRawResponse } from './books'

const SHOP = 'https://materialdistrict.com'

/** Minimale, geldige `WPMediaResponse` voor een mock-cover. */
function mockCover(id: number, seed: string): WPMediaResponse {
  const full = `https://picsum.photos/seed/${seed}/600/800`
  const medium = `https://picsum.photos/seed/${seed}/300/400`
  return {
    id,
    date: '2026-01-01T00:00:00',
    slug: `cover-${seed}`,
    type: 'attachment',
    status: 'inherit',
    link: full,
    title: { rendered: `Cover ${seed}` },
    alt_text: `Book cover — ${seed}`,
    caption: { rendered: '' },
    description: { rendered: '' },
    media_type: 'image',
    mime_type: 'image/jpeg',
    source_url: full,
    post: null,
    menu_order: 0,
    media_details: {
      width: 600,
      height: 800,
      file: `cover-${seed}.jpg`,
      sizes: {
        medium: {
          file: `cover-${seed}-300x400.jpg`,
          width: 300,
          height: 400,
          mime_type: 'image/jpeg',
          source_url: medium,
        },
      },
    },
  }
}

function p(...paragraphs: string[]): string {
  return paragraphs.map((t) => `<p>${t}</p>`).join('\n')
}

export const MOCK_BOOKS: WPBookRawResponse[] = [
  {
    id: 9101,
    date: '2026-05-20T10:00:00',
    modified: '2026-05-22T09:00:00',
    slug: 'the-material-book',
    status: 'publish',
    link: `${SHOP}/product/the-material-book/`,
    title: { rendered: 'The Material Book' },
    excerpt: {
      rendered: p(
        'A reference for designers and architects on choosing materials with intent.',
      ),
    },
    content: {
      rendered: p(
        'The Material Book brings together hundreds of innovative materials, organised by application and property, with practical guidance on specification.',
        'Each entry pairs a high-resolution image with the data you need to compare options at a glance — from sustainability profile to processing route.',
      ),
    },
    featured_media: 9201,
    author_name: 'Els Zijlstra',
    isbn: '978-90-1234-001-1',
    publisher: 'MaterialDistrict Press',
    pages: 320,
    publication_year: 2024,
    price: 39.95,
    in_stock: true,
    buy_url: `${SHOP}/product/the-material-book/`,
    _embedded: { 'wp:featuredmedia': [mockCover(9201, 'the-material-book')] },
  },
  {
    id: 9102,
    date: '2026-04-11T10:00:00',
    modified: '2026-04-11T10:00:00',
    slug: 'bio-based-futures',
    status: 'publish',
    link: `${SHOP}/product/bio-based-futures/`,
    title: { rendered: 'Bio-Based Futures' },
    excerpt: {
      rendered: p(
        'How bio-based and regenerative materials are reshaping the built environment.',
      ),
    },
    content: {
      rendered: p(
        'Bio-Based Futures surveys the fast-moving field of materials grown rather than extracted — mycelium, algae, agricultural residue and more.',
        'Case studies show where these materials already perform at scale, and where the honest limits still are.',
      ),
    },
    featured_media: 9202,
    author_name: 'Jort van Dijk',
    isbn: '978-90-1234-002-8',
    publisher: 'MaterialDistrict Press',
    pages: 240,
    publication_year: 2025,
    price: 29.5,
    in_stock: true,
    buy_url: `${SHOP}/product/bio-based-futures/`,
    _embedded: { 'wp:featuredmedia': [mockCover(9202, 'bio-based-futures')] },
  },
  {
    id: 9103,
    date: '2026-02-03T10:00:00',
    modified: '2026-02-03T10:00:00',
    slug: 'circular-by-design',
    status: 'publish',
    link: `${SHOP}/product/circular-by-design/`,
    title: { rendered: 'Circular by Design' },
    excerpt: {
      rendered: p(
        'Designing products and buildings for reuse, repair and disassembly.',
      ),
    },
    content: {
      rendered: p(
        'Circular by Design turns circular-economy principles into concrete design decisions, from joint detailing to material passports.',
      ),
    },
    featured_media: 9203,
    author_name: 'Marleen de Vries',
    isbn: '978-90-1234-003-5',
    publisher: 'MaterialDistrict Press',
    pages: 280,
    publication_year: 2023,
    price: 45.0,
    in_stock: true,
    buy_url: `${SHOP}/product/circular-by-design/`,
    _embedded: { 'wp:featuredmedia': [mockCover(9203, 'circular-by-design')] },
  },
  {
    id: 9104,
    date: '2026-01-15T10:00:00',
    modified: '2026-01-15T10:00:00',
    slug: 'surface-and-structure',
    status: 'publish',
    link: `${SHOP}/product/surface-and-structure/`,
    title: { rendered: 'Surface & Structure' },
    excerpt: {
      rendered: p('An atlas of finishes, textures and the structures beneath them.'),
    },
    content: {
      rendered: p(
        'Surface & Structure pairs macro photography of finishes with the engineering that makes them possible.',
      ),
    },
    featured_media: 9204,
    author_name: 'Tomás Reyes',
    isbn: '978-90-1234-004-2',
    publisher: 'MaterialDistrict Press',
    pages: 200,
    publication_year: 2022,
    price: 34.95,
    in_stock: true,
    buy_url: `${SHOP}/product/surface-and-structure/`,
    _embedded: { 'wp:featuredmedia': [mockCover(9204, 'surface-and-structure')] },
  },
  {
    id: 9105,
    date: '2025-11-01T10:00:00',
    modified: '2025-11-01T10:00:00',
    slug: 'light-glass-form',
    status: 'publish',
    link: `${SHOP}/product/light-glass-form/`,
    title: { rendered: 'Light, Glass, Form' },
    excerpt: {
      rendered: p('Glass as a structural and expressive material in contemporary architecture.'),
    },
    content: {
      rendered: p(
        'Light, Glass, Form documents projects where glass does more than glaze — it carries load, filters light and shapes space.',
      ),
    },
    featured_media: 9205,
    author_name: 'Anita Brouwer',
    isbn: '978-90-1234-005-9',
    publisher: 'MaterialDistrict Press',
    pages: 360,
    publication_year: 2021,
    price: 52.0,
    // Uitverkocht → koopknop uitgeschakeld in de UI.
    in_stock: false,
    buy_url: `${SHOP}/product/light-glass-form/`,
    _embedded: { 'wp:featuredmedia': [mockCover(9205, 'light-glass-form')] },
  },
  {
    id: 9106,
    date: '2025-09-09T10:00:00',
    modified: '2025-09-09T10:00:00',
    slug: 'textile-thinking',
    status: 'publish',
    link: `${SHOP}/product/textile-thinking/`,
    title: { rendered: 'Textile Thinking' },
    excerpt: {
      rendered: p('Soft materials, hard problems: textiles in product and spatial design.'),
    },
    content: {
      rendered: p(
        'Textile Thinking explores how woven, knitted and non-woven structures solve problems across scales.',
      ),
    },
    // Geen featured image en geen auteur — dekt de placeholder-/null-takken,
    // zoals live waar auteur/pagina's voorlopig leeg blijven.
    featured_media: 0,
    isbn: '978-90-1234-006-6',
    publisher: 'MaterialDistrict Press',
    pages: 180,
    publication_year: 2025,
    price: 24.95,
    in_stock: true,
    buy_url: `${SHOP}/product/textile-thinking/`,
  },
]
