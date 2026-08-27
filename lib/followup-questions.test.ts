import { describe, it, expect } from 'vitest';
import { clusterQuestions, questionsFor } from '@/lib/followup-questions';
import { MAX_SCORES } from '@/lib/scoring';

// This file exists because of a specific bug, and its job is to stop that bug
// coming back.
//
// Five sets of follow-up questions were filed under the wrong key: SocialImpact
// sat inside Entrepreneurship, SkilledTrades inside Creative, and Legal, Sales
// and Hospitality all inside Operations. Nothing connected the scoring model to
// the questionnaire, so the mistake was invisible until someone paid.
//
// It broke the product in both directions at once. Anyone whose top cluster was
// one of the five saw "Error: No questions found for Hospitality." in the part
// they had just paid to unlock. Anyone with Operations in their top three was
// asked 32 questions instead of 8, two thirds of them about law, sales and
// hotels, and those answers were then fed to the model as the basis of their
// roadmap.

const CLUSTERS = Object.keys(MAX_SCORES);

describe('every scoring cluster can actually be followed up', () => {
  // The assertion that would have caught the original bug.
  it('has a question set for all 15 clusters', () => {
    const missing = CLUSTERS.filter((c) => (clusterQuestions[c]?.length ?? 0) === 0);
    expect(missing).toEqual([]);
  });

  it('has no question sets for clusters the scoring model does not produce', () => {
    const orphans = Object.keys(clusterQuestions).filter((c) => !CLUSTERS.includes(c));
    expect(orphans).toEqual([]);
  });

  for (const cluster of CLUSTERS) {
    it(`${cluster} has a usable number of questions`, () => {
      const qs = questionsFor(cluster);
      expect(qs.length).toBeGreaterThanOrEqual(4);
      // The upper bound is the half of the bug that was easy to miss: a
      // bloated array meant somebody else's questions had been appended.
      expect(qs.length).toBeLessThanOrEqual(12);
    });
  }
});

describe('every question is answerable', () => {
  for (const [cluster, questions] of Object.entries(clusterQuestions)) {
    it(`${cluster} questions all offer options`, () => {
      for (const q of questions) {
        // The component parses options from lines starting "(a) ", "(b) "…
        // An entry without them renders as a question nobody can answer, which
        // is how a stray heading in the array would show up.
        expect(q, `no options in: ${q.slice(0, 60)}`).toMatch(/\n\(a\)\s/);
        expect(q, `no second option in: ${q.slice(0, 60)}`).toMatch(/\n\(b\)\s/);
      }
    });
  }

  it('has no duplicate questions across clusters', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];

    for (const [cluster, questions] of Object.entries(clusterQuestions)) {
      for (const q of questions) {
        // The WHOLE question, stem and options together. Comparing stems alone
        // fails on "Would you rather..." and "Which would you rather do?",
        // which several clusters share legitimately — the stem is generic and
        // the options are what make it about engineering or hospitality.
        // A byte-identical question in two clusters is the real fingerprint of
        // a set having been copied into the wrong place.
        const previous = seen.get(q);
        if (previous && previous !== cluster) {
          clashes.push(
            `identical question in both ${previous} and ${cluster}: "${q.split('\n')[0].slice(0, 50)}"`
          );
        }
        seen.set(q, cluster);
      }
    }

    expect(clashes).toEqual([]);
  });
});
