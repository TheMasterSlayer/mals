'use client';

import { useEffect, useState } from 'react';
import {
  Grid, Typography, Box, Button, Alert, Skeleton, Paper,
} from '@mui/material';
import {
  Inventory2, FlightTakeoff, Build, Warning,
  Assignment, Groups, TrendingUp, Add,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/dashboard/StatsCard';
import { AssetStatusPie, RequestsBarChart } from '@/components/dashboard/Charts';
import { dashboardApi, getApiError } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome, {user?.rank ? `${user.rank} ` : ''}{user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(), "EEEE, d MMMM yyyy · HH:mm 'UTC'")} · {user?.unit ?? 'MALS Command Center'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Assignment />} onClick={() => router.push('/requests')}>
            Requests
          </Button>
          {(user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER') && (
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/assets/new')}>
              Add Asset
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Assets',         key: 'totalAssets',       icon: <Inventory2 />,      color: '#00B4D8' },
          { title: 'Available',            key: 'availableAssets',   icon: <TrendingUp />,      color: '#22C55E' },
          { title: 'Deployed',             key: 'deployedAssets',    icon: <FlightTakeoff />,   color: '#7C3AED' },
          { title: 'Under Maintenance',    key: 'maintenanceAssets', icon: <Build />,           color: '#F59E0B' },
          { title: 'Pending Requests',     key: 'pendingRequests',   icon: <Assignment />,      color: '#F59E0B' },
          { title: 'Low Stock Alerts',     key: 'lowStockAlerts',    icon: <Warning />,         color: '#EF4444' },
          { title: 'Active Personnel',     key: 'totalUsers',        icon: <Groups />,          color: '#00B4D8' },
          { title: 'In Use',               key: 'inUseAssets',       icon: <Inventory2 />,      color: '#94A3B8' },
        ].map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.key}>
            <StatsCard
              title={card.title}
              value={loading ? '—' : (stats?.[card.key as keyof DashboardStats] ?? 0)}
              icon={card.icon}
              color={card.color}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {loading
            ? <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
            : stats && <AssetStatusPie stats={stats} />
          }
        </Grid>
        <Grid item xs={12} md={6}>
          {loading
            ? <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
            : stats && <RequestsBarChart stats={stats} />
          }
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" onClick={() => router.push('/assets')}>
            Browse Assets
          </Button>
          <Button variant="outlined" size="small" onClick={() => router.push('/requests')}>
            View All Requests
          </Button>
          <Button variant="outlined" size="small" onClick={() => router.push('/map')}>
            Open Tactical Map
          </Button>
          <Button variant="outlined" size="small" onClick={() => router.push('/reports')}>
            Generate Report
          </Button>
          {(user?.role === 'ADMIN' || user?.role === 'COMMANDER') && (
            <Button variant="outlined" size="small" onClick={() => router.push('/audit')}>
              View Audit Log
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
