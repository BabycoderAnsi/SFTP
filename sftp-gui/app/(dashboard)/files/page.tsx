'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileList, FileUpload, FolderCreateDialog } from '@/components/files';
import { RoleGuard } from '@/components/layout';
import { useFiles, useAuth } from '@/hooks';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function FilesPage() {
  const { files, currentPath, isLoading, error, fetchFiles, navigateTo, navigateUp, createFolder, uploadFile, downloadFile, refresh } = useFiles();
  const { hasRole } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  
  const canUpload = hasRole(['READ_WRITE', 'ADMIN']);

  useEffect(() => {
    fetchFiles('/');
  }, [fetchFiles]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateFolder = useCallback(async (name: string) => {
    const result = await createFolder(name);
    if (result.success) {
      toast.success(`Folder "${name}" created successfully`);
    }
    return result;
  }, [createFolder]);

  const handleUpload = useCallback(async (file: File, onProgress: (progress: number) => void) => {
    const result = await uploadFile(file, onProgress);
    if (result.success) {
      toast.success(`File "${file.name}" uploaded successfully`);
    }
    return result;
  }, [uploadFile]);

  const handleDownload = useCallback(async (filename: string) => {
    const result = await downloadFile(filename);
    if (result.success) {
      toast.success(`File "${filename}" downloaded successfully`);
    } else {
      toast.error(result.error || 'Download failed');
    }
  }, [downloadFile]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Files</h2>
          <p className="text-muted-foreground">
            Browse, upload, and manage files on the SFTP server
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {canUpload && (
            <>
              <FolderCreateDialog onCreate={handleCreateFolder} disabled={isLoading} />
              <Button onClick={() => setShowUpload(!showUpload)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </>
          )}
        </div>
      </div>

      {showUpload && canUpload && (
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
          <FileUpload onUpload={handleUpload} disabled={isLoading} />
        </div>
      )}

      <FileList
        files={files}
        currentPath={currentPath}
        isLoading={isLoading}
        onNavigate={navigateTo}
        onNavigateUp={navigateUp}
        onDownload={handleDownload}
      />
    </div>
  );
}
