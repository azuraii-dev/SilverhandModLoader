import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Shield, FolderOpen, Zap } from 'lucide-react';

const GameFileManager = ({ config }) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastClean, setLastClean] = useState(null);

  const handleCleanVirtual = async () => {
    const confirmed = window.confirm(
      'This will clean the virtual game environment. ' +
      'Your original game files are never touched and remain safe. Continue?'
    );

    if (!confirmed) return;

    setIsCleaning(true);
    try {
      const result = await window.electronAPI.cleanVirtualEnvironment();
      setLastClean({
        timestamp: new Date(),
        message: result.message
      });
      
      alert(result.message);
    } catch (error) {
      console.error('Error cleaning virtual environment:', error);
      alert(`Error cleaning virtual environment: ${error.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleOpenVirtualFolder = async () => {
    try {
      await window.electronAPI.openVirtualGameFolder();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="cyber-border p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-cyber-blue mb-4 flex items-center space-x-2">
        <Zap size={20} />
        <span>Non-Destructive Virtual Environment</span>
      </h3>

      <div className="space-y-4">
        {/* Current Status */}
        <div className="p-4 bg-cyber-dark bg-opacity-30 rounded">
          <h4 className="font-semibold text-gray-200 mb-2">🛡️ Completely Safe Approach</h4>
          <p className="text-sm text-gray-300 mb-3">
            Your original game files are <strong>NEVER touched</strong>. We create a complete virtual copy 
            using symbolic links, then overlay mod files on top. Game launches from the virtual environment only.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 p-3 rounded">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-green-400 font-semibold text-sm">Zero Risk</span>
              </div>
              <p className="text-green-300 text-xs">
                Original game directory is never modified
              </p>
            </div>
            
            <div className="bg-cyber-blue bg-opacity-10 border border-cyber-blue border-opacity-30 p-3 rounded">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="text-cyber-blue" size={16} />
                <span className="text-cyber-blue font-semibold text-sm">Isolated</span>
              </div>
              <p className="text-cyber-blue text-xs">
                Mods only active when launched through mod loader
              </p>
            </div>
            
            <div className="bg-cyber-pink bg-opacity-10 border border-cyber-pink border-opacity-30 p-3 rounded">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="text-cyber-pink" size={16} />
                <span className="text-cyber-pink font-semibold text-sm">Steam Safe</span>
              </div>
              <p className="text-cyber-pink text-xs">
                Steam launches show no mods - completely vanilla
              </p>
            </div>
          </div>
        </div>

        {/* Virtual Environment Actions */}
        <div className="p-4 bg-cyber-blue bg-opacity-10 border border-cyber-blue border-opacity-30 rounded">
          <div className="flex items-start space-x-3">
            <FolderOpen className="text-cyber-blue mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-cyber-blue mb-2">Virtual Environment</h4>
              <p className="text-gray-300 text-sm mb-3">
                Explore or clean the virtual game environment. This is a complete copy of your game 
                with symbolic links to originals and mod files overlaid on top.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleOpenVirtualFolder}
                  className="cyber-button flex items-center space-x-2"
                >
                  <FolderOpen size={16} />
                  <span>Open Virtual Folder</span>
                </button>
                
                <button
                  onClick={handleCleanVirtual}
                  disabled={isCleaning}
                  className="cyber-button-secondary flex items-center space-x-2"
                >
                  {isCleaning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      <span>Cleaning...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Clean Virtual Env</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Last Clean Info */}
        {lastClean && (
          <div className="p-3 bg-cyber-blue bg-opacity-10 border border-cyber-blue border-opacity-30 rounded">
            <div className="text-sm text-cyber-blue">
              <strong>Last Cleanup:</strong> {lastClean.timestamp.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              {lastClean.message}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-gray-500 bg-opacity-10 border border-gray-500 border-opacity-30 rounded">
          <h4 className="font-semibold text-gray-300 mb-2 text-sm">How Non-Destructive Virtual Environment Works</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <span>Complete game directory mirror created in <code>virtual_game/</code> using symbolic links</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <span>Mod files overlaid on top of symbolic links (respecting load order)</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <span>Game launched from virtual directory - sees all mods + originals</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
              <span>Original game directory remains <strong>completely untouched</strong></span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-3 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded">
          <div className="flex items-start space-x-2">
            <CheckCircle className="text-green-400 mt-0.5" size={16} />
            <div className="text-sm text-green-400">
              <strong>Benefits:</strong> Steam validates fine, achievements work normally, no risk of corruption, 
              easy to clean up, and original game remains in pristine condition.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameFileManager;