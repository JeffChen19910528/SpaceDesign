'use strict'

// ── State ──────────────────────────────────────────────
let currentDocType = 'srs'
let currentLocale  = 'zh-TW'
let lastPercentage = null
let settings = {
  useLocalModel: false,
  modelUrl: 'http://localhost:11434',
  modelName: 'llama3',
  language: 'zh-TW'
}
let scenariosData = null
let currentScenario = null
let scenarioHintsVisible = false

// ── DOM refs ───────────────────────────────────────────
const editor        = document.getElementById('editor')
const charCount     = document.getElementById('char-count')
const evaluateBtn   = document.getElementById('evaluate-btn')
const docTypeLabel  = document.getElementById('doc-type-label')
const langSelect    = document.getElementById('lang-select')

const resultsEmpty   = document.getElementById('results-empty')
const resultsLoading = document.getElementById('results-loading')
const scoreSection   = document.getElementById('score-section')
const missingSection = document.getElementById('missing-section')
const warningsSection= document.getElementById('warnings-section')
const foundSection   = document.getElementById('found-section')
const aiSection      = document.getElementById('ai-section')

const scoreArc      = document.getElementById('score-arc')
const scoreValue    = document.getElementById('score-value')
const scoreBarFill  = document.getElementById('score-bar-fill')
const scoreBarLabel = document.getElementById('score-bar-label')
const foundCount    = document.getElementById('found-count')
const missingCount  = document.getElementById('missing-count')
const warningCount  = document.getElementById('warning-count')
const missingList   = document.getElementById('missing-list')
const warningsList  = document.getElementById('warnings-list')
const foundList     = document.getElementById('found-list')
const aiContent     = document.getElementById('ai-content')
const aiLoading     = document.getElementById('ai-loading')

const scenarioPanel      = document.getElementById('scenario-panel')
const scenarioBadge      = document.getElementById('scenario-badge')
const scenarioStars      = document.getElementById('scenario-stars')
const scenarioTitleText  = document.getElementById('scenario-title-text')
const scenarioDesc       = document.getElementById('scenario-desc')
const scenarioReqs       = document.getElementById('scenario-reqs')
const scenarioHintsWrap  = document.getElementById('scenario-hints-wrap')
const scenarioHintsList  = document.getElementById('scenario-hints-list')
const scenarioGenLoading = document.getElementById('scenario-gen-loading')
const scenarioAiBtn      = document.getElementById('scenario-ai-btn')

const settingsOverlay  = document.getElementById('settings-overlay')
const useLocalModelChk = document.getElementById('use-local-model')
const modelSettingsDiv = document.getElementById('model-settings')
const modelUrlInput    = document.getElementById('model-url')
const modelNameInput   = document.getElementById('model-name')
const testResult       = document.getElementById('test-result')

// ── i18n ───────────────────────────────────────────────
function t(key) {
  const locale = window.LOCALES[currentLocale] || window.LOCALES['zh-TW']
  const val = locale[key]
  return typeof val === 'string' ? val : (window.LOCALES['zh-TW'][key] ?? key)
}

function applyLocale() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n)
    if (typeof val === 'string') el.textContent = val
  })
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const val = t(el.dataset.i18nPlaceholder)
    if (typeof val === 'string') el.placeholder = val
  })
  langSelect.value = currentLocale
  const docKey = `doc_type_label_${currentDocType.replace(/-/g, '_')}`
  docTypeLabel.textContent = t(docKey)
  updateCharCount()
  if (lastPercentage !== null && !scoreSection.classList.contains('hidden')) {
    scoreBarLabel.textContent = lastPercentage >= 70 ? t('score_label_good') : lastPercentage >= 40 ? t('score_label_fair') : t('score_label_poor')
  }
  if (!scenarioPanel.classList.contains('hidden') && currentScenario) {
    renderScenario(currentScenario)
  }
}

// ── Init ───────────────────────────────────────────────
async function init() {
  const saved = await window.api.loadSettings()
  if (saved) Object.assign(settings, saved)
  currentLocale = settings.language || 'zh-TW'
  applySettingsToUI()
  setupEvents()
  applyLocale()
}

function applySettingsToUI() {
  useLocalModelChk.checked = settings.useLocalModel
  modelUrlInput.value  = settings.modelUrl
  modelNameInput.value = settings.modelName
  modelSettingsDiv.classList.toggle('hidden', !settings.useLocalModel)
  langSelect.value = currentLocale
}

