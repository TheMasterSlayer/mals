'use client';

import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Chip, Tooltip,
} from '@mui/material';
import {
  Dashboard, Inventory2, Assignment, BarChart, Map,
  History, People, Shield, ChevronLeft,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/lib/types';

export const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: Role[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  path: '/dashboard',  icon: <Dashboard /> },
  { label: 'Assets',     path: '/assets',     icon: <Inventory2 /> },
  { label: 'Requests',   path: '/requests',   icon: <Assignment /> },
  { label: 'Reports',    path: '/reports',    icon: <BarChart /> },
  { label: 'Map View',   path: '/map',        icon: <Map /> },
  { label: 'Audit Log',  path: '/audit',      icon: <History />, roles: ['ADMIN', 'COMMANDER'] },
  { label: 'Personnel',  path: '/users',      icon: <People />,  roles: ['ADMIN'] },
];

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
}

export default function Sidebar({ open, onClose, variant = 'permanent' }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useAuthStore();

  const visible = NAV_ITEMS.filter(
    item => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Brand header */}
      <Box
        sx={{
          px: 3, py: 2.5,
          background: 'linear-gradient(135deg, #0A1628 0%, #1A3A5C 100%)',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        <Shield sx={{ color: '#00B4D8', fontSize: 28 }} />
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', lineHeight: 1 }}>
            MALS
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', letterSpacing: 1 }}>
            ASSET MANAGEMENT
          </Typography>
        </Box>
      </Box>

      {/* User info */}
      {user && (
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {user.rank ?? 'Personnel'}
          </Typography>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {user.username}
          </Typography>
          <Chip
            label={user.role.replace('_', ' ')}
            size="small"
            sx={{
              mt: 0.5, fontSize: '0.65rem', fontWeight: 700,
              bgcolor: user.role === 'ADMIN' ? '#7C3AED' :
                       user.role === 'COMMANDER' ? '#0369A1' : '#065F46',
              color: '#fff',
            }}
          />
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ flex: 1, py: 1, px: 1 }}>
        {visible.map(item => {
          const active = pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { router.push(item.path); onClose?.(); }}
                selected={active}
                sx={{
                  borderRadius: 2, py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(0,180,216,0.12)',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
                  },
                  '&:hover': { bgcolor: 'rgba(0,180,216,0.06)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          v1.0.0 • UNCLASSIFIED
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {content}
    </Drawer>
  );
}
