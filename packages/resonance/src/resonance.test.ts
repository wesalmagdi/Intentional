import { describe, expect, it } from 'vitest';
import { embed, findResonant, keyConcepts, questionSeeds, similarity, tokenize } from './index';

const NOTES = [
  {
    id: 'd-1', kind: 'discovery' as const,
    text: 'Bridges connect isolated communities. A bridge between two villages changes trade and friendship.',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'j-2', kind: 'journal' as const,
    text: 'Frustrated by noisy open offices; patience worn thin by interruptions.',
    createdAt: '2026-05-01T10:00:00Z',
  },
];

describe('resonance engine', () => {
  it('stems and removes stopwords deterministically', () => {
    expect(tokenize('Bridges connecting!')).toContain('bridge');
    expect(tokenize('what is the point')).not.toContain('the');
  });

  it('scores similar texts higher than unrelated ones', () => {
    const q = embed('how do bridges connect communities?');
    const close = similarity(q, embed(NOTES[0].text));
    const far = similarity(q, embed(NOTES[1].text));
    expect(close).toBeGreaterThan(far);
  });

  it('returns matches above threshold and honors exclusions', () => {
    const [match] = findResonant('bridges linking isolated villages', NOTES, { threshold: 0.05 });
    expect(match?.note.id).toBe('d-1');
    const excluded = findResonant('bridges linking isolated villages', NOTES, { threshold: 0.05, excludeId: 'd-1' });
    expect(excluded.every(m => m.note.id !== 'd-1')).toBe(true);
  });

  it('extracts key concepts and deterministic question seeds', () => {
    const text = 'Mycelium connects forests. Mycelium carries nutrients between trees. Forests share resources through mycelium networks.';
    const concepts = keyConcepts(text, 3);
    expect(concepts[0]).toBe('mycelium');
    const seeds = questionSeeds(text, 'The Wood Wide Web', 3);
    expect(seeds.length).toBe(3);
    expect(seeds[0]).toContain('mycelium');
    expect(seeds[0]).toContain('The Wood Wide Web');
  });
});
