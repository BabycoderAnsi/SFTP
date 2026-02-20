export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const SSE_URL = process.env.NEXT_PUBLIC_SSE_URL || '/api/v1/logs/stream';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  FILES: '/files',
  USERS: '/users',
  LOGS: '/logs',
  SETTINGS: '/settings',
} as const;

export const ROLES = {
  READ_ONLY: 'READ_ONLY',
  READ_WRITE: 'READ_WRITE',
  ADMIN: 'ADMIN',
} as const;

export const USER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
} as const;

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  DISABLED: 'bg-red-100 text-red-800 border-red-200',
} as const;

export const ROLE_LABELS = {
  READ_ONLY: 'Read Only',
  READ_WRITE: 'Read/Write',
  ADMIN: 'Administrator',
} as const;

export const STATUS_LABELS = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
} as const;

export const ACTION_LABELS = {
  LIST: 'List Files',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  MKDIR: 'Create Folder',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  REGISTER: 'Register',
} as const;

export const FILE_ICONS: Record<string, string> = {
  folder: 'folder',
  pdf: 'file-text',
  csv: 'file-spreadsheet',
  xlsx: 'file-spreadsheet',
  xls: 'file-spreadsheet',
  doc: 'file-text',
  docx: 'file-text',
  txt: 'file-text',
  zip: 'file-archive',
  default: 'file',
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};
