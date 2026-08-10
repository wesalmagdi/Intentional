// packages/domain/src/learn/promptService.test.ts

import { describe, expect, it } from 'vitest'
import { LEARN_PROMPTS } from './prompts'
import { getPrompts, surprisePrompt } from './promptService'

describe('collection', () => {
  it('is non-empty', () => {
    expect(LEARN_PROMPTS.length).toBeGreaterThan(0)
  })

  it('has unique ids', () => {
    const ids = LEARN_PROMPTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getPrompts', () => {
  it('returns the whole collection when no category is given', () => {
    expect(getPrompts()).toHaveLength(LEARN_PROMPTS.length)
  })

  it('filters by category', () => {
    const science = getPrompts('science')
    expect(science.length).toBeGreaterThan(0)
    expect(science.every((p) => p.category === 'science')).toBe(true)
  })
})

describe('surprisePrompt', () => {
  it('is deterministic when the RNG is injected', () => {
    const first = surprisePrompt(undefined, () => 0)
    const second = surprisePrompt(undefined, () => 0)
    expect(first).toBe(second)
    expect(first).toBe(LEARN_PROMPTS[0])
  })

  it('never returns the excluded prompt', () => {
    const excluded = LEARN_PROMPTS[0].id
    for (let i = 0; i < 50; i++) {
      const pick = surprisePrompt(excluded)
      expect(pick?.id).not.toBe(excluded)
    }
  })
})