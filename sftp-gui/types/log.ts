import { Role } from './user';

export interface AuditLog {
  id: string;
  requestId: string;
  user: string | null;
  role: Role | null;
  action: string;
  path: string | null;
  status: number;
  createdAt: string;
}

export interface ListLogsQuery {
  user?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export interface LogsListResponse {
  logs: AuditLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface LogStreamEvent {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  user?: string;
  action?: string;
  path?: string;
  status?: number;
}
