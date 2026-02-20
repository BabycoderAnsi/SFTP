import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, LoginResponse, User } from '@/types';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sftp_accessToken');
};

const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sftp_refreshToken');
};

const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sftp_accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('sftp_refreshToken', refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sftp_accessToken');
  localStorage.removeItem('sftp_refreshToken');
  localStorage.removeItem('sftp_user');
};

const API_BASE_URL = typeof window !== 'undefined' ? '/api' : (process.env.API_BASE_URL || 'https://localhost:8443');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_BASE_URL}/v1/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data.data!;
        setTokens(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/v1/auth/login', { username, password }),
  
  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>('/v1/auth/refresh', { refreshToken }),
  
  logout: () =>
    api.post<ApiResponse<{ message: string }>>('/v1/auth/logout'),
  
  me: () =>
    api.get<ApiResponse<{ user: User }>>('/v1/auth/me'),

  meWithToken: async (token?: string): Promise<User | null> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    const data = await response.json();
    return data.data?.user || null;
  },
};

export const filesApi = {
  list: (params?: { path?: string; limit?: number; offset?: number }) =>
    api.get<ApiResponse<import('@/types').ListFilesResponse>>('/v1/files/list', { params }),
  
  download: (path: string) =>
    api.get<Blob>('/v1/files/download', { 
      params: { path },
      responseType: 'blob',
    }),
  
  upload: (formData: FormData, onProgress?: (progress: number) => void) =>
    api.post<ApiResponse<import('@/types').UploadResponse>>('/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }),
  
  mkdir: (path: string) =>
    api.post<ApiResponse<{ message: string; path: string }>>('/v1/files/mkdir', { path }),
  
  stats: () =>
    api.get<ApiResponse<import('@/types').FileStats>>('/v1/files/stats'),
};

export const adminApi = {
  users: (params?: import('@/types').ListUsersQuery) =>
    api.get<ApiResponse<import('@/types').UsersListResponse>>('/v1/admin/users', { params }),
  
  updateStatus: (id: string, status: import('@/types').UserStatus) =>
    api.patch<ApiResponse<{ id: string; username: string; status: string }>>(
      `/v1/admin/users/${id}/status`,
      { status }
    ),
  
  updateRole: (id: string, role: import('@/types').Role) =>
    api.patch<ApiResponse<{ id: string; username: string; role: string }>>(
      `/v1/admin/users/${id}/role`,
      { role }
    ),
  
  organizations: () =>
    api.get<ApiResponse<{ organizations: import('@/types').Organization[] }>>('/v1/admin/organizations'),
};

export const logsApi = {
  list: (params?: import('@/types').ListLogsQuery) =>
    api.get<ApiResponse<import('@/types').LogsListResponse>>('/v1/logs', { params }),
};

export const healthApi = {
  check: () =>
    api.get<import('@/types').HealthResponse>('/health'),
};
