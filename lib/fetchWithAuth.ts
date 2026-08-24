// lib/fetchWithAuth.ts
//
// Authenticated fetch for client components.
//
// The session is an httpOnly cookie, so `credentials: 'include'` is all the
// authentication there is — the browser attaches it and the server validates
// it in requireAuth(). There is deliberately no Bearer token here any more:
// obtaining one would have meant exposing the access token to JavaScript,
// which is exactly what we moved away from.
//
// This also removes the old 400ms "wait for the SDK to rehydrate" retry. A
// cookie is present from the very first request of a page load, so there is
// nothing to wait for.

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // IMPORTANT: Do NOT read response.text() or response.json() here.
  // Reading the body stream consumes it, making it impossible for the
  // caller to read the response body afterwards.
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}
