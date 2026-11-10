// lib/ai-provenance.ts
//
// The machine-readable "this text was written by AI" marker that goes wherever
// a report leaves our hands: on the page, and in the data download.
//
// The EU AI Act (Article 50(2)) asks whoever provides a system that generates
// text to mark its output in a format software can read. No single format is
// required for text, so this uses the two vocabularies tools already look
// for: IPTC's digital source type (the code image metadata and C2PA use for
// AI-generated media) and schema.org's digitalSourceType, which mirrors it.
//
// One module, so the page and the export cannot disagree about what the
// marker says.

import { BRAND, SITE_URL } from '@/lib/site';

/** IPTC NewsCodes concept for media created by a trained model. The concept
 *  URI is http://, as IPTC publishes it; it is an identifier, not a link. */
export const IPTC_AI_SOURCE =
  'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia';

/** The schema.org member of IPTCDigitalSourceEnumeration for the same thing. */
export const SCHEMA_AI_SOURCE = 'https://schema.org/TrainedAlgorithmicMediaDigitalSource';

/**
 * What a report row carries in the data download. It names no model: the
 * stored reports do not record which one wrote them, and a marker that
 * guessed would be wrong the day the provider changes.
 */
export type AiProvenance = {
  ai_generated: true;
  digital_source_type: string;
  schema_org_digital_source_type: string;
  generator: string;
  human_reviewed: false;
  notice: string;
};

export function aiProvenance(): AiProvenance {
  return {
    ai_generated: true,
    digital_source_type: IPTC_AI_SOURCE,
    schema_org_digital_source_type: SCHEMA_AI_SOURCE,
    generator: `${BRAND.name} report generator (large language model)`,
    human_reviewed: false,
    notice: `${SITE_URL}/ai-notice`,
  };
}

/** Adds the marker to every row of a table that holds AI-written text. */
export function withAiProvenance<T extends Record<string, unknown>>(
  rows: T[]
): Array<T & { ai_provenance: AiProvenance }> {
  const provenance = aiProvenance();
  return rows.map((row) => ({ ...row, ai_provenance: provenance }));
}

/**
 * The attributes for the element that wraps a report on the page. Microdata
 * (itemScope/itemType) is what makes the digitalSourceType link inside it
 * mean "this block", not "this whole page".
 */
export const AI_MARKER_ATTRIBUTES = {
  'data-ai-generated': 'true',
  'data-digital-source-type': IPTC_AI_SOURCE,
  itemScope: true,
  itemType: 'https://schema.org/CreativeWork',
} as const;
