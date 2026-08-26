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

export function randomJournalPrompt(): string {
  return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
}
