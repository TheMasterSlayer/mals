'use client';

import {
  AppBar, Toolbar, IconButton, Typography, Box,
  Tooltip, Avatar, Menu, MenuItem, Divider, Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode, LightMode, Logout, AccountCircle, NotificationsNone,
} from '@mui/icons-material';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ColorModeContext } from '@/app/providers';
import { useAuthStore } from '@/store/authStore';
import type { PaletteMode } from '@mui/material';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  mode: PaletteMode;
}

export default function TopBar({ title, onMenuClick, mode }: TopBarProps) {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const { toggleColorMode } = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 1 }}>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        {/* Breadcrumb / page title */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>
            MALS COMMAND CENTER
          </Typography>
        </Box>

        {/* Classification indicator */}
        <Chip
          label="FOUO"
          size="small"
          sx={{
            bgcolor: '#15803D', color: '#fff', fontWeight: 700,
            fontSize: '0.65rem', letterSpacing: 1, display: { xs: 'none', sm: 'flex' },
          }}
        />

        <Tooltip title="Notifications">
          <IconButton color="inherit" size="small">
            <NotificationsNone />
          </IconButton>
        </Tooltip>

        <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton color="inherit" onClick={toggleColorMode} size="small">
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        {/* User menu */}
        <Tooltip title={user?.username ?? 'Account'}>
          <IconButton onClick={e => setAnchorEl(e.currentTarget)} size="small">
            <Avatar
              sx={{
                width: 32, height: 32, bgcolor: 'primary.main',
                fontSize: '0.875rem', fontWeight: 700, color: '#000',
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{user?.username}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); }} disabled>
            <AccountCircle sx={{ mr: 1.5, fontSize: 20 }} /> Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
