const { contextBridge, ipcRenderer, webUtils } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Config management
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  
  // Mod management
  getMods: () => ipcRenderer.invoke('get-mods'),
  importMod: (filePath) => ipcRenderer.invoke('import-mod', filePath),
  deleteMod: (modId) => ipcRenderer.invoke('delete-mod', modId),
  updateModMetadata: (modId, updates) => ipcRenderer.invoke('update-mod-metadata', modId, updates),
  getModsWithMetadata: () => ipcRenderer.invoke('get-mods-with-metadata'),
  getModCategoriesAndTags: () => ipcRenderer.invoke('get-mod-categories-and-tags'),
  
  // Game management
  selectGameDirectory: () => ipcRenderer.invoke('select-game-directory'),
  selectModFiles: () => ipcRenderer.invoke('select-mod-files'),
  launchGame: (gameInstallPath, enabledMods) => ipcRenderer.invoke('launch-game', gameInstallPath, enabledMods),
  getGameStatus: () => ipcRenderer.invoke('get-game-status'),
  
  // File operations with security validation
  importModFile: (filePath) => ipcRenderer.invoke('import-mod-secure', filePath),
  
  // Modern Electron file path resolution
  getPathForFile: (file) => {
    try {
      return webUtils.getPathForFile(file);
    } catch (error) {
      console.error('Error getting file path:', error);
      return null;
    }
  },
  
  // Import mod from file buffer (for drag & drop)
  importModFromBuffer: (fileName, arrayBuffer) => ipcRenderer.invoke('import-mod-from-buffer', fileName, arrayBuffer),
  
  // File operations
  openPath: (path) => ipcRenderer.invoke('open-path', path),
  
  // System info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Dependency management
  checkDependency: (dependency, gameInstallPath) => ipcRenderer.invoke('check-dependency', dependency, gameInstallPath),
  scanRedscriptErrors: () => ipcRenderer.invoke('scan-redscript-errors'),
  
  // Launch preview
  generateLaunchPreview: (enabledMods) => ipcRenderer.invoke('generate-launch-preview', enabledMods),
  openMergedRuntimeFolder: () => ipcRenderer.invoke('open-merged-runtime-folder'),
  
  // Folder operations
  openModFolder: (modId) => ipcRenderer.invoke('open-mod-folder', modId),
  openGameFolder: (gameInstallPath) => ipcRenderer.invoke('open-game-folder', gameInstallPath),
  
  // Virtual environment management
  cleanVirtualEnvironment: () => ipcRenderer.invoke('clean-virtual-environment'),
  openVirtualGameFolder: () => ipcRenderer.invoke('open-virtual-game-folder'),
  
  // Events
  onConfigChanged: (callback) => ipcRenderer.on('config-changed', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});