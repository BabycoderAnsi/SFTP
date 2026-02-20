'use client';

import { useMemo } from 'react';
import { FolderOpen, FileIcon, Download, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatBytes, formatDate } from '@/lib/utils';
import type { FileInfo } from '@/types';

interface FileListProps {
  files: FileInfo[];
  currentPath: string;
  isLoading: boolean;
  onNavigate: (path: string) => void;
  onNavigateUp: () => void;
  onDownload: (filename: string) => void;
}

const getFileIcon = (file: FileInfo) => {
  if (file.type === 'directory') {
    return <FolderOpen className="h-5 w-5 text-primary" />;
  }
  return <FileIcon className="h-5 w-5 text-muted-foreground" />;
};

export function FileList({
  files,
  currentPath,
  isLoading,
  onNavigate,
  onNavigateUp,
  onDownload,
}: FileListProps) {
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [files]);

  const pathParts = currentPath.split('/').filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          Root
        </Button>
        {pathParts.map((part, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-muted-foreground">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/' + pathParts.slice(0, index + 1).join('/'))}
              className="text-muted-foreground hover:text-foreground"
            >
              {part}
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPath !== '/' && (
              <TableRow className="cursor-pointer hover:bg-muted/50">
                <TableCell colSpan={4}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNavigateUp}
                    className="w-full justify-start"
                  >
                    <FolderOpen className="h-5 w-5 mr-2 text-primary" />
                    ..
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {sortedFiles.length === 0 && currentPath === '/' ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No files found. Upload a file to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedFiles.map((file) => (
                <TableRow
                  key={file.name}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    file.type === 'directory' && 'bg-muted/30'
                  )}
                >
                  <TableCell>
                    <div
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (file.type === 'directory') {
                          const newPath =
                            currentPath === '/'
                              ? `/${file.name}`
                              : `${currentPath}/${file.name}`;
                          onNavigate(newPath);
                        }
                      }}
                    >
                      {getFileIcon(file)}
                      <span className="truncate">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {file.type === 'directory' ? '-' : formatBytes(file.size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(new Date(file.modifyTime * 1000))}
                  </TableCell>
                  <TableCell>
                    {file.type === 'file' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onDownload(file.name)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
