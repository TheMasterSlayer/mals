'use client';

import {
  Box, Grid, TextField, MenuItem, Button, CircularProgress, Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Asset, AssetType, AssetStatus } from '@/lib/types';

const schema = z.object({
  name:         z.string().min(1, 'Name is required').max(100),
  type:         z.enum(['VEHICLE','WEAPON','EQUIPMENT','SUPPLY','AIRCRAFT','VESSEL','COMMUNICATION'] as const),
  category:     z.string().max(60).optional(),
  serialNumber: z.string().max(50).optional(),
  quantity:     z.coerce.number().int().min(1, 'At least 1'),
  status:       z.enum(['AVAILABLE','IN_USE','MAINTENANCE','DEPLOYED','DECOMMISSIONED'] as const),
  location:     z.string().max(100).optional(),
  assignedTo:   z.string().max(100).optional(),
  description:  z.string().optional(),
  latitude:     z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude:    z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
});

export type AssetFormData = z.infer<typeof schema>;

const TYPES: { value: AssetType; label: string }[] = [
  { value: 'VEHICLE',       label: 'Vehicle' },
  { value: 'WEAPON',        label: 'Weapon' },
  { value: 'EQUIPMENT',     label: 'Equipment' },
  { value: 'SUPPLY',        label: 'Supply' },
  { value: 'AIRCRAFT',      label: 'Aircraft' },
  { value: 'VESSEL',        label: 'Vessel' },
  { value: 'COMMUNICATION', label: 'Communication' },
];

const STATUSES: { value: AssetStatus; label: string }[] = [
  { value: 'AVAILABLE',      label: 'Available' },
  { value: 'IN_USE',         label: 'In Use' },
  { value: 'MAINTENANCE',    label: 'Maintenance' },
  { value: 'DEPLOYED',       label: 'Deployed' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned' },
];

interface Props {
  defaultValues?: Partial<AssetFormData>;
  onSubmit: (data: AssetFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export default function AssetForm({ defaultValues, onSubmit, loading, submitLabel = 'Save Asset' }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<AssetFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'AVAILABLE',
      quantity: 1,
      ...defaultValues,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="overline" color="text.secondary" display="block" mb={2}>
        Asset Information
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          <TextField
            {...register('name')}
            label="Asset Name *"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            {...register('type')}
            select label="Type *" fullWidth defaultValue={defaultValues?.type ?? ''}
            error={!!errors.type} helperText={errors.type?.message}
          >
            {TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            {...register('category')}
            label="Category" fullWidth
            error={!!errors.category} helperText={errors.category?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('serialNumber')}
            label="Serial Number" fullWidth
            error={!!errors.serialNumber} helperText={errors.serialNumber?.message}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <TextField
            {...register('quantity')}
            label="Quantity *" type="number" fullWidth
            error={!!errors.quantity} helperText={errors.quantity?.message}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            {...register('status')}
            select label="Status *" fullWidth defaultValue={defaultValues?.status ?? 'AVAILABLE'}
            error={!!errors.status} helperText={errors.status?.message}
          >
            {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('location')}
            label="Location / Base" fullWidth
            error={!!errors.location} helperText={errors.location?.message}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            {...register('assignedTo')}
            label="Assigned To (unit/personnel)" fullWidth
            error={!!errors.assignedTo} helperText={errors.assignedTo?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            {...register('description')}
            label="Description" fullWidth multiline rows={3}
            error={!!errors.description} helperText={errors.description?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="overline" color="text.secondary" display="block" mb={1}>
            Map Coordinates (optional)
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField
            {...register('latitude')}
            label="Latitude" type="number" fullWidth
            inputProps={{ step: 'any' }}
            error={!!errors.latitude} helperText={errors.latitude?.message ?? '–90 to 90'}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            {...register('longitude')}
            label="Longitude" type="number" fullWidth
            inputProps={{ step: 'any' }}
            error={!!errors.longitude} helperText={errors.longitude?.message ?? '–180 to 180'}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ minWidth: 160 }}
            >
              {loading ? <CircularProgress size={22} /> : submitLabel}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
