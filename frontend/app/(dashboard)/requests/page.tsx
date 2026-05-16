'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, TablePagination,
  MenuItem, TextField, Grid, Alert, CircularProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Divider,
} from '@mui/material';
import { Add, CheckCircle, Cancel, Done, Refresh } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetsApi, requestsApi, getApiError } from '@/lib/api';
import type { AssetRequest, Asset, RequestStatus } from '@/lib/types';
import StatusChip from '@/components/common/StatusChip';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

// ── New Request Form ──────────────────────────────────────────────────────────

const schema = z.object({
  assetId:           z.coerce.number().min(1, 'Asset is required'),
  quantityRequested: z.coerce.number().int().min(1, 'At least 1'),
  missionName:       z.string().min(1, 'Mission name is required').max(120),
  purpose:           z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const STATUSES: { value: RequestStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'APPROVED',  label: 'Approved' },
  { value: 'REJECTED',  label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function RequestsPage() {
  const { user } = useAuthStore();
  const canProcess = user?.role === 'ADMIN' || user?.role === 'COMMANDER';

  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New request dialog
  const [newOpen, setNewOpen] = useState(false);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Process dialog
  const [processDialog, setProcessDialog] = useState<{ id: number; action: 'APPROVED' | 'REJECTED' } | null>(null);
  const [processNotes, setProcessNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await requestsApi.list({
        status: statusFilter || undefined,
        page,
        size: rowsPerPage,
      });
      setRequests(result.content);
      setTotal(result.totalElements);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const openNewDialog = async () => {
    const result = await assetsApi.search({ size: 200 });
    setAllAssets(result.content.filter(a => a.status !== 'DECOMMISSIONED'));
    setNewOpen(true);
  };

  const handleCreate = async (data: FormData) => {
    setSubmitting(true);
    try {
      await requestsApi.create(data);
      setNewOpen(false);
      reset();
      load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async () => {
    if (!processDialog) return;
    setProcessing(true);
    try {
      await requestsApi.process(processDialog.id, {
        status: processDialog.action,
        notes: processNotes,
      });
      setProcessDialog(null);
      setProcessNotes('');
      load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await requestsApi.complete(id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Mission Requests</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openNewDialog}>
          New Request
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3}>
            <TextField
              select fullWidth label="Status" size="small"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as RequestStatus | ''); setPage(0); }}
            >
              {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item>
            <Button startIcon={<Refresh />} onClick={load} size="small" variant="outlined">Refresh</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Mission</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Processed By</TableCell>
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
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No requests found
                  </TableCell>
                </TableRow>
              ) : requests.map(req => (
                <TableRow key={req.id} hover>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace">#{req.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{req.missionName}</Typography>
                    {req.purpose && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                        {req.purpose}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{req.assetName}</Typography>
                  </TableCell>
                  <TableCell align="center">{req.quantityRequested}</TableCell>
                  <TableCell>
                    <Typography variant="caption">{req.requestedByUsername}</Typography>
                  </TableCell>
                  <TableCell><StatusChip status={req.status} type="request" /></TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {format(new Date(req.requestedAt), 'dd MMM yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{req.processedByUsername ?? '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {canProcess && req.status === 'PENDING' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success"
                              onClick={() => setProcessDialog({ id: req.id, action: 'APPROVED' })}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error"
                              onClick={() => setProcessDialog({ id: req.id, action: 'REJECTED' })}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {req.status === 'APPROVED' && (
                        <Tooltip title="Mark Complete">
                          <IconButton size="small" color="primary" onClick={() => handleComplete(req.id)}>
                            <Done fontSize="small" />
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

      {/* ── New Request Dialog ── */}
      <Dialog open={newOpen} onClose={() => { setNewOpen(false); reset(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Mission Request</DialogTitle>
        <DialogContent>
          <Box component="form" id="new-request-form" onSubmit={handleSubmit(handleCreate)} noValidate sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  {...register('missionName')}
                  label="Mission Name *" fullWidth
                  error={!!errors.missionName} helperText={errors.missionName?.message}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  {...register('assetId')}
                  select label="Asset *" fullWidth defaultValue=""
                  error={!!errors.assetId} helperText={errors.assetId?.message}
                >
                  {allAssets.map(a => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name} (Qty: {a.quantity})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  {...register('quantityRequested')}
                  label="Qty *" type="number" fullWidth
                  error={!!errors.quantityRequested} helperText={errors.quantityRequested?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('purpose')}
                  label="Purpose / Justification" fullWidth multiline rows={3}
                  error={!!errors.purpose} helperText={errors.purpose?.message}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setNewOpen(false); reset(); }}>Cancel</Button>
          <Button type="submit" form="new-request-form" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Process Dialog ── */}
      <Dialog open={!!processDialog} onClose={() => setProcessDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {processDialog?.action === 'APPROVED' ? 'Approve Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Notes (optional)"
            fullWidth multiline rows={3}
            value={processNotes}
            onChange={e => setProcessNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProcessDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={processDialog?.action === 'APPROVED' ? 'success' : 'error'}
            onClick={handleProcess}
            disabled={processing}
          >
            {processing ? <CircularProgress size={20} /> : processDialog?.action}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
