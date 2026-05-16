'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box, Typography, Paper, Alert, CircularProgress, Chip,
  List, ListItem, ListItemText, Divider, Button,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { assetsApi, getApiError } from '@/lib/api';
import type { Asset, AssetStatus } from '@/lib/types';
import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only (no SSR)
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

const STATUS_COLORS: Record<AssetStatus, string> = {
  AVAILABLE:      '#22C55E',
  IN_USE:         '#00B4D8',
  MAINTENANCE:    '#F59E0B',
  DEPLOYED:       '#7C3AED',
  DECOMMISSIONED: '#64748B',
};

export default function MapPage() {
  const searchParams = useSearchParams();
  const focusId  = searchParams.get('id')  ? Number(searchParams.get('id'))  : undefined;
  const focusLat = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined;
  const focusLng = searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    assetsApi.search({ size: 500 })
      .then(r => setAssets(r.content.filter(a => a.latitude != null && a.longitude != null)))
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const withCoords = assets.filter(a => a.latitude != null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Tactical Map View</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading...' : `${withCoords.length} assets with coordinates`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load} disabled={loading} size="small">
            Refresh
          </Button>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <Chip
              key={status}
              label={status.replace('_', ' ')}
              size="small"
              sx={{ bgcolor: `${color}1A`, color, borderColor: `${color}40`, border: '1px solid', fontWeight: 600, fontSize: '0.68rem' }}
            />
          ))}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, gap: 2 }}>
        <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ height: 540, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <MapView assets={assets} focusId={focusId} focusLat={focusLat} focusLng={focusLng} />
          )}
        </Paper>

        {/* Asset list sidebar */}
        <Paper sx={{ maxHeight: 580, overflow: 'auto' }}>
          <Box sx={{ p: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Assets on Map ({withCoords.length})
            </Typography>
          </Box>
          <Divider />
          <List dense disablePadding>
            {withCoords.map((asset, idx) => (
              <Box key={asset.id}>
                {idx > 0 && <Divider />}
                <ListItem>
                  <Box
                    sx={{
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: STATUS_COLORS[asset.status],
                      mr: 1.5, flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={asset.name}
                    secondary={asset.location ?? 'Unknown location'}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}
