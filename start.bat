@echo off
chcp 65001 >nul
title 系統設計練習工具 - 啟動程式

echo ============================================
echo   系統設計練習工具  一鍵啟動
echo ============================================
echo.

REM ── 1. 檢查 Node.js ──────────────────────────
echo [1/3] 檢查 Node.js 環境...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [錯誤] 找不到 Node.js！
    echo  請至 https://nodejs.org 下載並安裝 v18 以上版本。
    echo.
    pause
    exit /b 1
)

REM 取得 Node.js 主版號
for /f "tokens=1 delims=." %%v in ('node -e "process.stdout.write(process.versions.node)"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 18 (
    echo.
    echo  [錯誤] Node.js 版本過低（目前 v%NODE_MAJOR%），需要 v18 以上。
    echo  請至 https://nodejs.org 下載最新 LTS 版本。
    echo.
    pause
    exit /b 1
)
echo  [OK] Node.js 版本符合要求 (v%NODE_MAJOR%.x)

REM ── 2. 安裝依賴 ──────────────────────────────
echo.
echo [2/3] 檢查套件相依性...
if not exist "node_modules" (
    echo  找不到 node_modules，正在執行 npm install...
    echo  （首次安裝約需 1-3 分鐘，請稍候）
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo  [錯誤] npm install 失敗，請確認網路連線後重試。
        echo.
        pause
        exit /b 1
    )
    echo  [OK] 套件安裝完成
) else (
    echo  [OK] 套件已安裝，跳過安裝步驟
)

REM ── 3. 啟動應用程式 ───────────────────────────
echo.
echo [3/3] 正在啟動應用程式...
echo  （視窗開啟後本視窗會繼續顯示，關閉應用程式即可結束）
echo.
npm start

if errorlevel 1 (
    echo.
    echo  [錯誤] 應用程式啟動失敗。
    echo  請確認 electron 已正確安裝（node_modules/electron 目錄存在）。
    echo.
    pause
    exit /b 1
)
