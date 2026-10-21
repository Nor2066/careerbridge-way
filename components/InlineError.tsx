// components/InlineError.tsx
//
// A problem shown on the page, next to the thing that failed. Replaces the
// browser's alert() boxes, which block the page, can't be styled, and were
// easy to dismiss without reading. role="alert" makes screen readers announce
// it when it appears.

export default function InlineError({ message, className = '' }: { message: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={`rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 ${className}`}
    >
      {message}
    </p>
  );
}
