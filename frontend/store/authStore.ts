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
  isInitialized: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => {
    // sessionStorage is per-tab so two simultaneous sessions don't overwrite each other
    sessionStorage.setItem('mals_token', user.token);
    sessionStorage.setItem('mals_user', JSON.stringify(user));
    setCookie(user.token);
    set({ user, isAuthenticated: true });
  },

  clearUser: () => {
    sessionStorage.removeItem('mals_token');
    sessionStorage.removeItem('mals_user');
    clearCookie();
    set({ user: null, isAuthenticated: false });
  },

  initFromStorage: () => {
    try {
      const raw = sessionStorage.getItem('mals_user');
      if (raw) {
        const user: AuthUser = JSON.parse(raw);
        setCookie(user.token);
        set({ user, isAuthenticated: true, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      sessionStorage.removeItem('mals_user');
      sessionStorage.removeItem('mals_token');
      clearCookie();
      set({ isInitialized: true });
    }
  },
}));
