'use client';

// lib/AuthContext.tsx
//
// The session now lives in httpOnly cookies, so this context can't (and must
// not) read tokens out of the browser. It asks the server who the visitor is
// via GET /api/auth/me and routes every sign-in / sign-out through our own
// API, which is the only place that writes auth cookies.
//
// The upside beyond security: there is exactly one writer of the session
// cookie now. The old split — browser SDK for password login, server route for
// Google, proxy rewriting both — is what made Google sign-in depend on which
// request happened to land last.

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/** Everything the UI actually needs. Deliberately no tokens. */
export type SessionUser = {
  id: string;
  email: string | null;
  /**
   * Whether the address has been confirmed. Optional so an older cached
   * response, or a deploy where the two halves land a moment apart, is treated
   * as "unknown" rather than crashing — the UI falls back to not nagging, and
   * the server still enforces the real rule on every paid route.
   */
  emailVerified?: boolean;
};

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    accepted: boolean
  ) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (returnTo?: string, accepted?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.error === 'string' ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user ?? null);
    } catch (err) {
      console.error('Could not determine auth state:', err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = res.ok ? await res.json() : { user: null };
        if (isMounted) setUser(data.user ?? null);
      } catch (err) {
        console.error('Could not determine auth state:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    // Another tab signing in or out should be reflected here. The old
    // implementation got this from the SDK's onAuthStateChange; with the
    // session server-side we re-check when the tab regains focus instead.
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error(await readError(res, 'Invalid email or password'));

    const data = await res.json();
    setUser(data.user ?? null);
    setLoading(false);
  };

  // `accepted` carries the age + terms tickbox. The route rejects anything
  // but true, so this is not an optional argument in practice — it is passed
  // explicitly to make it obvious at every call site that an account cannot
  // be created without it.
  const signUp = async (email: string, password: string, accepted: boolean) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        acceptedTerms: accepted,
        confirmedAge: accepted,
      }),
    });

    if (!res.ok) throw new Error(await readError(res, 'Signup failed. Please try again.'));

    const data = await res.json();
    // When email confirmation is off, Supabase signs the user straight in.
    if (!data.needsConfirmation) await refresh();
    return { needsConfirmation: Boolean(data.needsConfirmation) };
  };

  // `accepted` says the caller put the age + terms wording in front of the
  // person before this ran. Google sign-in creates the account as a side
  // effect, so if it is not captured here it is never captured at all.
  const signInWithGoogle = async (returnTo?: string, accepted = false) => {
    // A full navigation, not fetch(): the server needs to set the PKCE
    // verifier cookie via a real Set-Cookie header that is committed before
    // the browser leaves for Google.
    const params = new URLSearchParams();
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      params.set('returnTo', returnTo);
    }
    if (accepted) params.set('accepted', '1');
    const query = params.toString();
    window.location.href = query ? `/api/auth/google?${query}` : '/api/auth/google';
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
