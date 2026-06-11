/**
 * MaterialDistrict — Icon Registry
 *
 * Centrale registry van alle iconen die in de app gebruikt worden. Componenten
 * importeren uit deze file (`IconSave`, `IconCompare`, etc.) — niet rechtstreeks
 * uit `lucide-react` of `react-icons/fa6`. Dit zorgt ervoor dat:
 *
 *   1. Eén plek bepaalt welk lucide-icoon "Save", "Compare", etc. is — geen
 *      synoniemen-drift over de codebase
 *   2. Een icoon-vervanging op één plek gebeurt
 *   3. De style-guide-section automatisch in sync blijft (hij itereert over
 *      `ICON_REGISTRY`)
 *
 * Bronnen:
 *   - lucide-react: alle UX-iconen (acties, navigatie, status, content-type, UI)
 *   - react-icons/fa6: social-platform-iconen (LinkedIn ontbreekt in lucide
 *     wegens brand-policy, daarom een tweede bron)
 *
 * Maak voor nieuwe iconen ALTIJD een semantische alias aan, ook al gebruik je
 * hem maar één keer. Dat houdt de barrière laag om hem later te wijzigen.
 *
 * Sizes worden per call meegegeven (bv. `<IconSave size={16} />`). Geen aparte
 * size-tokens — lucide en react-icons ondersteunen `size`-prop natively.
 *
 * `InsiderIcon` (sterretje) is GEEN deel van deze registry — die is een eigen
 * custom SVG (`./InsiderIcon.tsx`) omdat het een brand-asset is. Wel
 * geherexporteerd onderaan voor één-stop-import.
 */

// ============================================================
// 1. Acties
// ============================================================
export {
  Bookmark as IconSave,
  BookmarkCheck as IconSaved,
  Share2 as IconShare,
  Folder as IconBoard,
  FolderPlus as IconBoardAdd,
  Trash2 as IconDelete,
  Download as IconDownload,
  Upload as IconUpload,
  Pencil as IconEdit,
  Plus as IconAdd,
  X as IconClose,
  Search as IconSearch,
  SlidersHorizontal as IconFilter,
  Filter as IconFilterAlt,
  Copy as IconCopy,
  ExternalLink as IconExternal,
} from 'lucide-react'

// IconCompare is een custom SVG (niet uit lucide-react). Reden: lucide
// hernoemt periodiek hun chart-iconen (`BarChart2` → `ChartNoAxesColumn`
// is recent gebeurd), waardoor het visuele icoon ongemerkt kan veranderen
// na een dependency-update. Het Compare-icoon is centraal in de UX
// (cards, detail-headers, compare-bar) en moet visueel stabiel zijn.
// Zie ./CompareIcon.tsx voor de geometrie.
export { CompareIcon as IconCompare } from './CompareIcon'

// IconSaveSearch is óók een custom SVG, om dezelfde reden als IconCompare:
// lucide heeft hun `Save`-glyph in een recente versie hertekend, waardoor de
// filter-header een afwijkend save-icoon kreeg. Geometrie 1-op-1 uit de
// catalogus-demo. Zie ./SaveSearchIcon.tsx.
export { SaveSearchIcon as IconSaveSearch } from './SaveSearchIcon'

// ============================================================
// 2. Navigatie
// ============================================================
export {
  ChevronRight as IconChevronRight,
  ChevronLeft as IconChevronLeft,
  ChevronUp as IconChevronUp,
  ChevronDown as IconChevronDown,
  ArrowRight as IconArrowRight,
  ArrowLeft as IconArrowLeft,
  ArrowUp as IconArrowUp,
  ArrowDown as IconArrowDown,
  Menu as IconMenu,
  MoreHorizontal as IconMoreHorizontal,
  MoreVertical as IconMoreVertical,
} from 'lucide-react'

// ============================================================
// 3. Status & feedback
// ============================================================
export {
  Check as IconCheck,
  X as IconErrorMark, // Hergebruik X voor de status-indicator. Alias voor leesbaarheid.
  AlertTriangle as IconWarning,
  Info as IconInfo,
  AlertCircle as IconAlert,
  Loader2 as IconLoading,
  Lock as IconLock,
  LockKeyhole as IconLockOpen,
  Shield as IconShield,
  ShieldCheck as IconShieldCheck,
  Eye as IconEye,
  EyeOff as IconEyeOff,
} from 'lucide-react'

