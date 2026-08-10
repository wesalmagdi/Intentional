// packages/domain/src/learn/promptService.ts
//
// Pure access helpers. No UI, no side effects — fully unit-testable.

import type { LearnCategory, LearnPrompt } from './prompts'
import { LEARN_PROMPTS } from './prompts'

/** All prompts, or just one category. */
export function getPrompts(category?: LearnCategory): readonly LearnPrompt[] {
  if (!category) return LEARN_PROMPTS
  return LEARN_PROMPTS.filter((p) => p.category === category)
}

/**
 * "Surprise me" — pure random draw from the finite collection.
 * RNG is injectable so tests are deterministic. Never personalized.
 */
export function surprisePrompt(
  excludeId?: string,
  rand: () => number = Math.random,
): LearnPrompt | undefined {
  const pool = excludeId ? LEARN_PROMPTS.filter((p) => p.id !== excludeId) : LEARN_PROMPTS
  if (pool.length === 0) return undefined
  const index = Math.min(Math.floor(rand() * pool.length), pool.length - 1)
  return pool[index]
}