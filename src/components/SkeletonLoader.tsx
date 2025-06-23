import React from 'react';
import { Box, Skeleton, Card, CardContent, Stack } from '@mui/material';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'chart';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 1 
}) => {
  const renderCardSkeleton = () => (
    <Card sx={{ height: '100%', borderRadius: 0 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 0 }} />
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Box>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
      <Box sx={{ overflow: 'hidden' }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Skeleton variant="text" width="15%" height={20} />
            <Skeleton variant="text" width="25%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
            <Skeleton variant="text" width="10%" height={20} />
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderListSkeleton = () => (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
            <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 0 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderChartSkeleton = () => (
    <Card sx={{ height: 300, borderRadius: 0 }}>
      <CardContent>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 200 }}>
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton 
              key={index} 
              variant="rectangular" 
              width={40} 
              height={Math.random() * 150 + 50} 
              sx={{ borderRadius: 0 }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (type) {
      case 'table':
        return renderTableSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'chart':
        return renderChartSkeleton();
      default:
        return (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ width: '100%' }}>
            {Array.from({ length: count }).map((_, index) => (
              <Box key={index} sx={{ flex: 1 }}>
                {renderCardSkeleton()}
              </Box>
            ))}
          </Stack>
        );
    }
  };

  return (
    <Box 
      className="fade-in"
      sx={{ 
        width: '100%',
        '& .MuiSkeleton-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          '&::after': {
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          },
        },
      }}
    >
      {renderContent()}
    </Box>
  );
};

export default SkeletonLoader; 