// ── Events ─────────────────────────────────────────────
function setupEvents() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchDocType(btn.dataset.type))
  })

  // Language switcher
  langSelect.addEventListener('change', () => {
    currentLocale = langSelect.value
    settings.language = currentLocale
    window.api.saveSettings(settings)
    applyLocale()
  })

  // Scenario panel
  document.getElementById('scenario-btn').addEventListener('click', showScenarioPanel)
  document.getElementById('scenario-close-btn').addEventListener('click', hideScenarioPanel)
  document.getElementById('scenario-next-btn').addEventListener('click', pickRandomScenario)
  document.getElementById('scenario-hint-btn').addEventListener('click', toggleScenarioHints)
  scenarioAiBtn.addEventListener('click', generateAIScenario)

  // Editor
  editor.addEventListener('input', updateCharCount)

  // Drag & drop
  const dropZone = document.getElementById('drop-zone')
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragging') })
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'))
  dropZone.addEventListener('drop', e => {
    e.preventDefault()
    dropZone.classList.remove('dragging')
    const file = e.dataTransfer.files[0]
    if (file) readDroppedFile(file)
  })

  // Buttons
  document.getElementById('upload-btn').addEventListener('click', uploadFile)
  document.getElementById('clear-btn').addEventListener('click', clearEditor)
  evaluateBtn.addEventListener('click', evaluate)

  // Settings
  document.getElementById('settings-btn').addEventListener('click', openSettings)
  document.getElementById('close-settings').addEventListener('click', closeSettings)
  settingsOverlay.addEventListener('click', e => { if (e.target === settingsOverlay) closeSettings() })
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings)
  useLocalModelChk.addEventListener('change', () => {
    modelSettingsDiv.classList.toggle('hidden', !useLocalModelChk.checked)
  })
  document.getElementById('test-model-btn').addEventListener('click', testModelConnection)
}

// ── Doc Type ───────────────────────────────────────────
async function switchDocType(type) {
  currentDocType = type
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === type)
  })
  const docKey = `doc_type_label_${type.replace(/-/g, '_')}`
  docTypeLabel.textContent = t(docKey)
  resetResults()
  if (!scenarioPanel.classList.contains('hidden')) {
    currentScenario = null
    await pickRandomScenario()
    scenarioAiBtn.classList.toggle('hidden', !settings.useLocalModel)
  }
}

// ── Editor helpers ─────────────────────────────────────
function updateCharCount() {
  charCount.textContent = `${editor.value.length} ${t('editor_chars')}`
}

function clearEditor() {
  editor.value = ''
  updateCharCount()
  resetResults()
}

async function uploadFile() {
  const result = await window.api.openFile()
  if (result) {
    editor.value = result.content
    updateCharCount()
    resetResults()
  }
}

function readDroppedFile(file) {
  const reader = new FileReader()
  reader.onload = e => {
    editor.value = e.target.result
    updateCharCount()
    resetResults()
  }
  reader.readAsText(file, 'utf-8')
}

// ── Results reset ──────────────────────────────────────
function resetResults() {
  lastPercentage = null
  resultsEmpty.classList.remove('hidden')
  resultsLoading.classList.add('hidden')
  scoreSection.classList.add('hidden')
  missingSection.classList.add('hidden')
  warningsSection.classList.add('hidden')
  foundSection.classList.add('hidden')
  aiSection.classList.add('hidden')
}

// ── Evaluate ───────────────────────────────────────────
async function evaluate() {
  const text = editor.value.trim()
  if (!text) { flashEditor(); return }

  resultsEmpty.classList.add('hidden')
  resultsLoading.classList.remove('hidden')
  scoreSection.classList.add('hidden')
  missingSection.classList.add('hidden')
  warningsSection.classList.add('hidden')
  foundSection.classList.add('hidden')
  aiSection.classList.add('hidden')
  evaluateBtn.disabled = true

  const rules = await window.api.loadRules(currentDocType)
  if (!rules) {
    resultsLoading.classList.add('hidden')
    resultsEmpty.classList.remove('hidden')
    evaluateBtn.disabled = false
    return
  }

  const result = evaluateWithRules(text, rules)
  renderResults(result)

  resultsLoading.classList.add('hidden')
  evaluateBtn.disabled = false

  if (settings.useLocalModel) {
    aiSection.classList.remove('hidden')
    aiLoading.classList.remove('hidden')
    aiContent.textContent = ''
    const aiText = await callLocalModel(text, rules.evaluationPrompt)
    aiLoading.classList.add('hidden')
    aiContent.textContent = aiText
  }
}

