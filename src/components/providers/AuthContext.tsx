'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface AuthState {
  isLoggedIn: boolean
  isMember: boolean
  /** User-object zal in sessie 4 worden gevuld vanuit WordPress. */
  user: null | { id: number; email: string; name: string }
}

interface AuthContextValue extends AuthState {
  /** Mock-functie. Wordt in sessie 4 vervangen door een echte login-flow. */
  signIn: (asMember?: boolean) => void
  /** Mock sign-out. */
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * AuthProvider — mock auth state voor sessie 3 smoke-test.
 *
 * In sessie 4 wordt deze vervangen door een echte provider die:
 *  - de WordPress JWT-cookie leest
 *  - via `/api/me` de actieve user ophaalt
 *  - membership-status uit MemberPress controleert
 *  - SSR-veilig hydrateert via een server-side initial value
 *
 * Voor nu: pure client-state, default uitgelogd. `signIn(asMember)` switcht naar
 * logged-in (en optioneel Insider). Handig voor smoke-test van Header en gates.
 */
export function AuthProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  /** Optionele beginstaat (handig voor smoke-test of preview). */
  initialState?: Partial<AuthState>
}) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isMember: false,
    user: null,
    ...initialState,
  })

  const signIn = useCallback((asMember = false) => {
    setState({
      isLoggedIn: true,
      isMember: asMember,
      user: { id: 1, email: 'demo@materialdistrict.com', name: 'Demo user' },
    })
  }, [])

  const signOut = useCallback(() => {
    setState({ isLoggedIn: false, isMember: false, user: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
