/**
 * Custom hook for handling file uploads with React Query.
 */

import { useMutation, useQuery } from '@tanstack/react-query';

// Types for the upload functionality
export interface FormOptions {
  workflow_types: Array<{ value: string; label: string }>;
  research_phases: Array<{ value: string; label: string }>;
  privacy_levels: Array<{ value: string; label: string }>;
  processing_requirements: Array<{ value: string; label: string }>;
}

export interface UploadFormData {
  // Required fields
  project_name: string;
  hypothesis: string;
  data_source: string;
  collection_method: string;
  workflow_type: string;
  
  // Optional fields
  experiment_id?: string;
  date_range_start?: string;
  date_range_end?: string;
  research_phase?: string;
  privacy_level?: string;
  processing_requirements?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  upload_info: {
    timestamp: string;
    uploader: string;
    original_filename: string;
    stored_filename: string;
    file_path: string;
    file_size_bytes: number;
    file_format: string;
  };
  research_metadata: any;
  technical_metadata: any;
  metadata_file_path: string;
}

// API functions
const fetchFormOptions = async (): Promise<FormOptions> => {
  const response = await fetch('/api/upload/options');
  if (!response.ok) {
    throw new Error('Failed to fetch form options');
  }
  return response.json();
};

const uploadFile = async (data: { file: File; formData: UploadFormData }): Promise<UploadResponse> => {
  const formData = new FormData();
  
  // Add file
  formData.append('file', data.file);
  
  // Add form fields
  Object.entries(data.formData).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });
  
  const response = await fetch('/api/upload/', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Upload failed');
  }
  
  return response.json();
};

// Custom hooks
export const useFormOptions = () => {
  return useQuery({
    queryKey: ['formOptions'],
    queryFn: fetchFormOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFileUpload = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};