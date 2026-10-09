// app/api/subscription-status/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { getSubscription, canStartAssessment } from '@/lib/subscription';
import { getLicence, getStaffInstitutions, resultHasInstitutionFollowup } from '@/lib/institutions';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // getLicence also joins a student to their university the first time they
    // arrive with a verified address on its domain — this route runs on every
    // page through the navbar, which makes it the natural moment.
    const [sub, licence, staffOf] = await Promise.all([
      getSubscription(user.id),
      getLicence(user),
      getStaffInstitutions(user),
    ]);
    const licenceAttempts = licence?.attemptsRemaining ?? 0;
    const startCheck = canStartAssessment(sub, licenceAttempts);

    // Is the attempt in flight one the university paid for? Decides whether
    // the follow-up is offered as included or as a purchase.
    const currentAttemptFollowupIncluded = sub.current_attempt_result_id
      ? await resultHasInstitutionFollowup(sub.current_attempt_result_id, user.id)
      : false;

    return NextResponse.json({
      plan: sub.plan,
      // Own attempts plus the university's, so every screen that counts
      // "attempts remaining" counts both without knowing the difference.
      mainAttemptsRemaining: sub.main_attempts_remaining + licenceAttempts,
      ownAttemptsRemaining: sub.main_attempts_remaining,
      followupsPaidCount: sub.followups_paid_count,
      bonusAttemptGranted: sub.bonus_attempt_granted,
      followupBundlePurchased: sub.followup_bundle_purchased,
      currentAttemptStatus: sub.current_attempt_status,
      currentAttemptResultId: sub.current_attempt_result_id,
      currentAttemptFollowupIncluded,
      canStartAssessment: startCheck.allowed,
      cannotStartReason: startCheck.reason ?? null,
      cannotStartCode: startCheck.code ?? null,
      institution: licence
        ? {
            name: licence.institution.name,
            active: licence.active,
            attemptsRemaining: licence.attemptsRemaining,
            attemptsPerStudent: licence.institution.attempts_per_student,
            followupIncluded: licence.institution.followup_included,
            licenceEndsAt: licence.institution.licence_ends_at,
          }
        : null,
      staffOf: staffOf.map((i) => ({ id: i.id, name: i.name })),
    });
  } catch (err) {
    // An expired session is not a server fault — answer 401 so the client
    // can prompt a sign-in instead of showing an error.
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    const message = err instanceof Error ? err.message : String(err);
    console.error('SUBSCRIPTION STATUS ERROR:', message);
    const errorMsg = process.env.NODE_ENV === 'development'
      ? message
      : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}