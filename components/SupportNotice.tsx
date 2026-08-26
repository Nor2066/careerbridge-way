'use client';

// Shown above a career report when the answers contained something that
// looked like distress. See lib/crisis.ts for how that is decided and why
// nothing about it is stored.
//
// Design notes, because they are load-bearing rather than decorative:
//
//   • It sits ABOVE the report, not below. Underneath, it reads as an
//     afterthought bolted onto a sales flow.
//
//   • No red, no warning triangle, no alarm styling. Someone who has just
//     written something difficult about themselves should not be met with an
//     error state. Warm and quiet, visually distinct from the glass cards
//     around it so it does not get skimmed past.
//
//   • Not dismissible. There is no X, because a dismiss button invites a
//     reflex click, and the whole cost of this component is a few seconds of
//     someone's attention.
//
//   • Phone numbers are real links: tel: on mobile is one tap, and the text
//     stays readable if the href never resolves.

export type SupportResource = {
  name: string;
  contact: string;
  detail: string;
  href?: string;
};

export type SupportNoticeData = {
  message: string;
  resources: SupportResource[];
};

/** "116 123" -> "tel:116123". Returns null for anything that isn't a number. */
function telHref(contact: string): string | null {
  const digits = contact.replace(/[^\d+]/g, '');
  return digits.length >= 3 && /\d/.test(contact) && !/[a-z]{4,}/i.test(contact)
    ? `tel:${digits}`
    : null;
}

export default function SupportNotice({ data }: { data: SupportNoticeData }) {
  if (!data?.resources?.length) return null;

  return (
    <section
      aria-label="Support information"
      className="mb-8 rounded-2xl border border-amber-200/30 bg-amber-50/10 p-6 backdrop-blur-sm"
    >
      <h3 className="mb-2 text-lg font-semibold text-amber-50">
        Before you read your report
      </h3>
      <p className="mb-5 text-[15px] leading-relaxed text-amber-50/85">{data.message}</p>

      <ul className="flex flex-col gap-3">
        {data.resources.map((resource) => {
          const tel = telHref(resource.contact);
          return (
            <li
              key={resource.name}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-semibold text-white">{resource.name}</span>
                {tel ? (
                  <a
                    href={tel}
                    className="font-mono text-amber-100 underline underline-offset-2 hover:text-white"
                  >
                    {resource.contact}
                  </a>
                ) : (
                  <span className="font-mono text-amber-100">{resource.contact}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-300">{resource.detail}</p>
              {resource.href && (
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-amber-200/80 underline underline-offset-2 hover:text-white"
                >
                  Visit {resource.name}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
