import { useCallback, useRef, useState } from 'react';
import { filesApi } from '@/lib/api-client';
import type { FileInfo, ListFilesResponse } from '@/types';
import { useOrgStore, getOrgPath } from '@/stores';

interface UseFilesOptions {
  initialPath?: string;
}

export function useFiles(options: UseFilesOptions = {}) {
  const { initialPath = '/' } = options;
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { selectedOrg } = useOrgStore();

  const fetchFiles = useCallback(async (path?: string) => {
    const targetPath = path ?? currentPath;
    const orgPath = getOrgPath(targetPath, selectedOrg);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await filesApi.list({ path: orgPath, limit: 1000 });
      setFiles(response.data.data?.files || []);
      setCurrentPath(targetPath);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, selectedOrg]);

  const navigateTo = useCallback((path: string) => {
    fetchFiles(path);
  }, [fetchFiles]);

  const navigateUp = useCallback(() => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      const newPath = '/' + parts.join('/');
      fetchFiles(newPath || '/');
    }
  }, [currentPath, fetchFiles]);

  const createFolder = useCallback(async (name: string) => {
    const newPath = currentPath === '/' 
      ? `/${name}` 
      : `${currentPath}/${name}`;
    const orgPath = getOrgPath(newPath, selectedOrg);
    
    try {
      await filesApi.mkdir(orgPath);
      await fetchFiles();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create folder' 
      };
    }
  }, [currentPath, selectedOrg, fetchFiles]);

  const uploadFile = useCallback(async (
    file: File, 
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const orgPath = getOrgPath(currentPath, selectedOrg);
    
    try {
      await filesApi.upload(formData, onProgress);
      await fetchFiles();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to upload file' 
      };
    }
  }, [currentPath, selectedOrg, fetchFiles]);

  const downloadFile = useCallback(async (filename: string) => {
    const filePath = currentPath === '/' 
      ? `/${filename}` 
      : `${currentPath}/${filename}`;
    const orgPath = getOrgPath(filePath, selectedOrg);
    
    try {
      const response = await filesApi.download(orgPath);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to download file' 
      };
    }
  }, [currentPath, selectedOrg]);

  const refresh = useCallback(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    currentPath,
    isLoading,
    error,
    fetchFiles,
    navigateTo,
    navigateUp,
    createFolder,
    uploadFile,
    downloadFile,
    refresh,
  };
}
