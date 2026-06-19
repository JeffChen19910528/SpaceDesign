'use strict'

/**
 * Integration tests for the file I/O logic performed by main.js IPC handlers.
 * We test the same operations directly (without Electron) to verify correctness.
 */

const fs   = require('fs')
const path = require('path')
const os   = require('os')

const ROOT = path.join(__dirname, '../..')

// ── Inline handler logic (mirrors main.js) ────────────────────────────────────

function handleLoadRules(docType) {
  const rulesPath = path.join(ROOT, 'rules', `${docType}.json`)
  if (fs.existsSync(rulesPath)) {
    return JSON.parse(fs.readFileSync(rulesPath, 'utf-8'))
  }
  return null
}

function handleLoadScenarios() {
  const scenariosPath = path.join(ROOT, 'scenarios', 'scenarios.json')
  if (fs.existsSync(scenariosPath)) {
    return JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'))
  }
  return null
}

function handleSaveSettings(settingsPath, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  return true
}

function handleLoadSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  }
  return { useLocalModel: false, modelUrl: 'http://localhost:11434', modelName: 'llama3' }
}

// ── Tests: load-rules ─────────────────────────────────────────────────────────

describe('IPC handler: load-rules', () => {
  test('returns valid SRS rules object for docType "srs"', () => {
    const rules = handleLoadRules('srs')
    expect(rules).not.toBeNull()
    expect(rules.docType).toBe('srs')
    expect(Array.isArray(rules.sections)).toBe(true)
    expect(rules.sections.length).toBeGreaterThan(0)
  })

  test('returns valid AI Skill rules object for docType "ai-skill"', () => {
    const rules = handleLoadRules('ai-skill')
    expect(rules).not.toBeNull()
    expect(rules.docType).toBe('ai-skill')
    expect(Array.isArray(rules.sections)).toBe(true)
  })

  test('returns valid System Design rules object for docType "system-design"', () => {
    const rules = handleLoadRules('system-design')
    expect(rules).not.toBeNull()
    expect(rules.docType).toBe('system-design')
    expect(Array.isArray(rules.sections)).toBe(true)
  })

  test('returns null for non-existent docType', () => {
    const result = handleLoadRules('non-existent-type')
    expect(result).toBeNull()
  })

  test('returned rules have evaluationPrompt string', () => {
    const rules = handleLoadRules('srs')
    expect(typeof rules.evaluationPrompt).toBe('string')
    expect(rules.evaluationPrompt.length).toBeGreaterThan(0)
  })

  test('returned rules have qualityChecks array', () => {
    ;['srs', 'ai-skill', 'system-design'].forEach(docType => {
      const rules = handleLoadRules(docType)
      expect(Array.isArray(rules.qualityChecks)).toBe(true)
    })
  })
})

// ── Tests: load-scenarios ─────────────────────────────────────────────────────

describe('IPC handler: load-scenarios', () => {
  test('returns non-null object', () => {
    const data = handleLoadScenarios()
    expect(data).not.toBeNull()
  })

  test('returned object contains srs, ai-skill, system-design categories', () => {
    const data = handleLoadScenarios()
    expect(Array.isArray(data.srs)).toBe(true)
    expect(Array.isArray(data['ai-skill'])).toBe(true)
    expect(Array.isArray(data['system-design'])).toBe(true)
  })

  test('each category has 43 scenarios', () => {
    const data = handleLoadScenarios()
    expect(data.srs).toHaveLength(43)
    expect(data['ai-skill']).toHaveLength(43)
    expect(data['system-design']).toHaveLength(43)
  })

  test('each scenario has an id and difficulty', () => {
    const data = handleLoadScenarios()
    data.srs.forEach(s => {
      expect(typeof s.id).toBe('string')
      expect([1, 2, 3]).toContain(s.difficulty)
    })
  })

  test('each scenario title has trilingual content', () => {
    const data = handleLoadScenarios()
    data['system-design'].forEach(s => {
      expect(typeof s.title['zh-TW']).toBe('string')
      expect(typeof s.title['en']).toBe('string')
      expect(typeof s.title['ja']).toBe('string')
    })
  })
})

// ── Tests: save-settings + load-settings roundtrip ───────────────────────────

describe('IPC handler: save-settings & load-settings', () => {
  let tempPath

  beforeEach(() => {
    tempPath = path.join(os.tmpdir(), `spacedesign-test-settings-${Date.now()}.json`)
  })

  afterEach(() => {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
  })

  test('save-settings returns true', () => {
    const result = handleSaveSettings(tempPath, { useLocalModel: false })
    expect(result).toBe(true)
  })

  test('saved file can be read back as valid JSON', () => {
    handleSaveSettings(tempPath, { useLocalModel: true, modelName: 'mistral' })
    const content = JSON.parse(fs.readFileSync(tempPath, 'utf-8'))
    expect(content.useLocalModel).toBe(true)
    expect(content.modelName).toBe('mistral')
  })

  test('settings roundtrip preserves all fields', () => {
    const original = {
      useLocalModel: true,
      modelUrl: 'http://localhost:11434',
      modelName: 'llama3',
      language: 'en',
    }
    handleSaveSettings(tempPath, original)
    const loaded = handleLoadSettings(tempPath)
    expect(loaded).toEqual(original)
  })

  test('load-settings returns defaults when file does not exist', () => {
    const nonExistentPath = path.join(os.tmpdir(), 'does-not-exist-abc123.json')
    const defaults = handleLoadSettings(nonExistentPath)
    expect(defaults).toMatchObject({
      useLocalModel: false,
      modelUrl: 'http://localhost:11434',
      modelName: 'llama3',
    })
  })

  test('load-settings correctly reads back boolean false', () => {
    handleSaveSettings(tempPath, { useLocalModel: false, modelUrl: 'http://custom:8080', modelName: 'gemma' })
    const loaded = handleLoadSettings(tempPath)
    expect(loaded.useLocalModel).toBe(false)
    expect(loaded.modelUrl).toBe('http://custom:8080')
    expect(loaded.modelName).toBe('gemma')
  })

  test('settings file is written as pretty-printed JSON', () => {
    handleSaveSettings(tempPath, { useLocalModel: false })
    const raw = fs.readFileSync(tempPath, 'utf-8')
    expect(raw).toContain('\n')  // pretty-printed has newlines
    expect(raw).toContain('  ')  // 2-space indent
  })
})
