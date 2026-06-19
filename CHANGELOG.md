# Changelog

本文件依照 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 規範撰寫。

---

## [1.3.0] - 2026-06-19

### Added
- `lib/engine.js`：將核心評估邏輯（`evaluateWithRules`、`parseAIScenario`）抽離為 UMD 模組，同時支援 Electron renderer（`window.Engine`）與 Node.js / Jest（`module.exports`）

### Changed
- `renderer/app.js`：移除重複的函數定義，改呼叫 `Engine.evaluateWithRules` 與 `Engine.parseAIScenario`，消除與測試層的邏輯漂移風險
- `renderer/index.html`：在 `app.js` 之前載入 `../lib/engine.js`

---

## [1.2.0] - 2026-06-19

### Added
- 自動化測試套件，共 **137 個測試**，全數通過（`npm test`）
  - `tests/unit/evaluateWithRules.test.js`：評分引擎單元測試（19 tests）
  - `tests/unit/parseAIScenario.test.js`：AI 情境解析單元測試（19 tests）
  - `tests/integration/rules.test.js`：三份規則 JSON 結構整合測試（47 tests）
  - `tests/integration/scenarios.test.js`：情境題庫整合測試（34 tests）
  - `tests/integration/ipcHandlers.test.js`：IPC handler 檔案 I/O 整合測試（18 tests）
- `jest.config.js`：Jest 測試設定
- `package.json` 新增 scripts：`test`、`test:unit`、`test:integration`
- Jest 加入 `devDependencies`

---

## [1.1.0] - 2026-06-19

### Added
- 情境題庫大幅擴充：三分類各從 23 道增加至 **43 道**（總計 129 道），新增題目皆為符合現實的實戰場景
  - **SRS**（srs-024 ～ srs-043）：HR 人資、醫療掛號、電商物流、金融帳務、跨境合規等
  - **AI Skill**（ai-024 ～ ai-043）：RAG 知識庫、推薦系統、異常偵測、多代理人協作等
  - **System Design**（sd-024 ～ sd-043）：分散式快取、RTB 競價、Saga 交易、直播推流、ML 訓練平台等
- `validate-scenarios.js`：`expectedCount` 更新為 43

### Changed
- 三份 README 題目數量說明從 23 更新至 43（總計 69 → 129）

---

## [1.0.1] - 2026-06-19

### Added
- 情境題庫初步擴充：三分類各從 3 道增加至 **23 道**（總計 69 道）
- `start.bat` / `start.ps1`：Windows 一鍵啟動腳本
- `validate-scenarios.js`：情境 JSON 格式驗證工具（`npm run validate`）
- `package.json` 新增 `validate` script

---

## [1.0.0] - 2026-06-19

### Added
- Electron 桌面應用程式初始版本
- 三種文件類型的規則式評論引擎：SRS 規格書、AI Skill、系統設計文件
- 評分圓環（0–100 分）與缺失項目、品質警告的詳細回饋
- 內建情境練習題庫（每類 3 道，共 9 道），含難度分級與撰寫提示
- Ollama 本地 AI 模型整合（深度評論 + AI 即時出題）
- 多語言 UI 支援：繁體中文 / English / 日本語
- 多種文件輸入方式：直接輸入、上傳 `.txt` / `.md`、拖曳上傳
- `test-samples/`：三份刻意不完整的範例文件供功能體驗
- 三份語言版 README（README.md、README.en.md、README.ja.md）
