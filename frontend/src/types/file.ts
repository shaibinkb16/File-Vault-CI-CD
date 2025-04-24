export interface File {
  id: string;
  file: string;
  original_filename: string;
  file_type: string;
  display_file_type: string;
  size: number;
  uploaded_at: string;
  reference_count: number;
  storage_saved: number;
} 