import React from 'react';
import { Play, AlertTriangle, Zap } from 'lucide-react';

const Header = ({ config, conflicts, onLaunchGame }) => {
  const enabledModsCount = config.enabledMods.length;
  const hasConflicts = conflicts.length > 0;

  return (
    <header className="bg-cyber-dark bg-opacity-50 border-b border-cyber-blue border-opacity-30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="text-cyber-yellow" size={32} />
            <h1 className="text-2xl font-cyber font-bold text-cyber-blue">
              Silverhand Mod Loader
            </h1>
          </div>
          
          <div className="text-sm text-gray-400">
            Cyberpunk 2077 Virtual Filesystem Mod Manager
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Mod Status */}
          <div className="text-right">
            <div className="text-sm text-gray-400">Active Mods</div>
            <div className="text-xl font-bold text-cyber-blue">{enabledModsCount}</div>
          </div>

          {/* Conflict Warning */}
          {hasConflicts && (
            <div className="flex items-center space-x-2 text-cyber-pink">
              <AlertTriangle size={20} />
              <span className="text-sm font-semibold">
                {conflicts.length} Conflict{conflicts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Game Install Status */}
          <div className="text-right">
            <div className="text-sm text-gray-400">Game Status</div>
            <div className={`text-sm font-semibold ${
              config.gameInstallPath ? 'text-green-400' : 'text-cyber-pink'
            }`}>
              {config.gameInstallPath ? 'Ready' : 'Not Configured'}
            </div>
          </div>

          {/* Quick Launch */}
          <button
            onClick={onLaunchGame}
            disabled={!config.gameInstallPath}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              config.gameInstallPath
                ? 'cyber-button-primary hover:animate-glow'
                : 'cyber-button opacity-50 cursor-not-allowed'
            }`}
          >
            <Play size={20} />
            <span>Launch Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;