'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { DashboardStats } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  Available:    '#22C55E',
  'In Use':     '#00B4D8',
  Maintenance:  '#F59E0B',
  Deployed:     '#7C3AED',
  Decommissioned: '#64748B',
};

interface ChartsProps {
  stats: DashboardStats;
}

export function AssetStatusPie({ stats }: ChartsProps) {
  const data = [
    { name: 'Available',   value: stats.availableAssets },
    { name: 'In Use',      value: stats.inUseAssets },
    { name: 'Maintenance', value: stats.maintenanceAssets },
    { name: 'Deployed',    value: stats.deployedAssets },
  ].filter(d => d.value > 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" fontSize="0.68rem">
          Asset Status Distribution
        </Typography>
        <Box sx={{ mt: 1, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] ?? '#94A3B8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D2137',
                  border: '1px solid #1A3A5C',
                  borderRadius: 8,
                  color: '#E2E8F0',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export function RequestsBarChart({ stats }: ChartsProps) {
  const data = [
    { name: 'Pending',  value: stats.pendingRequests,  fill: '#F59E0B' },
    { name: 'Approved', value: stats.approvedRequests, fill: '#22C55E' },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" fontSize="0.68rem">
          Mission Requests Overview
        </Typography>
        <Box sx={{ mt: 1, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D2137',
                  border: '1px solid #1A3A5C',
                  borderRadius: 8,
                  color: '#E2E8F0',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
