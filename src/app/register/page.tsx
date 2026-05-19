import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, WordPressAuthError } from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'
import { AuthPageLayout } from '@/app/_auth-components/AuthPageLayout'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = {
  title: 'Create your account',
  robots: { index: false, follow: false },
}

interface RegisterPageProps {
  searchParams: Promise<{ next?: string }>
}

/**
 * Register page.
 *
 * Same already-logged-in short-circuit as /sign-in. Same `?next=`
 * forwarding to land on the original destination after the auto-login
 * that follows successful registration.
 */
export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams
  const safeNext = sanitizeNext(next)

  const token = await getAuthCookie()
  if (token) {
    try {
      await getCurrentUser(token)
      redirect(safeNext)
    } catch (err) {
      if (!(err instanceof WordPressAuthError)) {
        console.error('[register] session check failed', err)
      }
    }
  }

  return (
    <AuthPageLayout
      heading="Create your account"
      subheading="Free account — discover materials, save favourites, and request samples."
      footer={
        <>
          <span className="auth-card-footer-text">Already have an account?</span>{' '}
          <a
            className="auth-card-footer-link"
            href={`/sign-in${next ? `?next=${encodeURIComponent(safeNext)}` : ''}`}
          >
            Sign in
          </a>
        </>
      }
    >
      <RegisterForm next={safeNext} />
    </AuthPageLayout>
  )
}

function sanitizeNext(next: string | undefined): string {
  const fallback = '/materials'
  if (!next || next.length === 0) return fallback
  if (next[0] !== '/') return fallback
  if (next.length > 1 && (next[1] === '/' || next[1] === '\\')) return fallback
  return next
}
