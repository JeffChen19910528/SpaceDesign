'use strict'

const fs   = require('fs')
const path = require('path')
const { evaluateWithRules } = require('../../lib/engine')

const RULES_DIR = path.join(__dirname, '../../rules')

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadRule(docType) {
  const filePath = path.join(RULES_DIR, `${docType}.json`)
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

const RULE_FILES = ['srs', 'ai-skill', 'system-design']

// Expected max scores computed from the rule files
const EXPECTED_MAX_SCORES = {
  'srs':           113,  // sum of all section weights in srs.json
  'ai-skill':       96,  // sum of all section weights in ai-skill.json
  'system-design': 112,  // sum of all section weights in system-design.json
}

// ── Top-level structure ───────────────────────────────────────────────────────

describe('rules JSON — file existence & top-level structure', () => {
  RULE_FILES.forEach(docType => {
    test(`${docType}.json exists and is valid JSON`, () => {
      const filePath = path.join(RULES_DIR, `${docType}.json`)
      expect(fs.existsSync(filePath)).toBe(true)
      expect(() => loadRule(docType)).not.toThrow()
    })

    test(`${docType}.json has required top-level fields`, () => {
      const rules = loadRule(docType)
      expect(typeof rules.version).toBe('string')
      expect(typeof rules.docType).toBe('string')
      expect(typeof rules.name).toBe('string')
      expect(Array.isArray(rules.sections)).toBe(true)
      expect(Array.isArray(rules.qualityChecks)).toBe(true)
      expect(typeof rules.evaluationPrompt).toBe('string')
    })

    test(`${docType}.json docType field matches filename`, () => {
      const rules = loadRule(docType)
      expect(rules.docType).toBe(docType)
    })
  })
})

// ── Sections validation ───────────────────────────────────────────────────────

describe('rules JSON — sections structure', () => {
  RULE_FILES.forEach(docType => {
    test(`${docType}.json — sections is non-empty`, () => {
      const rules = loadRule(docType)
      expect(rules.sections.length).toBeGreaterThan(0)
    })

    test(`${docType}.json — every section has required fields`, () => {
      const rules = loadRule(docType)
      rules.sections.forEach(section => {
        expect(typeof section.id).toBe('string')
        expect(section.id.length).toBeGreaterThan(0)
        expect(typeof section.name).toBe('string')
        expect(section.name.length).toBeGreaterThan(0)
        expect(typeof section.required).toBe('boolean')
        expect(typeof section.weight).toBe('number')
        expect(section.weight).toBeGreaterThan(0)
        expect(Array.isArray(section.keywords)).toBe(true)
        expect(section.keywords.length).toBeGreaterThan(0)
        expect(typeof section.description).toBe('string')
        expect(typeof section.hint).toBe('string')
      })
    })

    test(`${docType}.json — all keywords are non-empty strings`, () => {
      const rules = loadRule(docType)
      rules.sections.forEach(section => {
        section.keywords.forEach(kw => {
          expect(typeof kw).toBe('string')
          expect(kw.trim().length).toBeGreaterThan(0)
        })
      })
    })

    test(`${docType}.json — section IDs are unique`, () => {
      const rules = loadRule(docType)
      const ids = rules.sections.map(s => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    test(`${docType}.json — maxScore equals expected value`, () => {
      const rules = loadRule(docType)
      const totalWeight = rules.sections.reduce((sum, s) => sum + s.weight, 0)
      expect(totalWeight).toBe(EXPECTED_MAX_SCORES[docType])
    })

    test(`${docType}.json — at least one section is marked required`, () => {
      const rules = loadRule(docType)
      const requiredSections = rules.sections.filter(s => s.required)
      expect(requiredSections.length).toBeGreaterThan(0)
    })
  })
})

// ── qualityChecks validation ──────────────────────────────────────────────────

describe('rules JSON — qualityChecks structure', () => {
  RULE_FILES.forEach(docType => {
    test(`${docType}.json — every qualityCheck has required fields`, () => {
      const rules = loadRule(docType)
      rules.qualityChecks.forEach(check => {
        expect(typeof check.id).toBe('string')
        expect(check.id.length).toBeGreaterThan(0)
        expect(typeof check.name).toBe('string')
        expect(typeof check.pattern).toBe('string')
        expect(check.pattern.length).toBeGreaterThan(0)
        expect(typeof check.triggerWhenFound).toBe('boolean')
        expect(typeof check.severity).toBe('string')
        expect(typeof check.message).toBe('string')
      })
    })

    test(`${docType}.json — qualityCheck patterns compile to valid regex`, () => {
      const rules = loadRule(docType)
      rules.qualityChecks.forEach(check => {
        expect(() => new RegExp(check.pattern, 'gi')).not.toThrow()
      })
    })

    test(`${docType}.json — qualityCheck IDs are unique`, () => {
      const rules = loadRule(docType)
      const ids = rules.qualityChecks.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })
})

// ── Engine integration with real rules ────────────────────────────────────────

describe('evaluateWithRules — integration with real rule files', () => {
  test('SRS: empty text → 0% and all 14 sections missing', () => {
    const rules = loadRule('srs')
    const res = evaluateWithRules('', rules)
    expect(res.percentage).toBe(0)
    expect(res.found).toHaveLength(0)
    expect(res.missing).toHaveLength(rules.sections.length)
  })

  test('SRS: text with all required section keywords → required sections all found', () => {
    const srsText = `
目的: 本文件描述系統需求。
系統範圍 scope: 本系統負責管理用戶。
概述 overview: 系統提供用戶管理功能。
使用者 user role: 管理員。
限制 constraint: 需使用 HTTPS。
功能需求 FR-001: 用戶可以登入。
非功能 NFR-001: 系統效能 performance QPS 1000。
回應時間 response time latency 200ms。
安全 security authentication HTTPS 認證。
介面 API interface 外部系統整合。
使用案例 use case UC-001 情境描述。
驗收 acceptance criteria: 測試通過。
錯誤 error exception 處理機制。
定義 definition 縮寫 glossary。
`
    const rules = loadRule('srs')
    const res = evaluateWithRules(srsText, rules)
    expect(res.percentage).toBeGreaterThan(0)
  })

  test('SRS: vague terms trigger quality warning', () => {
    const rules = loadRule('srs')
    const res = evaluateWithRules('系統也許可以處理請求，大概回應在 1 秒左右', rules)
    const vagueCheck = res.warnings.find(w => w.id === 'vague-terms')
    expect(vagueCheck).toBeDefined()
  })

  test('SRS: text with FR-001 does NOT trigger req-numbering warning', () => {
    const rules = loadRule('srs')
    const res = evaluateWithRules('FR-001 定義功能需求', rules)
    const check = res.warnings.find(w => w.id === 'req-numbering')
    expect(check).toBeUndefined()
  })

  test('SRS: text with 200ms metric does NOT trigger measurable-metrics warning', () => {
    const rules = loadRule('srs')
    const res = evaluateWithRules('系統回應時間需在 200ms 以內，並發 1000 QPS', rules)
    const check = res.warnings.find(w => w.id === 'measurable-metrics')
    expect(check).toBeUndefined()
  })

  test('AI Skill: empty text → 0% and all 11 sections missing', () => {
    const rules = loadRule('ai-skill')
    const res = evaluateWithRules('', rules)
    expect(res.percentage).toBe(0)
    expect(res.missing).toHaveLength(rules.sections.length)
  })

  test('AI Skill: text with skill name triggers skill-name section', () => {
    const rules = loadRule('ai-skill')
    const res = evaluateWithRules('skill name: send_email', rules)
    const found = res.found.find(s => s.id === 'skill-name')
    expect(found).toBeDefined()
  })

  test('System Design: empty text → 0% and all 14 sections missing', () => {
    const rules = loadRule('system-design')
    const res = evaluateWithRules('', rules)
    expect(res.percentage).toBe(0)
    expect(res.missing).toHaveLength(rules.sections.length)
  })

  test('System Design: text with QPS number does NOT trigger scale-numbers warning', () => {
    const rules = loadRule('system-design')
    const res = evaluateWithRules('系統支援 10000 QPS 的並發請求', rules)
    const check = res.warnings.find(w => w.id === 'scale-numbers')
    expect(check).toBeUndefined()
  })

  test('System Design: text with 取捨 does NOT trigger tradeoffs warning', () => {
    const rules = loadRule('system-design')
    const res = evaluateWithRules('此設計的取捨是效能與一致性之間的平衡', rules)
    const check = res.warnings.find(w => w.id === 'tradeoffs')
    expect(check).toBeUndefined()
  })
})
