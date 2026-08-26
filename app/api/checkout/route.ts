// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/api-errors';
import { safeReturnTo } from '@/lib/auth-cookies';
import { supabaseServer } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import {
  STRIPE_PRICE_IDS,
  CHECKOUT_BRANDING,
  CHECKOUT_SUBMIT_MESSAGE,
  IMMEDIATE_DELIVERY_NOTICE,
  type ProductType,
} from '@/lib/plans';
import { checkPurchaseEligibility } from '@/lib/purchase-rules';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

const CheckoutSchema = z.object({
  productType: z.enum(['basic', 'full', 'followup_unlock', 'topup']),
  // resultId is no longer used by followup_unlock (it's now an account-wide
  // bundle purchase), but kept optional/accepted for backward compatibility
  // in case any old client code still sends it — it's simply ignored.
  resultId: z.string().uuid().optional(),
  // Where to send the customer after they come back from Stripe. The client
  // also stashes this in sessionStorage, but sessionStorage does not survive
  // every return trip (some in-app browsers hand the redirect to a brand new
  // tab), so it travels through the session metadata as well and is handed
  // back by /api/checkout/verify.
  returnPath: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { productType } = parsed.data;

    // ─── Business rule checks ──────────────────────────────────────────
    const { data: sub, error: subError } = await supabaseServer
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !sub) {
      return NextResponse.json({ error: 'Subscription record not found' }, { status: 500 });
    }

    const denial = checkPurchaseEligibility(productType, sub);
    if (denial) {
      const { status, ...body } = denial;
      return NextResponse.json(body, { status });
    }

    // ─── Create Stripe Checkout Session ────────────────────────────────
    const priceId = STRIPE_PRICE_IDS[productType as ProductType];
    if (!priceId) {
      // Missing env var — fail loudly here instead of letting Stripe return
      // a confusing "No such price: undefined".
      throw new Error(`No Stripe price ID configured for product "${productType}"`);
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://careerbridge-way.vercel.app';
    const returnPath = safeReturnTo(parsed.data.returnPath, '/assess');

    // A logo only appears if one is actually reachable — pointing Stripe at a
    // URL that 404s makes session creation fail, which would take checkout
    // down entirely. Unset by default; set STRIPE_CHECKOUT_LOGO_URL once a
    // real logo file is deployed.
    const logoUrl = process.env.STRIPE_CHECKOUT_LOGO_URL;
    // The icon is the small square mark beside the business name in the
    // Checkout header; the logo is the wider lockup. Stripe shows one or the
    // other depending on the "Prefer logo over icon" toggle in the Dashboard.
    const iconUrl = process.env.STRIPE_CHECKOUT_ICON_URL;

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      // payment_method_types is deliberately NOT set. Pinning it to ['card']
      // hid every local method from customers paying in EUR — iDEAL,
      // Bancontact, SEPA. Leaving it off lets Stripe offer whatever is
      // enabled in the Dashboard, matched to the customer's country, and
      // means changing the mix is a Dashboard toggle rather than a deploy.
      line_items: [{ price: priceId, quantity: 1 }],
      // Follows the browser's language rather than defaulting to English.
      locale: 'auto',
      branding_settings: {
        ...CHECKOUT_BRANDING,
        ...(logoUrl ? { logo: { type: 'url' as const, url: logoUrl } } : {}),
        ...(iconUrl ? { icon: { type: 'url' as const, url: iconUrl } } : {}),
      },
      custom_text: {
        // Two things the customer needs at the moment they decide: what they
        // get, and the fact that receiving it immediately ends their 14-day
        // cancellation right. See IMMEDIATE_DELIVERY_NOTICE in lib/plans.ts.
        submit: {
          message: `${CHECKOUT_SUBMIT_MESSAGE[productType]} ${IMMEDIATE_DELIVERY_NOTICE}`,
        },
      },
      // A tickbox tying the purchase to the published terms. Behind an env
      // flag because Stripe rejects session creation if consent is required
      // and no terms-of-service URL is set in the Dashboard — switching this
      // on before that is configured would take checkout down entirely.
      // Set the URL under Settings → Checkout, then STRIPE_REQUIRE_TOS=true.
      ...(process.env.STRIPE_REQUIRE_TOS === 'true'
        ? { consent_collection: { terms_of_service: 'required' as const } }
        : {}),
      // Metadata is read by the webhook and by /api/checkout/verify — this is
      // how we know what to grant, and where to drop the customer afterwards.
      metadata: {
        userId: user.id,
        productType,
        returnPath,
      },
      client_reference_id: user.id,
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      // The cancel URL gets no session id from Stripe, so the return path
      // rides along in the query string instead. The cancelled page runs it
      // through the same same-site check before navigating.
      cancel_url: `${baseUrl}/payment/cancelled?return=${encodeURIComponent(returnPath)}`,
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    Sentry.captureException(err);
    const message = err instanceof Error ? err.message : String(err);
    console.error('CHECKOUT ERROR:', message);
    const errorMsg = process.env.NODE_ENV === 'development'
      ? message
      : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
