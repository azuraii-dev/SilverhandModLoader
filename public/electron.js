const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true' || !app.isPackaged;
const fs = require('fs-extra');
const yauzl = require('yauzl');
const { spawn } = require('child_process');

// Helper function to get the correct base path for data storage  
const getAppDataPath = () => {
  if (isDev) {
    // In development, use the project directory
    return process.cwd();
  } else {
    // In packaged app, use the directory containing the executable (ORIGINAL BEHAVIOR)
    return path.dirname(process.execPath);
  }
};

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Add icon later
    show: false,
    titleBarStyle: 'default'
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// Load configuration
ipcMain.handle('load-config', async () => {
  try {
    const configPath = path.join(getAppDataPath(), 'config', 'load_order.json');
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
    return {
      gameInstallPath: '',
      enabledMods: [],
      modLoadOrder: [],
      profiles: {
        default: {
          name: 'Default Profile',
          enabledMods: [],
          loadOrder: []
        }
      },
      currentProfile: 'default'
    };
  } catch (error) {
    console.error('Error loading config:', error);
    throw error;
  }
});

// Save configuration
ipcMain.handle('save-config', async (event, config) => {
  try {
    const configPath = path.join(getAppDataPath(), 'config', 'load_order.json');
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, config, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
});

// Get installed mods
ipcMain.handle('get-mods', async () => {
  try {
    const baseDataPath = getAppDataPath();
    const modsPath = path.join(baseDataPath, 'mods');
    
    console.log('[MODS DEBUG] Getting mods from:', modsPath);
    console.log('[MODS DEBUG] Base data path:', baseDataPath);
    
    await fs.ensureDir(modsPath);
    
    const modDirs = await fs.readdir(modsPath);
    console.log('[MODS DEBUG] Found items in mods folder:', modDirs);
    const mods = [];
    
    for (const modDir of modDirs) {
      const modPath = path.join(modsPath, modDir);
      const stat = await fs.stat(modPath);
      
      if (stat.isDirectory()) {
        const mod = {
          id: modDir,
          name: modDir,
          path: modPath,
          enabled: false,
          metadata: {}
        };
        
        // Try to read mod metadata
        try {
          const iniPath = path.join(modPath, 'mod.ini');
          if (await fs.pathExists(iniPath)) {
            const iniContent = await fs.readFile(iniPath, 'utf8');
            mod.metadata = parseIni(iniContent);
            if (mod.metadata.name) mod.name = mod.metadata.name;
          }
          
          const readmePath = path.join(modPath, 'README.md');
          if (await fs.pathExists(readmePath)) {
            mod.readme = await fs.readFile(readmePath, 'utf8');
          }
        } catch (metaError) {
          console.warn(`Error reading metadata for mod ${modDir}:`, metaError);
        }
        
        mods.push(mod);
      }
    }
    
    return mods;
  } catch (error) {
    console.error('Error getting mods:', error);
    throw error;
  }
});

// Select game install directory
ipcMain.handle('select-game-directory', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Cyberpunk 2077 Installation Directory'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  } catch (error) {
    console.error('Error selecting directory:', error);
    throw error;
  }
});

