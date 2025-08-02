import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ModImporter = ({ onImportMod }) => {
  const [importStatus, setImportStatus] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const processFile = async (file) => {
    const fileId = Date.now() + Math.random();
    
    // Add file to status list
    setImportStatus(prev => [...prev, {
      id: fileId,
      name: file.name,
      status: 'processing',
      error: null
    }]);

    try {
      // In Electron, file.path contains the full system path
      const filePath = file.path || file.name;
      await onImportMod(filePath);
      
      // Update status to success
      setImportStatus(prev => prev.map(item =>
        item.id === fileId
          ? { ...item, status: 'success' }
          : item
      ));
    } catch (error) {
      // Update status to error
      setImportStatus(prev => prev.map(item =>
        item.id === fileId
          ? { ...item, status: 'error', error: error.message }
          : item
      ));
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setIsImporting(true);
    
    try {
      await Promise.all(acceptedFiles.map(processFile));
    } finally {
      setIsImporting(false);
    }
  }, [onImportMod]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    multiple: true
  });

  const clearStatus = () => {
    setImportStatus([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyber-blue" />;
      case 'success':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'error':
        return <XCircle className="text-cyber-pink" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-cyber-blue font-cyber">
          Import Mods
        </h2>
        {importStatus.length > 0 && (
          <button
            onClick={clearStatus}
            className="cyber-button text-sm"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`drop-zone p-12 rounded-lg text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'active' : ''
        } ${
          isDragReject ? 'border-cyber-pink border-opacity-75' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <Upload size={64} className={`mx-auto ${
            isDragActive ? 'text-cyber-blue animate-bounce' : 'text-gray-400'
          }`} />
          
          <div>
            {isDragActive ? (
              <p className="text-cyber-blue text-xl font-semibold">
                Drop your mod files here...
              </p>
            ) : (
              <>
                <p className="text-gray-300 text-xl font-semibold mb-2">
                  Drag and drop mod files here
                </p>
                <p className="text-gray-400">
                  or click to browse for .zip files
                </p>
              </>
            )}
          </div>

          {isDragReject && (
            <div className="flex items-center justify-center space-x-2 text-cyber-pink">
              <AlertCircle size={20} />
              <span>Only .zip files are supported</span>
            </div>
          )}
        </div>
      </div>

      {/* Import Instructions */}
      <div className="cyber-border p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-cyber-blue mb-4">
          Import Instructions
        </h3>
        
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold">Prepare your mod files</p>
              <p className="text-sm text-gray-400">
                Download mod .zip files from NexusMods or other sources
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold">Drag and drop or click to import</p>
              <p className="text-sm text-gray-400">
                The mod loader will automatically extract and validate mod structure
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-cyber-blue text-cyber-dark rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold">Enable and configure</p>
              <p className="text-sm text-gray-400">
                Switch to the Mod Library to enable, disable, and reorder your mods
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Status */}
      {importStatus.length > 0 && (
        <div className="cyber-border p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-cyber-blue mb-4">
            Import Status
          </h3>
          
          <div className="space-y-2">
            {importStatus.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-cyber-dark bg-opacity-30 rounded"
              >
                <div className="flex items-center space-x-3">
                  <File size={16} className="text-gray-400" />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className={`text-sm font-semibold ${
                    item.status === 'success' ? 'text-green-400' :
                    item.status === 'error' ? 'text-cyber-pink' :
                    'text-cyber-blue'
                  }`}>
                    {item.status === 'processing' ? 'Importing...' :
                     item.status === 'success' ? 'Success' :
                     'Error'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Show errors */}
          {importStatus.some(item => item.error) && (
            <div className="mt-4 p-3 bg-cyber-pink bg-opacity-10 border border-cyber-pink rounded">
              <h4 className="font-semibold text-cyber-pink mb-2">Import Errors:</h4>
              {importStatus.filter(item => item.error).map(item => (
                <div key={item.id} className="text-sm text-cyber-pink">
                  {item.name}: {item.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModImporter;