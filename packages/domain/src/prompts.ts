export const LEARN_CATEGORIES = ['Science', 'History', 'People', 'Tech', 'Art'] as const;

export const LEARN_PROMPTS: Record<string, string[]> = {
  Science: ['How do trees communicate underground?', 'What happens to time near a black hole?', 'Why do we dream?'],
  History: ['What was the quietest revolution in history?', 'How did people navigate before maps?', 'What was a day in the life of a Roman baker?'],
  People: ['What makes someone a good listener?', 'How do introverts recharge?', 'What is the origin of the word "friend"?'],
  Tech: ['How does the internet actually cross the ocean?', 'What was the first computer bug?', 'How do touchscreens feel our fingers?'],
  Art: ['Why do minor chords sound sad?', 'How did the color blue get its name?', 'What is the golden ratio in nature?'],
};

export const JOURNAL_PROMPTS = [
  'What have you been thinking about lately that you haven\'t said out loud?',
  'What is a small moment from today that you want to remember?',
  'If you could pause one thing in your life right now, what would it be?',
  'What is a belief you hold that you rarely share?',
];

export const REFLECTION_PROMPTS = [
  { id: 'fresh', label: 'The Story', sublabel: 'Tell yourself the story while it\'s still fresh.' },
  { id: 'forget', label: 'The Core', sublabel: 'What is the one thing you don\'t want to forget?' },
  { id: 'surprise', label: 'The Shift', sublabel: 'Anything that surprised you?' },
  { id: 'mind', label: 'The Lens', sublabel: 'Did it change how you see the question?' },
];

export const NOTICE_PROMPTS = [
  'What do you notice right now?',
  'What sound is closest to you right now?',
  'What is the light doing where you are?',
] as const;

export const CHOOSE_PROMPTS = [
  { id: 'attention', label: 'What gets your attention today?', sublabel: 'Name the one thing worth your energy.' },
  { id: 'setdown', label: 'What are you setting down?', sublabel: 'Something you can stop carrying today.' },
];

export const ZOOMOUT_PROMPTS = [
  { id: 'part', label: 'What is this a part of?', sublabel: 'See it from further away.' },
  { id: 'connect', label: 'How does this connect to what you already know?', sublabel: 'Tie it to something older.' },
];

export function randomJournalPrompt(): string {
  return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
}

export function promptForDay(list: readonly string[], now: Date): string {
  const day = Math.floor(now.getTime() / 86_400_000);
  return list[day % list.length];
}

export function isRevisitWorthy(createdAt: string, now: Date, days = 3): boolean {
  return now.getTime() - new Date(createdAt).getTime() > days * 86_400_000;
}
