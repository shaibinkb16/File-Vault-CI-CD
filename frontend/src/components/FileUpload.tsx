import React, { useState, useRef, useEffect } from 'react';
import { fileService } from '../services/fileService';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: fileService.uploadFile,
    onSuccess: () => {
      setUploadProgress(100);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        queryClient.invalidateQueries({ queryKey: ['files'] });
        setSelectedFile(null);
        onUploadSuccess();
      }, 1500);
    },
    onError: (error) => {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    },
  });

  // Simulate upload progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (uploadMutation.isPending && uploadProgress < 90) {
      interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [uploadMutation.isPending, uploadProgress]);

  // Reset progress when not uploading
  useEffect(() => {
    if (!uploadMutation.isPending) {
      setUploadProgress(0);
    }
  }, [uploadMutation.isPending]);

  // Generate preview when file selected
  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    } else {
      setFilePreview(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setError(null);
      await uploadMutation.mutateAsync(selectedFile);
    } catch (err) {
      // Error handling is done in onError callback
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileTypeColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'bg-purple-100 text-purple-600 border-purple-200';
    } else if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
      return 'bg-blue-100 text-blue-600 border-blue-200';
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(extension || '')) {
      return 'bg-red-100 text-red-600 border-red-200';
    } else {
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return '🖼️';
    } else if (['pdf'].includes(extension || '')) {
      return '📄';
    } else if (['doc', 'docx', 'txt'].includes(extension || '')) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return '📊';
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return '📑';
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(extension || '')) {
      return '🎬';
    } else if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return '🎵';
    } else {
      return '📁';
    }
  };

  return (
    <motion.div 
      className="p-6 overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <CloudArrowUpIcon className="h-8 w-8 text-indigo-600 mr-3" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900">Upload File</h2>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {showSuccessMessage ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <motion.div 
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckIcon className="h-8 w-8 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">Upload Complete!</h3>
            <p className="text-gray-500">Your file has been successfully uploaded</p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={dropAreaRef}
              className={`relative transition-all duration-300 ${
                isDragging 
                  ? 'bg-indigo-50 border-indigo-300' 
                  : 'bg-gray-50 border-gray-300'
              } border-2 border-dashed rounded-xl px-6 py-10`}
              whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {!selectedFile ? (
                <div className="text-center">
                  <motion.div 
                    className="mx-auto h-20 w-20 text-gray-400 mb-4"
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3,
                      ease: "easeInOut" 
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </motion.div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select a file
                    </motion.button>
                    
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileSelect}
                      disabled={uploadMutation.isPending}
                    />
                    
                    <p className="text-sm text-gray-500">or drop it right here</p>
                    <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-16 w-16 ${getFileTypeColor(selectedFile.name)} rounded-lg flex items-center justify-center mr-4 border`}>
                    {filePreview ? (
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="h-full w-full object-cover rounded" 
                      />
                    ) : (
                      <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={clearSelectedFile}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </motion.button>
                </div>
              )}
            </motion.div>
            
            {error && (
              <motion.div 
                className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <svg className="flex-shrink-0 inline w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <span>{error}</span>
              </motion.div>
            )}
            
            <motion.button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className={`relative w-full py-3 px-6 rounded-lg font-medium shadow-sm transition-all ${
                !selectedFile || uploadMutation.isPending
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              whileHover={selectedFile && !uploadMutation.isPending ? { y: -2, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" } : {}}
              whileTap={selectedFile && !uploadMutation.isPending ? { y: 0, boxShadow: "0 0px 0px rgba(79, 70, 229, 0.3)" } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {uploadMutation.isPending && (
                <motion.div 
                  className="absolute inset-0 overflow-hidden rounded-lg"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ type: "tween", ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 bg-indigo-500 opacity-30"></div>
                </motion.div>
              )}
              <span className="relative flex items-center justify-center">
                {uploadMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                    Upload File
                  </>
                )}
              </span>
            </motion.button>
            
            <motion.div 
              className="text-center text-xs text-gray-400 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              We support most common file formats
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};