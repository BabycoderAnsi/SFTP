export interface ApiResponse<T> {
  status: 'success' | 'error';
  requestId: string;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown[];
  };
}

export interface PaginatedResponse<T> {
  status: 'success';
  requestId: string;
  data: T;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface HealthResponse {
  status: string;
  checks: {
    database: {
      status: string;
      latency: number;
    };
    sftp: {
      status: string;
      latency: number;
    };
  };
}

export interface Organization {
  id: string;
  name: string;
  username: string;
}

export interface DashboardStats {
  files: {
    total: number;
    size: number;
    recentUploads: number;
  };
  users: {
    total: number;
    pending: number;
    active: number;
  };
  transfers: {
    uploads: number;
    downloads: number;
    today: number;
  };
}
