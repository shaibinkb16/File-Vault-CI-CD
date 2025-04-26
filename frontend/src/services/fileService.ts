import axios from 'axios';
import { File } from '../types/file';

interface SearchParams {
  name?: string;
  type?: string;
  sizeMin?: string;
  sizeMax?: string;
}

const API_URL = 'http://65.2.168.38:8001/api';

export const fileService = {
  async uploadFile(file: globalThis.File): Promise<File> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getFiles(params?: SearchParams): Promise<File[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.name) queryParams.append('search', params.name);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.sizeMin) queryParams.append('size_min', params.sizeMin);
    if (params?.sizeMax) queryParams.append('size_max', params.sizeMax);
    
    const url = params && (params.name || params.type || params.sizeMin || params.sizeMax)
      ? `${API_URL}/files/search/?${queryParams.toString()}`
      : `${API_URL}/files/`;
    
    const response = await axios.get(url);
    return response.data;
  },

  async deleteFile(id: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${id}/`);
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },

  async searchFiles(params: SearchParams): Promise<File[]> {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('name', params.name);
    if (params.type) queryParams.append('type', params.type);
    if (params.sizeMin) queryParams.append('size_min', params.sizeMin);
    if (params.sizeMax) queryParams.append('size_max', params.sizeMax);
    
    const response = await axios.get(`${API_URL}/files/search/?${queryParams.toString()}`);
    return response.data;
  }
}; 