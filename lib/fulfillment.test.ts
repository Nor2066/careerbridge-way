import { describe, it, expect, beforeEach, vi } from 'vitest';

// fulfillment.ts builds its Supabase admin client at module load from env
// vars, so these must exist before the import below is evaluated.
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';

/**
 * Records every write and replays canned responses. Covers exactly the call
 * chains fulfillment.ts uses:
 *   from(t).insert(row)                        -> { error }
 *   from(t).select().eq().single()             -> { data, error }
 *   from(t).update(patch).eq()...select()      -> { data, error }
 *
 * The update chain is a compare-and-swap: it carries one .eq per guarded
 * column (or .is for a NULL one) and ends in .select(), whose row count says
 * whether this writer won. `updateMatches` drives that — shift a `false` onto
 * it to simulate losing a race and force the retry path.
 */
function makeSupabaseStub() {
  const state = {
    inserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
    updates: [] as Array<{
      table: string;
      patch: Record<string, unknown>;
      guards: Array<[string, unknown]>;
    }>,
    insertError: null as { code?: string; message?: string } | null,
    updateError: null as { code?: string; message?: string } | null,
    // One entry consumed per update; `false` means zero rows matched.
    updateMatches: [] as boolean[],
    subscription: null as Record<string, unknown> | null,
    subscriptionError: null as { message?: string } | null,
  };

  const client = {
    from(table: string) {
      return {
        insert(row: Record<string, unknown>) {
          state.inserts.push({ table, row });
          return Promise.resolve({ error: state.insertError });
        },
        select() {
          return {
            eq() {
              return {
                single: () =>
                  Promise.resolve({
                    data: state.subscription,
                    error: state.subscriptionError,
                  }),
              };
            },
          };
        },
        update(patch: Record<string, unknown>) {
          const record = { table, patch, guards: [] as Array<[string, unknown]> };
          state.updates.push(record);

          const chain = {
            eq(column: string, value: unknown) {
              // user_id is the row selector, not a concurrency guard.
              if (column !== 'user_id') record.guards.push([column, value]);
              return chain;
            },
            is(column: string, value: unknown) {
              record.guards.push([column, value]);
              return chain;
            },
            select() {
              const matched = state.updateMatches.length
                ? state.updateMatches.shift()
                : true;
              return Promise.resolve({
                data: matched ? [{ user_id: 'user-1' }] : [],
                error: state.updateError,
              });
            },
          };

          return chain;
        },
      };
    },
  };

  return { state, client };
}

const stub = makeSupabaseStub();
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => stub.client,
}));

const { fulfillCheckoutSession } = await import('@/lib/fulfillment');
const { ATTEMPTS_GRANTED, PRODUCT_AMOUNTS_CENTS } = await import('@/lib/plans');

type Product = 'basic' | 'full' | 'topup' | 'followup_unlock';

const BASE_SUB = {
  user_id: 'user-1',
  plan: 'free',
  main_attempts_remaining: 0,
  topup_followup_credits: 0,
  followup_bundle_purchased: false,
  bonus_attempt_granted: false,
};

beforeEach(() => {
  stub.state.inserts = [];
  stub.state.updates = [];
  stub.state.insertError = null;
  stub.state.updateError = null;
  stub.state.updateMatches = [];
  stub.state.subscriptionError = null;
  stub.state.subscription = { ...BASE_SUB };
});

const fulfill = (
  productType: Product,
  sessionId = 'cs_1',
  extra: { amountTotal?: number | null; currency?: string | null } = {}
) =>
  fulfillCheckoutSession({
    userId: 'user-1',
    productType,
    sessionId,
    paymentIntentId: 'pi_1',
    ...extra,
  });

