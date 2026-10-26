// lib/email-layout.ts
//
// One look for every email: the ones we send through Resend (lib/email.ts)
// and the three Supabase sends for us. Those live in supabase/email-templates
// as files to paste into the dashboard, written from this layout by
// lib/auth-email-templates.test.ts (`npx vitest run -u` after a change).
//
// Built for email clients, not browsers: tables for layout, every style
// inline, a solid-colour button that Outlook can draw, no images (most
// clients block them until asked) and no tracking. A plain-text version goes
// with every HTML one.

export type EmailBlock =
  | { kind: 'text'; text: string }
  /** A small heading over the small print that follows it. */
  | { kind: 'heading'; text: string }
  | { kind: 'details'; rows: [label: string, value: string][] }
  | { kind: 'button'; label: string; url: string; /** Shown under the button with the bare link, for clients that drop buttons. */ fallback?: string }
  | { kind: 'note'; text: string; link?: { label: string; url: string } };

export type EmailContent = {
  lang: string;
  subject: string;
  /** The grey line an inbox shows after the subject. */
  preview: string;
  heading: string;
  blocks: EmailBlock[];
  /** Small print under the card, one line per entry. */
  footer: string[];
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const INDIGO = '#4f46e5';

/** For text and attribute values. Leaves {{ .Template }} placeholders alone,
 *  which is what lets the Supabase templates be built from this file. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBlock(block: EmailBlock): string {
  switch (block.kind) {
    case 'text':
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#374151;">${escapeHtml(block.text)}</p>`;
    case 'heading':
      return `<h2 style="margin:24px 0 10px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:14px;line-height:1.4;color:#111827;">${escapeHtml(block.text)}</h2>`;
    case 'details':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid #e5e7eb;">${block.rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${escapeHtml(value)}</td></tr>`
        )
        .join('')}</table>`;
    case 'button': {
      const url = escapeHtml(block.url);
      const fallback = block.fallback
        ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#6b7280;">${escapeHtml(block.fallback)}<br><a href="${url}" style="color:${INDIGO};word-break:break-all;">${url}</a></p>`
        : '';
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td bgcolor="${INDIGO}" style="border-radius:8px;"><a href="${url}" style="display:inline-block;padding:12px 22px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(block.label)}</a></td></tr></table>${fallback}`;
    }
    case 'note': {
      const link = block.link
        ? ` <a href="${escapeHtml(block.link.url)}" style="color:${INDIGO};">${escapeHtml(block.link.label)}</a>`
        : '';
      return `<p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#6b7280;">${escapeHtml(block.text)}${link}</p>`;
    }
  }
}

export function renderEmailHtml(c: EmailContent): string {
  return `<!doctype html>
<html lang="${escapeHtml(c.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(c.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
<tr><td align="center" style="padding:32px 16px;font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
<tr><td style="padding:28px 28px 4px;font-family:${FONT};">
<div style="font-size:15px;font-weight:700;letter-spacing:4px;color:${INDIGO};">ADAQNO</div>
<h1 style="margin:20px 0 12px;font-size:22px;line-height:1.3;color:#111827;">${escapeHtml(c.heading)}</h1>
${c.blocks.map(renderBlock).join('\n')}
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#9ca3af;font-family:${FONT};">${c.footer.map(escapeHtml).join('<br>')}</p>
</td></tr>
</table>
</body>
</html>`;
}

export function renderEmailText(c: EmailContent): string {
  const parts = [c.heading, ''];
  for (const block of c.blocks) {
    switch (block.kind) {
      case 'text':
        parts.push(block.text, '');
        break;
      case 'heading':
        parts.push('—', block.text.toUpperCase(), '');
        break;
      case 'details': {
        const width = Math.max(...block.rows.map(([label]) => label.length));
        parts.push(...block.rows.map(([label, value]) => `  ${`${label}:`.padEnd(width + 2)}${value}`), '');
        break;
      }
      case 'button':
        parts.push(`${block.label}: ${block.url}`, '');
        break;
      case 'note':
        parts.push(block.link ? `${block.text} ${block.link.label}: ${block.link.url}` : block.text, '');
        break;
    }
  }
  parts.push('—', ...c.footer);
  return parts.join('\n');
}
