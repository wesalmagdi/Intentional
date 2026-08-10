// packages/domain/src/learn/prompts.ts
//
// Curated Learn prompts.
// Hand-written and deterministic by design — never generated, never personalized.
// This is a FINITE collection. "Surprise me" draws from it at random.
// The collection is validated at module load: a typo or duplicate id fails fast.

import { z } from 'zod'

// ── Categories ──────────────────────────────────────────────────────────────

export const LearnCategorySchema = z.enum([
  'science',
  'history',
  'people',
  'technology',
  'everyday',
  'bigQuestions',
])
export type LearnCategory = z.infer<typeof LearnCategorySchema>

export const LearnPromptSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  category: LearnCategorySchema,
})
export type LearnPrompt = z.infer<typeof LearnPromptSchema>

/** Display metadata for the horizontal category chips. */
export const CATEGORY_META: Record<LearnCategory, { label: string }> = {
  science: { label: 'Science' },
  history: { label: 'History' },
  people: { label: 'People' },
  technology: { label: 'Technology' },
  everyday: { label: 'Everyday' },
  bigQuestions: { label: 'Big Questions' },
}

// ── The collection ──────────────────────────────────────────────────────────

const RAW_PROMPTS: readonly LearnPrompt[] = [
  // ── Science ───────────────────────────────────────────────────────────────
  { id: 'sci-time-speeds-up', category: 'science', text: 'Why does time seem to speed up as you get older?' },
  { id: 'sci-memory-brain', category: 'science', text: 'What actually happens in your brain when you remember something?' },
  { id: 'sci-forgotten-dreams', category: 'science', text: 'Why do we forget dreams minutes after waking up?' },
  { id: 'sci-seed-knows', category: 'science', text: 'How does a single seed know what to become?' },
  { id: 'sci-music-chills', category: 'science', text: 'Why does music sometimes give you chills?' },
  { id: 'sci-universe-into-what', category: 'science', text: 'What is the universe expanding into?' },
  { id: 'sci-why-sleep', category: 'science', text: 'Why do we need to sleep at all?' },
  { id: 'sci-birds-migrate', category: 'science', text: 'How do migrating birds find their way?' },
  { id: 'sci-smell-of-rain', category: 'science', text: 'Why does the smell of rain feel so familiar?' },
  { id: 'sci-star-dies', category: 'science', text: 'What happens in the first moments after a star dies?' },
  { id: 'sci-ocean-unexplored', category: 'science', text: 'Why is most of the ocean still unexplored?' },
  { id: 'sci-cold-water-relief', category: 'science', text: 'Why does cold water feel so good when you’re overheated?' },

  // ── History ───────────────────────────────────────────────────────────────
  { id: 'his-time-before-clocks', category: 'history', text: 'How did people tell time before clocks existed?' },
  { id: 'his-our-calendar', category: 'history', text: 'Why do we use the calendar we use?' },
  { id: 'his-ordinary-day-2000', category: 'history', text: 'What did an ordinary day look like 2,000 years ago?' },
  { id: 'his-abandoned-cities', category: 'history', text: 'Why did some great cities get abandoned?' },
  { id: 'his-regular-people', category: 'history', text: 'How did regular people experience huge historical events?' },
  { id: 'his-remembered-wars', category: 'history', text: 'Why do we remember some wars and forget others?' },
  { id: 'his-first-writing', category: 'history', text: 'When did humans start writing things down — and why?' },
  { id: 'his-invention-weekend', category: 'history', text: 'How did the weekend become a thing?' },
  { id: 'his-where-borders', category: 'history', text: 'Why do borders exist where they do?' },
  { id: 'his-lost-language', category: 'history', text: 'What gets lost when a language dies?' },
  { id: 'his-before-phones', category: 'history', text: 'How did people stay in touch before phones?' },
  { id: 'his-spices-gold', category: 'history', text: 'Why were spices once worth more than gold?' },

  // ── People ────────────────────────────────────────────────────────────────
  { id: 'ppl-strangers-friends', category: 'people', text: 'Why do strangers sometimes become your closest people?' },
  { id: 'ppl-mirror-people', category: 'people', text: 'Why do you unconsciously copy the people you like?' },
  { id: 'ppl-name-loud-room', category: 'people', text: 'How do you hear your own name across a loud room?' },
  { id: 'ppl-eye-contact', category: 'people', text: 'Why does eye contact feel so intense?' },
  { id: 'ppl-embarrassing-memory', category: 'people', text: 'Why do embarrassing memories come back years later?' },
  { id: 'ppl-how-accents', category: 'people', text: 'How do accents form — and why do they stick?' },
  { id: 'ppl-talk-to-self', category: 'people', text: 'Why do we talk to ourselves?' },
  { id: 'ppl-crowds-move', category: 'people', text: 'Why do crowds move the way they do?' },
  { id: 'ppl-being-understood', category: 'people', text: 'Why does being understood feel so good?' },
  { id: 'ppl-fictional-characters', category: 'people', text: 'Why do we get attached to fictional characters?' },
  { id: 'ppl-inside-jokes', category: 'people', text: 'Why do inside jokes matter so much?' },
  { id: 'ppl-different-around', category: 'people', text: 'Why do you feel like a different person around different people?' },

  // ── Technology ────────────────────────────────────────────────────────────
  { id: 'tech-internet-ocean', category: 'technology', text: 'How does the internet cross the ocean?' },
  { id: 'tech-delete-really', category: 'technology', text: 'What really happens when you delete something?' },
  { id: 'tech-phone-location', category: 'technology', text: 'How does your phone know where you are?' },
  { id: 'tech-same-websites', category: 'technology', text: 'Why do so many websites start to look the same?' },
  { id: 'tech-still-email', category: 'technology', text: 'Why do we still use email after all this time?' },
  { id: 'tech-touchscreen', category: 'technology', text: 'How does a touchscreen know you’re touching it?' },
  { id: 'tech-effortless-app', category: 'technology', text: 'What makes one app feel effortless and another feel hard?' },
  { id: 'tech-why-passwords', category: 'technology', text: 'Why do passwords exist in the first place?' },
  { id: 'tech-song-recommend', category: 'technology', text: 'How does a song recommendation actually work?' },
  { id: 'tech-backup-photos', category: 'technology', text: 'What happens to your photos when you “back them up”?' },

  // ── Everyday ──────────────────────────────────────────────────────────────
  { id: 'day-where-cities', category: 'everyday', text: 'Why do cities form where they do?' },
  { id: 'day-own-voice', category: 'everyday', text: 'Why does your own voice sound strange in recordings?' },
  { id: 'day-bless-you', category: 'everyday', text: 'Why do we say “bless you” after a sneeze?' },
  { id: 'day-hot-drink', category: 'everyday', text: 'Why does a hot drink feel comforting?' },
  { id: 'day-procrastinate-want', category: 'everyday', text: 'Why do we procrastinate on things we actually want to do?' },
  { id: 'day-grocery-smell', category: 'everyday', text: 'Why do grocery stores smell the way they do?' },
  { id: 'day-sunday-feeling', category: 'everyday', text: 'Why do we feel a little strange on Sundays?' },
  { id: 'day-places-shrink', category: 'everyday', text: 'Why do familiar places feel smaller when you return?' },
  { id: 'day-keep-unused', category: 'everyday', text: 'Why do we keep things we never use?' },
  { id: 'day-waiting-excited', category: 'everyday', text: 'Why does waiting feel longer when you’re excited?' },

  // ── Big Questions ─────────────────────────────────────────────────────────
  { id: 'big-feels-like-home', category: 'bigQuestions', text: 'What makes a place feel like home?' },
  { id: 'big-be-remembered', category: 'bigQuestions', text: 'Why do we want to be remembered?' },
  { id: 'big-good-question', category: 'bigQuestions', text: 'What makes a question a good one?' },
  { id: 'big-collect-things', category: 'bigQuestions', text: 'Why do we collect things?' },
  { id: 'big-truly-understand', category: 'bigQuestions', text: 'What does it mean to truly understand something?' },
  { id: 'big-tell-stories', category: 'bigQuestions', text: 'Why do we tell stories?' },
  { id: 'big-habit-becomes-you', category: 'bigQuestions', text: 'When does a habit become part of who you are?' },
  { id: 'big-why-wonder', category: 'bigQuestions', text: 'Why do we wonder at all?' },
]

// ── Validation ──────────────────────────────────────────────────────────────

const LearnCollectionSchema = LearnPromptSchema.array().superRefine((items, ctx) => {
  const seen = new Set<string>()
  for (let i = 0; i < items.length; i++) {
    if (seen.has(items[i].id)) {
      ctx.addIssue({
        code: 'custom',
        path: [i, 'id'],
        message: `Duplicate prompt id: ${items[i].id}`,
      })
    }
    seen.add(items[i].id)
  }
})

/** Validated at module load — a typo or duplicate id fails fast. */
export const LEARN_PROMPTS: readonly LearnPrompt[] = LearnCollectionSchema.parse(RAW_PROMPTS)