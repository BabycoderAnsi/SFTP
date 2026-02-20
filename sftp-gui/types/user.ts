export type Role = 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'DISABLED';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface UpdateStatusInput {
  status: UserStatus;
}

export interface UpdateRoleInput {
  role: Role;
}

export interface ListUsersQuery {
  status?: UserStatus;
  role?: Role;
  limit?: number;
  offset?: number;
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
