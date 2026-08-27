'use client';

// A short, always-visible answer to "where am I, and what happens next?"
//
// This is the item from the launch notes: a user-facing checklist. It exists
// for two reasons that are worth keeping in mind if it gets redesigned.
//
// First, completion. A 46-question assessment followed by a second
// questionnaire is a long road, and people abandon long roads mainly when they
// cannot see the end of them. Showing four steps with two already ticked is
// the cheapest thing that helps.
//
// Second, and more practically: it answers "what did I actually pay for?"
// without anybody emailing support. Someone who bought the follow-up bundle
// and then could not find the follow-up is the most common support message a
// product like this gets.
//
// The state is derived entirely from the subscription status the page already
// has — no extra request, and nothing new stored.

import Link from 'next/link';

/**
 * Only the fields the checklist reads, kept structural rather than importing
 * SubscriptionStatus — the history page has its own narrower local type, and
 * this needs to accept both without either one having to change.
 */
export type ChecklistSubscription = {
  plan: 'free' | 'basic' | 'full';
  mainAttemptsRemaining: number;
  followupBundlePurchased: boolean;
  currentAttemptStatus: string;
};

type StepState = 'done' | 'current' | 'todo' | 'locked';

type Step = {
  label: string;
  detail: string;
  state: StepState;
  href?: string;
};

function buildSteps(sub: ChecklistSubscription | null, hasHistory: boolean): Step[] {
  if (!sub) return [];

  const hasPlan = sub.plan !== 'free';
  const inProgress = sub.currentAttemptStatus === 'in_progress';
  const awaitingFollowup = sub.currentAttemptStatus === 'awaiting_followup_decision';
  const followupsAvailable = sub.plan === 'full' || sub.followupBundlePurchased;

  return [
    {
      label: 'Choose a plan',
      detail: hasPlan
        ? `You are on the ${sub.plan} plan.`
        : 'Pick a plan to unlock the full assessment.',
      state: hasPlan ? 'done' : 'current',
      href: hasPlan ? undefined : '/pricing',
    },
    {
      label: 'Complete the assessment',
      detail: inProgress
        ? 'You have one in progress — pick up where you left off.'
        : hasHistory || awaitingFollowup
          ? 'Done. You can take another whenever you have an attempt left.'
          : `${sub.mainAttemptsRemaining} attempt${sub.mainAttemptsRemaining === 1 ? '' : 's'} available.`,
      state: inProgress ? 'current' : hasHistory || awaitingFollowup ? 'done' : hasPlan ? 'todo' : 'locked',
      href: hasPlan ? '/assess' : undefined,
    },
    {
      label: 'Read your career report',
      detail:
        hasHistory || awaitingFollowup
          ? 'Ready in your history.'
          : 'Generated as soon as you finish the questionnaire.',
      state: hasHistory || awaitingFollowup ? 'done' : 'todo',
      href: hasHistory || awaitingFollowup ? '/history' : undefined,
    },
    {
      label: 'Get your detailed roadmap',
      detail: followupsAvailable
        ? awaitingFollowup
          ? 'Unlocked and waiting — this is your next step.'
          : 'Unlocked on your account. Answer the follow-up on any attempt.'
        : 'Needs the follow-up bundle. Adds specific roles and a three-month plan.',
      state: !followupsAvailable
        ? 'locked'
        : awaitingFollowup
          ? 'current'
          : hasHistory
            ? 'todo'
            : 'todo',
      href: followupsAvailable ? (awaitingFollowup ? '/followup' : '/history') : '/pricing',
    },
  ];
}

const MARK: Record<StepState, { symbol: string; className: string }> = {
  done: { symbol: '✓', className: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' },
  current: { symbol: '→', className: 'border-indigo-400/60 bg-indigo-400/15 text-indigo-200' },
  todo: { symbol: '', className: 'border-white/20 bg-transparent text-transparent' },
  locked: { symbol: '🔒', className: 'border-white/10 bg-transparent text-gray-500 text-[10px]' },
};

export default function ProgressChecklist({
  sub,
  hasHistory = false,
  className = '',
}: {
  sub: ChecklistSubscription | null;
  hasHistory?: boolean;
  className?: string;
}) {
  const steps = buildSteps(sub, hasHistory);
  if (steps.length === 0) return null;

  const done = steps.filter((s) => s.state === 'done').length;

  return (
    <section
      aria-label="Your progress"
      className={`rounded-xl border border-white/10 bg-white/5 p-5 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Where you are
        </h2>
        <span className="font-mono text-xs text-gray-500">{done} of {steps.length}</span>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((step) => {
          const mark = MARK[step.state];
          const body = (
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-xs font-bold ${mark.className}`}
              >
                {mark.symbol}
              </span>
              <div>
                <p
                  className={
                    step.state === 'done'
                      ? 'text-sm text-gray-400 line-through decoration-1'
                      : step.state === 'current'
                        ? 'text-sm font-semibold text-white'
                        : 'text-sm text-gray-300'
                  }
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.detail}</p>
              </div>
            </div>
          );

          return (
            <li key={step.label}>
              {step.href ? (
                <Link
                  href={step.href}
                  className="block rounded-lg -mx-2 px-2 py-1 transition hover:bg-white/5"
                >
                  {body}
                </Link>
              ) : (
                <div className="-mx-2 px-2 py-1">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
