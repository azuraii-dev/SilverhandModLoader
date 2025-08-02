import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Terminal, Folder } from 'lucide-react';

const TroubleshootingPanel = ({ config }) => {
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);

  const runDiagnostics = async () => {
    setIsTesting(true);
    const results = {};

    // Test 1: Check if IPC handlers are available
    try {
      if (window.electronAPI && window.electronAPI.getAppInfo) {
        const appInfo = await window.electronAPI.getAppInfo();
        results.ipcHandlers = { status: 'success', message: 'IPC handlers available', data: appInfo };
      } else {
        results.ipcHandlers = { status: 'error', message: 'IPC handlers not available - restart app' };
      }
    } catch (error) {
      results.ipcHandlers = { status: 'error', message: `IPC test failed: ${error.message}` };
    }

    // Test 2: Check folder opening functionality
    try {
      if (window.electronAPI && window.electronAPI.openMergedRuntimeFolder) {
        results.folderOps = { status: 'success', message: 'Folder operations available' };
      } else {
        results.folderOps = { status: 'error', message: 'Folder operations not available' };
      }
    } catch (error) {
      results.folderOps = { status: 'error', message: `Folder test failed: ${error.message}` };
    }

    // Test 3: Check launch preview functionality
    try {
      if (window.electronAPI && window.electronAPI.generateLaunchPreview) {
        results.launchPreview = { status: 'success', message: 'Launch preview available' };
      } else {
        results.launchPreview = { status: 'error', message: 'Launch preview not available' };
      }
    } catch (error) {
      results.launchPreview = { status: 'error', message: `Launch preview test failed: ${error.message}` };
    }

    // Test 4: Check game path
    if (config.gameInstallPath) {
      results.gamePath = { status: 'success', message: `Game path configured: ${config.gameInstallPath}` };
    } else {
      results.gamePath = { status: 'warning', message: 'Game path not configured' };
    }

    // Test 5: Check Node.js environment
    try {
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Electron')) {
        results.environment = { status: 'success', message: 'Running in Electron environment' };
      } else {
        results.environment = { status: 'warning', message: 'Not running in Electron - some features may not work' };
      }
    } catch (error) {
      results.environment = { status: 'error', message: `Environment check failed: ${error.message}` };
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-cyber-yellow" size={16} />;
      case 'error':
        return <XCircle className="text-cyber-pink" size={16} />;
      default:
        return <RefreshCw className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-cyber-yellow';
      case 'error':
        return 'text-cyber-pink';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="cyber-border p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cyber-blue flex items-center space-x-2">
          <Terminal size={20} />
          <span>Troubleshooting</span>
        </h3>
        
        <button
          onClick={runDiagnostics}
          disabled={isTesting}
          className="cyber-button flex items-center space-x-2"
        >
          <RefreshCw size={16} className={isTesting ? 'animate-spin' : ''} />
          <span>Run Diagnostics</span>
        </button>
      </div>

      {Object.keys(testResults).length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Terminal size={48} className="mx-auto mb-4 opacity-50" />
          <p>Click "Run Diagnostics" to test application functionality</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="flex items-start space-x-3 p-3 bg-cyber-dark bg-opacity-30 rounded">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-semibold text-gray-200 capitalize">
                  {testName.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className={`text-sm ${getStatusColor(result.status)}`}>
                  {result.message}
                </div>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Show details</summary>
                    <pre className="text-xs text-gray-500 mt-1 p-2 bg-black bg-opacity-50 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Common Issues */}
      <div className="mt-6 p-4 bg-cyber-blue bg-opacity-10 border border-cyber-blue border-opacity-30 rounded">
        <h4 className="font-semibold text-cyber-blue mb-2">Common Issues & Solutions</h4>
        <div className="space-y-2 text-sm text-gray-300">
          <div>
            <strong>• "No handler registered" errors:</strong> Restart the Electron app completely (Ctrl+C then npm run electron-dev)
          </div>
          <div>
            <strong>• Folders not opening:</strong> Make sure you're running in Electron, not a browser
          </div>
          <div>
            <strong>• Functions not available:</strong> Check that you restarted the app after code changes
          </div>
          <div>
            <strong>• Preview not working:</strong> Ensure you have mods enabled and paths configured
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            if (window.electronAPI && window.electronAPI.openMergedRuntimeFolder) {
              window.electronAPI.openMergedRuntimeFolder().catch(console.error);
            } else {
              alert('Folder operations not available. Please restart the application.');
            }
          }}
          className="cyber-button text-sm flex items-center space-x-2"
        >
          <Folder size={14} />
          <span>Test Open Merged Folder</span>
        </button>
        
        <button
          onClick={() => {
            if (window.electronAPI && window.electronAPI.getAppInfo) {
              window.electronAPI.getAppInfo().then(info => {
                alert(`App Info: ${JSON.stringify(info, null, 2)}`);
              }).catch(console.error);
            } else {
              alert('IPC not available. Please restart the application.');
            }
          }}
          className="cyber-button text-sm flex items-center space-x-2"
        >
          <Terminal size={14} />
          <span>Test IPC</span>
        </button>
      </div>
    </div>
  );
};

export default TroubleshootingPanel;