// ── Rule-based evaluation ──────────────────────────────
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

// ── Render ─────────────────────────────────────────────
function renderResults({ found, missing, warnings, percentage }) {
  lastPercentage = percentage
  const circumference = 2 * Math.PI * 40
  const offset = circumference * (1 - percentage / 100)
  scoreArc.style.strokeDashoffset = offset
  scoreArc.style.stroke = percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--error)'
  scoreValue.textContent = percentage
  scoreBarFill.style.width = percentage + '%'
  scoreBarFill.style.background = percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--error)'
  scoreBarLabel.textContent = percentage >= 70 ? t('score_label_good') : percentage >= 40 ? t('score_label_fair') : t('score_label_poor')
  foundCount.textContent   = found.length
  missingCount.textContent = missing.length
  warningCount.textContent = warnings.length
  scoreSection.classList.remove('hidden')

  if (missing.length > 0) {
    missingList.innerHTML = ''
    missing.forEach(s => {
      const div = document.createElement('div')
      div.className = 'result-item'
      div.innerHTML = `
        <div class="item-header">
          <span class="item-name">${s.name}</span>
          ${s.required ? `<span class="required-badge">${t('badge_required')}</span>` : ''}
        </div>
        <div class="item-desc">${s.description}</div>
        <div class="item-hint">&#128161; ${s.hint}</div>
      `
      missingList.appendChild(div)
    })
    missingSection.classList.remove('hidden')
  }

  if (warnings.length > 0) {
    warningsList.innerHTML = ''
    warnings.forEach(w => {
      const div = document.createElement('div')
      div.className = 'warning-item'
      div.innerHTML = `
        <div class="warning-name">&#9888; ${w.name}</div>
        <div class="warning-msg">${w.message}</div>
      `
      warningsList.appendChild(div)
    })
    warningsSection.classList.remove('hidden')
  }

  if (found.length > 0) {
    foundList.innerHTML = ''
    found.forEach(s => {
      const div = document.createElement('div')
      div.className = 'found-item'
      div.innerHTML = `<span class="found-icon">&#10003;</span> ${s.name}`
      foundList.appendChild(div)
    })
    foundSection.classList.remove('hidden')
  }
}

// ── Scenario Panel ─────────────────────────────────────
async function ensureScenariosLoaded() {
  if (!scenariosData) {
    scenariosData = await window.api.loadScenarios()
  }
}

async function showScenarioPanel() {
  await ensureScenariosLoaded()
  if (!currentScenario) await pickRandomScenario()
  scenarioPanel.classList.remove('hidden')
  scenarioAiBtn.classList.toggle('hidden', !settings.useLocalModel)
}

function hideScenarioPanel() {
  scenarioPanel.classList.add('hidden')
}

async function pickRandomScenario() {
  await ensureScenariosLoaded()
  const list = scenariosData?.[currentDocType] || []
  if (!list.length) return
  const others = list.filter(s => s.id !== currentScenario?.id)
  const pool = others.length > 0 ? others : list
  currentScenario = pool[Math.floor(Math.random() * pool.length)]
  renderScenario(currentScenario)
}

function renderScenario(scenario) {
  if (!scenario) return
  const badgeKeys = { srs: 'scenario_badge_srs', 'ai-skill': 'scenario_badge_ai_skill', 'system-design': 'scenario_badge_system_design' }
  const starsMap  = { 1: '★☆☆', 2: '★★☆', 3: '★★★' }

  scenarioBadge.textContent = t(badgeKeys[currentDocType] || 'scenario_badge_srs')
  scenarioStars.textContent = starsMap[scenario.difficulty] || '★☆☆'

  const getField = (field) => {
    if (scenario._lang !== undefined) return scenario[field] ?? ''
    const val = scenario[field]
    if (val && typeof val === 'object') return val[currentLocale] ?? val['zh-TW'] ?? ''
    return val ?? ''
  }

  scenarioTitleText.textContent = getField('title')
  scenarioDesc.textContent      = getField('scenario')

  scenarioReqs.innerHTML = ''
  const reqs = getField('requirements')
  ;(Array.isArray(reqs) ? reqs : []).forEach(req => {
    const li = document.createElement('li')
    li.textContent = req
    scenarioReqs.appendChild(li)
  })

  scenarioHintsList.innerHTML = ''
  const hints = getField('hints')
  ;(Array.isArray(hints) ? hints : []).forEach(hint => {
    const li = document.createElement('li')
    li.textContent = hint
    scenarioHintsList.appendChild(li)
  })

  document.querySelector('#scenario-reqs-wrap .sc-section-title').textContent = t('scenario_req_title')
  document.querySelector('#scenario-hints-wrap .sc-section-title').textContent = t('scenario_hints_title')

  scenarioHintsVisible = false
  scenarioHintsWrap.classList.add('hidden')
  document.getElementById('scenario-hint-btn').textContent = t('scenario_btn_hint')
}

