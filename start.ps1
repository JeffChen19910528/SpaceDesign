#Requires -Version 5.1
<#
.SYNOPSIS
    系統設計練習工具 一鍵啟動腳本
.DESCRIPTION
    自動檢測 Node.js 環境、安裝相依套件，並啟動應用程式。
#>

$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = '系統設計練習工具 - 啟動程式'

function Write-Header {
    Write-Host ''
    Write-Host '============================================' -ForegroundColor Cyan
    Write-Host '   系統設計練習工具  一鍵啟動' -ForegroundColor Cyan
    Write-Host '============================================' -ForegroundColor Cyan
    Write-Host ''
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "[$Step] $Message" -ForegroundColor Yellow
}

function Write-Ok {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message)
    Write-Host ''
    Write-Host "  [錯誤] $Message" -ForegroundColor Red
    Write-Host ''
}

# ─────────────────────────────────────────────
Write-Header

# ── 1. 確認腳本路徑 ──────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# ── 2. 檢查 Node.js ──────────────────────────
Write-Step '1/3' '檢查 Node.js 環境...'

$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Fail '找不到 Node.js！請至 https://nodejs.org 下載並安裝 v18 以上版本。'
    Read-Host '按 Enter 鍵關閉'
    exit 1
}

$nodeVersionRaw = & node -e 'process.stdout.write(process.versions.node)'
$nodeMajor = [int]($nodeVersionRaw -split '\.')[0]

if ($nodeMajor -lt 18) {
    Write-Fail "Node.js 版本過低（目前 v$nodeVersionRaw），需要 v18 以上。`n  請至 https://nodejs.org 下載最新 LTS 版本。"
    Read-Host '按 Enter 鍵關閉'
    exit 1
}

Write-Ok "Node.js v$nodeVersionRaw 符合要求"

# ── 3. 安裝套件 ──────────────────────────────
Write-Host ''
Write-Step '2/3' '檢查套件相依性...'

$nodeModulesPath = Join-Path $scriptDir 'node_modules'
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host '  找不到 node_modules，正在執行 npm install...' -ForegroundColor Yellow
    Write-Host '  （首次安裝約需 1-3 分鐘，請稍候）' -ForegroundColor DarkGray
    Write-Host ''

    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Fail 'npm install 失敗，請確認網路連線後重試。'
        Read-Host '按 Enter 鍵關閉'
        exit 1
    }
    Write-Ok '套件安裝完成'
} else {
    Write-Ok '套件已安裝，跳過安裝步驟'
}

# ── 4. 啟動應用程式 ───────────────────────────
Write-Host ''
Write-Step '3/3' '正在啟動應用程式...'
Write-Host '  （應用程式視窗開啟後，本視窗可以關閉）' -ForegroundColor DarkGray
Write-Host ''

& npm start

if ($LASTEXITCODE -ne 0) {
    Write-Fail "應用程式啟動失敗（exit code $LASTEXITCODE）。`n  請確認 electron 已正確安裝（node_modules/electron 目錄存在）。"
    Read-Host '按 Enter 鍵關閉'
    exit 1
}
