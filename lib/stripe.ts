// lib/stripe.ts
import Stripe from 'stripe';

// Lazily instantiated — avoids "apiKey not provided" errors during
// Next.js build-time page data collection, when env vars aren't available.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia',
    });
  }
  return _stripe;
}