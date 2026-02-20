import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, initializeAuth } from '@/stores';
import { authApi } from '@/lib/api-client';
import type { LoginInput, User } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout: storeLogout,
    setLoading,
    hasRole,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  const signIn = useCallback(async (credentials: LoginInput) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials.username, credentials.password);
      const tokens = response.data.data;
      
      if (!tokens) {
        throw new Error('No tokens received');
      }

      let userData: User;
      try {
        const meResponse = await authApi.meWithToken(tokens.accessToken);
        userData = meResponse as User;
      } catch {
        const payload = tokens.accessToken.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        userData = {
          id: decoded.id || '',
          username: decoded.sub || credentials.username,
          email: decoded.email || '',
          role: decoded.role || 'READ_ONLY',
          status: decoded.status || 'ACTIVE',
          createdAt: decoded.createdAt || new Date().toISOString(),
          updatedAt: decoded.updatedAt || new Date().toISOString(),
        };
      }
      
      login(userData, tokens.accessToken, tokens.refreshToken);
      
      router.push('/');
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, [login, router, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
      router.push('/login');
    }
  }, [storeLogout, router]);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.meWithToken();
      if (user) {
        useAuthStore.getState().setUser(user);
      }
    } catch {
      // Ignore refresh errors
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    logout,
    refreshUser,
    hasRole,
  };
}
