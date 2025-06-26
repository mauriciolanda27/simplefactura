import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function TestDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    categoriesCreated: number;
    invoicesCreated: number;
    totalAmount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const generateSampleData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test/generate-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar datos de muestra');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Generar Datos de Prueba">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Generar Datos de Prueba
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Esta página te permite generar datos de muestra para probar las funcionalidades de análisis predictivo.
          Solo funciona para usuarios que no tienen datos existentes.
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ¿Qué se generará?
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mb: 2 }}>
            <li>6 categorías de gastos (Servicios Básicos, Tecnología, Materiales, etc.)</li>
            <li>36-96 facturas distribuidas en los últimos 12 meses</li>
            <li>Patrones estacionales en los gastos (picos en diciembre, marzo, junio)</li>
            <li>Diferentes proveedores y rubros para análisis de patrones</li>
          </Typography>
          
          <Button
            variant="contained"
            onClick={generateSampleData}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Generando...
              </>
            ) : (
              'Generar Datos de Muestra'
            )}
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ¡Datos generados exitosamente!
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Categorías creadas:</strong> {result.categoriesCreated}<br />
              <strong>Facturas creadas:</strong> {result.invoicesCreated}<br />
              <strong>Monto total:</strong> {new Intl.NumberFormat('es-BO', {
                style: 'currency',
                currency: 'BOB'
              }).format(result.totalAmount)}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push('/analytics')}
              sx={{ mt: 2 }}
            >
              Ver Análisis Predictivo
            </Button>
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Próximos pasos
          </Typography>
          <Typography variant="body2" component="ol">
            <li>Genera los datos de muestra usando el botón de arriba</li>
            <li>Ve a la página de &quot;Análisis Predictivo&quot; en el menú lateral</li>
            <li>Explora las diferentes pestañas: Flujo de Caja, Predicciones de Pagos, etc.</li>
            <li>Observa cómo la IA detecta patrones y genera predicciones</li>
          </Typography>
        </Paper>
      </Container>
    </Layout>
  );
} 