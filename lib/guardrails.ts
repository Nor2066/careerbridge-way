// lib/guardrails.ts
//
// Rules the career model follows every single time, plus a screen for the
// cases that need extra care.
//
// The scoring model cannot produce an unlawful recommendation — the fifteen
// clusters are all legitimate fields. The exposure is the free text. A student
// writes "my dream job is selling weed" or "I want to make money the way my
// cousin does" into an open box, and a model whose only instruction is "stay
// on the topic of careers" may well treat that as the brief.
//
// THE RULES ARE UNCONDITIONAL
//
// LAWFUL_GUIDANCE_RULES is appended to the system prompt on every request, not
// only when something is detected. Detection is a keyword screen and will miss
// things — phrasing is endless, and people are indirect about this precisely
// because they know it is dodgy. The always-on rules are what actually holds;
// the screen only adds emphasis when it happens to catch something.
//
// REDIRECT, DO NOT LECTURE
//
// A seventeen-year-old who says they want easy money is describing a real
// motivation — money, autonomy, status, not being bored — and those map onto
// lawful careers perfectly well. Moralising at them ends the conversation and
// teaches them the product is not for people like them. Naming the motivation
// and pointing it somewhere legal is both kinder and more useful.

/**
 * Appended to every career system prompt, always.
 */
export const LAWFUL_GUIDANCE_RULES = `

LAWFUL AND ETHICAL GUIDANCE — THESE APPLY TO EVERY REPORT:
1. Only ever recommend lawful, legitimate work. Never suggest, describe, plan, price, romanticise, or explain how to enter illegal work — including drug supply, theft, fraud, scams, violence, weapons dealing, trafficking, sex work in jurisdictions where it is criminalised, counterfeit goods, hacking for gain, money laundering, or the handling of stolen property.
2. Never recommend work whose business model depends on deceiving, exploiting, endangering, or defrauding other people, even where it is technically legal.
3. If the user's answers point toward illegal or exploitative work, do NOT lecture them, do NOT refuse to write the report, and do NOT tell them they are a bad person. Name the underlying motivation in neutral terms — money, independence, risk appetite, status, flexible hours, not being managed — and redirect it to lawful careers that genuinely satisfy that motivation. Then continue the report as normal.
4. Never state or imply that an illegal route is faster, easier, or more profitable. Do not compare it favourably to lawful work in any way.
5. Where you recommend a regulated profession — medicine, nursing, law, teaching, accountancy, financial advice, social work, aviation, security — always name the qualification, registration, or licence it requires. Sending someone toward a protected title without saying it is protected is bad advice.
6. Do not recommend anything with a minimum age or clearance the user plainly cannot meet, without saying so plainly.
7. If a stated ambition is lawful but the user's described method of pursuing it is not, address the ambition and quietly ignore the method.`;

/**
 * Phrases suggesting the writer is describing unlawful or exploitative work as
 * an aspiration rather than as something to avoid.
 *
 * Word-boundary matched and deliberately narrow. This is not the primary
 * defence — the rules above are — so a false negative costs little, whereas a
 * false positive that makes a report read strangely for a would-be pharmacist
 * or criminal-law student costs a customer.
 */
const UNLAWFUL_PATTERNS: RegExp[] = [
  // Drug supply, but not pharmacy, pharmacology or drug policy work.
  /\b(sell|selling|deal|dealing|dealer|move|moving|slang)\s+(drugs?|weed|coke|cocaine|crack|heroin|meth|pills)\b/i,
  /\bdrug\s+dealer\b/i,
  /\bplug\b(?=[^.]*\b(money|paid|earn)\b)/i,

  // Acquisitive and financial crime.
  /\b(scam|scamming|scammer|defraud|con)\s+(people|others|them|clients|customers|olds?)\b/i,
  /\brunning\s+(a\s+)?(scam|fraud|ponzi|pyramid)\b/i,
  /\b(money\s+launder(ing)?|launder\s+money)\b/i,
  /\b(steal|stealing|rob|robbing|robbery|burglar(y|ise|ize))\b(?=[^.]*\b(job|career|living|money|work)\b)/i,
  /\bfraud\b(?=[^.]*\b(career|job|living|money)\b)/i,
  /\bcarding\b/i,

  // Violence for hire.
  /\b(hitman|hit\s?man|assassin|enforcer)\b/i,
  /\bhurt(ing)?\s+people\s+for\s+money\b/i,

  // Illicit hacking framed as a living.
  /\b(hack|hacking)\b(?=[^.]*\b(money|paid|steal|accounts?|ransom)\b)/i,
  /\bransomware\b/i,

  // Trafficking and exploitation.
  /\btraffick(ing|er)\b/i,
  /\bpimp(ing)?\b/i,

  // Counterfeiting.
  /\b(counterfeit|fake)\s+(goods|money|notes|currency|documents|passports?|ids?)\b/i,
];

/**
 * Words that mean the writer is describing fighting this, studying it, or
 * regulating it — not doing it.
 *
 * Whole categories of legitimate career are built on naming a crime:
 * forensic accountants investigate money laundering, charities work in
 * anti-trafficking, security researchers do ethical hacking, pharmacists
 * dispense drugs. A keyword list without this exclusion accuses all of them,
 * and being wrongly accused by a careers report is the kind of thing someone
 * tells other people about.
 *
 * Broad on purpose. This screen is the secondary defence — the always-on rules
 * cover what it misses — so over-suppressing costs very little and
 * over-firing costs a customer.
 */
const PROFESSIONAL_CONTEXT =
  /\b(anti[-\s]?\w+|against|prevent\w*|combat\w*|investigat\w*|detect\w*|tackl\w*|stop\w*|report\w*|forensic\w*|complian\w*|enforc\w*|regulat\w*|polic\w*|detective|lawyer|solicitor|barrister|prosecut\w*|legal|law|court|charity|charities|ngo|victim\w*|survivor\w*|safeguard\w*|rehabilit\w*|ethical|penetration\s+test\w*|pen\s?test\w*|research\w*|academic|policy|pharmac\w*|nurs\w*|doctor|medic\w*|dispens\w*|social\s+work\w*|counsell\w*|therapy|therapist)\b/i;

/**
 * True when any answer looks like it is describing unlawful work as a goal.
 *
 * Pass raw answers, before sanitisation — the sanitiser strips brackets and
 * code fences, which could remove the phrase we need to see.
 */
export function detectUnlawfulAspiration(texts: Array<string | undefined | null>): boolean {
  for (const text of texts) {
    if (!text) continue;

    // Someone describing the lawful side of a crime is not describing a crime.
    if (PROFESSIONAL_CONTEXT.test(text)) continue;

    for (const pattern of UNLAWFUL_PATTERNS) {
      if (pattern.test(text)) return true;
    }
  }
  return false;
}

/**
 * Added on top of the always-on rules when the screen fires.
 *
 * Spells out the redirect rather than restating the prohibition, because by
 * this point the model already has the prohibition — what it needs is a
 * template for handling the person well.
 */
export const UNLAWFUL_PROMPT_ADDENDUM = `

NOTE ON THIS PARTICULAR SUBMISSION:
Something in this person's answers appears to describe illegal or exploitative work as a career goal.

Handle it exactly like this:
- Do not repeat, quote, or name what they described.
- Do not moralise, warn, threaten, or mention consequences, prison, or police. They are not being reported and they are not in trouble.
- Work out what they are actually after — money, independence, not being managed, excitement, status, fast progression, flexible hours — and say that back to them in plain, non-judgemental words as something legitimate to want.
- Then spend the report on lawful careers that genuinely deliver that. Self-employment, trades, sales, logistics, security, emergency services, entrepreneurship and skilled work all offer autonomy, fast progression, or high earnings without the risk.
- Be warm and practical. Someone who wrote that honestly into a careers questionnaire is asking for a better option, and this report is the answer to that question.
- Write the rest of the report exactly as you normally would.`;
