'use client';

import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';
import type { SxProps } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
  sx?: SxProps;
}

export default function StatsCard({
  title, value, subtitle, icon, color = '#00B4D8', loading, sx,
}: StatsCardProps) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="text.secondary" fontSize="0.68rem">
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={48} />
            ) : (
              <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1, mt: 0.5 }}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: `${color}1A`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              '& svg': { color, fontSize: 26 },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
