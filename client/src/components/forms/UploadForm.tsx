/**
 * Main upload form component for the intake app.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

import { useFileUpload, useFormOptions, UploadFormData } from '@/hooks/useUpload';
import { FileInput } from './FileInput';

// Form validation schema
const uploadSchema = z.object({
  // Required fields
  project_name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  hypothesis: z.string().min(1, 'Research hypothesis is required').max(1000, 'Hypothesis too long'),
  data_source: z.string().min(1, 'Data source is required').max(200, 'Data source too long'),
  collection_method: z.string().min(1, 'Collection method is required').max(200, 'Collection method too long'),
  workflow_type: z.string().min(1, 'Workflow type is required'),
  
  // Optional fields
  experiment_id: z.string().max(100, 'Experiment ID too long').optional(),
  date_range_start: z.string().optional(),
  date_range_end: z.string().optional(),
  research_phase: z.string().optional(),
  privacy_level: z.string().optional(),
  processing_requirements: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onSuccess, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { data: formOptions, isLoading: optionsLoading } = useFormOptions();
  const uploadMutation = useFileUpload();
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      project_name: '',
      hypothesis: '',
      data_source: '',
      collection_method: '',
      workflow_type: '',
      experiment_id: '',
      date_range_start: '',
      date_range_end: '',
      research_phase: '',
      privacy_level: '',
      processing_requirements: '',
    },
  });
  
  const onSubmit = async (values: UploadFormValues) => {
    if (!selectedFile) {
      onError?.('Please select a file to upload');
      return;
    }
    
    try {
      setUploadProgress(0);
      
      const response = await uploadMutation.mutateAsync({
        file: selectedFile,
        formData: values as UploadFormData,
      });
      
      setUploadProgress(100);
      onSuccess?.(response);
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      setUploadProgress(0);
      
    } catch (error) {
      setUploadProgress(0);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };
  
  if (optionsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Loading form options...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Marketing Research File Upload</CardTitle>
        <CardDescription>
          Upload your research files with comprehensive metadata for proper organization and discoverability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">File Selection</h3>
              <FileInput
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                accept=".csv,.json,.pdf,.xlsx,.txt"
                maxSizeMB={100}
              />
            </div>
            
            {/* Research Metadata Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Research Information</h3>
              
              <FormField
                control={form.control}
                name="project_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your project name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for your research project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hypothesis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Hypothesis/Question *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your research hypothesis or main research question"
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Source *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Customer Survey, Interview Study, A/B Test" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the source of your research data
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="collection_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Method *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Online Survey, Phone Interview, Focus Group" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        How was this data collected?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Technical Metadata Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">File Information</h3>
              
              <FormField
                control={form.control}
                name="workflow_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Format *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select file format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formOptions?.workflow_types.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the format that matches your uploaded file
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Optional Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experiment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experiment ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., EXP-2025-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="research_phase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Research Phase</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select phase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formOptions?.research_phases.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date_range_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date_range_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="privacy_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select privacy level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formOptions?.privacy_levels.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
                </p>
              </div>
            )}
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};