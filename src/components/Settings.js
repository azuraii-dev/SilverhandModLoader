import React, { useState, useEffect } from 'react';
import { FolderOpen, RefreshCw, HardDrive, Settings as SettingsIcon } from 'lucide-react';


const Settings = ({ config, onUpdateGamePath }) => {
  const [gameInstallPath, setGameInstallPath] = useState(config.gameInstallPath || '');
  const [isSaving, setIsSaving] = useState(false);
  const [appInfo, setAppInfo] = useState({
    appVersion: '1.0.0',
    electronVersion: '25.3.0',
    nodeVersion: '18.x.x',
    chromiumVersion: '114.x.x'
  });

  useEffect(() => {
    // Load app info from Electron main process
    const loadAppInfo = async () => {
      try {
        const info = await window.electronAPI.getAppInfo();
        setAppInfo(info);
      } catch (error) {
        console.error('Error loading app info:', error);
        // Keep default values if API call fails
      }
    };
    
    loadAppInfo();
  }, []);

  const selectGameDirectory = async () => {
    try {
      const path = await window.electronAPI.selectGameDirectory();
      if (path) {
        setGameInstallPath(path);
        await handleSave(path);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };

  const handleSave = async (path = gameInstallPath) => {
    if (!path) return;
    
    setIsSaving(true);
    try {
      await onUpdateGamePath(path);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validateGamePath = (path) => {
    // Basic validation - in a real app, you'd check for the actual executable
    return path && path.length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="text-cyber-blue" size={32} />
        <h2 className="text-3xl font-bold text-cyber-blue font-cyber">
          Settings
        </h2>
      </div>

      {/* Game Installation Path */}
      <div className="cyber-border p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-cyber-blue mb-4 flex items-center">
          <HardDrive size={20} className="mr-2" />
          Game Installation
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cyberpunk 2077 Installation Directory
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={gameInstallPath}
                onChange={(e) => setGameInstallPath(e.target.value)}
                placeholder="Select game installation directory..."
                className="cyber-input flex-1"
                readOnly
              />
              <button
                onClick={selectGameDirectory}
                className="cyber-button flex items-center space-x-2"
              >
                <FolderOpen size={16} />
                <span>Browse</span>
              </button>
            </div>
            
            {gameInstallPath && (
              <div className="mt-2 text-sm">
                <span className={`font-semibold ${
                  validateGamePath(gameInstallPath) ? 'text-green-400' : 'text-cyber-pink'
                }`}>
                  {validateGamePath(gameInstallPath) ? '✓ Valid Path' : '✗ Invalid Path'}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 bg-cyber-blue bg-opacity-10 rounded border border-cyber-blue border-opacity-30">
            <p className="text-sm text-gray-300">
              <strong>Instructions:</strong> Select the main Cyberpunk 2077 installation directory 
              (the folder containing Cyberpunk2077.exe). This is typically located at:
            </p>
            <ul className="text-sm text-gray-400 mt-2 space-y-1">
              <li>• Steam: <code>C:\Program Files (x86)\Steam\steamapps\common\Cyberpunk 2077</code></li>
              <li>• GOG: <code>C:\Program Files (x86)\GOG Galaxy\Games\Cyberpunk 2077</code></li>
              <li>• Epic: <code>C:\Program Files\Epic Games\Cyberpunk2077</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mod Management Settings */}
      <div className="cyber-border p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-cyber-blue mb-4">
          Mod Management
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cyber-dark bg-opacity-30 p-4 rounded">
              <div className="text-2xl font-bold text-cyber-blue">{config.enabledMods?.length || 0}</div>
              <div className="text-sm text-gray-400">Enabled Mods</div>
            </div>
            
            <div className="bg-cyber-dark bg-opacity-30 p-4 rounded">
              <div className="text-2xl font-bold text-cyber-blue">{config.modLoadOrder?.length || 0}</div>
              <div className="text-sm text-gray-400">Load Order Entries</div>
            </div>
          </div>

          <div className="p-4 bg-amber-500 bg-opacity-10 rounded border border-amber-500 border-opacity-30">
            <p className="text-sm text-amber-200">
              <strong>Note:</strong> This mod loader uses a virtual filesystem overlay. 
              Your original game files are never modified. Mods are applied at runtime 
              by creating a merged view in the <code>merged_game/</code> directory.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="cyber-border p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-cyber-blue mb-4">
          Advanced Options
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-300">Open Game Folder</div>
              <div className="text-sm text-gray-400">
                Open the game installation directory in Windows Explorer
              </div>
            </div>
            <button
              onClick={() => {
                if (config.gameInstallPath) {
                  window.electronAPI.openGameFolder(config.gameInstallPath).catch(error => {
                    console.error('Error opening game folder:', error);
                    alert(`Error opening game folder: ${error.message}`);
                  });
                } else {
                  alert('Please set the game installation path first.');
                }
              }}
              disabled={!config.gameInstallPath}
              className="cyber-button flex items-center space-x-2"
            >
              <FolderOpen size={16} />
              <span>Open</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-300">Clear Virtual Game Environment</div>
              <div className="text-sm text-gray-400">
                Clear the virtual game environment to free up space
              </div>
            </div>
            <button 
              onClick={async () => {
                const confirmed = window.confirm(
                  'This will clear the virtual game environment. Your original game files and mods are safe. Continue?'
                );
                if (confirmed) {
                  try {
                    await window.electronAPI.cleanVirtualEnvironment();
                    alert('Virtual environment cleared successfully!');
                  } catch (error) {
                    alert(`Error clearing virtual environment: ${error.message}`);
                  }
                }
              }}
              className="cyber-button flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-300">Reset Configuration</div>
              <div className="text-sm text-gray-400">
                Reset all settings to default values
              </div>
            </div>
            <button className="cyber-button-danger flex items-center space-x-2">
              <RefreshCw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div className="cyber-border p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-cyber-blue mb-4">
          About
        </h3>
        
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Application Version:</span>
            <span className="text-cyber-blue">{appInfo.appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Electron Version:</span>
            <span className="text-cyber-blue">{appInfo.electronVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Node.js Version:</span>
            <span className="text-cyber-blue">{appInfo.nodeVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Chromium Version:</span>
            <span className="text-cyber-blue">{appInfo.chromiumVersion}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;