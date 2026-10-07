// scripts/generate-brand-assets.mjs
//
// Draws every brand image the site ships: favicon, app icons, the link
// preview shown when someone shares a page, and the marks Stripe Checkout
// shows. Run with `node scripts/generate-brand-assets.mjs` after changing the
// name, the descriptor or the colours, and commit what it writes.
//
// Why a script and not image files from a design tool: there is no designed
// logo yet. These are placeholders that read cleanly at every size, and when
// a real logo arrives the files it writes are the list of what to replace.
//
// It uses the renderer Next.js already bundles (next/og), so it needs nothing
// installed. That renderer's only bundled font is Geist Regular, so the mark
// is drawn as shapes rather than as a bold letter.

import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const { ImageResponse } = require('next/og');
const { createElement: h } = require('react');

// Keep in step with BRAND in lib/site.ts and --btn-primary-bg-* in globals.css.
const NAME = 'ADAQNO';
const DESCRIPTOR = 'Career Planning';
const INDIGO = '#4f46e5';
const PURPLE = '#9333ea';
const NIGHT = '#020617'; // slate-950, the site's background

/**
 * The mark: a bold "A" drawn as a path that climbs to a peak, on the site's
 * indigo-to-purple gradient. Drawn on a 100-unit grid and scaled.
 */
function mark(size, { rounded = true } = {}) {
  return h(
    'div',
    {
      style: {
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${INDIGO}, ${PURPLE})`,
        borderRadius: rounded ? size * 0.22 : 0,
      },
    },
    h(
      'svg',
      { width: size * 0.62, height: size * 0.62, viewBox: '0 0 100 100' },
      h('path', {
        d: 'M18 86 L50 14 L82 86',
        fill: 'none',
        stroke: 'white',
        strokeWidth: 15,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      h('path', {
        d: 'M34 62 L66 62',
        stroke: 'white',
        strokeWidth: 12,
        strokeLinecap: 'round',
      })
    )
  );
}

/** The mark beside the name, with the descriptor underneath. */
function lockup({ markSize, nameSize, color, subColor }) {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: markSize * 0.4 } },
    mark(markSize),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h(
        'div',
        { style: { fontSize: nameSize, letterSpacing: nameSize * 0.12, color, lineHeight: 1 } },
        NAME
      ),
      h(
        'div',
        {
          style: {
            fontSize: nameSize * 0.24,
            letterSpacing: nameSize * 0.1,
            color: subColor,
            marginTop: nameSize * 0.18,
            textTransform: 'uppercase',
          },
        },
        DESCRIPTOR
      )
    )
  );
}

async function png(element, width, height) {
  const res = new ImageResponse(element, { width, height });
  return Buffer.from(await res.arrayBuffer());
}

/**
 * A .ico that holds PNG images, which every current browser reads. Written
 * by hand because the format is two small headers and the PNG bytes.
 */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // no palette
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

function square(size, opts) {
  return h(
    'div',
    { style: { width: size, height: size, display: 'flex', background: 'transparent' } },
    mark(size, opts)
  );
}

const preview = h(
  'div',
  {
    style: {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 96px',
      background: `radial-gradient(circle at 85% 15%, ${INDIGO}55, transparent 55%), radial-gradient(circle at 10% 90%, ${PURPLE}44, transparent 50%), ${NIGHT}`,
      color: 'white',
    },
  },
  lockup({ markSize: 150, nameSize: 112, color: 'white', subColor: '#c7d2fe' }),
  h(
    'div',
    { style: { marginTop: 64, fontSize: 40, color: '#e0e7ff', lineHeight: 1.35, maxWidth: 900 } },
    'Find the career that fits you. A free AI career assessment for students and graduates.'
  )
);

const PREVIEW_ALT = `${NAME} ${DESCRIPTOR}: a free AI career assessment for students and graduates`;

const outputs = [
  // Browser tab and bookmarks. Next.js serves app/favicon.ico at /favicon.ico
  // and links app/icon.png from every page.
  ['app/favicon.ico', ico([
    { size: 16, data: await png(square(16), 16, 16) },
    { size: 32, data: await png(square(32), 32, 32) },
    { size: 48, data: await png(square(48), 48, 48) },
  ])],
  ['app/icon.png', await png(square(512), 512, 512)],
  // iOS applies its own rounded mask, so this one is full-bleed.
  ['app/apple-icon.png', await png(square(180, { rounded: false }), 180, 180)],
  // Link previews on social networks and messaging apps.
  ['app/opengraph-image.png', await png(preview, 1200, 630)],
  ['app/opengraph-image.alt.txt', PREVIEW_ALT],
  ['app/twitter-image.png', await png(preview, 1200, 630)],
  ['app/twitter-image.alt.txt', PREVIEW_ALT],
  // Stripe Checkout. The square one is the "icon" and the wide one the
  // "logo"; upload them under Settings -> Branding, or point
  // STRIPE_CHECKOUT_ICON_URL / STRIPE_CHECKOUT_LOGO_URL at them. Checkout's
  // background is white, so the lockup uses dark text.
  ['public/images/checkout-logo.png', await png(square(512), 512, 512)],
  ['public/images/brand-lockup.png', await png(
    h(
      'div',
      { style: { width: 1200, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      lockup({ markSize: 180, nameSize: 132, color: '#0f172a', subColor: INDIGO })
    ),
    1200,
    360
  )],
];

for (const [file, data] of outputs) {
  writeFileSync(path.join(root, file), data);
  console.log(`wrote ${file} (${data.length} bytes)`);
}
