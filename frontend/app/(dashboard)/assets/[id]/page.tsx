'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button, Alert,
  Skeleton, Divider,
} from '@mui/material';
import { ArrowBack, Edit, Assignment } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { assetsApi, requestsApi, getApiError } from '@/lib/api';
import type { Asset } from '@/lib/types';
import StatusChip from '@/components/common/StatusChip';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

export default function AssetDetailPage() {
  const router  = useRouter();
  const params  = useParams();
  const { user } = useAuthStore();
  const id = Number(params.id);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    assetsApi.getById(id)
      .then(setAsset)
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />;
  if (error)   return <Alert severity="error">{error}</Alert>;
  if (!asset)  return null;

  const canWrite = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value ?? '—'}</Typography>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => router.push('/assets')}>
            Back
          </Button>
          <Box>
            <Typography variant="h5" fontWeight={700}>{asset.name}</Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {asset.serialNumber ?? 'No serial number'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Assignment />}
            onClick={() => router.push(`/requests?assetId=${asset.id}`)}
          >
            Request Asset
          </Button>
          {canWrite && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => router.push(`/assets/${asset.id}/edit`)}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <StatusChip status={asset.status} type="asset" />
              <Chip label={asset.type} size="small" variant="outlined" />
              {asset.category && <Chip label={asset.category} size="small" variant="outlined" />}
            </Box>

            <Grid container spacing={2}>
              <Row label="Asset Name"     value={asset.name} />
              <Row label="Serial Number"  value={<span style={{ fontFamily: 'monospace' }}>{asset.serialNumber}</span>} />
              <Row label="Type"           value={asset.type} />
              <Row label="Category"       value={asset.category} />
              <Row label="Location"       value={asset.location} />
              <Row label="Assigned To"    value={asset.assignedTo} />
              <Row label="Quantity"       value={
                <Typography
                  variant="body2" fontWeight={700}
                  color={asset.quantity < 5 ? 'error.main' : 'text.primary'}
                  component="span"
                >
                  {asset.quantity} {asset.quantity < 5 ? '⚠ LOW STOCK' : ''}
                </Typography>
              } />
              <Row label="Status"         value={<StatusChip status={asset.status} type="asset" />} />
              <Row label="Created"        value={format(new Date(asset.createdAt), 'dd MMM yyyy HH:mm')} />
              <Row label="Last Updated"   value={format(new Date(asset.lastUpdated), 'dd MMM yyyy HH:mm')} />
            </Grid>

            {asset.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="overline" color="text.secondary" display="block" mb={1}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {asset.description}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary" display="block" mb={1}>
              Map Coordinates
            </Typography>
            {asset.latitude != null && asset.longitude != null ? (
              <Box>
                <Typography variant="body2">
                  Lat: {asset.latitude.toFixed(4)}, Lon: {asset.longitude.toFixed(4)}
                </Typography>
                <Button
                  variant="text" size="small" sx={{ mt: 1 }}
                  onClick={() => router.push('/map')}
                >
                  View on Map →
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No coordinates assigned
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
