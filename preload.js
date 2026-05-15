const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('open-file'),
  loadRules: (docType) => ipcRenderer.invoke('load-rules', docType),
  loadScenarios: () => ipcRenderer.invoke('load-scenarios'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings')
})
