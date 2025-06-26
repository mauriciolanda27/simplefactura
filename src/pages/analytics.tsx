import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import StatisticalAnalytics from '../components/PredictiveAnalytics';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/landing');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Cargando...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Análisis Estadístico Avanzado
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Utilizando métodos estadísticos avanzados para analizar patrones de gastos, proyecciones de flujo de caja y análisis estacional
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Características implementadas:</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, mb: 0 }}>
              <li>Proyección de flujo de caja usando análisis de series temporales</li>
              <li>Detección de patrones de pagos por proveedor</li>
              <li>Análisis estacional con recomendaciones automáticas</li>
              <li>Evaluación de riesgo financiero basada en estadísticas</li>
              <li>Insights estadísticos por categoría de gastos</li>
            </Typography>
          </Alert>
        </Paper>

        <StatisticalAnalytics />
      </Container>
    </Layout>
  );
} 