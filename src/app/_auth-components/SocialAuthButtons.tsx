/**
 * SocialAuthButtons — Google + LinkedIn login, gedeeld door /sign-in en
 * /register.
 *
 * FORWARD-BUILT: de knoppen wijzen naar de OAuth-start-endpoints die Johan
 * nog moet bouwen (`/api/auth/oauth/{provider}`). Tot die bestaan doen ze
 * niets functioneels — de UI staat klaar zodat inschakelen één backend-stap
 * is. Identiteit blijft in WordPress (geen externe auth-service); de flow
 * eindigt met dezelfde JWT-cookie als e-mail/wachtwoord-login. Account-type
 * (Discover/List) wordt ná een eerste social login in een mini-stap gevraagd.
 */

interface SocialAuthButtonsProps {
  /** Sanitised post-login target, forwarded to the OAuth callback. */
  next: string
  /** Werkwoord in het label: 'Continue' (register) of 'Log in' (sign-in). */
  verb?: string
}

function oauthHref(provider: 'google' | 'linkedin', next: string): string {
  return `/api/auth/oauth/${provider}?next=${encodeURIComponent(next)}`
}

export function SocialAuthButtons({ next, verb = 'Continue' }: SocialAuthButtonsProps) {
  return (
    <div className="auth-social">
      <a className="auth-social-btn" href={oauthHref('google', next)}>
        <GoogleMark />
        <span>{verb} with Google</span>
      </a>
      <a className="auth-social-btn" href={oauthHref('linkedin', next)}>
        <LinkedInMark />
        <span>{verb} with LinkedIn</span>
      </a>
      <div className="auth-social-divider"><span>or</span></div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg className="auth-social-icon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  )
}

function LinkedInMark() {
  return (
    <svg className="auth-social-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}
