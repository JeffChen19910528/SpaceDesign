'use strict'

// ── State ──────────────────────────────────────────────
let currentDocType = 'srs'
let settings = {
  useLocalModel: false,
  modelUrl: 'http://localhost:11434',
  modelName: 'llama3'
}
let scenariosData = null
let currentScenario = null
let scenarioHintsVisible = false

// ── DOM refs ───────────────────────────────────────────
const editor        = document.getElementById('editor')
const charCount     = document.getElementById('char-count')
const evaluateBtn   = document.getElementById('evaluate-btn')
const docTypeLabel  = document.getElementById('doc-type-label')

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

const docTabNames = { srs: 'SRS 規格書', 'ai-skill': 'AI Skill', 'system-design': '系統設計文件' }

// ── Init ───────────────────────────────────────────────
async function init() {
  const saved = await window.api.loadSettings()
  if (saved) Object.assign(settings, saved)
  applySettingsToUI()
  setupEvents()
  updateCharCount()
}

function applySettingsToUI() {
  useLocalModelChk.checked = settings.useLocalModel
  modelUrlInput.value  = settings.modelUrl
  modelNameInput.value = settings.modelName
  modelSettingsDiv.classList.toggle('hidden', !settings.useLocalModel)
}

// ── Events ─────────────────────────────────────────────
function setupEvents() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchDocType(btn.dataset.type))
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
  docTypeLabel.textContent = docTabNames[type]
  resetResults()
  if (!scenarioPanel.classList.contains('hidden')) {
    currentScenario = null
    await pickRandomScenario()
    scenarioAiBtn.classList.toggle('hidden', !settings.useLocalModel)
  }
}

// ── Editor helpers ─────────────────────────────────────
function updateCharCount() {
  charCount.textContent = `${editor.value.length} 字`
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
  // Score circle
  const circumference = 2 * Math.PI * 40  // r=40 → 251.2
  const offset = circumference * (1 - percentage / 100)
  scoreArc.style.strokeDashoffset = offset
  scoreArc.style.stroke = percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--error)'
  scoreValue.textContent = percentage
  scoreBarFill.style.width = percentage + '%'
  scoreBarFill.style.background = percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--error)'
  scoreBarLabel.textContent = percentage >= 70 ? '良好' : percentage >= 40 ? '待改善' : '需加強'
  foundCount.textContent   = found.length
  missingCount.textContent = missing.length
  warningCount.textContent = warnings.length
  scoreSection.classList.remove('hidden')

  // Missing
  if (missing.length > 0) {
    missingList.innerHTML = ''
    missing.forEach(s => {
      const div = document.createElement('div')
      div.className = 'result-item'
      div.innerHTML = `
        <div class="item-header">
          <span class="item-name">${s.name}</span>
          ${s.required ? '<span class="required-badge">必要</span>' : ''}
        </div>
        <div class="item-desc">${s.description}</div>
        <div class="item-hint">&#128161; ${s.hint}</div>
      `
      missingList.appendChild(div)
    })
    missingSection.classList.remove('hidden')
  }

  // Warnings
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

  // Found
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
  const docLabels = { srs: 'SRS 規格書', 'ai-skill': 'AI Skill', 'system-design': '系統設計' }
  const starsMap  = { 1: '★☆☆', 2: '★★☆', 3: '★★★' }

  scenarioBadge.textContent     = docLabels[currentDocType] || currentDocType
  scenarioStars.textContent     = starsMap[scenario.difficulty] || '★☆☆'
  scenarioTitleText.textContent = scenario.title
  scenarioDesc.textContent      = scenario.scenario

  scenarioReqs.innerHTML = ''
  scenario.requirements.forEach(req => {
    const li = document.createElement('li')
    li.textContent = req
    scenarioReqs.appendChild(li)
  })

  scenarioHintsList.innerHTML = ''
  scenario.hints.forEach(hint => {
    const li = document.createElement('li')
    li.textContent = hint
    scenarioHintsList.appendChild(li)
  })

  scenarioHintsVisible = false
  scenarioHintsWrap.classList.add('hidden')
  document.getElementById('scenario-hint-btn').textContent = '💡 提示'
}

function toggleScenarioHints() {
  scenarioHintsVisible = !scenarioHintsVisible
  scenarioHintsWrap.classList.toggle('hidden', !scenarioHintsVisible)
  document.getElementById('scenario-hint-btn').textContent =
    scenarioHintsVisible ? '💡 收起提示' : '💡 提示'
}

async function generateAIScenario() {
  if (!settings.useLocalModel) return
  const docLabels = { srs: 'SRS 規格書', 'ai-skill': 'AI Skill 技術文件', 'system-design': '系統設計文件' }
  const typeName  = docLabels[currentDocType] || currentDocType

  const prompt = `你是一位資深軟體工程師和技術面試官。請用繁體中文為「${typeName}」生成一道全新的情境練習題目。

請完全按照以下格式回答（不要有其他多餘內容）：
標題：[簡短的系統名稱，2-6個字]
難度：[初級/中級/高級]
情境：
[2-3段描述，包含業務背景、規模數據、技術挑戰]
需求：
- [具體需求1]
- [具體需求2]
- [具體需求3]
- [具體需求4]
- [具體需求5]
提示：
- [撰寫文件的具體提示1]
- [撰寫文件的具體提示2]
- [撰寫文件的具體提示3]`

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
  try {
    const titleMatch    = text.match(/標題[：:]\s*(.+)/)
    const diffMatch     = text.match(/難度[：:]\s*(.+)/)
    const scenarioMatch = text.match(/情境[：:]\s*\n([\s\S]+?)(?=\n需求[：:]|\n提示[：:]|$)/)
    const reqsMatch     = text.match(/需求[：:]\s*\n([\s\S]+?)(?=\n提示[：:]|$)/)
    const hintsMatch    = text.match(/提示[：:]\s*\n([\s\S]+?)$/)
    const diffMap       = { '初級': 1, '中級': 2, '高級': 3 }
    const parseList     = str => str
      ? str.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l.length > 0)
      : []
    return {
      id: `ai-${Date.now()}`,
      title: titleMatch?.[1]?.trim() || 'AI 生成題目',
      difficulty: diffMap[diffMatch?.[1]?.trim()] || 2,
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
  const prompt = (promptTemplate || '請評論以下文件，用繁體中文回答：\n') + text
  try {
    const res = await fetch(`${settings.modelUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: settings.modelName, prompt, stream: false })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.response || '（模型未回傳內容）'
  } catch (err) {
    return `無法連接本地模型：${err.message}\n\n請確認 Ollama 已啟動，且模型名稱正確。`
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
  settings.modelUrl = modelUrlInput.value.trim() || 'http://localhost:11434'
  settings.modelName = modelNameInput.value.trim() || 'llama3'
  await window.api.saveSettings(settings)
  if (!scenarioPanel.classList.contains('hidden')) {
    scenarioAiBtn.classList.toggle('hidden', !settings.useLocalModel)
  }
  closeSettings()
}

async function testModelConnection() {
  const url  = modelUrlInput.value.trim()
  const name = modelNameInput.value.trim()
  testResult.textContent = '測試中...'
  testResult.className = ''
  try {
    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: name, prompt: 'hi', stream: false })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    testResult.textContent = '連線成功 ✓'
    testResult.className = 'ok'
  } catch (err) {
    testResult.textContent = `連線失敗：${err.message}`
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
