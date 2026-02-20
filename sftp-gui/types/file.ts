export interface FileInfo {
  type: 'file' | 'directory';
  name: string;
  size: number;
  modifyTime: number;
  accessTime: number;
  rights: {
    user: string;
    group: string;
    other: string;
  };
  owner: number;
  group: number;
}

export interface ListFilesResponse {
  files: FileInfo[];
  path: string;
}

export interface ListFilesQuery {
  path?: string;
  limit?: number;
  offset?: number;
}

export interface UploadResponse {
  message: string;
  path: string;
  filename: string;
  size: number;
}

export interface MkdirInput {
  path: string;
}

export interface FileStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  recentUploads: number;
  recentDownloads: number;
}
