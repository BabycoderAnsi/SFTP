export interface JwtPayload {
  sub: string;
  role: string;
  id: string;
  email?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  iat?: number;
  exp?: number;
  iss?: string;
}

export interface AuditLogEntry {
  requestId: string;
  user?: string;
  role?: string;
  action: string;
  path?: string;
  status: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LogMeta {
  requestId?: string;
  user?: string;
  role?: string;
  action?: string;
  path?: string;
  status?: number;
  [key: string]: unknown;
}
