'use strict'

const { parseAIScenario } = require('../../lib/engine')

// ── Locale ai_parse fixtures (mirrors renderer/locales.js) ───────────────────

const ZH_TW_PARSE = {
  title:    /標題[：:]\s*(.+)/,
  diff:     /難度[：:]\s*(.+)/,
  scenario: /情境[：:]\s*\n([\s\S]+?)(?=\n需求[：:]|\n提示[：:]|$)/,
  reqs:     /需求[：:]\s*\n([\s\S]+?)(?=\n提示[：:]|$)/,
  hints:    /提示[：:]\s*\n([\s\S]+?)$/,
  diffMap:  { '初級': 1, '中級': 2, '高級': 3 },
}

const EN_PARSE = {
  title:    /Title[：:]\s*(.+)/i,
  diff:     /Difficulty[：:]\s*(.+)/i,
  scenario: /Scenario[：:]\s*\n([\s\S]+?)(?=\nRequirements[：:]|\nHints[：:]|$)/i,
  reqs:     /Requirements[：:]\s*\n([\s\S]+?)(?=\nHints[：:]|$)/i,
  hints:    /Hints[：:]\s*\n([\s\S]+?)$/i,
  diffMap:  { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 },
}

const JA_PARSE = {
  title:    /タイトル[：:]\s*(.+)/,
  diff:     /難易度[：:]\s*(.+)/,
  scenario: /シナリオ[：:]\s*\n([\s\S]+?)(?=\n要件[：:]|\nヒント[：:]|$)/,
  reqs:     /要件[：:]\s*\n([\s\S]+?)(?=\nヒント[：:]|$)/,
  hints:    /ヒント[：:]\s*\n([\s\S]+?)$/,
  diffMap:  { '初級': 1, '中級': 2, '上級': 3 },
}

// ── Sample AI responses ───────────────────────────────────────────────────────

const ZH_TW_RESPONSE = `標題：線上購物車系統
難度：中級
情境：
設計一個高並發的線上購物車系統，支援 100 萬日活用戶。
需要考量庫存管理與防超賣機制。
需求：
- 支援加入購物車功能
- 支援結帳與付款流程
- 庫存即時同步
- 防超賣設計
- 購物車資料持久化
提示：
- 使用 Redis 做購物車存儲
- 考慮分散式鎖防超賣
- 設計冪等性結帳 API`

const EN_RESPONSE = `Title: Shopping Cart System
Difficulty: Intermediate
Scenario:
Design a high-throughput shopping cart supporting 1M DAU.
Consider inventory management and oversell prevention.
Requirements:
- Add-to-cart functionality
- Checkout and payment flow
- Real-time inventory sync
- Oversell prevention
- Cart persistence
Hints:
- Use Redis for cart storage
- Consider distributed locks
- Design idempotent checkout API`

const JA_RESPONSE = `タイトル：オンラインショッピングカート
難易度：中級
シナリオ：
高並行のオンラインショッピングカートシステムを設計します。
100万 DAU をサポートします。
要件：
- カートへの追加機能
- チェックアウトフロー
- リアルタイム在庫同期
- 過剰販売防止
- カートデータの永続化
ヒント：
- Redis でカートを保存
- 分散ロックを検討
- 冪等性のある API を設計`

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('parseAIScenario — 繁體中文', () => {
  test('correctly parses title', () => {
    const result = parseAIScenario(ZH_TW_RESPONSE, ZH_TW_PARSE, 'AI 生成題目')
    expect(result.title).toBe('線上購物車系統')
  })

  test('difficulty 中級 → 2', () => {
    const result = parseAIScenario(ZH_TW_RESPONSE, ZH_TW_PARSE, 'AI 生成題目')
    expect(result.difficulty).toBe(2)
  })

  test('scenario text is extracted', () => {
    const result = parseAIScenario(ZH_TW_RESPONSE, ZH_TW_PARSE, 'AI 生成題目')
    expect(result.scenario).toContain('高並發')
    expect(result.scenario).toContain('100 萬日活用戶')
  })

  test('requirements are parsed into array (5 items)', () => {
    const result = parseAIScenario(ZH_TW_RESPONSE, ZH_TW_PARSE, 'AI 生成題目')
    expect(Array.isArray(result.requirements)).toBe(true)
    expect(result.requirements).toHaveLength(5)
  })

  test('bullet points stripped from requirements', () => {
    const result = parseAIScenario(ZH_TW_RESPONSE, ZH_TW_PARSE, 'AI 生成題目')
    result.requirements.forEach(req => {
      expect(req).not.toMatch(/^[-•*]/)
    })
  })

  test('hints are parsed into array (3 items)', () => {
    const result = parseAIScenario(ZH_TW_RESPONSE, ZH_TW_PARSE, 'AI 生成題目')
    expect(Array.isArray(result.hints)).toBe(true)
    expect(result.hints).toHaveLength(3)
  })

  test('difficulty 初級 → 1', () => {
    const text = ZH_TW_RESPONSE.replace('中級', '初級')
    const result = parseAIScenario(text, ZH_TW_PARSE, 'AI 生成題目')
    expect(result.difficulty).toBe(1)
  })

  test('difficulty 高級 → 3', () => {
    const text = ZH_TW_RESPONSE.replace('中級', '高級')
    const result = parseAIScenario(text, ZH_TW_PARSE, 'AI 生成題目')
    expect(result.difficulty).toBe(3)
  })
})

