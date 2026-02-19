import path from 'path';

export function sanitizeFilename(filename: string): string {
  let sanitized = path.basename(filename);
  
  sanitized = sanitized.replace(/\0/g, '');
  
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
  
  sanitized = sanitized.replace(/\s+/g, '_');
  
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js'];
  const ext = path.extname(sanitized).toLowerCase();
  const nameWithoutExt = path.basename(sanitized, ext);
  
  if (sanitized.length > 255) {
    if (ext.length <= 255) {
      const maxNameLength = 255 - ext.length;
      sanitized = nameWithoutExt.substring(0, maxNameLength) + ext;
    } else {
      sanitized = sanitized.substring(0, 255);
    }
  }
  
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    sanitized = `file_${Date.now()}`;
  }
  
  if (dangerousExtensions.includes(ext)) {
    sanitized = nameWithoutExt + ext + '.txt';
  }
  
  return sanitized;
}

export function sanitizePath(userPath: string): string {
  let sanitized = userPath.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
  sanitized = sanitized.replace(/\/+/g, '/');
  return sanitized;
}
