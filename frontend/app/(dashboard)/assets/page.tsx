'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Grid,
  Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, TablePagination, IconButton,
  Tooltip, Alert, CircularProgress, Chip,
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Search, FilterList, Refresh,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { assetsApi, getApiError } from '@/lib/api';
import type { Asset, AssetStatus, AssetType } from '@/lib/types';
import StatusChip from '@/components/common/StatusChip';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

const ASSET_TYPES: { value: AssetType; label: string }[] = [
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

export default function AssetsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';
  const canDelete = user?.role === 'ADMIN';

  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | ''>('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');
  const [locationFilter, setLocationFilter] = useState('');

  // Delete dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await assetsApi.search({
        q:        search   || undefined,
        type:     typeFilter   || undefined,
        status:   statusFilter || undefined,
        location: locationFilter || undefined,
        page,
        size: rowsPerPage,
      });
      setAssets(result.content);
      setTotal(result.totalElements);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, locationFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await assetsApi.delete(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const TYPE_LABELS: Record<AssetType, string> = {
    VEHICLE: 'Vehicle', WEAPON: 'Weapon', EQUIPMENT: 'Equipment',
    SUPPLY: 'Supply', AIRCRAFT: 'Aircraft', VESSEL: 'Vessel', COMMUNICATION: 'Comms',
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Asset Inventory</Typography>
        {canWrite && (
          <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/assets/new')}>
            Add Asset
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              placeholder="Search name, serial, location..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select fullWidth label="Type"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as AssetType | ''); setPage(0); }}
            >
              <MenuItem value="">All Types</MenuItem>
              {ASSET_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select fullWidth label="Status"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as AssetStatus | ''); setPage(0); }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth placeholder="Filter by location..."
              value={locationFilter}
              onChange={e => { setLocationFilter(e.target.value); setPage(0); }}
              InputProps={{ startAdornment: <FilterList sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth startIcon={<Refresh />} onClick={load} variant="outlined">
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Serial No.</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No assets found
                  </TableCell>
                </TableRow>
              ) : assets.map(asset => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{asset.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={TYPE_LABELS[asset.type]} size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace">
                      {asset.serialNumber ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2" fontWeight={700}
                      color={asset.quantity < 5 ? 'error.main' : 'text.primary'}
                    >
                      {asset.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell><StatusChip status={asset.status} type="asset" /></TableCell>
                  <TableCell>
                    <Typography variant="caption">{asset.location ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{asset.assignedTo ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {format(new Date(asset.lastUpdated), 'dd MMM yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => router.push(`/assets/${asset.id}`)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canWrite && (
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => router.push(`/assets/${asset.id}/edit`)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(asset.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Asset"
        message="This action cannot be undone. The asset record will be permanently removed from the inventory."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
