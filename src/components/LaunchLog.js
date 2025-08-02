import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Trash2, Eye } from 'lucide-react';

const LaunchLog = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // In a real implementation, this would listen to console logs from the main process
    // For now, we'll simulate some logs
    const sampleLogs = [
      { timestamp: new Date(), level: 'info', message: '[LAUNCH] Starting game launch with 3 enabled mods' },
      { timestamp: new Date(), level: 'info', message: '[MERGE] Building merged runtime at: C:\\...\\merged_runtime' },
      { timestamp: new Date(), level: 'info', message: '[MERGE] Processing 3 enabled mods in load order' },
      { timestamp: new Date(), level: 'info', message: '[MERGE] Processing mod 1/3: TestMod' },
      { timestamp: new Date(), level: 'info', message: '[MERGE]   → archive/pc/mod/testmod.archive (2.1 MB)' },
      { timestamp: new Date(), level: 'info', message: '[MERGE]   → r6/scripts/testmod.reds (4.2 KB)' },
      { timestamp: new Date(), level: 'info', message: '[MERGE] - TestMod: 15 files, 2.5 MB' },
      { timestamp: new Date(), level: 'success', message: '[MERGE] Merge complete: 45 files, 12.3 MB total' },
      { timestamp: new Date(), level: 'info', message: '[LAUNCH] Launching game from: C:\\...\\Cyberpunk2077.exe' }
    ];
    
    setLogs(sampleLogs);
  }, []);

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString();
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-cyber-pink';
      case 'warn':
        return 'text-cyber-yellow';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-gray-300';
    }
  };

  const copyLogs = () => {
    const logText = logs
      .map(log => `[${formatTimestamp(log.timestamp)}] ${log.message}`)
      .join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      alert('Logs copied to clipboard');
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="cyber-button text-sm flex items-center space-x-2"
        title="Show Launch Logs"
      >
        <Terminal size={14} />
        <span>Show Logs</span>
      </button>
    );
  }

  return (
    <div className="cyber-border p-4 rounded-lg bg-cyber-dark bg-opacity-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-cyber-blue flex items-center space-x-2">
          <Terminal size={16} />
          <span>Launch Log</span>
        </h4>
        
        <div className="flex space-x-2">
          <button
            onClick={copyLogs}
            className="p-1 text-gray-400 hover:text-cyber-blue"
            title="Copy logs"
          >
            <Copy size={14} />
          </button>
          
          <button
            onClick={clearLogs}
            className="p-1 text-gray-400 hover:text-cyber-pink"
            title="Clear logs"
          >
            <Trash2 size={14} />
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-gray-200"
            title="Hide logs"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
      
      <div className="bg-black bg-opacity-50 p-3 rounded font-mono text-xs max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">No logs yet. Launch the game to see merge activity.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">
                [{formatTimestamp(log.timestamp)}]
              </span>{' '}
              <span className={getLevelColor(log.level)}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
      
      {logs.length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          {logs.length} log entries • Last updated: {formatTimestamp(new Date())}
        </div>
      )}
    </div>
  );
};

export default LaunchLog;