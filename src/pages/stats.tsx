// pages/stats.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Typography, 
  Paper, 
  Box, 
  Stack, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { 
  Receipt, 
  AttachMoney,
  Category as CategoryIcon,
  Business
} from '@mui/icons-material';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedContainer from '../components/AnimatedContainer';
import { useHoverAnimation } from '../utils/useScrollAnimation';
import { Suspense, lazy } from 'react';
import { LazyLoadingFallback } from '../components/LazyComponents';

// Componente de gráfico de líneas lazy
const LazyLineChart = lazy(() => import('../components/charts/LineChart'));
const LazyBarChart = lazy(() => import('../components/charts/BarChart'));
const LazyPieChart = lazy(() => import('../components/charts/PieChart'));

interface StatsData {
  summary: {
    totalInvoices: number;
    totalAmount: number;
    averageAmount: number;
    totalTax: number;
  };
  weeklyData: Array<{ week: string; amount: number; count: number }>;
  monthlyData: Array<{ month: string; amount: number; count: number }>;
  categoryData: Array<{ category: string; amount: number; count: number }>;
  vendorData: Array<{ vendor: string; amount: number; count: number }>;
  rubroData: Array<{ rubro: string; amount: number; count: number }>;
  trends: Array<{ period: string; growth: number }>;
  comparisons: Array<{
    metric: string;
    current: number;
    previous: number;
    change: number;
  }>;
  topCategories: Array<{ name: string; amount: number; count: number }>;
  topRubros: Array<{ name: string; amount: number; count: number }>;
}

export default function Stats() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { handlers: headerHover } = useHoverAnimation();
  
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/landing');
    }
  }, [session, status, router]);

  // Load stats data
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        const data = await res.json();
        setStatsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadStats();
    }
  }, [session, timeRange]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Layout title="Estadísticas">
        <Box sx={{ py: 4 }}>
          <SkeletonLoader />
        </Box>
      </Layout>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <Layout title="Estadísticas">
        <Box sx={{ py: 4, px: 2 }}>
          <SkeletonLoader />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Estadísticas">
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Box>
      </Layout>
    );
  }

  if (!statsData) {
    return (
      <Layout title="Estadísticas">
        <Box sx={{ py: 4, px: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No hay datos disponibles
          </Typography>
        </Box>
      </Layout>
    );
  }

  const { summary, weeklyData, monthlyData, categoryData, vendorData, rubroData, comparisons } = statsData;

  // Transform data to match LineChart expected format
  const transformedWeeklyData: Array<{ date: string; amount: number; count: number }> = weeklyData.map(item => ({
    date: item.week,
    amount: item.amount,
    count: item.count
  }));

  const transformedMonthlyData: Array<{ date: string; amount: number; count: number }> = monthlyData.map(item => ({
    date: item.month,
    amount: item.amount,
    count: item.count
  }));

  // Transform category data to match PieChart expected format
  const transformedCategoryData: Array<{ name: string; value: number; color?: string }> = categoryData.map(item => ({
    name: item.category,
    value: item.amount,
    color: undefined
  }));

  // Transform vendor and rubro data to match BarChart expected format
  const transformedVendorData: Array<{ vendor: string; amount: number; count: number }> = vendorData.map(item => ({
    vendor: item.vendor,
    amount: item.amount,
    count: item.count
  }));

  const transformedRubroData: Array<{ rubro: string; amount: number; count: number }> = rubroData.map(item => ({
    rubro: item.rubro,
    amount: item.amount,
    count: item.count
  }));

  // Calcular cambios porcentuales desde el array de comparisons
  const amountComparison = comparisons.find(c => c.metric === 'Total Monto');
  const countComparison = comparisons.find(c => c.metric === 'Total Facturas');
  
  const amountChange = amountComparison ? amountComparison.change : 0;
  const countChange = countComparison ? countComparison.change : 0;

  return (
    <Layout title="Estadísticas">
      <Box sx={{ py: 4, px: 2 }}>

        {/* Filtros */}
        <AnimatedContainer animation="fade-in" delay={300}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 0 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Período de Análisis:
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Rango de Tiempo</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Rango de Tiempo"
                  sx={{ borderRadius: 0 }}
                >
                  <MenuItem value="week">Última Semana</MenuItem>
                  <MenuItem value="month">Último Mes</MenuItem>
                  <MenuItem value="quarter">Último Trimestre</MenuItem>
                  <MenuItem value="year">Último Año</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </AnimatedContainer>

        {/* Métricas principales */}
        <AnimatedContainer animation="fade-in" delay={400}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
            <MetricCard
              title="Total Facturas"
              value={summary.totalInvoices}
              icon={<Receipt />}
              trend={countChange > 0 ? 'up' : countChange < 0 ? 'down' : null}
              trendValue={Math.abs(countChange)}
              trendLabel="vs mes anterior"
              color="primary"
            />
            <MetricCard
              title="Monto Total"
              value={summary.totalAmount}
              icon={<AttachMoney />}
              trend={amountChange > 0 ? 'up' : amountChange < 0 ? 'down' : null}
              trendValue={Math.abs(amountChange)}
              trendLabel="vs mes anterior"
              color="success"
            />
            <MetricCard
              title="Categorías"
              value={categoryData.length}
              icon={<CategoryIcon />}
              color="info"
            />
            <MetricCard
              title="Proveedores"
              value={vendorData.length}
              icon={<Business />}
              color="warning"
            />
          </Box>
        </AnimatedContainer>

        {/* Gráficos */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Gráfico de tendencias */}
          <AnimatedContainer animation="slide-in-left" delay={600}>
            <Paper sx={{ p: 3, borderRadius: 0, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tendencia de Gastos
              </Typography>
              <Suspense fallback={<LazyLoadingFallback message="Cargando gráfico..." />}>
                <LazyLineChart data={timeRange === 'week' ? transformedWeeklyData : transformedMonthlyData} />
              </Suspense>
            </Paper>
          </AnimatedContainer>

          {/* Gráfico de categorías */}
          <AnimatedContainer animation="slide-in-right" delay={700}>
            <Paper sx={{ p: 3, borderRadius: 0, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Gastos por Categoría
              </Typography>
              <Suspense fallback={<LazyLoadingFallback message="Cargando gráfico..." />}>
                <LazyPieChart data={transformedCategoryData} />
              </Suspense>
            </Paper>
          </AnimatedContainer>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
          {/* Gráfico de rubros */}
          <AnimatedContainer animation="fade-in" delay={800}>
            <Paper sx={{ p: 3, borderRadius: 0, height: 350 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Gastos por Rubro
              </Typography>
              <Suspense fallback={<LazyLoadingFallback message="Cargando gráfico..." />}>
                <LazyBarChart data={transformedRubroData} />
              </Suspense>
            </Paper>
          </AnimatedContainer>

          {/* Gráfico de proveedores */}
          <AnimatedContainer animation="fade-in" delay={900}>
            <Paper sx={{ p: 3, borderRadius: 0, height: 350 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Gastos por Proveedor
              </Typography>
              <Suspense fallback={<LazyLoadingFallback message="Cargando gráfico..." />}>
                <LazyBarChart data={transformedVendorData} />
              </Suspense>
            </Paper>
          </AnimatedContainer>
        </Box>
      </Box>
    </Layout>
  );
} 