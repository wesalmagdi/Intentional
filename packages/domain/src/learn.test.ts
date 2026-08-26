import { describe, expect, it } from 'vitest';
import { advance, discoveryText, emptyDraft, PHASE_PROMPTS, phaseOf } from './learn';

describe('learn session', () => {
  it('walks notice → choose → zoom-out → done', () => {
    let draft = emptyDraft();
    expect(phaseOf(draft)).toBe('notice');

    draft = advance(draft, '   ');
    expect(phaseOf(draft)).toBe('notice');

    draft = advance(draft, 'A footnote about attention');
    expect(phaseOf(draft)).toBe('choose');

    draft = advance(draft, 'Attention is a resource worth guarding.');
    expect(phaseOf(draft)).toBe('zoom-out');

    draft = advance(draft, '');
    expect(phaseOf(draft)).toBe('done');
    expect(discoveryText(draft)).toBe('Attention is a resource worth guarding.');
  });

  it('has a prompt for every active phase', () => {
    expect(PHASE_PROMPTS.notice.length).toBeGreaterThan(0);
    expect(PHASE_PROMPTS.choose.length).toBeGreaterThan(0);
    expect(PHASE_PROMPTS['zoom-out'].length).toBeGreaterThan(0);
  });
});
