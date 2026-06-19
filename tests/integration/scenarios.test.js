'use strict'

const fs   = require('fs')
const path = require('path')

const SCENARIOS_PATH = path.join(__dirname, '../../scenarios/scenarios.json')
const CATEGORIES     = ['srs', 'ai-skill', 'system-design']
const LANGS          = ['zh-TW', 'en', 'ja']
const EXPECTED_COUNT = 43

let data

beforeAll(() => {
  data = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf-8'))
})

// ── File-level ────────────────────────────────────────────────────────────────

describe('scenarios.json — file level', () => {
  test('file exists', () => {
    expect(fs.existsSync(SCENARIOS_PATH)).toBe(true)
  })

  test('parses as valid JSON', () => {
    expect(() => JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf-8'))).not.toThrow()
  })

  test('contains all three categories', () => {
    CATEGORIES.forEach(cat => {
      expect(data).toHaveProperty(cat)
      expect(Array.isArray(data[cat])).toBe(true)
    })
  })

  test(`total scenarios = ${EXPECTED_COUNT * CATEGORIES.length}`, () => {
    const total = CATEGORIES.reduce((sum, cat) => sum + data[cat].length, 0)
    expect(total).toBe(EXPECTED_COUNT * CATEGORIES.length)
  })
})

// ── Per-category counts ───────────────────────────────────────────────────────

describe('scenarios.json — category counts', () => {
  CATEGORIES.forEach(cat => {
    test(`${cat} has exactly ${EXPECTED_COUNT} scenarios`, () => {
      expect(data[cat]).toHaveLength(EXPECTED_COUNT)
    })
  })
})

// ── ID uniqueness ─────────────────────────────────────────────────────────────

describe('scenarios.json — ID uniqueness', () => {
  CATEGORIES.forEach(cat => {
    test(`${cat} has no duplicate IDs within category`, () => {
      const ids = data[cat].map(s => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  test('all IDs are unique across all categories', () => {
    const allIds = CATEGORIES.flatMap(cat => data[cat].map(s => s.id))
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})

// ── Per-scenario structure ────────────────────────────────────────────────────

describe('scenarios.json — scenario object structure', () => {
  CATEGORIES.forEach(cat => {
    test(`${cat} — every scenario has id, difficulty, title, scenario, requirements, hints`, () => {
      data[cat].forEach(scenario => {
        expect(typeof scenario.id).toBe('string')
        expect(scenario.id.length).toBeGreaterThan(0)
        expect([1, 2, 3]).toContain(scenario.difficulty)
        expect(typeof scenario.title).toBe('object')
        expect(typeof scenario.scenario).toBe('object')
        expect(typeof scenario.requirements).toBe('object')
        expect(typeof scenario.hints).toBe('object')
      })
    })

    test(`${cat} — every scenario has zh-TW, en, ja translations for title and scenario text`, () => {
      data[cat].forEach(s => {
        LANGS.forEach(lang => {
          expect(typeof s.title[lang]).toBe('string')
          expect(s.title[lang].trim().length).toBeGreaterThan(0)

          expect(typeof s.scenario[lang]).toBe('string')
          expect(s.scenario[lang].trim().length).toBeGreaterThan(0)
        })
      })
    })

    test(`${cat} — every scenario has ≥5 requirements in each language`, () => {
      data[cat].forEach(s => {
        LANGS.forEach(lang => {
          expect(Array.isArray(s.requirements[lang])).toBe(true)
          expect(s.requirements[lang].length).toBeGreaterThanOrEqual(5)
        })
      })
    })

    test(`${cat} — every scenario has ≥3 hints in each language`, () => {
      data[cat].forEach(s => {
        LANGS.forEach(lang => {
          expect(Array.isArray(s.hints[lang])).toBe(true)
          expect(s.hints[lang].length).toBeGreaterThanOrEqual(3)
        })
      })
    })

    test(`${cat} — no empty strings in requirements or hints`, () => {
      data[cat].forEach(s => {
        LANGS.forEach(lang => {
          s.requirements[lang].forEach(req => {
            expect(typeof req).toBe('string')
            expect(req.trim().length).toBeGreaterThan(0)
          })
          s.hints[lang].forEach(hint => {
            expect(typeof hint).toBe('string')
            expect(hint.trim().length).toBeGreaterThan(0)
          })
        })
      })
    })
  })
})

// ── Difficulty distribution ───────────────────────────────────────────────────

describe('scenarios.json — difficulty coverage', () => {
  CATEGORIES.forEach(cat => {
    test(`${cat} — contains scenarios of all three difficulty levels`, () => {
      const difficulties = new Set(data[cat].map(s => s.difficulty))
      expect(difficulties.has(1)).toBe(true)
      expect(difficulties.has(2)).toBe(true)
      expect(difficulties.has(3)).toBe(true)
    })
  })
})

// ── ID prefix convention ──────────────────────────────────────────────────────

describe('scenarios.json — ID prefix conventions', () => {
  test('srs IDs start with "srs-"', () => {
    data.srs.forEach(s => expect(s.id).toMatch(/^srs-\d+$/))
  })

  test('ai-skill IDs start with "ai-"', () => {
    data['ai-skill'].forEach(s => expect(s.id).toMatch(/^ai-\d+$/))
  })

  test('system-design IDs start with "sd-"', () => {
    data['system-design'].forEach(s => expect(s.id).toMatch(/^sd-\d+$/))
  })
})
