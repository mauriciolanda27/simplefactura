import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface MetricCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  trend?: 'up' | 'down' | null;
  trendValue?: number;
  trendLabel?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  color = 'primary',
  prefix = '',
  suffix = '',
  loading = false,
  trend = null,
  trendValue,
  trendLabel
}: MetricCardProps) {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = useState(loading ? 0 : value);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (loading) {
      setDisplayValue(0);
      return;
    }
    const start = ref.current;
    let startTime: number | null = null;
    const duration = 800;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(start + (value - start) * progress);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        ref.current = value;
      }
    };
    requestAnimationFrame(animate);
  }, [value, loading]);

  return (
    <Card sx={{ borderRadius: 0, boxShadow: 'none', minWidth: 200, height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          {icon && (
            <Box color={theme.palette[color].main} sx={{ display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h4" fontWeight={600} color={theme.palette[color].main}>
            {prefix}{displayValue.toLocaleString()}{suffix}
          </Typography>
          {trend && trendValue !== undefined && (
            <Chip
              size="small"
              icon={trend === 'up' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
              label={`${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%${trendLabel ? ' ' + trendLabel : ''}`}
              sx={{
                bgcolor: trend === 'up' ? theme.palette.success.light : theme.palette.error.light,
                color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 500,
                borderRadius: 0
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
} 