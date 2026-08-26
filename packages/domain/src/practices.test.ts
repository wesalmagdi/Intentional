import { describe, expect, it } from 'vitest';
import { NOTICE_PROMPTS, isRevisitWorthy, promptForDay } from './prompts';

describe('practices', () => {
  it('picks a deterministic prompt per day', () => {
    const morning = promptForDay(NOTICE_PROMPTS, new Date('2026-08-27T09:00:00Z'));
    const evening = promptForDay(NOTICE_PROMPTS, new Date('2026-08-27T21:00:00Z'));
    expect(morning).toBe(evening);
    expect(NOTICE_PROMPTS).toContain(morning);
  });

  it('marks discoveries older than three days as revisit-worthy', () => {
    const now = new Date('2026-08-27T12:00:00Z');
    expect(isRevisitWorthy('2026-08-20T12:00:00Z', now)).toBe(true);
    expect(isRevisitWorthy('2026-08-26T12:00:00Z', now)).toBe(false);
  });
});
