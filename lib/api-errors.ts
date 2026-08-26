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
