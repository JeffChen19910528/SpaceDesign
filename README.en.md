**Language:** [繁體中文](README.md) | **English** | [日本語](README.ja.md)

---

# System Design Practice Tool

An Electron desktop app for practicing technical document writing — SRS specifications, AI Skill docs, and system design documents — with real-time evaluation and improvement suggestions. Includes a built-in scenario library and supports English, Traditional Chinese, and Japanese.

---

## Features

- **Three document types**: SRS Specification, AI Skill, System Design — each with its own evaluation ruleset
- **Scenario practice library**: 23 scenarios per document type, covering Beginner / Intermediate / Advanced difficulty
- **AI scenario generation**: Enable Ollama to generate brand-new scenario questions on demand
- **Rule-based evaluation**: Automatically checks for required sections and flags quality issues (vague language, missing metrics, etc.)
- **Score ring**: Visualizes completeness (0–100) with a breakdown of found / missing / warnings
- **Local AI model**: Optional Ollama integration for in-depth textual review
- **Multiple input methods**: Type directly, upload `.txt`/`.md`, or drag & drop
- **Multi-language UI**: Switch between Traditional Chinese, English, and Japanese in the header

---

## System Requirements

| Item | Requirement |
|------|-------------|
| OS | Windows 10/11, macOS 12+, Linux |
| Node.js | v18 or higher |
| Disk space | ~300 MB (includes Electron) |
| Local model (optional) | Ollama ([ollama.com](https://ollama.com)) |

---

## Installation & Launch

```bash
# 1. Enter the project directory
cd SpaceDesign

# 2. Install dependencies (first run only)
npm install

# 3. Launch the app
npm start
```

---

## Interface Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│  System Design Practice  [SRS Spec] [AI Skill] [System Design]  [EN▼] [Scenarios] [Settings] │
├────────────────────────────────────────────────────────────────────────────┤
│  [Sys Design]  ★★☆  Real-time Chat System    [💡 Tips] [↺ Next] [✨ AI Gen] [✕] │
│  Scenario: Design a real-time messaging system supporting 100M DAU...      │
│  Requirements: ▌At-least-once delivery  ▌Message status  ▌Media files ... │
├────────────────────────┬───────────────────────────────────────────────────┤
│  System Design Doc     │  Evaluation Results                               │
│  Upload  Clear         │                                                   │
│                        │  ┌──────────────────────────┐                    │
│  Type your document    │  │  Score ring  ✓ Done ✗ Missing │               │
│  content here...       │  └──────────────────────────┘                    │
│                        │                                                   │
│                        │  ✗ Missing Items (with hints)                    │
│                        │  ⚠ Warnings                                      │
│                        │  ✓ Completed Items                               │
│                        │  🤖 AI Detailed Review (optional)                │
│                        │                                                   │
│  0 chars   [Evaluate]  │                                                   │
└────────────────────────┴───────────────────────────────────────────────────┘
```

---

## How to Use

### Step 1: Select a Document Type

Click the tabs at the top to switch between:
- **SRS Spec**: Software Requirements Specification
- **AI Skill**: Technical document for an AI agent skill
- **System Design**: High-level architecture design document

### Step 2 (Recommended): Get a Scenario

Click the **📋 Scenarios** button in the header. The panel expands above the editor:

| Action | Description |
|--------|-------------|
| **💡 Tips** | Show/hide writing tips — peek only when stuck |
| **↺ Next** | Get a random scenario of the same document type |
| **✨ AI Generate** | Call local Ollama to generate a brand-new scenario (requires local model) |
| **✕** | Collapse the scenario panel |

Switching tabs automatically loads a scenario for the new document type.

> **Difficulty**: ★☆☆ Beginner / ★★☆ Intermediate / ★★★ Advanced

### Step 3: Write Your Document

Three input methods:
1. **Type directly** in the left editor
2. **Upload file**: click "Upload" to select a `.txt` or `.md` file
3. **Drag & drop** a file onto the editor area

### Step 4: Click "Evaluate"

The right panel shows:

| Item | Description |
|------|-------------|
| **Score (0–100)** | Based on completed sections: 70+ Good, 40–69 Needs Work, <40 Insufficient |
| **Missing Items** | Sections not yet covered; red badge = Required |
| **Warnings** | Vague language, missing numeric metrics, no requirement IDs, etc. |
| **Completed Items** | List of detected sections |

### Step 5 (Optional): Enable AI Review

1. Click **⚙ Settings** in the header
2. Check **"Enable local model (Ollama) for AI review"**
3. Enter your Ollama API URL (default `http://localhost:11434`) and model name (e.g., `llama3`)
4. Click **"Test Connection"** to verify
5. After saving, the next evaluation will include an **"AI Detailed Review"** section. The Scenarios panel will also show the **"✨ AI Generate"** button.

---

## Scenario Library

Each document type includes **23 built-in scenarios** (3 original + 20 new real-world scenarios) across three difficulty levels:

### SRS Specification (23 scenarios)

| Difficulty | Example Scenarios |
|------------|------------------|
| ★☆☆ | Online Bookstore, E-commerce Product Reviews, HR Employee Onboarding… |
| ★★☆ | Food Delivery Order Module, Multi-Platform Inventory Management, Live Class Platform… |
| ★★★ | Employee Leave & Attendance System, Financial Reconciliation, Cross-Border E-Commerce Compliance… |

### AI Skill (23 scenarios)

| Difficulty | Example Scenarios |
|------------|------------------|
| ★☆☆ | Customer Service Chatbot, Image Content Auto-Tagging, Enterprise Email Routing… |
| ★★☆ | Smart Contract Review, Brand Sentiment Monitoring, SEO Content Advisor… |
| ★★★ | Multi-Agent Data Analysis, E-Commerce Search Re-ranking, Real-Time Fraud Detection… |

### System Design (23 scenarios)

| Difficulty | Example Scenarios |
|------------|------------------|
| ★☆☆ | URL Shortening Service, Shopping Cart System, Game Leaderboard… |
| ★★☆ | Real-time Chat System, Push Notification System, Digital Payment Transfer… |
| ★★★ | Global Video Streaming, Online Collaborative Editing, Flash Sale System… |

---

## Evaluation Criteria

### SRS Specification (13 sections)

| Section | Required | Weight |
|---------|----------|--------|
| Purpose | ✓ | 8 |
| Scope | ✓ | 8 |
| System Overview | ✓ | 8 |
| Functional Requirements | ✓ | 15 |
| Non-functional Requirements | ✓ | 12 |
| Performance Requirements | ✓ | 10 |
| Security Requirements | ✓ | 10 |
| Definitions & Abbreviations | - | 5 |
| User Descriptions | - | 5 |
| System Constraints | - | 5 |
| External Interface Requirements | - | 7 |
| Use Cases | - | 8 |
| Acceptance Criteria | - | 7 |

Quality warnings: vague language, missing requirement IDs (FR-001), missing quantitative metrics (ms/QPS), missing priority labels.

### AI Skill Document (11 sections)

Required: Skill name, functional description, trigger conditions, input parameters, output format, usage examples, error handling, limitations.

Quality warnings: missing parameter types, missing required/optional markers, missing edge case descriptions.

### System Design Document (14 sections)

Required: System overview, requirements analysis, architecture, component description, data flow, database design, scalability, security design, technology stack.

Quality warnings: missing scale estimates (QPS/DAU), missing design tradeoffs, missing bottleneck analysis.

---

## Local Model Setup (Ollama)

```bash
# After installing Ollama from the official website:
ollama pull llama3        # Download Llama 3 model (~4 GB)
ollama pull mistral       # Or use Mistral

# Start Ollama service (usually auto-starts on boot)
ollama serve
```

In the Settings panel:
- API URL: `http://localhost:11434`
- Model Name: `llama3` (or whichever model you downloaded)

---

## Project Structure

```
SpaceDesign/
├── main.js              # Electron main process
├── preload.js           # Secure bridge layer (contextBridge)
├── package.json
├── rules/
│   ├── srs.json         # SRS evaluation rules
│   ├── ai-skill.json    # AI Skill evaluation rules
│   └── system-design.json  # System Design evaluation rules
├── scenarios/
│   └── scenarios.json   # Scenario library (69 built-in, trilingual)
└── renderer/
    ├── index.html       # Main UI
    ├── style.css        # Dark theme styles
    ├── locales.js       # UI strings (zh-TW / en / ja)
    └── app.js           # Frontend logic, evaluation engine, i18n
```

---

## Test Sample Files

The `test-samples/` directory contains three intentionally incomplete documents for testing the evaluation feature:

| File | Description |
|------|-------------|
| `test-srs.md` | SRS sample with missing sections and quality issues |
| `test-ai-skill.md` | AI Skill sample missing error handling and edge cases |
| `test-system-design.md` | System design sample missing scale estimates and tradeoffs |
