'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AssetForm, { type AssetFormData } from '@/components/assets/AssetForm';
import { assetsApi, getApiError } from '@/lib/api';

export default function NewAssetPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: AssetFormData) => {
    setError('');
    setLoading(true);
    try {
      await assetsApi.create({
        ...data,
        latitude:  data.latitude  === '' ? undefined : data.latitude as number,
        longitude: data.longitude === '' ? undefined : data.longitude as number,
      });
      router.push('/assets');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/assets')}>
          Back to Inventory
        </Button>
        <Typography variant="h5" fontWeight={700}>Add New Asset</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <AssetForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Asset" />
      </Paper>
    </Box>
  );
}
