'use client';

import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from '@/theme/theme';
import type { PaletteMode } from '@mui/material';
import { useAuthStore } from '@/store/authStore';

interface ColorModeContextValue {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

export const ColorModeContext = createContext<ColorModeContextValue>({
  toggleColorMode: () => {},
  mode: 'dark',
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('dark');
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    // Restore auth state and theme preference from localStorage on mount
    initFromStorage();
    const saved = localStorage.getItem('mals_theme') as PaletteMode | null;
    if (saved === 'light' || saved === 'dark') setMode(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // When another tab logs out it clears the shared cookie. Re-sync it from
    // this tab's sessionStorage whenever this tab regains focus so middleware
    // doesn't redirect active sessions to /login.
    const resyncCookie = () => {
      if (document.visibilityState !== 'visible') return;
      const token = sessionStorage.getItem('mals_token');
      if (token) {
        document.cookie = `mals_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }
    };
    document.addEventListener('visibilitychange', resyncCookie);
    window.addEventListener('focus', resyncCookie);
    return () => {
      document.removeEventListener('visibilitychange', resyncCookie);
      window.removeEventListener('focus', resyncCookie);
    };
  }, []);

  const colorMode = useMemo<ColorModeContextValue>(
    () => ({
      toggleColorMode: () => {
        setMode(prev => {
          const next = prev === 'dark' ? 'light' : 'dark';
          localStorage.setItem('mals_theme', next);
          return next;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
