import React, { useState, useEffect } from 'react';
import { Play, Zap, AlertTriangle, CheckCircle, Monitor } from 'lucide-react';

const GameLauncher = ({ config, enabledModsCount, onLaunchGame }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [gameStatus, setGameStatus] = useState({ isRunning: false, launchedAt: null });

  // Poll game status
  useEffect(() => {
    const checkGameStatus = async () => {
      try {
        const status = await window.electronAPI.getGameStatus();
        setGameStatus(status);
      } catch (error) {
        console.error('Error checking game status:', error);
      }
    };

    // Check immediately
    checkGameStatus();
    
    // Then poll every 2 seconds
    const interval = setInterval(checkGameStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      await onLaunchGame();
      // Status will be updated by the polling effect
    } catch (error) {
      console.error('Launch error:', error);
    } finally {
      setIsLaunching(false);
    }
  };

  const canLaunch = config.gameInstallPath && !isLaunching && !gameStatus.isRunning;
  const hasGamePath = Boolean(config.gameInstallPath);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cyber-blue flex items-center">
        <Zap size={20} className="mr-2" />
        Game Launcher
      </h3>

      {/* Status Indicators */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          {hasGamePath ? (
            <CheckCircle size={16} className="text-green-400" />
          ) : (
            <AlertTriangle size={16} className="text-cyber-pink" />
          )}
          <span className={hasGamePath ? 'text-green-400' : 'text-cyber-pink'}>
            Game Path {hasGamePath ? 'Configured' : 'Not Set'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-green-400">
            {enabledModsCount} Mod{enabledModsCount !== 1 ? 's' : ''} Enabled
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          {gameStatus.isRunning ? (
            <>
              <Monitor size={16} className="text-cyber-blue animate-pulse" />
              <span className="text-cyber-blue">
                Game Running {gameStatus.launchedAt ? `(${new Date(gameStatus.launchedAt).toLocaleTimeString()})` : ''}
              </span>
            </>
          ) : (
            <>
              <Monitor size={16} className="text-gray-400" />
              <span className="text-gray-400">Game Not Running</span>
            </>
          )}
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={handleLaunch}
        disabled={!canLaunch}
        className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
          canLaunch
            ? 'cyber-button-primary hover:animate-glow text-lg'
            : 'cyber-button opacity-50 cursor-not-allowed'
        }`}
      >
        {isLaunching ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
            <span>Building Virtual Environment...</span>
          </>
        ) : gameStatus.isRunning ? (
          <>
            <Monitor size={24} className="text-cyber-blue" />
            <span>Game is Running</span>
          </>
        ) : (
          <>
            <Play size={24} />
            <span>Launch Game</span>
          </>
        )}
      </button>

      {/* Launch Info */}
      <div className="p-3 bg-cyber-blue bg-opacity-10 rounded border border-cyber-blue border-opacity-30">
        <p className="text-xs text-gray-300">
          {gameStatus.isRunning ? (
            <>
              <strong>Game is currently running</strong> with {enabledModsCount} mod{enabledModsCount !== 1 ? 's' : ''} in virtual environment. 
              Your original game files remain completely untouched.
            </>
          ) : enabledModsCount > 0 ? (
            <>
              Will launch with <strong>{enabledModsCount} mod{enabledModsCount !== 1 ? 's' : ''}</strong> enabled.
              Virtual environment will be rebuilt with current mod configuration.
            </>
          ) : (
            <>
              No mods enabled. Game will launch normally without modifications.
            </>
          )}
        </p>
      </div>

      {!hasGamePath && (
        <div className="p-3 bg-cyber-pink bg-opacity-10 rounded border border-cyber-pink border-opacity-30">
          <p className="text-xs text-cyber-pink">
            Configure the game installation path in Settings before launching.
          </p>
        </div>
      )}
    </div>
  );
};

export default GameLauncher;