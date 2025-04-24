import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../FileUpload';
import { fileService } from '../../services/fileService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the file service
jest.mock('../../services/fileService', () => ({
  fileService: {
    uploadFile: jest.fn(),
  },
}));

const queryClient = new QueryClient();

describe('FileUpload', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders upload button initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FileUpload onUploadSuccess={() => {}} />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('Select a file')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FileUpload onUploadSuccess={() => {}} />
      </QueryClientProvider>
    );
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  it('shows error when trying to upload without file', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FileUpload onUploadSuccess={() => {}} />
      </QueryClientProvider>
    );
    
    const uploadButton = screen.getByText('Upload File');
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please select a file')).toBeInTheDocument();
    });
  });
}); 