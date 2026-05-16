'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert, Button, Skeleton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import AssetForm, { type AssetFormData } from '@/components/assets/AssetForm';
import { assetsApi, getApiError } from '@/lib/api';
import type { Asset } from '@/lib/types';

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    assetsApi.getById(id)
      .then(setAsset)
      .catch(err => setFetchError(getApiError(err)));
  }, [id]);

  const handleSubmit = async (data: AssetFormData) => {
    setSaveError('');
    setLoading(true);
    try {
      await assetsApi.update(id, {
        ...data,
        latitude:  data.latitude  === '' ? undefined : data.latitude as number,
        longitude: data.longitude === '' ? undefined : data.longitude as number,
      });
      router.push(`/assets/${id}`);
    } catch (err) {
      setSaveError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) return <Alert severity="error">{fetchError}</Alert>;
  if (!asset) return <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push(`/assets/${id}`)}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>Edit Asset: {asset.name}</Typography>
      </Box>

      {saveError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>{saveError}</Alert>}

      <Paper sx={{ p: 3 }}>
        <AssetForm
          defaultValues={{
            name: asset.name,
            type: asset.type,
            category: asset.category ?? '',
            serialNumber: asset.serialNumber ?? '',
            quantity: asset.quantity,
            status: asset.status,
            location: asset.location ?? '',
            assignedTo: asset.assignedTo ?? '',
            description: asset.description ?? '',
            latitude: asset.latitude ?? undefined,
            longitude: asset.longitude ?? undefined,
          }}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Save Changes"
        />
      </Paper>
    </Box>
  );
}
