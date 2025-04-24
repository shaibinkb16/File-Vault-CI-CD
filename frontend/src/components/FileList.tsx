import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatFileSize, formatDate } from '../utils/formatters';
import { fileService } from '../services/fileService';
import { File } from '../types/file';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchParams {
  search: string;
  type: string;
  sortBy: keyof File;
  sortOrder: 'asc' | 'desc';
}

const FileList: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    search: '',
    type: '',
    sortBy: 'uploaded_at',
    sortOrder: 'desc'
  });

  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filterRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => fileService.getFiles()
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    }
  });

  // Handle clicks outside the filter panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (files) {
      let result = [...files];
      
      // Apply search filter
      if (searchParams.search) {
        result = result.filter(file => 
          file.original_filename.toLowerCase().includes(searchParams.search.toLowerCase())
        );
      }
      
      // Apply type filter
      if (searchParams.type) {
        result = result.filter(file => 
          file.file_type.includes(searchParams.type))
      }
      
      // Apply sorting
      result.sort((a, b) => {
        const aValue = a[searchParams.sortBy];
        const bValue = b[searchParams.sortBy];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (searchParams.sortBy === 'uploaded_at') {
            return searchParams.sortOrder === 'asc'
              ? new Date(aValue).getTime() - new Date(bValue).getTime()
              : new Date(bValue).getTime() - new Date(aValue).getTime();
          }
          return searchParams.sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return searchParams.sortOrder === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        return 0;
      });
      
      setFilteredFiles(result);
    }
  }, [files, searchParams]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteMutation.mutateAsync(fileId);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('image')) return '📷';
    if (fileType.includes('document') || fileType.includes('pdf')) return '📄';
    if (fileType.includes('video')) return '🎬';
    return '📁';
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('image')) return 'bg-purple-100 text-purple-700';
    if (fileType.includes('document') || fileType.includes('pdf')) return 'bg-blue-100 text-blue-700';
    if (fileType.includes('video')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoading) return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your files...</p>
      </div>
    </div>
  );

  const fileCounter = (
    <motion.div 
      className="mb-2 text-sm text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Showing {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
      {searchParams.search && ` matching "${searchParams.search}"`}
      {searchParams.type && ` of type "${searchParams.type}"`}
    </motion.div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <motion.div 
        className="mb-6 flex flex-col"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">File Manager</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setView('grid')}
              className={`rounded p-2 ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setView('list')}
              className={`rounded p-2 ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              List
            </button>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="ml-2 flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <span className="mr-2">Filter</span>
              <svg 
                className={`h-4 w-4 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              placeholder="Search files..."
              value={searchParams.search}
              onChange={handleSearch}
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              ref={filterRef}
              className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">File Type</label>
                  <select
                    name="type"
                    value={searchParams.type}
                    onChange={handleSearch}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Types</option>
                    <option value="image">Images</option>
                    <option value="document">Documents</option>
                    <option value="video">Videos</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
                  <select
                    name="sortBy"
                    value={searchParams.sortBy}
                    onChange={handleSearch}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="uploaded_at">Upload Date</option>
                    <option value="original_filename">Name</option>
                    <option value="size">Size</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sort Order</label>
                  <select
                    name="sortOrder"
                    value={searchParams.sortOrder}
                    onChange={handleSearch}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {fileCounter}
      </motion.div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFile(null)}
          >
            <motion.div 
              className="max-h-full max-w-4xl overflow-auto rounded-lg bg-white p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedFile.original_filename}</h3>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Size: {formatFileSize(selectedFile.size)}</p>
                    <p className="text-sm text-gray-600">Type: {selectedFile.display_file_type}</p>
                    <p className="text-sm text-gray-600">Uploaded: {formatDate(selectedFile.uploaded_at)}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <a
                      href={selectedFile.file}
                      download
                      className="flex items-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(selectedFile.id)}
                      className="flex items-center rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                {selectedFile.file_type.includes('image') ? (
                  <img src={selectedFile.file} alt={selectedFile.original_filename} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-center">
                    <div className="mb-2 text-4xl">{getFileTypeIcon(selectedFile.file_type)}</div>
                    <div className="text-gray-500">{selectedFile.file_type}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Display Area */}
      {filteredFiles.length > 0 ? (
        view === 'grid' ? (
          <motion.div 
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div 
                  className="relative h-40 cursor-pointer bg-gray-50"
                  onClick={() => setSelectedFile(file)}
                >
                  {file.file_type.includes('image') ? (
                    <img 
                      src={file.file} 
                      alt={file.original_filename} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl">{getFileTypeIcon(file.file_type)}</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex space-x-1">
                      <a
                        href={file.file}
                        download
                        onClick={e => e.stopPropagation()}
                        className="rounded bg-white bg-opacity-20 p-1 text-white backdrop-blur-sm hover:bg-opacity-30"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.id);
                        }}
                        className="rounded bg-white bg-opacity-20 p-1 text-white backdrop-blur-sm hover:bg-opacity-30"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="truncate font-medium text-gray-800" title={file.original_filename}>
                      {file.original_filename}
                    </h3>
                    <span className={`ml-2 rounded-full px-2 py-1 text-xs ${getFileTypeColor(file.file_type)}`}>
                      {file.display_file_type.split('/')[1] || file.display_file_type}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.uploaded_at)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">File</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Uploaded</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <AnimatePresence>
                  {filteredFiles.map((file, index) => (
                    <motion.tr 
                      key={file.id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <span className="text-xl">{getFileTypeIcon(file.file_type)}</span>
                          </div>
                          <div className="cursor-pointer font-medium text-gray-900 hover:text-blue-600" onClick={() => setSelectedFile(file)}>
                            {file.original_filename}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs ${getFileTypeColor(file.file_type)}`}>
                          {file.display_file_type.split('/')[1] || file.display_file_type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(file.uploaded_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <a
                            href={file.file}
                            download
                            className="rounded bg-blue-100 p-1 text-blue-600 hover:bg-blue-200"
                            title="Download"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="rounded bg-red-100 p-1 text-red-600 hover:bg-red-200"
                            title="Delete"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )
      ) : (
        <motion.div 
          className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mb-1 text-lg font-medium text-gray-900">No files found</h3>
          <p className="text-sm text-gray-500">
            {searchParams.search || searchParams.type ? 
              'Try changing your search or filter criteria' : 
              'Upload some files to get started'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FileList;