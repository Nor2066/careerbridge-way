// lib/site.ts
//
// The site's public address, for everything that has to spell it out in full:
// page metadata, the sitemap, robots.txt, structured data, and the URLs Stripe
// sends customers back to.
//
// It comes from NEXT_PUBLIC_URL, so moving to a custom domain means changing
// one environment variable and redeploying. Six files used to carry their
// own copy of the vercel.app address, and every copy that got missed would
// have kept pointing search engines and link previews at the old one.
//
// Not the same question as siteOrigin() in lib/auth-cookies.ts. That one asks
// which origin the OAuth round trip has to stay on for a given request, and in
// development the answer is localhost. This one asks for the site's public
// address, so it never depends on a request.

/**
 * The brand, in one place, because it has already changed once. Everything
 * customer-facing reads from here or from COMPANY.tradingName, which is set
 * from it.
 */
export const BRAND = {
  name: 'ADAQNO',
  /** The few words of explanation the name does not carry on its own. Used
   *  where someone meets the brand cold: the homepage hero, the footer, link
   *  previews, the Stripe checkout header and email sign-offs. */
  descriptor: 'Career Planning',
} as const;

export const BRAND_FULL = `${BRAND.name} ${BRAND.descriptor}`;

/**
 * Social profiles, or null for one that is not ours yet.
 *
 * Null rather than a guessed URL: a link to a handle we have not claimed sends
 * people to whoever claims it, which is the same mistake as the old homepage
 * email address. The homepage shows only the ones set here.
 */
export const SOCIAL: Record<'instagram' | 'tiktok' | 'linkedin', string | null> = {
  instagram: null,
  tiktok: null,
  linkedin: null,
};

/** Used only when NEXT_PUBLIC_URL is unset or invalid. next.config.js has the
 *  same fallback; it is CommonJS and cannot import this file. */
const FALLBACK_URL = 'https://careerbridge-way.vercel.app';

export function resolveSiteUrl(configured: string | undefined): string {
  if (configured) {
    try {
      // .origin drops any path and trailing slash, so `${SITE_URL}/pricing`
      // can never come out as "//pricing".
      return new URL(configured).origin;
    } catch {
      console.error(`NEXT_PUBLIC_URL is not a valid URL; using ${FALLBACK_URL}`);
    }
  }
  return FALLBACK_URL;
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_URL);
