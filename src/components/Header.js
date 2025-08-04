import React, { useState, useEffect } from 'react';
import { Play, AlertTriangle, Zap, Monitor } from 'lucide-react';

const Header = ({ config, conflicts, onLaunchGame }) => {
  const enabledModsCount = config.enabledMods.length;
  const hasConflicts = conflicts.length > 0;
  const [gameStatus, setGameStatus] = useState({ isRunning: false, launchedAt: null });

  // Poll game status
  useEffect(() => {
    const checkGameStatus = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getGameStatus) {
          const status = await window.electronAPI.getGameStatus();
          setGameStatus(status);
        }
      } catch (error) {
        console.error('Error checking game status in header:', error);
      }
    };

    checkGameStatus();
    const interval = setInterval(checkGameStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-cyber-dark bg-opacity-50 border-b border-cyber-blue border-opacity-30 px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Zap className="text-cyber-yellow" size={36} />
            <h1 className="text-3xl font-cyber font-bold text-cyber-blue">
              Silverhand Mod Loader
            </h1>
          </div>
          
          {/* Game Running Indicator */}
          {gameStatus.isRunning && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-cyber-blue bg-opacity-20 rounded-full border border-cyber-blue border-opacity-40">
              <Monitor size={16} className="text-cyber-blue animate-pulse" />
              <span className="text-cyber-blue text-sm font-semibold">
                Game Active
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-8">
          {/* Status Cards */}
          <div className="flex items-center space-x-6">
            {/* Mod Status */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-cyber-dark bg-opacity-40 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyber-blue">{enabledModsCount}</div>
                <div className="text-xs text-gray-400">Active Mods</div>
              </div>
            </div>

            {/* Conflict Warning */}
            {hasConflicts && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-cyber-pink bg-opacity-10 rounded-lg border border-cyber-pink border-opacity-30">
                <AlertTriangle size={18} className="text-cyber-pink" />
                <div className="text-center">
                  <div className="text-sm font-bold text-cyber-pink">{conflicts.length}</div>
                  <div className="text-xs text-cyber-pink">Conflict{conflicts.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )}

            {/* Game Install Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              config.gameInstallPath 
                ? 'bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30' 
                : 'bg-cyber-pink bg-opacity-10 border border-cyber-pink border-opacity-30'
            }`}>
              <div className="text-center">
                <div className={`text-sm font-bold ${
                  config.gameInstallPath ? 'text-green-400' : 'text-cyber-pink'
                }`}>
                  {config.gameInstallPath ? 'Ready' : 'Not Set'}
                </div>
                <div className={`text-xs ${
                  config.gameInstallPath ? 'text-green-400' : 'text-cyber-pink'
                }`}>
                  Game Path
                </div>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={onLaunchGame}
            disabled={!config.gameInstallPath || gameStatus.isRunning}
            className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              config.gameInstallPath && !gameStatus.isRunning
                ? 'cyber-button-primary hover:animate-glow hover:scale-105'
                : 'cyber-button opacity-50 cursor-not-allowed'
            }`}
          >
            {gameStatus.isRunning ? (
              <>
                <Monitor size={24} className="text-cyber-blue" />
                <span>Game Running</span>
              </>
            ) : (
              <>
                <Play size={24} />
                <span>Launch Game</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;