// ============================================================
// 4. Content-type indicators (voor Tags op cards)
// ============================================================
export {
  Layers as IconMaterial,
  Newspaper as IconArticle,
  Calendar as IconEvent,
  BookOpen as IconBook,
  Building as IconBrand,
  Mic as IconTalk,
  User as IconPeople,
  Users as IconStory,
} from 'lucide-react'

// ============================================================
// 5. UI / contact
// ============================================================
export {
  Mail as IconMail,
  Phone as IconPhone,
  MapPin as IconMapPin,
  Settings as IconSettings,
  Sun as IconSun,
  Moon as IconMoon,
  ShoppingBag as IconCart,
  Heart as IconHeart,
  Bell as IconBell,
  Tag as IconTagFilter,
  Image as IconImage,
  Globe as IconGlobe,
  LogIn as IconLogin,
  LogOut as IconLogout,
  CircleHelp as IconHelp,
} from 'lucide-react'

// ============================================================
// 6. Featured & highlight
// ============================================================
export {
  Star as IconFeatured,
} from 'lucide-react'

// ============================================================
// 7. Insider Insights
// ============================================================
export {
  Lightbulb as IconInsiderInsights,
} from 'lucide-react'

// ============================================================
// 8. Socials (uit react-icons/fa6)
//
// LinkedIn ontbreekt in lucide-react en simple-icons wegens brand-richtlijnen
// van LinkedIn zelf. Daarom gebruiken we hier react-icons/fa6 — Font Awesome 6
// (Brands family) is treeshakeable en ~3kb totaal voor de socials die we
// daadwerkelijk gebruiken.
//
// Lijst gespiegeld op de brand-profile-form in de mockup (Social channels):
// Twitter/X, Instagram, LinkedIn, YouTube, Pinterest, Facebook.
// ============================================================
export {
  FaLinkedin as IconLinkedin,
  FaXTwitter as IconX,
  FaFacebook as IconFacebook,
  FaInstagram as IconInstagram,
  FaYoutube as IconYoutube,
  FaPinterest as IconPinterest,
} from 'react-icons/fa6'

// ============================================================
// Custom brand-assets — InsiderIcon (re-export voor gemak)
// ============================================================
export { InsiderIcon } from './InsiderIcon'

// ============================================================
// Registry-metadata — voor de style-guide IconsSection
//
// Deze structuur is informatief; in productie-componenten importeer je de
// `Icon*`-namen direct. Dit object wordt door `/style-guide` doorlopen om de
// IconsSection automatisch te genereren — voeg hier een nieuwe regel toe als
// je hierboven een nieuwe icon-export toevoegt.
// ============================================================

export interface IconRegistryEntry {
  /** Semantische naam zoals geëxporteerd uit deze file. */
  name: string
  /** Onderliggende lucide- of fa6-naam — voor traceability. */
  source: string
  /** Korte gebruikscontext. */
  description: string
}

export interface IconCategory {
  title: string
  description: string
  items: IconRegistryEntry[]
}

export const ICON_REGISTRY: IconCategory[] = [
  {
    title: 'Acties',
    description: 'Knoppen en click-actions die de gebruiker uitvoert.',
    items: [
      { name: 'IconSave', source: 'lucide-react/Bookmark', description: 'Bookmark/save-actie' },
      { name: 'IconSaved', source: 'lucide-react/BookmarkCheck', description: 'Geactiveerde save-state' },
      { name: 'IconSaveSearch', source: 'custom/SaveSearchIcon', description: 'Save search (klassieke diskette — custom SVG, versie-stabiel; demo-geometrie)' },
      { name: 'IconCompare', source: 'custom/CompareIcon', description: 'Compare materials — drie staafjes oplopend (custom SVG, versie-stabiel)' },
      { name: 'IconShare', source: 'lucide-react/Share2', description: 'Share-actie' },
      { name: 'IconBoard', source: 'lucide-react/Folder', description: 'Add to board' },
      { name: 'IconBoardAdd', source: 'lucide-react/FolderPlus', description: '+ Add to board variant' },
      { name: 'IconDelete', source: 'lucide-react/Trash2', description: 'Verwijderen' },
      { name: 'IconDownload', source: 'lucide-react/Download', description: 'Download-actie' },
      { name: 'IconUpload', source: 'lucide-react/Upload', description: 'Upload-actie' },
      { name: 'IconEdit', source: 'lucide-react/Pencil', description: 'Edit-actie' },
      { name: 'IconAdd', source: 'lucide-react/Plus', description: 'Toevoegen' },
      { name: 'IconClose', source: 'lucide-react/X', description: 'Sluiten (modal, banner, drawer)' },
      { name: 'IconSearch', source: 'lucide-react/Search', description: 'Zoekfunctionaliteit' },
      { name: 'IconFilter', source: 'lucide-react/SlidersHorizontal', description: 'FilterSidebar trigger' },
      { name: 'IconFilterAlt', source: 'lucide-react/Filter', description: 'Compact filter-icoon' },
      { name: 'IconCopy', source: 'lucide-react/Copy', description: 'Kopieer-naar-clipboard' },
      { name: 'IconExternal', source: 'lucide-react/ExternalLink', description: 'Externe link-indicator' },
    ],
  },
  {
    title: 'Navigatie',
    description: 'Navigeren door content — pagination, accordion, dropdowns, drawers.',
    items: [
      { name: 'IconChevronRight', source: 'lucide-react/ChevronRight', description: 'Pagination next, breadcrumb' },
      { name: 'IconChevronLeft', source: 'lucide-react/ChevronLeft', description: 'Pagination prev, back' },
      { name: 'IconChevronUp', source: 'lucide-react/ChevronUp', description: 'Accordion collapse' },
      { name: 'IconChevronDown', source: 'lucide-react/ChevronDown', description: 'Accordion expand, dropdown' },
      { name: 'IconArrowRight', source: 'lucide-react/ArrowRight', description: 'TextLink "All materials →"' },
      { name: 'IconArrowLeft', source: 'lucide-react/ArrowLeft', description: 'Back to overview' },
      { name: 'IconArrowUp', source: 'lucide-react/ArrowUp', description: 'Back to top' },
      { name: 'IconArrowDown', source: 'lucide-react/ArrowDown', description: 'Sort indicator' },
      { name: 'IconMenu', source: 'lucide-react/Menu', description: 'Mobile drawer trigger' },
      { name: 'IconMoreHorizontal', source: 'lucide-react/MoreHorizontal', description: 'Inline overflow-menu' },
      { name: 'IconMoreVertical', source: 'lucide-react/MoreVertical', description: 'Card-overflow-menu' },
    ],
  },
  {
    title: 'Status & feedback',
    description: 'Validatie-resultaten, info, lock-states, password-reveal.',
    items: [
      { name: 'IconCheck', source: 'lucide-react/Check', description: 'Vink (form-success, "Added ✓")' },
      { name: 'IconErrorMark', source: 'lucide-react/X', description: 'X (form-error in indicator-cirkel)' },
      { name: 'IconWarning', source: 'lucide-react/AlertTriangle', description: 'Warning-meldingen' },
      { name: 'IconInfo', source: 'lucide-react/Info', description: 'Info-tooltip, helper-tekst' },
      { name: 'IconAlert', source: 'lucide-react/AlertCircle', description: 'Algemene melding' },
      { name: 'IconLoading', source: 'lucide-react/Loader2', description: 'Loading-spinner (animation)' },
      { name: 'IconLock', source: 'lucide-react/Lock', description: 'Brand-tier gate (Plus/Partner)' },
      { name: 'IconLockOpen', source: 'lucide-react/LockKeyhole', description: 'Lock-variant met sleutelgat' },
      { name: 'IconShield', source: 'lucide-react/Shield', description: 'Brand-tier gate (alternatief)' },
      { name: 'IconShieldCheck', source: 'lucide-react/ShieldCheck', description: 'Verified status' },
      { name: 'IconEye', source: 'lucide-react/Eye', description: 'Preview-button, password-reveal' },
      { name: 'IconEyeOff', source: 'lucide-react/EyeOff', description: 'Password-hide' },
    ],
  },
  {
    title: 'Content-type indicators',
    description: 'Gebruikt op Tags voor het type content (material, article, etc.).',
    items: [
      { name: 'IconMaterial', source: 'lucide-react/Layers', description: 'material — composiet/lagen' },
      { name: 'IconArticle', source: 'lucide-react/Newspaper', description: 'article — krantje' },
      { name: 'IconEvent', source: 'lucide-react/Calendar', description: 'event — kalender' },
      { name: 'IconBook', source: 'lucide-react/BookOpen', description: 'book — open boek' },
      { name: 'IconBrand', source: 'lucide-react/Building', description: 'brand — gebouw' },
      { name: 'IconTalk', source: 'lucide-react/Mic', description: 'talk — microfoon' },
      { name: 'IconPeople', source: 'lucide-react/User', description: 'people — single persoon' },
      { name: 'IconStory', source: 'lucide-react/Users', description: 'story — meerdere = collaboration' },
    ],
  },
  {
    title: 'UI & contact',
    description: 'Header-actions, contact-info, theme, settings.',
    items: [
      { name: 'IconMail', source: 'lucide-react/Mail', description: 'Email contact' },
      { name: 'IconPhone', source: 'lucide-react/Phone', description: 'Phone contact' },
      { name: 'IconMapPin', source: 'lucide-react/MapPin', description: 'Locatie/adres' },
      { name: 'IconSettings', source: 'lucide-react/Settings', description: 'Instellingen' },
      { name: 'IconSun', source: 'lucide-react/Sun', description: 'Theme toggle (light)' },
      { name: 'IconMoon', source: 'lucide-react/Moon', description: 'Theme toggle (dark)' },
      { name: 'IconCart', source: 'lucide-react/ShoppingBag', description: 'Cart (header) — boeken/samples' },
      { name: 'IconHeart', source: 'lucide-react/Heart', description: 'Favorites/like' },
      { name: 'IconBell', source: 'lucide-react/Bell', description: 'Notificaties' },
      { name: 'IconTagFilter', source: 'lucide-react/Tag', description: 'Tag-filter-icoon' },
      { name: 'IconImage', source: 'lucide-react/Image', description: 'Afbeelding-placeholder/upload' },
      { name: 'IconGlobe', source: 'lucide-react/Globe', description: 'Land/internationaal' },
      { name: 'IconLogin', source: 'lucide-react/LogIn', description: 'Login-actie' },
      { name: 'IconLogout', source: 'lucide-react/LogOut', description: 'Logout-actie' },
      { name: 'IconHelp', source: 'lucide-react/CircleHelp', description: 'Help/uitleg' },
    ],
  },
  {
    title: 'Featured & highlight',
    description: 'Markeren van uitgelichte content (featured material, sponsored placement).',
    items: [
      { name: 'IconFeatured', source: 'lucide-react/Star', description: 'Featured material/article' },
    ],
  },
  {
    title: 'Insider Insights',
    description: 'Dashboard-navigatie en rapporten voor Insiders.',
    items: [
      { name: 'IconInsiderInsights', source: 'lucide-react/Lightbulb', description: 'Insider insights / trend-rapporten' },
    ],
  },
  {
    title: 'Socials',
    description:
      'Social-platform-logos. Bron: react-icons/fa6 (Font Awesome) — lucide-react heeft deze niet meer wegens brand-richtlijnen.',
    items: [
      { name: 'IconLinkedin', source: 'react-icons/fa6/FaLinkedin', description: 'LinkedIn — primair voor MaterialDistrict (B2B)' },
      { name: 'IconX', source: 'react-icons/fa6/FaXTwitter', description: 'X (voorheen Twitter)' },
      { name: 'IconInstagram', source: 'react-icons/fa6/FaInstagram', description: 'Instagram' },
      { name: 'IconYoutube', source: 'react-icons/fa6/FaYoutube', description: 'YouTube' },
      { name: 'IconPinterest', source: 'react-icons/fa6/FaPinterest', description: 'Pinterest' },
      { name: 'IconFacebook', source: 'react-icons/fa6/FaFacebook', description: 'Facebook' },
    ],
  },
]
