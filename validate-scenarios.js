const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'scenarios', 'scenarios.json')

function fail(msg) {
  console.error(`  [FAIL] ${msg}`)
  return false
}

function pass(msg) {
  console.log(`  [PASS] ${msg}`)
  return true
}

let totalErrors = 0

function validateScenario(scenario, category) {
  let errors = 0
  const id = scenario.id || '(no id)'

  // Check required top-level fields
  const required = ['id', 'difficulty', 'title', 'scenario', 'requirements', 'hints']
  for (const field of required) {
    if (!(field in scenario)) {
      fail(`${category}/${id}: missing field "${field}"`)
      errors++
    }
  }

  // Check difficulty
  if (![1, 2, 3].includes(scenario.difficulty)) {
    fail(`${category}/${id}: difficulty must be 1, 2, or 3, got ${scenario.difficulty}`)
    errors++
  }

  // Check trilingual fields
  const langs = ['zh-TW', 'en', 'ja']
  for (const textField of ['title', 'scenario']) {
    if (scenario[textField]) {
      for (const lang of langs) {
        if (!scenario[textField][lang] || typeof scenario[textField][lang] !== 'string' || scenario[textField][lang].trim() === '') {
          fail(`${category}/${id}: "${textField}.${lang}" is empty or missing`)
          errors++
        }
      }
    }
  }

  // Check requirements and hints (arrays of 3 langs)
  for (const arrayField of ['requirements', 'hints']) {
    if (scenario[arrayField]) {
      for (const lang of langs) {
        const arr = scenario[arrayField][lang]
        if (!Array.isArray(arr)) {
          fail(`${category}/${id}: "${arrayField}.${lang}" is not an array`)
          errors++
          continue
        }
        const minLen = arrayField === 'requirements' ? 5 : 3
        if (arr.length < minLen) {
          fail(`${category}/${id}: "${arrayField}.${lang}" has ${arr.length} items, expected at least ${minLen}`)
          errors++
        }
        for (let i = 0; i < arr.length; i++) {
          if (typeof arr[i] !== 'string' || arr[i].trim() === '') {
            fail(`${category}/${id}: "${arrayField}.${lang}[${i}]" is empty or not a string`)
            errors++
          }
        }
      }
    }
  }

  return errors
}

try {
  console.log('=== scenarios.json 驗證開始 ===\n')

  if (!fs.existsSync(filePath)) {
    console.error('找不到 scenarios.json')
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)
  console.log('JSON 解析成功\n')

  const categories = ['srs', 'ai-skill', 'system-design']
  const expectedCount = 43
  const idSets = {}

  for (const category of categories) {
    console.log(`--- 類別：${category} ---`)
    if (!Array.isArray(data[category])) {
      fail(`類別 "${category}" 不存在或不是陣列`)
      totalErrors++
      continue
    }

    const scenarios = data[category]
    console.log(`  題目數量：${scenarios.length}（預期 ${expectedCount}）`)
    if (scenarios.length !== expectedCount) {
      fail(`題目數量不符，實際 ${scenarios.length}，預期 ${expectedCount}`)
      totalErrors++
    } else {
      pass(`題目數量正確 (${expectedCount})`)
    }

    // Check IDs are unique across all categories
    idSets[category] = new Set()
    for (const scenario of scenarios) {
      if (scenario.id) {
        if (idSets[category].has(scenario.id)) {
          fail(`重複的 ID: ${scenario.id}`)
          totalErrors++
        }
        idSets[category].add(scenario.id)
      }
    }
    pass(`無重複 ID`)

    // Validate each scenario
    let catErrors = 0
    for (const scenario of scenarios) {
      catErrors += validateScenario(scenario, category)
    }
    totalErrors += catErrors
    if (catErrors === 0) {
      pass(`所有 ${scenarios.length} 題結構驗證通過`)
    }
    console.log()
  }

  // Check no duplicate IDs across categories
  const allIds = []
  for (const category of categories) {
    if (idSets[category]) allIds.push(...idSets[category])
  }
  const uniqueIds = new Set(allIds)
  if (uniqueIds.size !== allIds.length) {
    fail('跨類別存在重複 ID')
    totalErrors++
  } else {
    console.log(`--- 全域 ID 唯一性檢查 ---`)
    pass(`全部 ${allIds.length} 個 ID 均唯一`)
  }

  console.log('\n=== 驗證結果 ===')
  if (totalErrors === 0) {
    console.log('所有驗證均通過！scenarios.json 格式正確。')
  } else {
    console.error(`共發現 ${totalErrors} 個錯誤，請修正後重新驗證。`)
    process.exit(1)
  }

} catch (err) {
  if (err instanceof SyntaxError) {
    console.error('JSON 解析失敗：' + err.message)
  } else {
    console.error('驗證過程發生錯誤：' + err.message)
  }
  process.exit(1)
}
