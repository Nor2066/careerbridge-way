// lib/api-errors.ts
//
// requireAuth() used to throw a plain Error('Unauthorized'), which every route
// caught in the same try/catch it uses for database failures — so an expired
// session came back as 500 "Internal server error". Three things went wrong
// with that: the client could not tell "sign in again" from "we are broken",
// the user saw an alarming message for an ordinary event, and Sentry filled up
// with reports that were not faults.
//
// A typed error lets a route answer 401 for the one case and keep 500 for the
// rest, without each route having to string-match a message.

import { NextResponse } from 'next/server';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export function isUnauthorized(err: unknown): boolean {
  return err instanceof UnauthorizedError;
}

/**
 * The single 401 body shape. `code` is what client code branches on —
 * PaymentSuccessClient and PricingContent already look for it.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Your session has expired. Please sign in again.', code: 'UNAUTHENTICATED' },
    { status: 401 }
  );
}

/**
 * The caller is signed in, but has not proved they own the email address.
 *
 * Distinct from Unauthorized on purpose: the fix is not "sign in again", it is
 * "go and click the link we sent you", and the client needs to tell those two
 * apart to show the right thing.
 */
export class EmailNotVerifiedError extends Error {
  constructor(message = 'Email not verified') {
    super(message);
    this.name = 'EmailNotVerifiedError';
  }
}

export function isEmailNotVerified(err: unknown): boolean {
  return err instanceof EmailNotVerifiedError;
}

export function emailNotVerifiedResponse() {
  return NextResponse.json(
    {
      error:
        'Please confirm your email address first — we sent you a link when you signed up. You can send a new one from your account page.',
      code: 'EMAIL_NOT_VERIFIED',
    },
    { status: 403 }
  );
}
