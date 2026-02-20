'use client';

import { useState, useCallback } from 'react';
import { DropEvent, useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn, formatBytes } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({ onUpload, disabled }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    const uploadItem: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading',
    };
    
    setUploadingFiles((prev) => [...prev, uploadItem]);
    setIsUploading(true);

    const result = await onUpload(file, (progress) => {
      setUploadingFiles((prev) =>
        prev.map((item) =>
          item.file === file ? { ...item, progress } : item
        )
      );
    });

    setUploadingFiles((prev) =>
      prev.map((item) =>
        item.file === file
          ? { ...item, status: result.success ? 'success' : 'error', error: result.error }
          : item
      )
    );
    
    setIsUploading(false);

    if (result.success) {
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((item) => item.file !== file));
      }, 2000);
    }
  }, [onUpload]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      handleUpload(file);
    });
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isUploading,
    noClick: false,
    noKeyboard: true,
  });

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((item) => item.file !== file));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag and drop files here, or click to select'}
        </p>
        <p className="text-xs text-muted-foreground">
          Max file size: 10MB
        </p>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item) => (
            <div
              key={item.file.name}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.file.size)}
                </p>
                {item.status === 'uploading' && (
                  <Progress value={item.progress} className="h-1 mt-2" />
                )}
                {item.status === 'error' && (
                  <p className="text-xs text-destructive mt-1">{item.error}</p>
                )}
              </div>
              {item.status === 'uploading' && (
                <span className="text-xs text-muted-foreground">{item.progress}%</span>
              )}
              {item.status !== 'uploading' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(item.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
