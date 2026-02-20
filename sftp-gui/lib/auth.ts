import type { User } from '@/types';
import { COOKIE_NAMES } from './constants';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('sftp_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sftp_accessToken');
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sftp_refreshToken');
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('sftp_accessToken');
  localStorage.removeItem('sftp_refreshToken');
  localStorage.removeItem('sftp_user');
  localStorage.removeItem('sftp-org');
}
