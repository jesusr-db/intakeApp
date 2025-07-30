/**
 * Success page shown after successful file upload.
 */

import React from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SuccessPageProps {
  uploadResponse: {
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
    research_metadata: {
      project_name: string;
      hypothesis: string;
      data_source: string;
      collection_method: string;
      experiment_id?: string;
      research_phase?: string;
      privacy_level?: string;
    };
    technical_metadata: {
      workflow_type: string;
      processing_requirements: string[];
    };
    metadata_file_path: string;
  };
  onStartNewUpload: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ 
  uploadResponse, 
  onStartNewUpload 
}) => {
  const { upload_info, research_metadata, technical_metadata } = uploadResponse;
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), 'PPpp');
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your file has been successfully uploaded and processed.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                File Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Original Filename</label>
                  <p className="text-gray-900">{upload_info.original_filename}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">File Size</label>
                  <p className="text-gray-900">{formatFileSize(upload_info.file_size_bytes)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">File Format</label>
                  <p className="text-gray-900 uppercase">{upload_info.file_format}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Upload Time</label>
                  <p className="text-gray-900">{formatTimestamp(upload_info.timestamp)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Storage Location</label>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded font-mono break-all">
                  {upload_info.file_path}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Stored Filename</label>
                <p className="text-sm text-gray-700">{upload_info.stored_filename}</p>
              </div>
            </CardContent>
          </Card>

          {/* Research Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Research Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Project Name</label>
                <p className="text-gray-900 font-medium">{research_metadata.project_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Research Hypothesis</label>
                <p className="text-gray-900">{research_metadata.hypothesis}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Source</label>
                  <p className="text-gray-900">{research_metadata.data_source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Collection Method</label>
                  <p className="text-gray-900">{research_metadata.collection_method}</p>
                </div>
                {research_metadata.experiment_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experiment ID</label>
                    <p className="text-gray-900">{research_metadata.experiment_id}</p>
                  </div>
                )}
                {research_metadata.research_phase && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Research Phase</label>
                    <p className="text-gray-900 capitalize">{research_metadata.research_phase.replace('_', ' ')}</p>
                  </div>
                )}
                {research_metadata.privacy_level && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Privacy Level</label>
                    <Badge variant={research_metadata.privacy_level === 'confidential' ? 'destructive' : 'secondary'}>
                      {research_metadata.privacy_level}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                File Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">File Format</label>
                <Badge className="ml-2">{technical_metadata.workflow_type.toUpperCase()}</Badge>
              </div>
              {technical_metadata.processing_requirements.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Processing Requirements</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {technical_metadata.processing_requirements.map((req, index) => (
                      <Badge key={index} variant="outline">
                        {req.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata File Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Metadata File
              </CardTitle>
              <CardDescription>
                A JSON file containing all metadata has been saved alongside your uploaded file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded font-mono break-all">
                {uploadResponse.metadata_file_path}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <Button onClick={onStartNewUpload} size="lg">
              Upload Another File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};