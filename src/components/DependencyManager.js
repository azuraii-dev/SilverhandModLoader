import React, { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, Download, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { DEPENDENCY_DATABASE, detectMissingDependencies, parseModDependencies, getInstallationInstructions } from '../utils/dependencyDatabase';
import RedscriptErrorsPanel from './RedscriptErrorsPanel';

const DependencyManager = ({ mods, config, onRefresh }) => {
  const [missingDependencies, setMissingDependencies] = useState([]);
  const [modDependencies, setModDependencies] = useState([]);
  const [selectedDep, setSelectedDep] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dependencyStatuses, setDependencyStatuses] = useState({});

  useEffect(() => {
    analyzeDependencies();
  }, [mods]);

  const analyzeDependencies = async () => {
    setIsAnalyzing(true);
    try {
      const allDeps = new Set();
      
      // Analyze installed mods for dependencies
      for (const mod of mods) {
        if (mod.metadata) {
          const deps = parseModDependencies(mod.metadata);
          deps.forEach(dep => allDeps.add(dep));
        }
      }
      
      // TODO: Analyze REDScript compilation errors
      // This would require integration with game launch detection
      
      setModDependencies(Array.from(allDeps));
      
      // For now, show common required dependencies
      const commonDeps = ['archivexl', 'tweakxl', 'redscript', 'red4ext'].map(key => DEPENDENCY_DATABASE[key]);
      setMissingDependencies(commonDeps);
      
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInstallDependency = (dependency) => {
    setSelectedDep(dependency);
  };

  const handleCloseInstructions = () => {
    setSelectedDep(null);
  };

  const checkDependencyStatus = async (dependency) => {
    if (!config.gameInstallPath) return 'unknown';
    
    try {
      const result = await window.electronAPI.checkDependency(dependency, config.gameInstallPath);
      return result.installed ? 'installed' : 'missing';
    } catch (error) {
      console.error('Error checking dependency:', error);
      return 'unknown';
    }
  };

  const refreshDependencyStatuses = async () => {
    if (!config.gameInstallPath) return;
    
    const statuses = {};
    for (const dep of Object.values(DEPENDENCY_DATABASE)) {
      const status = await checkDependencyStatus(dep);
      statuses[dep.name] = status;
    }
    setDependencyStatuses(statuses);
  };

  useEffect(() => {
    refreshDependencyStatuses();
  }, [config.gameInstallPath]);

  const getDependencyStatus = (dependency) => {
    return dependencyStatuses[dependency.name] || 'unknown';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'installed':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'missing':
        return <XCircle className="text-cyber-pink" size={20} />;
      default:
        return <AlertTriangle className="text-cyber-yellow" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'installed':
        return 'Installed';
      case 'missing':
        return 'Missing';
      default:
        return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Framework':
        return 'text-cyber-blue';
      case 'Gameplay':
        return 'text-cyber-yellow';
      default:
        return 'text-gray-400';
    }
  };

  const handleNavigateToDependencies = () => {
    // Focus on the critical dependencies section
    const criticalSection = document.querySelector('[data-section="critical-dependencies"]');
    if (criticalSection) {
      criticalSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-cyber-blue font-cyber">
            Dependency Manager
          </h2>
          <p className="text-gray-400 mt-2">
            Manage mod dependencies and framework requirements
          </p>
        </div>
        
        <button
          onClick={analyzeDependencies}
          disabled={isAnalyzing}
          className="cyber-button flex items-center space-x-2"
        >
          <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
          <span>Analyze</span>
        </button>
      </div>

      {/* REDScript Errors Panel */}
      <RedscriptErrorsPanel 
        config={config} 
        onNavigateToDependencies={handleNavigateToDependencies}
      />

      {/* Critical Dependencies Warning */}
      {missingDependencies.length > 0 && (
        <div 
          className="cyber-border border-cyber-pink bg-cyber-pink bg-opacity-10 p-6 rounded-lg"
          data-section="critical-dependencies"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-cyber-pink mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-cyber-pink mb-2">
                Critical Dependencies Required
              </h3>
              <p className="text-gray-300 mb-4">
                The following dependencies are required for most mods to function properly. 
                Install them before enabling mods to avoid errors.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missingDependencies.map(dep => (
                  <div key={dep.name} className="bg-cyber-dark bg-opacity-50 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-200">{dep.name}</div>
                        <div className="text-sm text-gray-400">{dep.description}</div>
                      </div>
                      <button
                        onClick={() => handleInstallDependency(dep)}
                        className="cyber-button-primary text-sm px-3 py-1"
                      >
                        Install
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Dependencies List */}
      <div className="cyber-border p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-cyber-blue mb-4">
          All Dependencies
        </h3>
        
        <div className="space-y-3">
          {Object.values(DEPENDENCY_DATABASE).map(dep => {
            const status = getDependencyStatus(dep);
            
            return (
              <div key={dep.name} className="flex items-center justify-between p-4 bg-cyber-dark bg-opacity-30 rounded">
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-200">{dep.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(dep.category)}`}>
                        {dep.category}
                      </span>
                      {dep.required && (
                        <span className="text-xs px-2 py-1 bg-cyber-pink bg-opacity-20 text-cyber-pink rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{dep.description}</p>
                    <p className="text-xs text-gray-500">Version: {dep.version}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${
                    status === 'installed' ? 'text-green-400' :
                    status === 'missing' ? 'text-cyber-pink' :
                    'text-cyber-yellow'
                  }`}>
                    {getStatusText(status)}
                  </span>
                  
                  <button
                    onClick={() => handleInstallDependency(dep)}
                    className="cyber-button text-sm px-3 py-1"
                  >
                    Install
                  </button>
                  
                  <a
                    href={dep.nexusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-cyber-blue transition-colors"
                    title="View on NexusMods"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Installation Instructions Modal */}
      {selectedDep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="cyber-border bg-cyber-darker max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-cyber-blue">
                  Install {selectedDep.name}
                </h3>
                <button
                  onClick={handleCloseInstructions}
                  className="text-gray-400 hover:text-cyber-blue"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Dependency Info */}
                <div className="cyber-border p-4 rounded">
                  <h4 className="font-semibold text-cyber-blue mb-2">About</h4>
                  <p className="text-gray-300 mb-2">{selectedDep.description}</p>
                  <p className="text-sm text-gray-400">Required Version: {selectedDep.version}</p>
                </div>

                {/* Quick Download */}
                <div className="cyber-border p-4 rounded">
                  <h4 className="font-semibold text-cyber-blue mb-3">Quick Download</h4>
                  <a
                    href={selectedDep.nexusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-button-primary inline-flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Download from NexusMods</span>
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Installation Instructions */}
                <div className="cyber-border p-4 rounded">
                  <h4 className="font-semibold text-cyber-blue mb-3">Installation Instructions</h4>
                  
                  <div className="space-y-3">
                    {getInstallationInstructions(selectedDep).steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Structure */}
                <div className="cyber-border p-4 rounded">
                  <h4 className="font-semibold text-cyber-blue mb-3">Expected File Structure</h4>
                  <div className="bg-cyber-dark bg-opacity-50 p-3 rounded font-mono text-sm">
                    <div className="text-gray-400 mb-2">Cyberpunk 2077/</div>
                    {selectedDep.folderStructure.map((path, index) => (
                      <div key={index} className="text-gray-300 ml-4">
                        ├── {path}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded">
                  <div className="flex items-start space-x-2">
                    <Info className="text-amber-400 mt-0.5" size={16} />
                    <div className="text-sm text-amber-200">
                      <strong>Important:</strong> Make sure Cyberpunk 2077 is not running during installation. 
                      Restart the game after installing dependencies for changes to take effect.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseInstructions}
                  className="cyber-button"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    refreshDependencyStatuses();
                    onRefresh();
                    handleCloseInstructions();
                  }}
                  className="cyber-button-primary"
                >
                  Refresh After Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyManager;