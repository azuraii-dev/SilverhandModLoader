import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, FileX, Layers } from 'lucide-react';

const ConflictDetector = ({ conflicts, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className={`cyber-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-cyber-pink bg-opacity-10 border-b border-cyber-pink border-opacity-30 flex items-center justify-between hover:bg-opacity-20 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-cyber-pink" size={20} />
          <div className="text-left">
            <h3 className="font-semibold text-cyber-pink">
              Mod Conflicts Detected
            </h3>
            <p className="text-sm text-gray-300">
              {conflicts.length} file conflict{conflicts.length !== 1 ? 's' : ''} found between enabled mods
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-cyber-pink font-semibold">
            {conflicts.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="text-cyber-pink" size={20} />
          ) : (
            <ChevronRight className="text-cyber-pink" size={20} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-300">
            The following files are modified by multiple mods. The mod loaded last 
            (bottom of the list) will take precedence.
          </div>

          <div className="space-y-3">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className="bg-cyber-dark bg-opacity-30 rounded p-3 border border-cyber-pink border-opacity-30"
              >
                <div className="flex items-start space-x-3">
                  <FileX className="text-cyber-pink mt-0.5" size={16} />
                  <div className="flex-1">
                    <div className="font-mono text-sm text-gray-200 mb-2">
                      {conflict.file}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Layers size={14} className="text-gray-400" />
                      <span className="text-gray-400">Conflicting mods:</span>
                    </div>
                    
                    <div className="mt-1 space-y-1">
                      {conflict.mods.map((modId, modIndex) => (
                        <div
                          key={modIndex}
                          className={`text-sm pl-4 ${
                            modIndex === conflict.mods.length - 1
                              ? 'text-cyber-yellow font-semibold'
                              : 'text-gray-400'
                          }`}
                        >
                          {modIndex + 1}. {modId}
                          {modIndex === conflict.mods.length - 1 && (
                            <span className="ml-2 text-xs">(will be used)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resolution Tips */}
          <div className="p-3 bg-cyber-blue bg-opacity-10 rounded border border-cyber-blue border-opacity-30">
            <h4 className="font-semibold text-cyber-blue mb-2 text-sm">
              Resolution Tips:
            </h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Reorder mods in the Mod Library to change which mod takes precedence</li>
              <li>• Disable conflicting mods if they're not essential</li>
              <li>• Check mod documentation for compatibility patches</li>
              <li>• Contact mod authors about creating compatibility patches</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictDetector;