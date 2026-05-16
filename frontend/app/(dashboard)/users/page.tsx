'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, TablePagination,
  Alert, CircularProgress, Chip, IconButton, Tooltip,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { usersApi, getApiError } from '@/lib/api';
import type { User } from '@/lib/types';
import { format } from 'date-fns';

const ROLE_COLORS: Record<string, string> = {
  ADMIN:             '#7C3AED',
  COMMANDER:         '#0369A1',
  LOGISTICS_OFFICER: '#065F46',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await usersApi.list({ page, size: rowsPerPage });
      setUsers(result.content);
      setTotal(result.totalElements);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const toggleUser = async (user: User) => {
    try {
      if (user.enabled) await usersApi.disable(user.id);
      else await usersApi.enable(user.id);
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Personnel Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rank</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : users.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{user.username}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{user.email}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{user.rank ?? '—'}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{user.unit ?? '—'}</Typography></TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: `${ROLE_COLORS[user.role]}22`,
                        color: ROLE_COLORS[user.role],
                        fontWeight: 700, fontSize: '0.68rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.enabled ? 'Active' : 'Disabled'}
                      size="small"
                      sx={{
                        bgcolor: user.enabled ? '#22C55E1A' : '#EF44441A',
                        color: user.enabled ? '#22C55E' : '#EF4444',
                        fontWeight: 700, fontSize: '0.68rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {format(new Date(user.createdAt), 'dd MMM yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={user.enabled ? 'Disable Account' : 'Enable Account'}>
                      <IconButton
                        size="small"
                        color={user.enabled ? 'error' : 'success'}
                        onClick={() => toggleUser(user)}
                      >
                        {user.enabled ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </Tooltip>
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
    </Box>
  );
}
