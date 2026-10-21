// components/ReportText.tsx
//
// Renders an AI report's markdown as headings, lists and bold text. Every
// piece of the report becomes a React text node (see lib/report-format.ts),
// so nothing a report contains is ever treated as HTML.

import { Fragment } from 'react';
import { parseReport, type Inline, type ListBlock } from '@/lib/report-format';

function InlineText({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.bold ? (
          <strong key={i} className="font-semibold text-white">{p.text}</strong>
        ) : p.italic ? (
          <em key={i}>{p.text}</em>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        )
      )}
    </>
  );
}

function List({ list, depth }: { list: ListBlock; depth: number }) {
  const Tag = list.ordered ? 'ol' : 'ul';
  return (
    <Tag
      start={list.ordered && list.start !== 1 ? list.start : undefined}
      className={`${list.ordered ? 'list-decimal' : depth === 0 ? 'list-disc' : 'list-[circle]'} flex flex-col gap-1.5 pl-5 marker:text-indigo-300`}
    >
      {list.items.map((item, i) => (
        <li key={i} className="pl-1">
          <InlineText parts={item.content} />
          {item.children && (
            <div className="mt-1.5">
              <List list={item.children} depth={depth + 1} />
            </div>
          )}
        </li>
      ))}
    </Tag>
  );
}

export default function ReportText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = parseReport(text);
  return (
    <div className={`flex flex-col gap-3 leading-relaxed text-gray-200 ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          const size = block.level === 2 ? 'text-xl' : block.level === 3 ? 'text-lg' : 'text-base';
          return (
            <h4 key={i} className={`${size} mt-2 font-semibold text-white first:mt-0`}>
              <InlineText parts={block.content} />
            </h4>
          );
        }
        if (block.type === 'list') return <List key={i} list={block} depth={0} />;
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <InlineText parts={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