describe('parseAIScenario — English', () => {
  test('correctly parses title', () => {
    const result = parseAIScenario(EN_RESPONSE, EN_PARSE, 'AI Generated Scenario')
    expect(result.title).toBe('Shopping Cart System')
  })

  test('difficulty Intermediate → 2', () => {
    const result = parseAIScenario(EN_RESPONSE, EN_PARSE, 'AI Generated Scenario')
    expect(result.difficulty).toBe(2)
  })

  test('difficulty Beginner → 1', () => {
    const text = EN_RESPONSE.replace('Intermediate', 'Beginner')
    const result = parseAIScenario(text, EN_PARSE, 'AI Generated Scenario')
    expect(result.difficulty).toBe(1)
  })

  test('difficulty Advanced → 3', () => {
    const text = EN_RESPONSE.replace('Intermediate', 'Advanced')
    const result = parseAIScenario(text, EN_PARSE, 'AI Generated Scenario')
    expect(result.difficulty).toBe(3)
  })

  test('requirements and hints are correctly parsed', () => {
    const result = parseAIScenario(EN_RESPONSE, EN_PARSE, 'AI Generated Scenario')
    expect(result.requirements).toHaveLength(5)
    expect(result.hints).toHaveLength(3)
  })
})

describe('parseAIScenario — 日本語', () => {
  test('correctly parses title', () => {
    const result = parseAIScenario(JA_RESPONSE, JA_PARSE, 'AI 生成問題')
    expect(result.title).toBe('オンラインショッピングカート')
  })

  test('difficulty 中級 → 2', () => {
    const result = parseAIScenario(JA_RESPONSE, JA_PARSE, 'AI 生成問題')
    expect(result.difficulty).toBe(2)
  })

  test('difficulty 上級 → 3 (JA uses 上級 not 高級)', () => {
    const text = JA_RESPONSE.replace('中級', '上級')
    const result = parseAIScenario(text, JA_PARSE, 'AI 生成問題')
    expect(result.difficulty).toBe(3)
  })

  test('requirements and hints are correctly parsed', () => {
    const result = parseAIScenario(JA_RESPONSE, JA_PARSE, 'AI 生成問題')
    expect(result.requirements).toHaveLength(5)
    expect(result.hints).toHaveLength(3)
  })
})

describe('parseAIScenario — fallback & edge cases', () => {
  test('missing title → fallback title used', () => {
    const noTitle = ZH_TW_RESPONSE.replace(/標題：.*\n/, '')
    const result = parseAIScenario(noTitle, ZH_TW_PARSE, 'FALLBACK')
    expect(result.title).toBe('FALLBACK')
  })

  test('unknown difficulty → defaults to 2', () => {
    const text = ZH_TW_RESPONSE.replace('中級', '超難')
    const result = parseAIScenario(text, ZH_TW_PARSE, 'AI 生成題目')
    expect(result.difficulty).toBe(2)
  })

  test('empty text → uses text.substring(0,300) as scenario fallback', () => {
    const result = parseAIScenario('短文字', ZH_TW_PARSE, 'FALLBACK')
    expect(typeof result.scenario).toBe('string')
    expect(result.requirements).toEqual([])
    expect(result.hints).toEqual([])
  })

  test('• bullet points stripped from lists', () => {
    const withBullets = ZH_TW_RESPONSE.replace(/^- /gm, '• ')
    const result = parseAIScenario(withBullets, ZH_TW_PARSE, 'AI 生成題目')
    result.requirements.forEach(r => expect(r).not.toMatch(/^[•*-]/))
  })

  test('returns object with required shape (id, title, difficulty, scenario, requirements, hints)', () => {
    const result = parseAIScenario(ZH_TW_RESPONSE, ZH_TW_PARSE, 'AI 生成題目')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('difficulty')
    expect(result).toHaveProperty('scenario')
    expect(result).toHaveProperty('requirements')
    expect(result).toHaveProperty('hints')
  })
})
