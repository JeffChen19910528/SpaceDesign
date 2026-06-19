'use strict'

/**
 * Pure business-logic functions shared between the Electron renderer and Jest tests.
 *
 * UMD pattern:
 *   - Node.js / Jest  → module.exports = { evaluateWithRules, parseAIScenario }
 *   - Browser / Electron renderer → window.Engine = { evaluateWithRules, parseAIScenario }
 */
;(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory()
  } else {
    root.Engine = factory()
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /**
   * Evaluate a document text against a set of rules.
   * @param {string} text   Raw document content.
   * @param {object} rules  Parsed rules JSON (sections + qualityChecks).
   * @returns {{ found, missing, warnings, score, maxScore, percentage }}
   */
  function evaluateWithRules(text, rules) {
    const found = []
    const missing = []
    let score = 0
    let maxScore = 0

    rules.sections.forEach(function (section) {
      maxScore += section.weight
      const matched = section.keywords.some(function (kw) {
        return new RegExp(kw, 'i').test(text)
      })
      if (matched) {
        score += section.weight
        found.push(section)
      } else {
        missing.push(section)
      }
    })

    const warnings = []
    if (rules.qualityChecks) {
      rules.qualityChecks.forEach(function (check) {
        const regex = new RegExp(check.pattern, 'gi')
        const hasMatch = regex.test(text)
        if ((check.triggerWhenFound && hasMatch) || (!check.triggerWhenFound && !hasMatch)) {
          warnings.push(check)
        }
      })
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    return { found, missing, warnings, score, maxScore, percentage }
  }

  /**
   * Parse an AI-generated scenario text into a structured object.
   * @param {string} text          Raw AI response text.
   * @param {object} aiParse       Locale's ai_parse config (regexes + diffMap).
   * @param {string} fallbackTitle Fallback title when the title regex cannot match.
   * @returns {object|null}  Parsed scenario, or null on failure.
   */
  function parseAIScenario(text, aiParse, fallbackTitle) {
    const p = aiParse
    try {
      const titleMatch    = text.match(p.title)
      const diffMatch     = text.match(p.diff)
      const scenarioMatch = text.match(p.scenario)
      const reqsMatch     = text.match(p.reqs)
      const hintsMatch    = text.match(p.hints)
      const parseList = function (str) {
        return str
          ? str.split('\n').map(function (l) { return l.replace(/^[-•*]\s*/, '').trim() }).filter(function (l) { return l.length > 0 })
          : []
      }
      return {
        id: 'ai-' + Date.now(),
        title: (titleMatch && titleMatch[1] && titleMatch[1].trim()) || fallbackTitle || 'AI Generated Scenario',
        difficulty: p.diffMap[(diffMatch && diffMatch[1] && diffMatch[1].trim())] || 2,
        scenario: (scenarioMatch && scenarioMatch[1] && scenarioMatch[1].trim()) || text.substring(0, 300),
        requirements: parseList(reqsMatch && reqsMatch[1]),
        hints: parseList(hintsMatch && hintsMatch[1])
      }
    } catch (e) {
      return null
    }
  }

  return { evaluateWithRules: evaluateWithRules, parseAIScenario: parseAIScenario }
}))
