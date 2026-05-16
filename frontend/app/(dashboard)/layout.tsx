'use client';

import { useState, useContext, useEffect } from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar, { DRAWER_WIDTH } from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { ColorModeContext } from '@/app/providers';
import { useAuthStore } from '@/store/authStore';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Command Dashboard',
  '/assets':    'Asset Inventory',
  '/requests':  'Mission Requests',
  '/reports':   'Reports & Analytics',
  '/map':       'Tactical Map View',
  '/audit':     'Audit Log',
  '/users':     'Personnel Management',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode } = useContext(ColorModeContext);
  const { isAuthenticated } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const title = Object.entries(PAGE_TITLES).find(
    ([p]) => pathname.startsWith(p)
  )?.[1] ?? 'MALS';

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Persistent sidebar (desktop) */}
      {!isMobile && (
        <Sidebar open variant="permanent" />
      )}

      {/* Temporary drawer (mobile) */}
      {isMobile && (
        <Sidebar
          open={mobileOpen}
          variant="temporary"
          onClose={() => setMobileOpen(false)}
        />
      )}

      {/* Main area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <TopBar
          title={title}
          onMenuClick={() => setMobileOpen(p => !p)}
          mode={mode}
        />
        <Toolbar />

        {/* Classification banner */}
        <Box
          sx={{
            bgcolor: '#15803D', textAlign: 'center', py: 0.25,
            fontSize: '0.65rem', fontWeight: 700, color: '#fff', letterSpacing: 3,
          }}
        >
          UNCLASSIFIED // FOR OFFICIAL USE ONLY
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1600, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