describe('idempotency: the double-grant guard', () => {
  // The webhook and the success page's verify call race each other by design.
  // The unique constraint on payments.stripe_session_id decides the winner;
  // the loser must back off WITHOUT touching the subscription.
  it('reports already_processed on a unique violation and grants nothing', async () => {
    stub.state.insertError = { code: '23505', message: 'duplicate key' };

    const outcome = await fulfill('full');

    expect(outcome).toBe('already_processed');
    expect(stub.state.updates).toHaveLength(0);
  });

  it('grants exactly once when the same session is fulfilled twice', async () => {
    expect(await fulfill('topup', 'cs_race')).toBe('granted');

    // Second caller hits the constraint.
    stub.state.insertError = { code: '23505' };
    expect(await fulfill('topup', 'cs_race')).toBe('already_processed');

    expect(stub.state.updates).toHaveLength(1);
  });

  it('rethrows insert failures that are not unique violations', async () => {
    stub.state.insertError = { code: '08006', message: 'connection failure' };

    await expect(fulfill('basic')).rejects.toMatchObject({ code: '08006' });
    expect(stub.state.updates).toHaveLength(0);
  });
});

describe('the payments row', () => {
  it('falls back to the configured amount when Stripe sends none', async () => {
    for (const p of ['basic', 'full', 'topup', 'followup_unlock'] as const) {
      stub.state.inserts = [];
      stub.state.subscription = { ...BASE_SUB };

      await fulfill(p, `cs_${p}`);

      expect(stub.state.inserts).toHaveLength(1);
      expect(stub.state.inserts[0].table).toBe('payments');
      expect(stub.state.inserts[0].row).toMatchObject({
        user_id: 'user-1',
        stripe_session_id: `cs_${p}`,
        product_type: p,
        amount_cents: PRODUCT_AMOUNTS_CENTS[p],
        currency: 'eur',
        status: 'completed',
      });
    }
  });

  it('stores a null payment intent when none was supplied', async () => {
    await fulfillCheckoutSession({
      userId: 'user-1',
      productType: 'basic',
      sessionId: 'cs_nopi',
    });

    expect(stub.state.inserts[0].row.stripe_payment_intent_id).toBeNull();
  });
});

describe('the recorded amount', () => {
  // The point of the change: Stripe prices are immutable, so replacing one
  // means pointing STRIPE_PRICE_* at a new object. If the amount were read
  // from a constant in the code, the payments table would quietly disagree
  // with what the customer was actually charged until someone redeployed.
  it('records what Stripe charged, not the configured constant', async () => {
    await fulfill('topup', 'cs_amt', { amountTotal: 500, currency: 'eur' });

    expect(stub.state.inserts[0].row.amount_cents).toBe(500);
    expect(PRODUCT_AMOUNTS_CENTS.topup).not.toBe(500); // the constant still says 300
  });

  it('records the currency Stripe used', async () => {
    await fulfill('basic', 'cs_cur', { amountTotal: 300, currency: 'usd' });
    expect(stub.state.inserts[0].row.currency).toBe('usd');
  });

  it('still fulfils, using the fallback, when amount_total is null', async () => {
    const outcome = await fulfill('full', 'cs_null', { amountTotal: null });

    expect(outcome).toBe('granted');
    expect(stub.state.inserts[0].row.amount_cents).toBe(PRODUCT_AMOUNTS_CENTS.full);
    // a missing amount must never block a paid customer's grant
    expect(stub.state.updates).toHaveLength(1);
  });

  it('records a zero amount rather than treating it as missing', async () => {
    // 0 is falsy; ?? must let it through or a 100%-discounted purchase
    // would be recorded at full price.
    await fulfill('topup', 'cs_zero', { amountTotal: 0, currency: 'eur' });
    expect(stub.state.inserts[0].row.amount_cents).toBe(0);
  });
});

describe('granting a base plan', () => {
  it.each([
    ['basic', 'basic'],
    ['full', 'full'],
  ] as const)('%s sets the plan and adds its attempts', async (product, plan) => {
    stub.state.subscription = { ...BASE_SUB, main_attempts_remaining: 1 };

    await fulfill(product);

    expect(stub.state.updates).toHaveLength(1);
    expect(stub.state.updates[0].table).toBe('subscriptions');
    expect(stub.state.updates[0].patch).toEqual({
      plan,
      main_attempts_remaining: 1 + ATTEMPTS_GRANTED[product],
    });
  });
});

