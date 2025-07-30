/**
 * Main upload page for the intake app.
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { UploadForm } from '@/components/forms/UploadForm';
import { SuccessPage } from './SuccessPage';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const UploadPage: React.FC = () => {
  const [uploadSuccess, setUploadSuccess] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSuccess = (response: any) => {
    setUploadSuccess(response);
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(null);
  };

  const handleStartNewUpload = () => {
    setUploadSuccess(null);
    setUploadError(null);
  };

  if (uploadSuccess) {
    return (
      <QueryClientProvider client={queryClient}>
        <SuccessPage 
          uploadResponse={uploadSuccess}
          onStartNewUpload={handleStartNewUpload}
        />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Marketing Research Intake
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your research files with comprehensive metadata for proper organization and future discoverability.
            </p>
          </div>

          {/* Error Display */}
          {uploadError && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Upload Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {uploadError}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <UploadForm 
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          />

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-gray-500">
            <p>
              Files are securely stored in Databricks Volumes with comprehensive metadata tracking.
            </p>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};