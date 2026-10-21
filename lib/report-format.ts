// lib/report-format.ts
//
// Turns the markdown the report model writes into a small block structure the
// page can render as real headings, lists and bold text.
//
// Why not a markdown library: the model only ever uses a handful of features
// (checked against every stored report on 2026-10-21: bold in all of them,
// numbered lists, bullets, the occasional "#" heading, nothing else), and the
// output is rendered as React text nodes, never as HTML, so nothing a report
// contains can become markup or script. A library would bring HTML support we
// would then have to switch off.
//
// Anything this does not recognise stays as plain text, so an unexpected
// construct degrades to what the page showed before rather than vanishing.

export type Inline = { text: string; bold?: boolean; italic?: boolean };

export type ListItem = { content: Inline[]; children: ListBlock | null };
export type ListBlock = { type: 'list'; ordered: boolean; start: number; items: ListItem[] };

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; content: Inline[] }
  | { type: 'paragraph'; lines: Inline[][] }
  | ListBlock;

const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const LIST_ITEM = /^(\s*)([-*•]|(\d{1,3})[.)])\s+(.*)$/;
/** A line that is nothing but one bold span, optionally ending in a colon. */
const BOLD_LINE = /^\s*\*\*([^*]+?)\*\*\s*:?\s*$/;

/** Split **bold** and *italic* spans. Unclosed markers stay as literal text. */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+?)\*\*|(?<![*\w])\*([^*\s][^*]*?)\*(?![*\w])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ text: m[1], bold: true });
    else out.push({ text: m[2], italic: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out.filter((s) => s.text.length > 0);
}

function indentWidth(raw: string): number {
  return raw.replace(/\t/g, '    ').length;
}

export function parseReport(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: Inline[][] | null = null;
  // Open lists, outermost first, each with the indent its items start at.
  let stack: { list: ListBlock; indent: number }[] = [];

  const closeParagraph = () => {
    if (paragraph && paragraph.length) blocks.push({ type: 'paragraph', lines: paragraph });
    paragraph = null;
  };
  const closeLists = () => {
    if (stack.length) blocks.push(stack[0].list);
    stack = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');

    if (!line.trim()) {
      closeParagraph();
      // A blank line between items of the same list is common in model
      // output; keep the list open and let the next non-list line close it.
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      closeParagraph();
      const indent = indentWidth(item[1]);
      const ordered = item[3] !== undefined;
      const entry: ListItem = { content: parseInline(item[4]), children: null };

      while (stack.length && indent < stack[stack.length - 1].indent) stack.pop();

      const top = stack[stack.length - 1];
      if (!top) {
        const list: ListBlock = { type: 'list', ordered, start: ordered ? Number(item[3]) : 1, items: [entry] };
        stack = [{ list, indent }];
      } else if (indent > top.indent) {
        const parentItem = top.list.items[top.list.items.length - 1];
        const list: ListBlock = { type: 'list', ordered, start: ordered ? Number(item[3]) : 1, items: [entry] };
        parentItem.children = list;
        stack.push({ list, indent });
      } else if (top.list.ordered !== ordered && stack.length === 1) {
        // Switching between bullets and numbers at the top level starts a
        // new list rather than mixing markers in one.
        closeLists();
        const list: ListBlock = { type: 'list', ordered, start: ordered ? Number(item[3]) : 1, items: [entry] };
        stack = [{ list, indent }];
      } else {
        top.list.items.push(entry);
      }
      continue;
    }

    const heading = HEADING.exec(line);
    const boldLine = heading ? null : BOLD_LINE.exec(line);
    if (heading || boldLine) {
      closeParagraph();
      closeLists();
      const level = heading ? (Math.min(Math.max(heading[1].length, 2), 4) as 2 | 3 | 4) : 4;
      blocks.push({ type: 'heading', level, content: parseInline(heading ? heading[2] : boldLine![1]) });
      continue;
    }

    // An indented continuation line inside a list item belongs to that item.
    if (stack.length && /^\s{2,}/.test(raw)) {
      const top = stack[stack.length - 1].list;
      const last = top.items[top.items.length - 1];
      last.content = [...last.content, { text: ' ' }, ...parseInline(line.trim())];
      continue;
    }

    closeLists();
    if (!paragraph) paragraph = [];
    paragraph.push(parseInline(line.trim()));
  }

  closeParagraph();
  closeLists();
  return blocks;
}
