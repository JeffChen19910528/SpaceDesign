'use strict'

const { evaluateWithRules } = require('../../lib/engine')

// ── Fixtures ──────────────────────────────────────────────────────────────────

/**
 * Minimal rules fixture — independent of any JSON files.
 * Section weights: A=10, B=5, C=15  →  maxScore=30
 */
const RULES = {
  sections: [
    { id: 'sec-a', name: 'Section A', required: true,  weight: 10,
      keywords: ['alpha', '目的'],  description: 'Desc A', hint: 'Hint A' },
    { id: 'sec-b', name: 'Section B', required: false, weight:  5,
      keywords: ['beta',  'scope'], description: 'Desc B', hint: 'Hint B' },
    { id: 'sec-c', name: 'Section C', required: true,  weight: 15,
      keywords: ['gamma', 'delta'], description: 'Desc C', hint: 'Hint C' },
  ],
  qualityChecks: [
    { id: 'qc-trigger',  name: 'Bad Word',      pattern: 'maybe|大概',
      triggerWhenFound: true,  severity: 'warning', message: 'Vague wording found' },
    { id: 'qc-missing',  name: 'Good Practice', pattern: 'FR-\\d+',
      triggerWhenFound: false, severity: 'warning', message: 'Requirement ID missing' },
  ],
}

const MAX_SCORE = 30 // 10 + 5 + 15

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('evaluateWithRules — section detection', () => {
  test('empty text → all sections missing, score=0, percentage=0', () => {
    const res = evaluateWithRules('', RULES)
    expect(res.found).toHaveLength(0)
    expect(res.missing).toHaveLength(3)
    expect(res.score).toBe(0)
    expect(res.maxScore).toBe(MAX_SCORE)
    expect(res.percentage).toBe(0)
  })

  test('text matching only section A keyword → found=[A], missing=[B,C]', () => {
    const res = evaluateWithRules('this document describes alpha usage', RULES)
    expect(res.found.map(s => s.id)).toEqual(['sec-a'])
    expect(res.missing.map(s => s.id)).toEqual(['sec-b', 'sec-c'])
    expect(res.score).toBe(10)
    expect(res.percentage).toBe(Math.round(10 / MAX_SCORE * 100)) // 33
  })

  test('text matching sections A and C → found=[A,C], missing=[B]', () => {
    const res = evaluateWithRules('alpha covers the gamma region and delta too', RULES)
    expect(res.found.map(s => s.id)).toEqual(['sec-a', 'sec-c'])
    expect(res.missing.map(s => s.id)).toEqual(['sec-b'])
    expect(res.score).toBe(25)
    expect(res.percentage).toBe(Math.round(25 / MAX_SCORE * 100)) // 83
  })

  test('text matching all sections → 100%', () => {
    const res = evaluateWithRules('alpha beta gamma delta scope', RULES)
    expect(res.found).toHaveLength(3)
    expect(res.missing).toHaveLength(0)
    expect(res.percentage).toBe(100)
  })

  test('keyword matching is case-insensitive (ALPHA matches alpha)', () => {
    const res = evaluateWithRules('ALPHA AND BETA AND GAMMA', RULES)
    expect(res.found.map(s => s.id)).toEqual(['sec-a', 'sec-b', 'sec-c'])
    expect(res.percentage).toBe(100)
  })

  test('Chinese keyword 目的 matched by section A', () => {
    const res = evaluateWithRules('本文件目的是說明系統需求', RULES)
    const foundIds = res.found.map(s => s.id)
    expect(foundIds).toContain('sec-a')
  })
})

describe('evaluateWithRules — score calculation', () => {
  test('percentage rounds correctly (10/30 ≈ 33%)', () => {
    const res = evaluateWithRules('alpha only', RULES)
    expect(res.percentage).toBe(33)
  })

  test('percentage rounds correctly (15/30 = 50%)', () => {
    const res = evaluateWithRules('gamma only', RULES)
    expect(res.percentage).toBe(50)
  })

  test('maxScore=0 → percentage=0 without division error', () => {
    const emptyRules = { sections: [], qualityChecks: [] }
    const res = evaluateWithRules('some text', emptyRules)
    expect(res.percentage).toBe(0)
    expect(res.maxScore).toBe(0)
  })
})

describe('evaluateWithRules — qualityChecks', () => {
  test('triggerWhenFound=true: pattern found → warning triggered', () => {
    const res = evaluateWithRules('maybe this will work 大概', RULES)
    const ids = res.warnings.map(w => w.id)
    expect(ids).toContain('qc-trigger')
  })

  test('triggerWhenFound=true: pattern not found → no warning', () => {
    const res = evaluateWithRules('this is a definitive statement', RULES)
    const ids = res.warnings.map(w => w.id)
    expect(ids).not.toContain('qc-trigger')
  })

  test('triggerWhenFound=false: pattern not found → warning triggered', () => {
    // No "FR-001" in text → requirement ID check fires
    const res = evaluateWithRules('alpha beta gamma description only', RULES)
    const ids = res.warnings.map(w => w.id)
    expect(ids).toContain('qc-missing')
  })

  test('triggerWhenFound=false: pattern found → no warning', () => {
    // Text contains FR-001 → requirement ID check does NOT fire
    const res = evaluateWithRules('FR-001 defines the requirement', RULES)
    const ids = res.warnings.map(w => w.id)
    expect(ids).not.toContain('qc-missing')
  })

  test('both warnings fire when text has vague words and no FR-id', () => {
    const res = evaluateWithRules('maybe alpha beta gamma delta scope', RULES)
    expect(res.warnings).toHaveLength(2)
  })

  test('no warnings fire when text has FR-id and no vague words', () => {
    const res = evaluateWithRules('alpha FR-001 gamma delta scope', RULES)
    expect(res.warnings).toHaveLength(0)
  })

  test('rules without qualityChecks field → warnings=[], no crash', () => {
    const noChecks = { sections: RULES.sections }
    const res = evaluateWithRules('alpha beta gamma delta', noChecks)
    expect(res.warnings).toEqual([])
  })
})

describe('evaluateWithRules — return shape', () => {
  test('result always contains all expected keys', () => {
    const res = evaluateWithRules('some content', RULES)
    expect(res).toHaveProperty('found')
    expect(res).toHaveProperty('missing')
    expect(res).toHaveProperty('warnings')
    expect(res).toHaveProperty('score')
    expect(res).toHaveProperty('maxScore')
    expect(res).toHaveProperty('percentage')
  })

  test('found items contain section metadata (name, required, weight)', () => {
    const res = evaluateWithRules('alpha', RULES)
    expect(res.found[0]).toMatchObject({ id: 'sec-a', name: 'Section A', required: true, weight: 10 })
  })

  test('missing items contain section metadata', () => {
    const res = evaluateWithRules('', RULES)
    expect(res.missing[0]).toMatchObject({ id: 'sec-a' })
  })

  test('score + (maxScore - score) = maxScore', () => {
    const res = evaluateWithRules('alpha beta', RULES)
    const missingWeight = res.missing.reduce((acc, s) => acc + s.weight, 0)
    expect(res.score + missingWeight).toBe(res.maxScore)
  })
})
