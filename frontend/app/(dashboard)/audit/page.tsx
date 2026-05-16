'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, TablePagination,
  TextField, Grid, Alert, CircularProgress, Chip, MenuItem,
} from '@mui/material';
import { auditApi, getApiError } from '@/lib/api';
import type { AuditLog } from '@/lib/types';
import { format } from 'date-fns';

const ENTITY_TYPES = ['Asset', 'AssetRequest', 'User'];

const ACTION_COLORS: Record<string, string> = {
  CREATED:    '#22C55E',
  UPDATED:    '#00B4D8',
  DELETED:    '#EF4444',
  LOGIN:      '#7C3AED',
  APPROVED:   '#22C55E',
  REJECTED:   '#EF4444',
  COMPLETED:  '#00B4D8',
  SUBMITTED:  '#F59E0B',
  REGISTERED: '#7C3AED',
};

function actionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find(k => action.includes(k));
  return key ? ACTION_COLORS[key] : '#94A3B8';
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await auditApi.list({
        action:     actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        page,
        size: rowsPerPage,
      });
      setLogs(result.content);
      setTotal(result.totalElements);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityTypeFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Audit Log</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth size="small" label="Filter by action"
              value={actionFilter}
              onChange={e => { setActionFilter(e.target.value); setPage(0); }}
              placeholder="e.g. ASSET_CREATED"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select fullWidth size="small" label="Entity Type"
              value={entityTypeFilter}
              onChange={e => { setEntityTypeFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Entities</MenuItem>
              {ENTITY_TYPES.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : logs.map(log => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace" sx={{ whiteSpace: 'nowrap' }}>
                      {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={600}>{log.performedByUsername}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      sx={{
                        bgcolor: `${actionColor(log.action)}1A`,
                        color: actionColor(log.action),
                        fontWeight: 700, fontSize: '0.65rem',
                        fontFamily: 'monospace',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{log.entityType ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace">
                      {log.entityId ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="caption" noWrap display="block">
                      {log.details ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace">
                      {log.ipAddress ?? '—'}
                    </Typography>
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
          rowsPerPageOptions={[10, 30, 100]}
        />
      </Paper>
    </Box>
  );
}
