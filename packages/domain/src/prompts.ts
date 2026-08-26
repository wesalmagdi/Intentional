export const JOURNAL_PROMPTS = [
  'What caught your attention today?',
  'What did you learn, and how?',
  'What will you do differently tomorrow?',
  'What are you grateful for right now?',
] as const;

export const REVISIT_PROMPT = 'What do you remember?';

export function promptForEntry(date: Date): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return JOURNAL_PROMPTS[day % JOURNAL_PROMPTS.length];
}
