const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: '系統設計練習工具',
    backgroundColor: '#1a1b26'
  })

  win.loadFile('renderer/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: '文字檔案', extensions: ['txt', 'md'] }]
  })
  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8')
    return { path: result.filePaths[0], content }
  }
  return null
})

ipcMain.handle('load-rules', (_, docType) => {
  const rulesPath = path.join(__dirname, 'rules', `${docType}.json`)
  if (fs.existsSync(rulesPath)) {
    return JSON.parse(fs.readFileSync(rulesPath, 'utf-8'))
  }
  return null
})

ipcMain.handle('save-settings', (_, settings) => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json')
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  return true
})

ipcMain.handle('load-scenarios', () => {
  const scenariosPath = path.join(__dirname, 'scenarios', 'scenarios.json')
  if (fs.existsSync(scenariosPath)) {
    return JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'))
  }
  return null
})

ipcMain.handle('load-settings', () => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json')
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  }
  return { useLocalModel: false, modelUrl: 'http://localhost:11434', modelName: 'llama3' }
})
