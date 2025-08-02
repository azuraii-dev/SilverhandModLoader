import React, { useState } from 'react';
import { Eye, Play, Folder, File, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import LaunchLog from './LaunchLog';

const LaunchPreview = ({ config, enabledMods, mods, onLaunchGame }) => {
  const [previewData, setPreviewData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generatePreview = async () => {
    if (enabledMods.length === 0) {
      alert('No mods enabled. Enable some mods first to see the preview.');
      return;
    }

    setIsGenerating(true);
    try {
      // Get preview of what will be merged
      const preview = await window.electronAPI.generateLaunchPreview(enabledMods);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert(`Error generating preview: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const openMergedRuntime = async () => {
    try {
      await window.electronAPI.openMergedRuntimeFolder();
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  const getFileTypeIcon = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase();
    switch (ext) {
      case 'archive':
        return '📦';
      case 'reds':
        return '🔴';
      case 'lua':
        return '🌙';
      case 'dll':
        return '⚙️';
      case 'yaml':
      case 'tweak':
        return '🔧';
      default:
        return '📄';
    }
  };

  const getFileCategory = (filePath) => {
    if (filePath.includes('archive/')) return 'Archive Files';
    if (filePath.includes('r6/scripts/')) return 'REDScript Files';
    if (filePath.includes('red4ext/')) return 'RED4ext Plugins';
    if (filePath.includes('cyber_engine_tweaks/')) return 'CET Mods';
    if (filePath.includes('engine/')) return 'Engine Files';
    return 'Other Files';
  };

  if (!showPreview) {
    return (
      <div className="cyber-border p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-cyber-blue flex items-center space-x-2">
              <Eye size={20} />
              <span>Launch Preview</span>
            </h3>
            <p className="text-gray-400 text-sm">
              See exactly what files will be merged before launching the game
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={openMergedRuntime}
              className="cyber-button text-sm flex items-center space-x-2"
            >
              <Folder size={14} />
              <span>Open Merged Folder</span>
            </button>
            
            <button
              onClick={generatePreview}
              disabled={isGenerating || enabledMods.length === 0}
              className="cyber-button-primary flex items-center space-x-2"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Eye size={16} />
              )}
              <span>Preview Launch</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cyber-dark bg-opacity-30 p-4 rounded text-center">
            <div className="text-2xl font-bold text-cyber-blue">{enabledMods.length}</div>
            <div className="text-sm text-gray-400">Enabled Mods</div>
          </div>
          
          <div className="bg-cyber-dark bg-opacity-30 p-4 rounded text-center">
            <div className="text-2xl font-bold text-cyber-yellow">?</div>
            <div className="text-sm text-gray-400">Files to Merge</div>
          </div>
          
          <div className="bg-cyber-dark bg-opacity-30 p-4 rounded text-center">
            <div className="text-2xl font-bold text-cyber-pink">?</div>
            <div className="text-sm text-gray-400">Potential Conflicts</div>
          </div>
        </div>

        {enabledMods.length === 0 && (
          <div className="mt-4 p-3 bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-amber-400" size={16} />
              <span className="text-amber-200 text-sm">
                No mods enabled. Enable some mods to generate a preview.
              </span>
            </div>
          </div>
        )}

        {/* Launch Log */}
        <div className="mt-4">
          <LaunchLog />
        </div>
      </div>
    );
  }

  // Group files by category
  const filesByCategory = {};
  previewData?.files?.forEach(file => {
    const category = getFileCategory(file.path);
    if (!filesByCategory[category]) {
      filesByCategory[category] = [];
    }
    filesByCategory[category].push(file);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-border p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cyber-blue flex items-center space-x-2">
            <Eye size={20} />
            <span>Launch Preview - Merged Files</span>
          </h3>
          
          <div className="flex space-x-2">
            <button
              onClick={openMergedRuntime}
              className="cyber-button text-sm flex items-center space-x-2"
            >
              <ExternalLink size={14} />
              <span>Open in Explorer</span>
            </button>
            
            <button
              onClick={() => setShowPreview(false)}
              className="cyber-button text-sm"
            >
              Close Preview
            </button>
            
            <button
              onClick={onLaunchGame}
              className="cyber-button-primary flex items-center space-x-2"
            >
              <Play size={16} />
              <span>Launch Game</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-cyber-dark bg-opacity-30 p-4 rounded text-center">
            <div className="text-2xl font-bold text-cyber-blue">{previewData?.totalFiles || 0}</div>
            <div className="text-sm text-gray-400">Total Files</div>
          </div>
          
          <div className="bg-cyber-dark bg-opacity-30 p-4 rounded text-center">
            <div className="text-2xl font-bold text-green-400">{enabledMods.length}</div>
            <div className="text-sm text-gray-400">Active Mods</div>
          </div>
          
          <div className="bg-cyber-dark bg-opacity-30 p-4 rounded text-center">
            <div className="text-2xl font-bold text-cyber-pink">{previewData?.conflicts || 0}</div>
            <div className="text-sm text-gray-400">Conflicts</div>
          </div>
          
          <div className="bg-cyber-dark bg-opacity-30 p-4 rounded text-center">
            <div className="text-2xl font-bold text-cyber-yellow">{previewData?.totalSizeMB || 0}MB</div>
            <div className="text-sm text-gray-400">Total Size</div>
          </div>
        </div>

        {/* Merge Path */}
        <div className="p-3 bg-cyber-blue bg-opacity-10 border border-cyber-blue border-opacity-30 rounded">
          <div className="text-sm text-cyber-blue font-semibold mb-1">Merge Location:</div>
          <div className="font-mono text-xs text-gray-300">{previewData?.mergedPath}</div>
        </div>
      </div>

      {/* Files by Category */}
      <div className="space-y-4">
        {Object.entries(filesByCategory).map(([category, files]) => (
          <div key={category} className="cyber-border p-4 rounded-lg">
            <h4 className="font-semibold text-gray-200 mb-3 flex items-center space-x-2">
              <span>{getFileTypeIcon(files[0]?.path)}</span>
              <span>{category}</span>
              <span className="text-sm text-gray-400">({files.length} files)</span>
            </h4>
            
            <div className="space-y-2">
              {files.slice(0, 10).map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-cyber-dark bg-opacity-30 rounded text-sm">
                  <div className="flex items-center space-x-3">
                    <File size={14} className="text-gray-400" />
                    <span className="font-mono text-gray-300">{file.path}</span>
                    {file.conflict && (
                      <AlertTriangle size={14} className="text-cyber-pink" title="File conflict detected" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-400">from</span>
                    <span className="text-cyber-blue">{file.sourceMod}</span>
                    {file.size && (
                      <span className="text-gray-500">({file.size})</span>
                    )}
                  </div>
                </div>
              ))}
              
              {files.length > 10 && (
                <div className="text-center text-gray-400 text-sm">
                  ... and {files.length - 10} more files
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load Order */}
      <div className="cyber-border p-4 rounded-lg">
        <h4 className="font-semibold text-gray-200 mb-3">Mod Load Order (Files from later mods override earlier ones)</h4>
        <div className="space-y-2">
          {enabledMods.map((modId, index) => {
            const mod = mods.find(m => m.id === modId);
            return (
              <div key={modId} className="flex items-center space-x-3 p-2 bg-cyber-dark bg-opacity-30 rounded">
                <div className="w-6 h-6 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-gray-300">{mod?.name || modId}</span>
                <CheckCircle size={16} className="text-green-400" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Conflicts Warning */}
      {previewData?.conflicts > 0 && (
        <div className="cyber-border border-cyber-pink bg-cyber-pink bg-opacity-10 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-cyber-pink mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-cyber-pink mb-2">File Conflicts Detected</h4>
              <p className="text-gray-300 text-sm">
                Multiple mods are trying to modify the same files. The mod loaded last (highest number) will take precedence.
                Review the load order if this isn't what you want.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchPreview;