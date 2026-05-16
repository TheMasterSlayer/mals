'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Alert,
  Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, CircularProgress, Divider,
} from '@mui/material';
import { Download, PictureAsPdf } from '@mui/icons-material';
import { assetsApi, getApiError } from '@/lib/api';
import type { Asset } from '@/lib/types';
import StatusChip from '@/components/common/StatusChip';
import { format } from 'date-fns';

function exportCsv(assets: Asset[]) {
  const headers = [
    'ID','Name','Type','Category','Serial Number','Quantity','Status',
    'Location','Assigned To','Created','Last Updated',
  ];
  const rows = assets.map(a => [
    a.id, a.name, a.type, a.category ?? '', a.serialNumber ?? '',
    a.quantity, a.status, a.location ?? '', a.assignedTo ?? '',
    format(new Date(a.createdAt), 'yyyy-MM-dd'),
    format(new Date(a.lastUpdated), 'yyyy-MM-dd'),
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `mals-assets-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportPdf(assets: Asset[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('MALS – Asset Inventory Report', 14, 18);
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')} UTC`, 14, 25);
  doc.text('UNCLASSIFIED // FOR OFFICIAL USE ONLY', 14, 30);

  autoTable(doc, {
    startY: 36,
    head: [['Name', 'Type', 'Serial No.', 'Qty', 'Status', 'Location', 'Assigned To']],
    body: assets.map(a => [
      a.name, a.type, a.serialNumber ?? '—', a.quantity,
      a.status.replace('_', ' '), a.location ?? '—', a.assignedTo ?? '—',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 77, 140], textColor: 255 },
  });

  doc.save(`mals-assets-${format(new Date(), 'yyyyMMdd')}.pdf`);
}

export default function ReportsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    assetsApi.search({ size: 500 })
      .then(r => setAssets(r.content))
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  // Summary stats
  const byType   = assets.reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.type]: (acc[a.type] ?? 0) + 1 }), {});
  const byStatus = assets.reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }), {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Reports & Analytics</Typography>
          <Typography variant="body2" color="text.secondary">
            Generated {format(new Date(), "dd MMM yyyy 'at' HH:mm")}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => exportCsv(assets)}
            disabled={loading || assets.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => exportPdf(assets)}
            disabled={loading || assets.length === 0}
            color="error"
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
              Assets by Type
            </Typography>
            {Object.entries(byType).map(([type, count]) => (
              <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                <Typography variant="body2">{type}</Typography>
                <Typography variant="body2" fontWeight={700}>{count}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
              Assets by Status
            </Typography>
            {Object.entries(byStatus).map(([status, count]) => (
              <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                <StatusChip status={status as any} type="asset" />
                <Typography variant="body2" fontWeight={700}>{count}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Full asset table */}
      <Paper>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="overline" color="text.secondary">
            Full Inventory Report ({assets.length} assets)
          </Typography>
        </Box>
        <Divider />
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
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : assets.map(asset => (
                <TableRow key={asset.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{asset.name}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{asset.type}</Typography></TableCell>
                  <TableCell><Typography variant="caption" fontFamily="monospace">{asset.serialNumber ?? '—'}</Typography></TableCell>
                  <TableCell align="center">{asset.quantity}</TableCell>
                  <TableCell><StatusChip status={asset.status} type="asset" /></TableCell>
                  <TableCell><Typography variant="caption">{asset.location ?? '—'}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{asset.assignedTo ?? '—'}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {format(new Date(asset.lastUpdated), 'dd MMM yyyy')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
