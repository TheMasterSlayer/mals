'use client';

import { Chip } from '@mui/material';
import type { AssetStatus, RequestStatus } from '@/lib/types';

const ASSET_STATUS_CONFIG: Record<AssetStatus, { label: string; color: string }> = {
  AVAILABLE:     { label: 'Available',      color: '#22C55E' },
  IN_USE:        { label: 'In Use',         color: '#00B4D8' },
  MAINTENANCE:   { label: 'Maintenance',    color: '#F59E0B' },
  DEPLOYED:      { label: 'Deployed',       color: '#7C3AED' },
  DECOMMISSIONED:{ label: 'Decommissioned', color: '#64748B' },
};

const REQUEST_STATUS_CONFIG: Record<RequestStatus, { label: string; color: string }> = {
  PENDING:   { label: 'Pending',   color: '#F59E0B' },
  APPROVED:  { label: 'Approved',  color: '#22C55E' },
  REJECTED:  { label: 'Rejected',  color: '#EF4444' },
  COMPLETED: { label: 'Completed', color: '#00B4D8' },
  CANCELLED: { label: 'Cancelled', color: '#64748B' },
};

interface Props {
  status: AssetStatus | RequestStatus;
  type: 'asset' | 'request';
}

export default function StatusChip({ status, type }: Props) {
  const config =
    type === 'asset'
      ? ASSET_STATUS_CONFIG[status as AssetStatus]
      : REQUEST_STATUS_CONFIG[status as RequestStatus];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: `${config.color}1A`,
        color: config.color,
        borderColor: `${config.color}40`,
        border: '1px solid',
        fontWeight: 700,
        fontSize: '0.7rem',
      }}
    />
  );
}
