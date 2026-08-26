// lib/recovery-cookie.ts
//
// A short-lived, httpOnly marker saying "this session was created by clicking
// a password-recovery link, and the holder may therefore set a new password
// without supplying the old one".
//
// It lives in its own tiny module because both /api/auth/set-session (which
// writes it) and /api/auth/update-password (which spends it) need the name and
// the lifetime, and a constant defined twice is a constant that will disagree
// with itself eventually.
//
// Why a cookie rather than a flag in the request body: the body is written by
// client JavaScript, so a flag there proves nothing. This is set server-side,
// is httpOnly, and cannot be read or forged by any script on the page.

export const RECOVERY_COOKIE = 'cbw-pw-recovery';

/**
 * Fifteen minutes. Long enough to read the email, click through, and choose a
 * password without being rushed; short enough that a recovery session left
 * open on a library computer stops being a password-change ticket quickly.
 */
export const RECOVERY_COOKIE_MAX_AGE = 60 * 15;
