import { create } from 'zustand';
import type { AuthUser } from '@/lib/types';

const COOKIE_NAME = 'mals_token';
const COOKIE_MAX_AGE = 86400; // 24 h — matches JWT expiration

function setCookie(value: string) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => {
    localStorage.setItem('mals_token', user.token);
    localStorage.setItem('mals_user', JSON.stringify(user));
    // Cookie lets the server-side middleware check auth without reading localStorage
    setCookie(user.token);
    set({ user, isAuthenticated: true });
  },

  clearUser: () => {
    localStorage.removeItem('mals_token');
    localStorage.removeItem('mals_user');
    clearCookie();
    set({ user: null, isAuthenticated: false });
  },

  initFromStorage: () => {
    try {
      const raw = localStorage.getItem('mals_user');
      if (raw) {
        const user: AuthUser = JSON.parse(raw);
        // Re-sync cookie in case it expired while localStorage is still valid
        setCookie(user.token);
        set({ user, isAuthenticated: true });
      }
    } catch {
      localStorage.removeItem('mals_user');
      localStorage.removeItem('mals_token');
      clearCookie();
    }
  },
}));