describe('granting a top-up', () => {
  it('adds attempts and followup credits together, leaving the plan alone', async () => {
    stub.state.subscription = {
      ...BASE_SUB,
      plan: 'basic',
      main_attempts_remaining: 2,
      topup_followup_credits: 1,
    };

    await fulfill('topup');

    const patch = stub.state.updates[0].patch;
    expect(patch).toEqual({
      main_attempts_remaining: 2 + ATTEMPTS_GRANTED.topup,
      topup_followup_credits: 1 + ATTEMPTS_GRANTED.topup,
    });
    expect(patch).not.toHaveProperty('plan');
  });

  it('treats a null credit balance as zero', async () => {
    stub.state.subscription = { ...BASE_SUB, plan: 'full', topup_followup_credits: null };

    await fulfill('topup');

    expect(stub.state.updates[0].patch.topup_followup_credits).toBe(ATTEMPTS_GRANTED.topup);
  });
});

describe('granting the followup bundle', () => {
  it('unlocks followups and hands over the bonus attempt', async () => {
    stub.state.subscription = { ...BASE_SUB, plan: 'basic', main_attempts_remaining: 0 };

    await fulfill('followup_unlock');

    expect(stub.state.updates[0].patch).toEqual({
      followup_bundle_purchased: true,
      main_attempts_remaining: 1,
      bonus_attempt_granted: true,
    });
  });

  // A legacy account already received the bonus under the old per-attempt
  // pricing. Buying the bundle must not hand out a second one.
  it('does not re-grant the bonus attempt to a legacy account', async () => {
    stub.state.subscription = {
      ...BASE_SUB,
      plan: 'basic',
      main_attempts_remaining: 4,
      bonus_attempt_granted: true,
    };

    await fulfill('followup_unlock');

    expect(stub.state.updates[0].patch).toEqual({ followup_bundle_purchased: true });
  });
});

// Two payments settling at the same moment used to be a silent loss: both
// webhooks read the same balance, both wrote the same total, and the customer
// was credited once for two purchases. The write is now pinned to the values
// it was derived from, so the loser is told it lost and tries again.
describe('concurrent grants', () => {
  it('pins every derived counter to the value it was read from', async () => {
    stub.state.subscription = { ...BASE_SUB, plan: 'full', main_attempts_remaining: 4, topup_followup_credits: 2 };

    await fulfill('topup');

    expect(stub.state.updates[0].guards).toEqual(
      expect.arrayContaining([
        ['main_attempts_remaining', 4],
        ['topup_followup_credits', 2],
      ])
    );
  });

  it('re-reads and retries when another writer got there first', async () => {
    stub.state.subscription = { ...BASE_SUB, main_attempts_remaining: 0 };
    // First write matches nothing; the row is re-read and the second wins.
    stub.state.updateMatches = [false, true];

    const outcome = await fulfill('basic');

    expect(outcome).toBe('granted');
    expect(stub.state.updates).toHaveLength(2);
  });

  it('throws rather than dropping a paid grant it can never apply', async () => {
    stub.state.subscription = { ...BASE_SUB };
    stub.state.updateMatches = [false, false, false, false, false];

    await expect(fulfill('full')).rejects.toThrow(/Could not apply full grant/);
  });
});

describe('failure handling', () => {
  it('throws when the subscription row is missing', async () => {
    stub.state.subscription = null;

    await expect(fulfill('basic')).rejects.toThrow(/Subscription not found for user user-1/);
  });

  it('propagates a failed subscription update', async () => {
    stub.state.updateError = { code: '23514', message: 'check constraint' };

    await expect(fulfill('full')).rejects.toMatchObject({ code: '23514' });
  });
});
