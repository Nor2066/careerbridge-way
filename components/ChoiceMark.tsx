// components/ChoiceMark.tsx
//
// The tick box or dot at the start of an answer card. The card's colour
// change alone was too faint to show which answers had been picked. The real
// input sits next to it, visually hidden, so this is decoration only.

type Props = { checked: boolean; kind: 'checkbox' | 'radio' };

export default function ChoiceMark({ checked, kind }: Props) {
  const shape = kind === 'radio' ? 'rounded-full' : 'rounded';
  return (
    <span
      aria-hidden="true"
      className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center border-2 ${shape} ${
        checked ? 'border-indigo-300 bg-indigo-500' : 'border-gray-400'
      }`}
    >
      {checked &&
        (kind === 'radio' ? (
          <span className="h-2 w-2 rounded-full bg-white" />
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        ))}
    </span>
  );
}
