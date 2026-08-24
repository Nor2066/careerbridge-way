// lib/logout.ts
//
// Sign-out for the admin area. Goes through the API because the session
// cookies are httpOnly — client JavaScript cannot clear them itself, and the
// server call also revokes the refresh token rather than merely dropping it.
export async function logout() {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    // Clear anything the app cached locally. The session was never in here,
    // but assessment drafts and UI state can be.
    localStorage.clear();
    sessionStorage.clear();

    // Full reload so every server component re-runs its auth check.
    window.location.href = '/admin/login';
  }
}
