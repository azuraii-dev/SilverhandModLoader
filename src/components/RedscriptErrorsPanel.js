import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink, Package, Code } from 'lucide-react';
import { detectMissingDependencies, DEPENDENCY_DATABASE } from '../utils/dependencyDatabase';

const RedscriptErrorsPanel = ({ config, onNavigateToDependencies }) => {
  const [errors, setErrors] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedDependencies, setDetectedDependencies] = useState([]);

  useEffect(() => {
    scanForErrors();
  }, []);

  const scanForErrors = async () => {
    setIsScanning(true);
    try {
      // TODO: Implement actual REDScript log scanning
      // For now, simulate some common errors based on the user's screenshot
      const mockErrors = [
        {
          type: 'compilation_failed',
          message: 'REDScript compilation has failed.',
          details: 'This error has been caused by mods listed below:',
          affectedMods: ['TestMods', 'VirtualCarDealer', 'nsx'],
          recommendations: [
            "Lizzie's Braindances depends on archiveXL but you don't have it installed. Try to (re)install it and make sure that you have red4ext\\plugins\\ArchiveXL\\ folder.",
            "Virtual Car Dealer depends on Codeware but you don't have it installed. Try to (re)install it and make sure that you have red4ext\\plugins\\Codeware\\ folder.",
            "Lizzie's Braindances depends on TweakXL but you don't have it installed. Try to (re)install it and make sure that you have red4ext\\plugins\\TweakXL\\ folder.",
            "Virtual Car Dealer depends on TweakXL but you don't have it installed. Try to (re)install it and make sure that you have red4ext\\plugins\\TweakXL\\ folder."
          ]
        }
      ];

      setErrors(mockErrors);

      // Detect missing dependencies from error messages
      const errorText = mockErrors.map(e => e.recommendations.join('\n')).join('\n');
      const missingDeps = detectMissingDependencies(errorText);
      setDetectedDependencies(missingDeps);

    } catch (error) {
      console.error('Error scanning for REDScript errors:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getErrorTypeIcon = (type) => {
    switch (type) {
      case 'compilation_failed':
        return <AlertTriangle className="text-cyber-pink" size={20} />;
      default:
        return <Code className="text-cyber-yellow" size={20} />;
    }
  };

  const getDependencyFromError = (recommendation) => {
    const patterns = [
      { pattern: /archiveXL/i, dep: 'archivexl' },
      { pattern: /TweakXL/i, dep: 'tweakxl' },
      { pattern: /Codeware/i, dep: 'codeware' },
      { pattern: /VirtualCarDealer/i, dep: 'virtual_car_dealer' }
    ];

    for (const { pattern, dep } of patterns) {
      if (pattern.test(recommendation)) {
        return DEPENDENCY_DATABASE[dep];
      }
    }
    return null;
  };

  if (errors.length === 0 && !isScanning) {
    return (
      <div className="cyber-border p-6 rounded-lg bg-green-500 bg-opacity-10 border-green-500 border-opacity-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-green-900 font-bold">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-green-400">No REDScript Errors</h3>
            <p className="text-green-300 text-sm">All mods are compiling successfully!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyber-pink flex items-center space-x-2">
          <AlertTriangle size={20} />
          <span>REDScript Compilation Errors</span>
        </h3>
        
        <button
          onClick={scanForErrors}
          disabled={isScanning}
          className="cyber-button text-sm flex items-center space-x-2"
        >
          <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
          <span>Scan Logs</span>
        </button>
      </div>

      {/* Quick Fix for Missing Dependencies */}
      {detectedDependencies.length > 0 && (
        <div className="cyber-border border-cyber-blue bg-cyber-blue bg-opacity-10 p-4 rounded">
          <h4 className="font-semibold text-cyber-blue mb-2">Quick Fix Available</h4>
          <p className="text-gray-300 text-sm mb-3">
            Missing dependencies detected. Install these to resolve most errors:
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {detectedDependencies.map(dep => (
              <span key={dep.name} className="px-2 py-1 bg-cyber-blue bg-opacity-20 text-cyber-blue text-xs rounded">
                {dep.name}
              </span>
            ))}
          </div>
          
          <button
            onClick={onNavigateToDependencies}
            className="cyber-button-primary text-sm flex items-center space-x-2"
          >
            <Package size={14} />
            <span>Install Dependencies</span>
          </button>
        </div>
      )}

      {/* Error Details */}
      {errors.map((error, index) => (
        <div key={index} className="cyber-border border-cyber-pink bg-cyber-pink bg-opacity-10 p-4 rounded">
          <div className="flex items-start space-x-3 mb-3">
            {getErrorTypeIcon(error.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-cyber-pink">{error.message}</h4>
              {error.details && (
                <p className="text-gray-300 text-sm mt-1">{error.details}</p>
              )}
            </div>
          </div>

          {error.affectedMods && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-300 mb-1">Affected Mods:</h5>
              <div className="flex flex-wrap gap-1">
                {error.affectedMods.map(mod => (
                  <span key={mod} className="px-2 py-1 bg-cyber-dark bg-opacity-50 text-gray-300 text-xs rounded">
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error.recommendations && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-300">Solutions:</h5>
              {error.recommendations.map((rec, recIndex) => {
                const dependency = getDependencyFromError(rec);
                return (
                  <div key={recIndex} className="bg-cyber-dark bg-opacity-30 p-3 rounded">
                    <p className="text-gray-300 text-sm mb-2">{rec}</p>
                    
                    {dependency && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Quick action:</span>
                        <a
                          href={dependency.nexusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cyber-button text-xs px-2 py-1 flex items-center space-x-1"
                        >
                          <span>Download {dependency.name}</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="p-3 bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="text-amber-400 mt-0.5" size={16} />
          <div className="text-sm text-amber-200">
            <strong>Note:</strong> The game will start but no scripts will take effect. 
            Install the missing dependencies and restart the game to resolve these errors.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedscriptErrorsPanel;