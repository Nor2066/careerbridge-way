// app/api/events/route.ts
//
// Receives funnel events from lib/analytics.ts.
//
// Two jobs beyond writing a row, and both are about making this endpoint
// boring rather than useful to an attacker:
//
//   1. It is public and unauthenticated, because the most valuable events
//      happen before anyone signs in. That makes it the easiest thing on the
//      site to flood, so it is rate limited hard and stores nothing a caller
//      can choose freely.
//
//   2. Nothing the client sends is trusted as-is. Event names come from an
//      allowlist, props are capped in count and size and may only be small
//      scalars, and the user id is taken from the session rather than the
//      body. A public write endpoint that accepts arbitrary JSON is a free
//      database-growth vector, which is precisely the "Allow anonymous
//      inserts" policy we removed from `assessments` last week.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { supabaseServer } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { getIP } from '@/lib/rate-limit';
import { EVENTS } from '@/lib/analytics';
import { NO_STORE_HEADERS } from '@/lib/auth-cookies';

export const dynamic = 'force-dynamic';

// Its own limiter rather than sharing readLimiter: a quiz emits an event per
// question, so the normal rate here is genuinely higher than for a read
// endpoint, and it should not be able to exhaust anyone else's budget.
const eventLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(120, '60 s'),
  analytics: false,
  prefix: 'rl:events',
});

/** Small scalars only. No free text — see the note in lib/analytics.ts. */
const PropValue = z.union([
  z.string().max(64),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

const EventSchema = z.object({
  event: z.enum(EVENTS),
  sessionId: z.string().min(8).max(64),
  path: z.string().max(200).optional(),
  props: z.record(z.string().max(32), PropValue).optional(),
});

export async function POST(request: Request) {
  // Deliberately no same-origin check. Events fire from pages the visitor is
  // navigating away from, where browsers are inconsistent about sending
  // Origin, and the cost of a forged event is a junk row rather than an
  // action. The rate limit is what protects this endpoint.
  const ip = getIP(request);
  const { success } = await eventLimiter.limit(ip);
  if (!success) {
    // 204 rather than 429: the client is fire-and-forget and cannot act on
    // this, and an error status would only show up as console noise for a
    // visitor who has done nothing wrong.
    return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS });
  }

  try {
    const parsed = EventSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS });
    }

    const { event, sessionId, path, props } = parsed.data;

    // A handful of keys, so one caller cannot store an object of arbitrary
    // size under the guise of properties.
    const trimmedProps = Object.fromEntries(
      Object.entries(props ?? {}).slice(0, 10)
    );

    // From the session, never from the body. Anonymous events are the norm
    // here and a null user_id is expected, not an error.
    const user = await getAuthenticatedUser();

    const { error } = await supabaseServer.from('analytics_events').insert({
      event,
      session_id: sessionId,
      user_id: user?.id ?? null,
      path: path ?? null,
      props: trimmedProps,
    });

    if (error) {
      // Logged, not surfaced. Losing an event must never affect the visitor.
      console.error('EVENTS: insert failed:', error.message);
    }

    return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS });
  } catch {
    return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS });
  }
}
