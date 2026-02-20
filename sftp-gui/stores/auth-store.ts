import { create } from 'zustand';
import type { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hasRole: (roles: Role[]) => boolean;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user }),
  
  setTokens: (accessToken, refreshToken) => set({ 
    accessToken,
    refreshToken,
  }),
  
  login: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sftp_accessToken', accessToken);
      localStorage.setItem('sftp_refreshToken', refreshToken);
      localStorage.setItem('sftp_user', JSON.stringify(user));
    }
    
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sftp_accessToken');
      localStorage.removeItem('sftp_refreshToken');
      localStorage.removeItem('sftp_user');
      localStorage.removeItem('sftp-org');
    }
    
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  hasRole: (roles) => {
    const state = get();
    if (!state.user) return false;
    return roles.includes(state.user.role);
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    
    const accessToken = localStorage.getItem('sftp_accessToken');
    const refreshToken = localStorage.getItem('sftp_refreshToken');
    const userStr = localStorage.getItem('sftp_user');
    
    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        get().logout();
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

export const initializeAuth = () => {
  useAuthStore.getState().initFromStorage();
};
