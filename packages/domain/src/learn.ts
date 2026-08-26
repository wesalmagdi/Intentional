export type LearnPhase = 'notice' | 'choose' | 'zoom-out' | 'done';

export interface LearnDraft {
  noticed: string | null;
  chosen: string | null;
  connected: string | null;
}

export const PHASE_PROMPTS: Record<Exclude<LearnPhase, 'done'>, string> = {
  notice: 'What caught your attention?',
  choose: 'What is the one thing worth keeping?',
  'zoom-out': 'How does this connect to what you already know?',
};

export function emptyDraft(): LearnDraft {
  return { noticed: null, chosen: null, connected: null };
}

export function phaseOf(draft: LearnDraft): LearnPhase {
  if (draft.noticed === null) return 'notice';
  if (draft.chosen === null) return 'choose';
  if (draft.connected === null) return 'zoom-out';
  return 'done';
}

export function advance(draft: LearnDraft, input: string): LearnDraft {
  const text = input.trim();
  switch (phaseOf(draft)) {
    case 'notice':
      return text.length === 0 ? draft : { ...draft, noticed: text };
    case 'choose':
      return text.length === 0 ? draft : { ...draft, chosen: text };
    case 'zoom-out':
      return { ...draft, connected: text };
    default:
      return draft;
  }
}

export function discoveryText(draft: LearnDraft): string | null {
  return phaseOf(draft) === 'done' ? draft.chosen : null;
}