// Select mod files to import
ipcMain.handle('select-mod-files', async () => {
  try {
    console.log('[ELECTRON DEBUG] File picker dialog opening...');
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      title: 'Select Mod Files to Import',
      filters: [
        { name: 'Zip Files', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    console.log('[ELECTRON DEBUG] Dialog result:', {
      canceled: result.canceled,
      filePaths: result.filePaths,
      filePathsLength: result.filePaths?.length || 0
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      console.log('[ELECTRON DEBUG] Returning file paths:', result.filePaths);
      // Immediately process the files and return results instead of just paths
      const results = [];
      for (const filePath of result.filePaths) {
        try {
          const fileName = path.basename(filePath, '.zip');
          const fileExists = await fs.pathExists(filePath);
          console.log('[ELECTRON DEBUG] Processing file:', filePath, 'exists:', fileExists);
          
          if (fileExists) {
            results.push({
              path: filePath,
              name: fileName,
              size: (await fs.stat(filePath)).size
            });
          }
        } catch (err) {
          console.error('[ELECTRON DEBUG] Error processing file:', filePath, err);
        }
      }
      return results;
    }
    console.log('[ELECTRON DEBUG] No files selected, returning empty array');
    return [];
  } catch (error) {
    console.error('[ELECTRON DEBUG] Error selecting mod files:', error);
    throw error;
  }
});

// Import mod from file buffer (for drag & drop security restrictions)
ipcMain.handle('import-mod-from-buffer', async (event, fileName, arrayBuffer) => {
  try {
    console.log('[ELECTRON DEBUG] Buffer import called for:', fileName, 'Size:', arrayBuffer.byteLength);
    
    if (!fileName || !arrayBuffer) {
      throw new Error('Invalid file data provided');
    }
    
    // Create temporary file from buffer
    const tempDir = path.join(getAppDataPath(), 'temp');
    await fs.ensureDir(tempDir);
    
    const tempFilePath = path.join(tempDir, fileName);
    console.log('[ELECTRON DEBUG] Writing temp file to:', tempFilePath);
    
    // Write buffer to temporary file
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));
    
    // Process the temporary file
    const modsPath = path.join(getAppDataPath(), 'mods');
    await fs.ensureDir(modsPath);
    
    const modName = path.basename(fileName, '.zip');
    const extractPath = path.join(modsPath, modName);
    
    // Check if mod already exists
    if (await fs.pathExists(extractPath)) {
      await fs.remove(tempFilePath); // Clean up temp file
      throw new Error(`Mod "${modName}" already exists`);
    }
    
    await fs.ensureDir(extractPath);
    
    // Extract zip file
    await extractZip(tempFilePath, extractPath);
    
    // Clean up temporary file
    await fs.remove(tempFilePath);
    
    // Validate mod structure
    const isValid = await validateModStructure(extractPath);
    if (!isValid) {
      await fs.remove(extractPath);
      throw new Error('Invalid mod structure. Mod must contain archive/, r6/, redscript/, or engine/ folders.');
    }
    
    console.log('[ELECTRON DEBUG] Mod imported successfully from buffer:', modName);
    return {
      id: modName,
      name: modName,
      path: extractPath
    };
  } catch (error) {
    console.error('[ELECTRON DEBUG] Error in buffer import:', error);
    throw error;
  }
});

// Secure mod import that processes files directly 
ipcMain.handle('import-mod-secure', async (event, fileInfo) => {
  try {
    console.log('[ELECTRON DEBUG] Secure import called with:', fileInfo);
    
    if (!fileInfo || !fileInfo.path) {
      throw new Error('Invalid file information provided');
    }
    
    const filePath = fileInfo.path;
    console.log('[ELECTRON DEBUG] Processing secure import for:', filePath);
    
    // Validate file exists
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const modsPath = path.join(getAppDataPath(), 'mods');
    await fs.ensureDir(modsPath);
    
    const fileName = path.basename(filePath, '.zip');
    const extractPath = path.join(modsPath, fileName);
    
    // Check if mod already exists
    if (await fs.pathExists(extractPath)) {
      throw new Error(`Mod "${fileName}" already exists`);
    }
    
    await fs.ensureDir(extractPath);
    
    // Extract zip file
    await extractZip(filePath, extractPath);
    
    // Validate mod structure
    const isValid = await validateModStructure(extractPath);
    if (!isValid) {
      await fs.remove(extractPath);
      throw new Error('Invalid mod structure. Mod must contain archive/, r6/, redscript/, or engine/ folders.');
    }
    
    console.log('[ELECTRON DEBUG] Mod imported successfully:', fileName);
    return {
      id: fileName,
      name: fileName,
      path: extractPath
    };
  } catch (error) {
    console.error('[ELECTRON DEBUG] Error in secure import:', error);
    throw error;
  }
});

// Import mod from zip file
ipcMain.handle('import-mod', async (event, filePath) => {
  try {
    console.log('[ELECTRON DEBUG] import-mod called with filePath:', filePath);
    console.log('[ELECTRON DEBUG] Current working directory:', process.cwd());
    console.log('[ELECTRON DEBUG] getAppDataPath():', getAppDataPath());
    console.log('[ELECTRON DEBUG] isDev:', isDev);
    console.log('[ELECTRON DEBUG] app.isPackaged:', app.isPackaged);
    
    // Check if file actually exists at the given path
    const fileExists = await fs.pathExists(filePath);
    console.log('[ELECTRON DEBUG] File exists at given path:', fileExists);
    
    if (!fileExists) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    
    const modsPath = path.join(getAppDataPath(), 'mods');
    console.log('[ELECTRON DEBUG] Mods directory will be:', modsPath);
    await fs.ensureDir(modsPath);
    
    const fileName = path.basename(filePath, '.zip');
    const extractPath = path.join(modsPath, fileName);
    console.log('[ELECTRON DEBUG] Extract path:', extractPath);
    
    // Check if mod already exists
    if (await fs.pathExists(extractPath)) {
      throw new Error(`Mod "${fileName}" already exists`);
    }
    
    await fs.ensureDir(extractPath);
    
    // Extract zip file
    await extractZip(filePath, extractPath);
    
    // Validate mod structure
    const isValid = await validateModStructure(extractPath);
    if (!isValid) {
      await fs.remove(extractPath);
      throw new Error('Invalid mod structure. Mod must contain archive/, r6/, redscript/, or engine/ folders.');
    }
    
    return {
      id: fileName,
      name: fileName,
      path: extractPath
    };
  } catch (error) {
    console.error('Error importing mod:', error);
    throw error;
  }
});

// Track game process state
let gameProcessInfo = {
  isRunning: false,
  launchedAt: null,
  processId: null
};

// Launch game with mods
ipcMain.handle('launch-game', async (event, gameInstallPath, enabledMods) => {
  try {
    console.log(`[LAUNCH] Starting non-destructive mod launch with ${enabledMods.length} enabled mods`);
    
    // Build virtual game environment
    const virtualStats = await buildMergedRuntime(enabledMods, gameInstallPath);
    console.log(`[LAUNCH] Virtual environment ready: ${virtualStats.modFilesOverlaid} mod files overlaid`);
    
    // Launch game from virtual directory
    const virtualGameExe = path.join(virtualStats.virtualGamePath, 'bin', 'x64', 'Cyberpunk2077.exe');
    
    if (!(await fs.pathExists(virtualGameExe))) {
      throw new Error('Cyberpunk2077.exe not found in virtual environment');
    }
    
    console.log(`[LAUNCH] Launching game from virtual environment`);
    console.log(`[LAUNCH] Virtual path: ${virtualGameExe}`);
    console.log(`[LAUNCH] Original game files remain completely untouched!`);
    
    const gameProcess = spawn(virtualGameExe, [], {
      cwd: virtualStats.virtualGamePath,  // Launch from virtual directory!
      detached: true,
      stdio: 'ignore'
    });
    
    // Track game process
    gameProcessInfo = {
      isRunning: true,
      launchedAt: new Date(),
      processId: gameProcess.pid
    };
    
    // Monitor when game process exits
    gameProcess.on('exit', (code) => {
      console.log(`[LAUNCH] Game process exited with code: ${code}`);
      gameProcessInfo.isRunning = false;
      gameProcessInfo.processId = null;
    });
    
    gameProcess.unref();
    
    return {
      success: true,
      virtualStats,
      virtualGamePath: virtualStats.virtualGamePath,
      originalGamePath: gameInstallPath,
      modFilesOverlaid: virtualStats.modFilesOverlaid,
      symlinksCreated: virtualStats.symlinksCreated,
      gameProcessInfo: { ...gameProcessInfo }
    };
  } catch (error) {
    console.error('Error launching game:', error);
    gameProcessInfo.isRunning = false;
    gameProcessInfo.processId = null;
    throw error;
  }
});

// Delete mod
ipcMain.handle('delete-mod', async (event, modId) => {
  try {
    const modPath = path.join(getAppDataPath(), 'mods', modId);
    await fs.remove(modPath);
    return true;
  } catch (error) {
    console.error('Error deleting mod:', error);
    throw error;
  }
});

// Get application info
ipcMain.handle('get-app-info', async () => {
  return {
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromiumVersion: process.versions.chrome
  };
});

// Check if dependency is installed
ipcMain.handle('check-dependency', async (event, dependency, gameInstallPath) => {
  try {
    if (!gameInstallPath || !dependency.folderStructure) {
      return { installed: false, error: 'Invalid parameters' };
    }

    const results = [];
    for (const filePath of dependency.folderStructure) {
      const fullPath = path.join(gameInstallPath, filePath);
      const exists = await fs.pathExists(fullPath);
      results.push({ path: filePath, exists });
    }

    const allInstalled = results.every(r => r.exists);
    return {
      installed: allInstalled,
      files: results,
      installPath: gameInstallPath
    };
  } catch (error) {
    console.error('Error checking dependency:', error);
    return { installed: false, error: error.message };
  }
});

// Scan for REDScript errors (placeholder for future implementation)
ipcMain.handle('scan-redscript-errors', async () => {
  try {
    // TODO: Implement actual REDScript log parsing
    // This would read from the game's log files to detect compilation errors
    
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error scanning REDScript errors:', error);
    return [];
  }
});

// Generate launch preview - show what files will be merged
ipcMain.handle('generate-launch-preview', async (event, enabledMods) => {
  try {
    console.log('[IPC] generate-launch-preview called with mods:', enabledMods);
    const mergedPath = path.join(getAppDataPath(), 'merged_runtime');
    const modsPath = path.join(getAppDataPath(), 'mods');
    
    console.log('[IPC] Merged path:', mergedPath);
    console.log('[IPC] Mods path:', modsPath);
    
    const preview = {
      mergedPath,
      files: [],
      totalFiles: 0,
      conflicts: 0,
      totalSizeMB: 0
    };

    const fileMap = new Map(); // Track file conflicts
    
    // Scan each enabled mod
    for (const modId of enabledMods) {
      const modPath = path.join(modsPath, modId);
      if (await fs.pathExists(modPath)) {
        const modFiles = await scanModFiles(modPath, modId);
        
        for (const file of modFiles) {
          const relativePath = file.path.replace(modPath, '').replace(/^[\\\/]/, '');
          
          // Check for conflicts
          if (fileMap.has(relativePath)) {
            preview.conflicts++;
            file.conflict = true;
          }
          
          fileMap.set(relativePath, {
            ...file,
            sourceMod: modId,
            path: relativePath
          });
        }
      }
    }

    // Convert map to array
    preview.files = Array.from(fileMap.values());
    preview.totalFiles = preview.files.length;
    
    // Calculate total size
    let totalSize = 0;
    for (const file of preview.files) {
      if (file.sizeBytes) {
        totalSize += file.sizeBytes;
      }
    }
    preview.totalSizeMB = Math.round(totalSize / (1024 * 1024) * 100) / 100;

    return preview;
  } catch (error) {
    console.error('Error generating launch preview:', error);
    throw error;
  }
});

// Open merged runtime folder in Windows Explorer
ipcMain.handle('open-merged-runtime-folder', async () => {
  try {
    console.log('[IPC] open-merged-runtime-folder called');
    const mergedPath = path.join(getAppDataPath(), 'merged_runtime');
    console.log('[IPC] Merged path:', mergedPath);
    
    await fs.ensureDir(mergedPath);
    
    // Open in Windows Explorer
    const result = await shell.openPath(mergedPath);
    console.log('[IPC] Shell.openPath result:', result);
    
    if (result) {
      console.warn('[IPC] Shell.openPath returned error:', result);
    }
    
    return { success: true, path: mergedPath };
  } catch (error) {
    console.error('Error opening merged runtime folder:', error);
    throw error;
  }
});

// Open mod folder in Windows Explorer
ipcMain.handle('open-mod-folder', async (event, modId) => {
  try {
    console.log('[IPC] open-mod-folder called for:', modId);
    const modPath = path.join(getAppDataPath(), 'mods', modId);
    console.log('[IPC] Mod path:', modPath);
    
    if (!(await fs.pathExists(modPath))) {
      throw new Error(`Mod folder not found: ${modPath}`);
    }
    
    // Open in Windows Explorer
    const result = await shell.openPath(modPath);
    console.log('[IPC] Shell.openPath result:', result);
    
    if (result) {
      console.warn('[IPC] Shell.openPath returned error:', result);
    }
    
    return { success: true, path: modPath };
  } catch (error) {
    console.error('Error opening mod folder:', error);
    throw error;
  }
});

// Open game installation folder
ipcMain.handle('open-game-folder', async (event, gameInstallPath) => {
  try {
    console.log('[IPC] open-game-folder called for:', gameInstallPath);
    
    if (!gameInstallPath || !(await fs.pathExists(gameInstallPath))) {
      throw new Error(`Game folder not found: ${gameInstallPath}`);
    }
    
    // Open in Windows Explorer
    const result = await shell.openPath(gameInstallPath);
    console.log('[IPC] Shell.openPath result:', result);
    
    if (result) {
      console.warn('[IPC] Shell.openPath returned error:', result);
    }
    
    return { success: true, path: gameInstallPath };
  } catch (error) {
    console.error('Error opening game folder:', error);
    throw error;
  }
});

// Scan mod files recursively
async function scanModFiles(modPath, modId, basePath = '') {
  const files = [];
  
  try {
    const items = await fs.readdir(modPath);
    
    for (const item of items) {
      const itemPath = path.join(modPath, item);
      const relativePath = path.join(basePath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanModFiles(itemPath, modId, relativePath);
        files.push(...subFiles);
      } else {
        // Add file to list
        files.push({
          path: itemPath,
          relativePath,
          size: formatFileSize(stat.size),
          sizeBytes: stat.size,
          sourceMod: modId,
          conflict: false
        });
      }
    }
  } catch (error) {
    console.warn(`Error scanning mod files for ${modId}:`, error);
  }
  
  return files;
}

// Create complete mirror of game directory using symbolic links
async function createGameMirror(gameInstallPath, virtualGamePath) {
  const stats = {
    symlinksCreated: 0,
    directoriesCreated: 0
  };
  
  console.log(`[MIRROR] Creating symbolic link mirror...`);
  await mirrorDirectory(gameInstallPath, virtualGamePath, stats);
  
  console.log(`[MIRROR] Created ${stats.symlinksCreated} symbolic links, ${stats.directoriesCreated} directories`);
  return stats;
}

async function mirrorDirectory(sourceDir, targetDir, stats) {
  try {
    const items = await fs.readdir(sourceDir);
    await fs.ensureDir(targetDir);
    stats.directoriesCreated++;
    
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      const stat = await fs.stat(sourcePath);
      
      if (stat.isDirectory()) {
        // Recursively mirror subdirectory
        await mirrorDirectory(sourcePath, targetPath, stats);
      } else {
        // Create symbolic link to original file
        try {
          await fs.symlink(sourcePath, targetPath);
          stats.symlinksCreated++;
        } catch (error) {
          // Fallback to hard link, then copy if symlink fails
          try {
            await fs.link(sourcePath, targetPath);
            stats.symlinksCreated++;
          } catch (linkError) {
            await fs.copy(sourcePath, targetPath);
            stats.symlinksCreated++;
            console.warn(`[MIRROR] Fallback copy for: ${item}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`[MIRROR] Error mirroring directory ${sourceDir}:`, error.message);
  }
}

// Overlay mod files into the virtual game directory
async function overlayModFiles(modPath, virtualGamePath, modId) {
  const stats = {
    filesProcessed: 0,
    totalSizeBytes: 0
  };
  
  await copyModToVirtual(modPath, virtualGamePath, modId, stats);
  return stats;
}

async function copyModToVirtual(modPath, virtualPath, modId, stats) {
  try {
    const items = await fs.readdir(modPath);
    
    for (const item of items) {
      const sourcePath = path.join(modPath, item);
      const targetPath = path.join(virtualPath, item);
      const stat = await fs.stat(sourcePath);
      
      if (stat.isDirectory()) {
        await fs.ensureDir(targetPath);
        await copyModToVirtual(sourcePath, targetPath, modId, stats);
      } else {
        // Overlay mod file (overwrites symlink to original)
        await fs.copy(sourcePath, targetPath, { overwrite: true });
        console.log(`[OVERLAY] ${modId}: ${path.relative(virtualPath, targetPath)}`);
        stats.filesProcessed++;
        stats.totalSizeBytes += stat.size;
      }
    }
  } catch (error) {
    console.warn(`[OVERLAY] Error copying mod ${modId}:`, error.message);
  }
}

// Clean virtual game directory (non-destructive)
ipcMain.handle('clean-virtual-environment', async (event) => {
  try {
    console.log(`[CLEAN] Cleaning virtual game environment`);
    const virtualGamePath = path.join(process.cwd(), 'virtual_game');
    
    if (await fs.pathExists(virtualGamePath)) {
      await fs.remove(virtualGamePath);
      console.log(`[CLEAN] Virtual game directory removed`);
      return { success: true, message: 'Virtual environment cleaned successfully' };
    } else {
      console.log(`[CLEAN] No virtual environment found`);
      return { success: true, message: 'No virtual environment to clean' };
    }
  } catch (error) {
    console.error('Error cleaning virtual environment:', error);
    throw error;
  }
});

// Get game process status
ipcMain.handle('get-game-status', async (event) => {
  return { ...gameProcessInfo };
});

// Open virtual game folder
ipcMain.handle('open-virtual-game-folder', async (event) => {
  const virtualGamePath = path.join(process.cwd(), 'virtual_game');
  if (await fs.pathExists(virtualGamePath)) {
    shell.openPath(virtualGamePath);
  } else {
    throw new Error('Virtual game directory not found. Launch the game first to create it.');
  }
});

// Create mod metadata file
async function createModMetadata(modDir, defaultName) {
  const metadataPath = path.join(modDir, 'mod_loader_info.json');
  
  // Don't overwrite existing metadata
  if (await fs.pathExists(metadataPath)) {
    return;
  }
  
  const metadata = {
    displayName: defaultName,
    originalName: defaultName,
    description: '',
    tags: [],
    category: 'Other',
    author: '',
    version: '',
    importDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    enabled: false,
    loadOrder: 0
  };
  
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`[METADATA] Created metadata for mod: ${defaultName}`);
}

// Read mod metadata
async function readModMetadata(modDir) {
  const metadataPath = path.join(modDir, 'mod_loader_info.json');
  
  try {
    if (await fs.pathExists(metadataPath)) {
      const content = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`[METADATA] Error reading metadata for ${modDir}:`, error.message);
  }
  
  // Return default metadata if file doesn't exist or is corrupted
  const folderName = path.basename(modDir);
  return {
    displayName: folderName,
    originalName: folderName,
    description: '',
    tags: [],
    category: 'Other',
    author: '',
    version: '',
    importDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    enabled: false,
    loadOrder: 0
  };
}

// Update mod metadata
ipcMain.handle('update-mod-metadata', async (event, modId, updates) => {
  try {
    const modDir = path.join(getAppDataPath(), 'mods', modId);
    const metadataPath = path.join(modDir, 'mod_loader_info.json');
    
    let metadata = await readModMetadata(modDir);
    
    // Update fields
    metadata = {
      ...metadata,
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`[METADATA] Updated metadata for mod: ${modId}`);
    
    return metadata;
  } catch (error) {
    console.error('Error updating mod metadata:', error);
    throw error;
  }
});

// Extract the logic into a reusable function
async function getModsWithMetadata() {
      const modsDir = path.join(getAppDataPath(), 'mods');
  
  if (!(await fs.pathExists(modsDir))) {
    return [];
  }
  
  const modFolders = await fs.readdir(modsDir);
  const mods = [];
  
  for (const modId of modFolders) {
    const modDir = path.join(modsDir, modId);
    const stat = await fs.stat(modDir);
    
    if (stat.isDirectory()) {
      const metadata = await readModMetadata(modDir);
      mods.push({
        id: modId,
        path: modDir,
        ...metadata
      });
    }
  }
  
  // Sort by load order, then by import date
  mods.sort((a, b) => {
    if (a.loadOrder !== b.loadOrder) {
      return a.loadOrder - b.loadOrder;
    }
    return new Date(a.importDate) - new Date(b.importDate);
  });
  
  return mods;
}

// Get all mods with metadata
ipcMain.handle('get-mods-with-metadata', async (event) => {
  try {
    return await getModsWithMetadata();
  } catch (error) {
    console.error('Error getting mods with metadata:', error);
    throw error;
  }
});

// Get available categories and tags
ipcMain.handle('get-mod-categories-and-tags', async (event) => {
  try {
    // Get mods directly instead of calling the IPC handler
    const mods = await getModsWithMetadata();
    
    const categories = new Set(['Other', 'Gameplay', 'Visual', 'Audio', 'UI', 'Performance', 'Utility', 'Adult']);
    const tags = new Set();
    
    mods.forEach(mod => {
      if (mod.category) categories.add(mod.category);
      if (mod.tags && Array.isArray(mod.tags)) {
        mod.tags.forEach(tag => tags.add(tag));
      }
    });
    
    return {
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort()
    };
  } catch (error) {
    console.error('Error getting categories and tags:', error);
    return { categories: ['Other'], tags: [] };
  }
});

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Helper functions

function parseIni(content) {
  const lines = content.split('\n');
  const result = {};
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      result[currentSection] = {};
    } else if (trimmed.includes('=') && currentSection) {
      const [key, value] = trimmed.split('=', 2);
      result[currentSection][key.trim()] = value.trim();
    } else if (trimmed.includes('=')) {
      const [key, value] = trimmed.split('=', 2);
      result[key.trim()] = value.trim();
    }
  }
  
  return result;
}

async function extractZip(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      
      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          zipfile.readEntry();
        } else {
          // File entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);
            
            let filePath = path.join(extractPath, entry.fileName);
            
            // Handle different mod structures
            filePath = adjustModFilePath(extractPath, entry.fileName);
            
            fs.ensureDir(path.dirname(filePath))
              .then(() => {
                const writeStream = fs.createWriteStream(filePath);
                readStream.pipe(writeStream);
                writeStream.on('close', () => zipfile.readEntry());
                writeStream.on('error', reject);
              })
              .catch(reject);
          });
        }
      });
      
      zipfile.on('end', resolve);
      zipfile.on('error', reject);
    });
  });
}

function adjustModFilePath(extractPath, fileName) {
  // Normalize path separators
  const normalizedPath = fileName.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/');
  
  // If file is directly in root and is an .archive file, move to proper location
  if (pathParts.length === 1 && fileName.endsWith('.archive')) {
    return path.join(extractPath, 'archive', 'pc', 'mod', fileName);
  }
  
  // Check if the mod has a proper structure already
  const knownRootFolders = ['archive', 'r6', 'redscript', 'engine', 'bin', 'red4ext'];
  const firstFolder = pathParts[0].toLowerCase();
  
  if (knownRootFolders.includes(firstFolder)) {
    // Mod already has proper structure, use as-is
    return path.join(extractPath, fileName);
  }
  
  // Handle RED4ext plugins
  if (fileName.endsWith('.dll') && (fileName.includes('ArchiveXL') || fileName.includes('TweakXL') || fileName.includes('Codeware'))) {
    const pluginName = path.basename(fileName, '.dll');
    return path.join(extractPath, 'red4ext', 'plugins', pluginName, fileName);
  }
  
  // Handle other RED4ext plugins by checking for common plugin DLLs
  if (fileName.endsWith('.dll') && pathParts.length === 1) {
    const pluginName = path.basename(fileName, '.dll');
    const knownPlugins = ['VirtualCarDealer', 'EquipmentEx', 'InputLoader', 'Codeware', 'ArchiveXL', 'TweakXL'];
    if (knownPlugins.some(plugin => fileName.includes(plugin))) {
      return path.join(extractPath, 'red4ext', 'plugins', pluginName, fileName);
    }
  }
  
  // Handle .reds files that should go to r6/scripts/
  if (fileName.endsWith('.reds')) {
    const filename = path.basename(fileName);
    return path.join(extractPath, 'r6', 'scripts', filename);
  }
  
  // Handle CET lua files
  if (fileName.endsWith('.lua') || pathParts.includes('init.lua')) {
    return path.join(extractPath, 'bin', 'x64', 'plugins', 'cyber_engine_tweaks', 'mods', fileName);
  }   
  
  // Handle CET version.dll
  if (fileName === 'version.dll' || (fileName.endsWith('version.dll') && pathParts.length === 1)) {
    return path.join(extractPath, 'bin', 'x64', 'plugins', 'cyber_engine_tweaks', fileName);
  }
  
  // Handle RED4ext main files
  if (fileName === 'RED4ext.dll' || fileName === 'config.ini') {
    return path.join(extractPath, 'red4ext', fileName);
  }
  
  // Handle REDScript files
  if (fileName === 'redscript.dll') {
    return path.join(extractPath, 'engine', fileName);
  }
  
  // Handle engine config files
  if (fileName.includes('config') && (fileName.endsWith('.ini') || fileName.endsWith('.xml'))) {
    return path.join(extractPath, 'engine', 'config', 'platform', 'pc', fileName);
  }
  
  // Handle tweak files
  if (fileName.endsWith('.yaml') || fileName.endsWith('.tweak')) {
    return path.join(extractPath, 'r6', 'tweaks', fileName);
  }
  
  // Default: keep original structure
  return path.join(extractPath, fileName);
}

async function validateModStructure(modPath) {
  const requiredFolders = ['archive', 'r6', 'redscript', 'engine', 'bin', 'red4ext'];
  const items = await fs.readdir(modPath);
  
  // Check for known mod folders
  for (const folder of requiredFolders) {
    const folderPath = path.join(modPath, folder);
    if (await fs.pathExists(folderPath)) {
      return true;
    }
  }
  
  // Check for loose .archive files (these should be moved to archive/pc/mod/)
  const archiveFiles = items.filter(item => item.endsWith('.archive'));
  if (archiveFiles.length > 0) {
    await organizeLooseArchiveFiles(modPath, archiveFiles);
    return true;
  }
  
  // Check for RED4ext plugin DLLs
  const dllFiles = items.filter(item => item.endsWith('.dll'));
  const pluginDlls = dllFiles.filter(dll => {
    const knownPlugins = ['VirtualCarDealer', 'ArchiveXL', 'TweakXL', 'Codeware', 'EquipmentEx', 'InputLoader', 'RED4ext', 'redscript'];
    return knownPlugins.some(plugin => dll.includes(plugin));
  });
  
  if (pluginDlls.length > 0) {
    await organizePluginFiles(modPath, pluginDlls);
    return true;
  }
  
  // Check for other common mod file types
  const modFileTypes = ['.reds', '.lua', '.json', '.yaml', '.xml', '.tweak', '.dll'];
  const hasModFiles = items.some(item => 
    modFileTypes.some(ext => item.endsWith(ext))
  );
  
  if (hasModFiles) {
    return true;
  }
  
  return false;
}

async function organizePluginFiles(modPath, dllFiles) {
  for (const dllFile of dllFiles) {
    const sourcePath = path.join(modPath, dllFile);
    const pluginName = path.basename(dllFile, '.dll');
    
    // Determine correct plugin directory
    let targetDir;
    if (dllFile === 'RED4ext.dll') {
      targetDir = path.join(modPath, 'red4ext');
    } else if (dllFile === 'redscript.dll') {
      targetDir = path.join(modPath, 'engine');
    } else if (dllFile === 'version.dll') {
      targetDir = path.join(modPath, 'bin', 'x64', 'plugins', 'cyber_engine_tweaks');
    } else {
      targetDir = path.join(modPath, 'red4ext', 'plugins', pluginName);
    }
    
    await fs.ensureDir(targetDir);
    const destPath = path.join(targetDir, dllFile);
    await fs.move(sourcePath, destPath);
  }
}

async function organizeLooseArchiveFiles(modPath, archiveFiles) {
  const archiveDir = path.join(modPath, 'archive', 'pc', 'mod');
  await fs.ensureDir(archiveDir);
  
  for (const archiveFile of archiveFiles) {
    const sourcePath = path.join(modPath, archiveFile);
    const destPath = path.join(archiveDir, archiveFile);
    await fs.move(sourcePath, destPath);
  }
}

async function buildMergedRuntime(enabledMods, gameInstallPath) {
  const virtualGamePath = path.join(process.cwd(), 'virtual_game');
  
  console.log(`[VIRTUAL] Building non-destructive virtual game environment`);
  console.log(`[VIRTUAL] Original game: ${gameInstallPath}`);
  console.log(`[VIRTUAL] Virtual game: ${virtualGamePath}`);
  console.log(`[VIRTUAL] Processing ${enabledMods.length} enabled mods in load order`);
  
  // Clear existing virtual game directory
  await fs.remove(virtualGamePath);
  await fs.ensureDir(virtualGamePath);
  
  let stats = {
    modsProcessed: 0,
    filesProcessed: 0,
    totalSizeBytes: 0,
    symlinksCreated: 0,
    modFilesOverlaid: 0
  };
  
  // Step 1: Create complete shadow copy of game directory using symbolic links
  console.log(`[VIRTUAL] Creating symbolic link mirror of game directory...`);
  const mirrorStats = await createGameMirror(gameInstallPath, virtualGamePath);
  stats.symlinksCreated = mirrorStats.symlinksCreated;
  
  // Step 2: Overlay mod files on top of the symbolic link structure
  console.log(`[VIRTUAL] Overlaying mod files in load order...`);
  for (let i = 0; i < enabledMods.length; i++) {
    const modId = enabledMods[i];
    console.log(`[VIRTUAL] Processing mod ${i + 1}/${enabledMods.length}: ${modId}`);
    
    const modPath = path.join(getAppDataPath(), 'mods', modId);
    if (await fs.pathExists(modPath)) {
      const modStats = await overlayModFiles(modPath, virtualGamePath, modId);
      stats.modsProcessed++;
      stats.filesProcessed += modStats.filesProcessed;
      stats.totalSizeBytes += modStats.totalSizeBytes;
      stats.modFilesOverlaid += modStats.filesProcessed;
      
      console.log(`[VIRTUAL] - ${modId}: ${modStats.filesProcessed} files overlaid, ${formatFileSize(modStats.totalSizeBytes)}`);
    } else {
      console.warn(`[VIRTUAL] - ${modId}: Mod directory not found, skipping`);
    }
  }
  
  console.log(`[VIRTUAL] Virtual environment complete:`);
  console.log(`[VIRTUAL] - ${stats.symlinksCreated} original files linked`);
  console.log(`[VIRTUAL] - ${stats.modFilesOverlaid} mod files overlaid`);
  console.log(`[VIRTUAL] - ${formatFileSize(stats.totalSizeBytes)} total mod content`);
  
  return {
    ...stats,
    virtualGamePath
  };
}

async function copyModToRuntime(modPath, runtimePath, modId = 'unknown') {
  const stats = {
    filesProcessed: 0,
    totalSizeBytes: 0
  };
  
  const items = await fs.readdir(modPath);
  
  for (const item of items) {
    const sourcePath = path.join(modPath, item);
    const destPath = path.join(runtimePath, item);
    
    const stat = await fs.stat(sourcePath);
    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
      const subStats = await copyModToRuntime(sourcePath, destPath, modId);
      stats.filesProcessed += subStats.filesProcessed;
      stats.totalSizeBytes += subStats.totalSizeBytes;
    } else {
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(sourcePath, destPath, { overwrite: true });
      stats.filesProcessed++;
      stats.totalSizeBytes += stat.size;
      
      // Log file overwrites for transparency
      const relativePath = path.relative(runtimePath, destPath);
      console.log(`[MERGE]   → ${relativePath} (${formatFileSize(stat.size)})`);
    }
  }
  
  return stats;
}