function toggleScenarioHints() {
  scenarioHintsVisible = !scenarioHintsVisible
  scenarioHintsWrap.classList.toggle('hidden', !scenarioHintsVisible)
  document.getElementById('scenario-hint-btn').textContent =
    scenarioHintsVisible ? t('scenario_btn_hint_close') : t('scenario_btn_hint')
}

async function generateAIScenario() {
  if (!settings.useLocalModel) return
  const docTypeNames = {
    srs: t('doc_type_label_srs'),
    'ai-skill': t('doc_type_label_ai_skill'),
    'system-design': t('doc_type_label_system_design')
  }
  const typeName = docTypeNames[currentDocType] || currentDocType
  const locale   = window.LOCALES[currentLocale] || window.LOCALES['zh-TW']
  const prompt   = locale.ai_gen_prompt(typeName)

  scenarioGenLoading.classList.remove('hidden')
  scenarioAiBtn.disabled = true

  try {
    const text   = await callLocalModel('', prompt)
    const parsed = parseAIScenario(text)
    if (parsed) {
      currentScenario = parsed
      renderScenario(parsed)
    }
  } finally {
    scenarioGenLoading.classList.add('hidden')
    scenarioAiBtn.disabled = false
  }
}

function parseAIScenario(text) {
  const locale = window.LOCALES[currentLocale] || window.LOCALES['zh-TW']
  const p = locale.ai_parse
  try {
    const titleMatch    = text.match(p.title)
    const diffMatch     = text.match(p.diff)
    const scenarioMatch = text.match(p.scenario)
    const reqsMatch     = text.match(p.reqs)
    const hintsMatch    = text.match(p.hints)
    const parseList     = str => str
      ? str.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l.length > 0)
      : []
    return {
      id: `ai-${Date.now()}`,
      _lang: currentLocale,
      title: titleMatch?.[1]?.trim() || t('scenario_ai_title'),
      difficulty: p.diffMap[diffMatch?.[1]?.trim()] || 2,
      scenario: scenarioMatch?.[1]?.trim() || text.substring(0, 300),
      requirements: parseList(reqsMatch?.[1]),
      hints: parseList(hintsMatch?.[1])
    }
  } catch {
    return null
  }
}

// ── Local Model ────────────────────────────────────────
async function callLocalModel(text, promptTemplate) {
  const prompt = (promptTemplate || t('ai_prompt_default')) + text
  try {
    const res = await fetch(`${settings.modelUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: settings.modelName, prompt, stream: false })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.response || t('ai_no_response')
  } catch (err) {
    return `${t('ai_no_connect')}：${err.message}\n\n${t('ai_check_ollama')}`
  }
}

// ── Settings ───────────────────────────────────────────
function openSettings() {
  applySettingsToUI()
  testResult.textContent = ''
  testResult.className = ''
  settingsOverlay.classList.remove('hidden')
}

function closeSettings() { settingsOverlay.classList.add('hidden') }

async function saveSettings() {
  settings.useLocalModel = useLocalModelChk.checked
  settings.modelUrl  = modelUrlInput.value.trim() || 'http://localhost:11434'
  settings.modelName = modelNameInput.value.trim() || 'llama3'
  settings.language  = currentLocale
  await window.api.saveSettings(settings)
  if (!scenarioPanel.classList.contains('hidden')) {
    scenarioAiBtn.classList.toggle('hidden', !settings.useLocalModel)
  }
  closeSettings()
}

async function testModelConnection() {
  const url  = modelUrlInput.value.trim()
  const name = modelNameInput.value.trim()
  testResult.textContent = t('settings_testing')
  testResult.className = ''
  try {
    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: name, prompt: 'hi', stream: false })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    testResult.textContent = t('settings_test_ok')
    testResult.className = 'ok'
  } catch (err) {
    testResult.textContent = `${t('settings_test_fail')}：${err.message}`
    testResult.className = 'err'
  }
}

// ── Misc ───────────────────────────────────────────────
function flashEditor() {
  editor.style.outline = '2px solid var(--error)'
  setTimeout(() => { editor.style.outline = '' }, 800)
}

// ── Start ──────────────────────────────────────────────
init()
