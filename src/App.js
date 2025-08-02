import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Header from './components/Header';
import ModList from './components/ModList';
import ModImporter from './components/ModImporter';
import Settings from './components/Settings';
import GameLauncher from './components/GameLauncher';
import ConflictDetector from './components/ConflictDetector';
import ErrorBoundary from './components/ErrorBoundary';
import { Settings as SettingsIcon, List, Upload, Play } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('mods');
  const [config, setConfig] = useState({
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
  });
  const [mods, setMods] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [loadedConfig, loadedMods] = await Promise.all([
        window.electronAPI.loadConfig(),
        window.electronAPI.getMods()
      ]);
      
      setConfig(loadedConfig);
      setMods(loadedMods);
      detectConflicts(loadedMods, loadedConfig.enabledMods);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig) => {
    try {
      await window.electronAPI.saveConfig(newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const detectConflicts = (modList, enabledModIds) => {
    const enabledMods = modList.filter(mod => enabledModIds.includes(mod.id));
    const fileMap = new Map();
    const foundConflicts = [];

    // This is a simplified conflict detection
    // In a real implementation, you'd scan actual file paths
    enabledMods.forEach(mod => {
      const mockFiles = [`archive/${mod.id}.archive`, `r6/scripts/${mod.id}.reds`];
      mockFiles.forEach(file => {
        if (fileMap.has(file)) {
          foundConflicts.push({
            file,
            mods: [fileMap.get(file), mod.id]
          });
        } else {
          fileMap.set(file, mod.id);
        }
      });
    });

    setConflicts(foundConflicts);
  };

  const refreshMods = async () => {
    try {
      const loadedMods = await window.electronAPI.getMods();
      setMods(loadedMods);
      detectConflicts(loadedMods, config.enabledMods);
    } catch (error) {
      console.error('Error refreshing mods:', error);
    }
  };

  const toggleMod = async (modId) => {
    const isCurrentlyEnabled = config.enabledMods.includes(modId);
    
    let newEnabledMods, newLoadOrder;
    
    if (isCurrentlyEnabled) {
      // Removing mod
      newEnabledMods = config.enabledMods.filter(id => id !== modId);
      newLoadOrder = config.modLoadOrder.filter(id => id !== modId);
    } else {
      // Adding mod
      newEnabledMods = [...config.enabledMods, modId];
      newLoadOrder = [...config.modLoadOrder, modId];
    }

    const newConfig = {
      ...config,
      enabledMods: newEnabledMods,
      modLoadOrder: newLoadOrder
    };

    await saveConfig(newConfig);
    detectConflicts(mods, newEnabledMods);
  };

  const reorderMods = async (result) => {
    // Basic validation
    if (!result || !result.destination) return;
    if (result.destination.index === result.source.index) return;

    // Only reorder if we have enabled mods
    if (!config.enabledMods || config.enabledMods.length === 0) return;

    // Ensure we're reordering within the correct droppable
    if (result.source.droppableId !== 'enabled-mods' || result.destination.droppableId !== 'enabled-mods') {
      return;
    }

    try {
      const newOrder = Array.from(config.modLoadOrder);
      const [reorderedItem] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, reorderedItem);

      const newConfig = {
        ...config,
        modLoadOrder: newOrder
      };

      await saveConfig(newConfig);
    } catch (error) {
      console.error('Error reordering mods:', error);
    }
  };

  const importMod = async (filePath) => {
    try {
      await window.electronAPI.importMod(filePath);
      await refreshMods();
    } catch (error) {
      console.error('Error importing mod:', error);
      throw error;
    }
  };

  const deleteMod = async (modId) => {
    try {
      await window.electronAPI.deleteMod(modId);
      
      // Remove from enabled mods and load order
      const newConfig = {
        ...config,
        enabledMods: config.enabledMods.filter(id => id !== modId),
        modLoadOrder: config.modLoadOrder.filter(id => id !== modId)
      };
      
      await saveConfig(newConfig);
      await refreshMods();
    } catch (error) {
      console.error('Error deleting mod:', error);
    }
  };

  const launchGame = async () => {
    try {
      if (!config.gameInstallPath) {
        alert('Please set the game installation path in Settings first.');
        return;
      }
      
      await window.electronAPI.launchGame(config.gameInstallPath, config.modLoadOrder);
    } catch (error) {
      console.error('Error launching game:', error);
      alert(`Error launching game: ${error.message}`);
    }
  };

  const updateGamePath = async (path) => {
    const newConfig = { ...config, gameInstallPath: path };
    await saveConfig(newConfig);
  };

  const navigationItems = [
    { id: 'mods', label: 'Mod Library', icon: List },
    { id: 'import', label: 'Import Mods', icon: Upload },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-darker flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyber-blue mx-auto mb-4"></div>
          <p className="text-cyber-blue text-xl">Loading Silverhand Mod Loader...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={reorderMods}>
      <div className="h-screen bg-cyber-darker flex flex-col">
        <Header 
          config={config}
          conflicts={conflicts}
          onLaunchGame={launchGame}
        />
        
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Static Sidebar Navigation - Fixed Height, No Scroll */}
          <nav className="w-64 bg-cyber-dark bg-opacity-50 border-r border-cyber-blue border-opacity-30 flex-shrink-0 h-full overflow-hidden">
            <div className="p-4 h-full">
              <div className="space-y-2">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        currentView === item.id
                          ? 'bg-cyber-blue bg-opacity-20 text-cyber-blue border border-cyber-blue'
                          : 'text-gray-300 hover:text-cyber-blue hover:bg-cyber-blue hover:bg-opacity-10'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Game Launcher in Sidebar */}
              <div className="mt-8 pt-4 border-t border-cyber-blue border-opacity-30">
                <GameLauncher 
                  config={config}
                  enabledModsCount={config.enabledMods.length}
                  onLaunchGame={launchGame}
                />
              </div>
            </div>
          </nav>

          {/* Main Content - Conditional layout based on current view */}
          <main className="flex-1 h-full bg-cyber-darker">
            {currentView === 'mods' ? (
              /* Mod Library - Special layout with constrained height */
              <div className="p-6 h-full flex flex-col">
                {conflicts.length > 0 && (
                  <ConflictDetector conflicts={conflicts} className="mb-6" />
                )}
                <div className="flex-1 min-h-0">
                  <ErrorBoundary>
                    <ModList
                      mods={mods}
                      config={config}
                      onToggleMod={toggleMod}
                      onDeleteMod={deleteMod}
                      enabledMods={config.enabledMods}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            ) : (
              /* All other pages - Normal scrollable layout */
              <div className="h-full overflow-y-auto">
                <div className="p-6 min-h-full">
                  {conflicts.length > 0 && (
                    <ConflictDetector conflicts={conflicts} className="mb-6" />
                  )}

                  {currentView === 'import' && (
                    <ModImporter onImportMod={importMod} />
                  )}

                  {currentView === 'settings' && (
                    <Settings
                      config={config}
                      onUpdateGamePath={updateGamePath}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;