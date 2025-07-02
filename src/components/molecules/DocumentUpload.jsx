import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const DocumentUpload = ({ 
  label, 
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = false,
  required = false,
  value = [],
  onChange,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      const isValidType = accept.split(',').some(type => 
        file.type.includes(type.replace('.', '').replace('*', '')) ||
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      const isValidSize = file.size <= maxSize;
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      setUploading(true);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileObjects = validFiles.map(file => ({
        Id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      }));

      const newFiles = multiple ? [...value, ...fileObjects] : fileObjects;
      onChange(newFiles);
      setUploading(false);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = value.filter(file => file.Id !== fileId);
    onChange(updatedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return 'FileText';
    if (file.type.includes('image')) return 'Image';
    return 'File';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          upload-zone
          ${dragOver ? 'dragover' : ''}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <ApperIcon name="Loader2" className="h-12 w-12 text-primary-500 animate-spin" />
          ) : (
            <ApperIcon name="Upload" className="h-12 w-12 text-gray-400" />
          )}
          
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports: {accept.replace(/\./g, '').toUpperCase()} • Max size: {formatFileSize(maxSize)}
            </p>
          </div>

          <Button variant="secondary" size="md" icon="FolderOpen" disabled={uploading}>
            Choose Files
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {value.map((file) => (
              <motion.div
                key={file.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <ApperIcon name={getFileIcon(file)} className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Eye"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.url, '_blank');
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.Id);
                    }}
                    className="text-error hover:text-error hover:bg-error/10"
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentUpload;