'use strict'

/**
 * Pure business-logic functions extracted for testability.
 * These mirror the implementations in renderer/app.js without any DOM or
 * Electron dependencies, so they can be imported by Jest tests.
 */

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

  rules.sections.forEach(section => {
    maxScore += section.weight
    const matched = section.keywords.some(kw => new RegExp(kw, 'i').test(text))
    if (matched) {
      score += section.weight
      found.push(section)
    } else {
      missing.push(section)
    }
  })

  const warnings = []
  rules.qualityChecks?.forEach(check => {
    const regex = new RegExp(check.pattern, 'gi')
    const hasMatch = regex.test(text)
    if ((check.triggerWhenFound && hasMatch) || (!check.triggerWhenFound && !hasMatch)) {
      warnings.push(check)
    }
  })

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  return { found, missing, warnings, score, maxScore, percentage }
}

/**
 * Parse an AI-generated scenario text into a structured object.
 * @param {string} text          Raw AI response text.
 * @param {object} aiParse       Locale's ai_parse config (regexes + diffMap).
 * @param {string} fallbackTitle Fallback title when regex cannot match.
 * @returns {object|null}  Parsed scenario or null on failure.
 */
function parseAIScenario(text, aiParse, fallbackTitle) {
  const p = aiParse
  try {
    const titleMatch    = text.match(p.title)
    const diffMatch     = text.match(p.diff)
    const scenarioMatch = text.match(p.scenario)
    const reqsMatch     = text.match(p.reqs)
    const hintsMatch    = text.match(p.hints)
    const parseList = str => str
      ? str.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l.length > 0)
      : []
    return {
      id: 'ai-generated',
      title: titleMatch?.[1]?.trim() || fallbackTitle || 'AI Generated Scenario',
      difficulty: p.diffMap[diffMatch?.[1]?.trim()] || 2,
      scenario: scenarioMatch?.[1]?.trim() || text.substring(0, 300),
      requirements: parseList(reqsMatch?.[1]),
      hints: parseList(hintsMatch?.[1])
    }
  } catch {
    return null
  }
}

module.exports = { evaluateWithRules, parseAIScenario }
