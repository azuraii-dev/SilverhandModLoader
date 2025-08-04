import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, AlertCircle, FolderOpen } from 'lucide-react';

const ModImporter = ({ onImportMod }) => {
  const [importStatus, setImportStatus] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const processFile = async (file, isFromPicker = false) => {
    const fileId = Date.now() + Math.random();
    const fileName = isFromPicker ? file.split(/[\\/]/).pop() : file.name;
    
    // Add file to status list
    setImportStatus(prev => [...prev, {
      id: fileId,
      name: fileName,
      status: 'processing',
      error: null
    }]);

    try {
      let filePath;
      
      if (isFromPicker) {
        // File picker returns string path
        filePath = file;
      } else {
        // Try webUtils first, fallback to buffer method for drag & drop
        filePath = window.electronAPI.getPathForFile(file);
        if (!filePath) {
          console.log('[DEBUG] webUtils failed, using buffer method for:', fileName);
          try {
            // Read file as buffer and send to main process
            const arrayBuffer = await file.arrayBuffer();
            console.log('[DEBUG] Read file buffer, size:', arrayBuffer.byteLength);
            
            const result = await window.electronAPI.importModFromBuffer(fileName, arrayBuffer);
            console.log('[DEBUG] Buffer import successful:', result);
            
            // Update status to success and return
            setImportStatus(prev => prev.map(item =>
              item.id === fileId
                ? { ...item, status: 'success' }
                : item
            ));
            return;
          } catch (bufferError) {
            console.error('[DEBUG] Buffer import failed:', bufferError);
            throw new Error(`Drag & drop import failed: ${bufferError.message}`);
          }
        }
      }
      
      console.log('[DEBUG] Processing file:', { 
        fileName,
        isFromPicker, 
        filePath,
        originalFile: isFromPicker ? 'string path' : file 
      });
      
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

    console.log('[DEBUG] onDrop called with files:', acceptedFiles.map(f => ({
      name: f.name,
      path: f.path,
      webkitRelativePath: f.webkitRelativePath,
      size: f.size,
      type: f.type
    })));

    setIsImporting(true);
    
    try {
      await Promise.all(acceptedFiles.map(file => processFile(file, false)));
    } finally {
      setIsImporting(false);
    }
  }, []);

  const handleBrowseFiles = async () => {
    try {
      setIsImporting(true);
      console.log('[DEBUG] Browse Files clicked - calling selectModFiles');
      const filePaths = await window.electronAPI.selectModFiles();
      console.log('[DEBUG] Selected file paths:', filePaths);
      
      if (filePaths.length > 0) {
        // Use the same processFile method but indicate they're from picker
        await Promise.all(filePaths.map(fileInfo => 
          processFile(fileInfo.path, true)
        ));
      } else {
        console.log('[DEBUG] No files selected');
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      setImportStatus(prev => [...prev, {
        id: Date.now(),
        name: 'File Selection Error',
        status: 'error',
        error: error.message
      }]);
    } finally {
      setIsImporting(false);
    }
  };

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
                <p className="text-gray-400 mb-4">
                  or use the browse button
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Both methods now work in packaged apps! Drag & drop uses secure buffer transfer.
                </p>
                <button
                  onClick={handleBrowseFiles}
                  disabled={isImporting}
                  className="cyber-button inline-flex items-center space-x-2"
                >
                  <FolderOpen size={16} />
                  <span>Browse Files</span>
                </button>
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