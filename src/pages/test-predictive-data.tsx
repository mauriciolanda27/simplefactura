import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';

interface GenerationResult {
  success: boolean;
  message: string;
  data?: {
    invoicesCreated: number;
    datesUsed: number;
    dateRange: {
      from: string;
      to: string;
    };
    categoriesUsed: number;
    rubrosUsed: number;
    totalAmount: number;
  };
  error?: string;
}

export default function TestPredictiveDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerateData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/generate-predictive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Wait a bit for the user to see the success message
        setTimeout(() => {
          // Optionally redirect to analytics page
          // router.push('/analytics');
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating data:', error);
      setResult({
        success: false,
        message: 'Error al generar datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <ScienceIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Generar Datos para Análisis Predictivo
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Genera facturas de prueba distribuidas en múltiples fechas para habilitar el análisis estadístico
          </Typography>
        </Box>

        {/* Explanation Card */}
        <Card sx={{ mb: 4, bgcolor: 'info.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              ¿Por qué necesito esto?
            </Typography>
            <Typography variant="body2" paragraph>
              El análisis predictivo requiere facturas distribuidas en al menos <strong>7 fechas diferentes</strong> para
              poder identificar tendencias, patrones y realizar proyecciones estadísticamente confiables.
            </Typography>
            <Typography variant="body2">
              Este botón generará automáticamente:
            </Typography>
            <List dense>
              <ListItem sx={{ color: 'white' }}>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="20-30 facturas de prueba" />
              </ListItem>
              <ListItem sx={{ color: 'white' }}>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Distribuidas en 10-15 fechas diferentes" />
              </ListItem>
              <ListItem sx={{ color: 'white' }}>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="A lo largo de los últimos 3 meses" />
              </ListItem>
              <ListItem sx={{ color: 'white' }}>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Con proveedores y montos variados" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
            sx={{ 
              py: 2, 
              px: 6,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Generando Datos...' : 'Generar Datos de Prueba'}
          </Button>
          
          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Esto puede tomar 10-20 segundos...
            </Typography>
          )}
        </Paper>

        {/* Results */}
        {result && (
          <Box sx={{ mb: 4 }}>
            {result.success ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    ¡Datos generados exitosamente! 🎉
                  </Typography>
                  <Typography variant="body2">
                    {result.message}
                  </Typography>
                </Alert>

                {result.data && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Resumen de Datos Generados
                      </Typography>

                      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              Facturas Creadas
                            </Typography>
                          </Box>
                          <Typography variant="h4" color="primary.main">
                            {result.data.invoicesCreated}
                          </Typography>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              Fechas Diferentes
                            </Typography>
                          </Box>
                          <Typography variant="h4" color="success.main">
                            {result.data.datesUsed}
                          </Typography>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CategoryIcon sx={{ mr: 1, color: 'info.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              Categorías Usadas
                            </Typography>
                          </Box>
                          <Typography variant="h4" color="info.main">
                            {result.data.categoriesUsed}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Rango de Fechas
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip 
                            label={new Date(result.data.dateRange.from).toLocaleDateString('es-BO', { 
                              day: '2-digit', 
                              month: 'long', 
                              year: 'numeric' 
                            })} 
                            color="primary" 
                          />
                          <Typography variant="body2">hasta</Typography>
                          <Chip 
                            label={new Date(result.data.dateRange.to).toLocaleDateString('es-BO', { 
                              day: '2-digit', 
                              month: 'long', 
                              year: 'numeric' 
                            })} 
                            color="primary" 
                          />
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Monto Total Generado
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {formatCurrency(result.data.totalAmount)}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      <Alert severity="info">
                        <Typography variant="body2" gutterBottom>
                          <strong>Próximos pasos:</strong>
                        </Typography>
                        <Typography variant="body2">
                          Ve a la página de <strong>Análisis Predictivo</strong> para ver todos los gráficos, 
                          proyecciones y recomendaciones basadas en estos datos.
                        </Typography>
                      </Alert>

                      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          onClick={() => router.push('/analytics')}
                          startIcon={<TrendingUpIcon />}
                        >
                          Ver Análisis Predictivo
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => router.push('/')}
                        >
                          Ir al Dashboard
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Alert severity="error">
                <Typography variant="h6" gutterBottom>
                  Error al generar datos
                </Typography>
                <Typography variant="body2">
                  {result.error || result.message}
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Warning */}
        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Nota:</strong> Esta función es solo para pruebas y demostración. 
            Los datos generados son ficticios y se mezclarán con tus facturas reales.
          </Typography>
        </Alert>
      </Container>
    </Layout>
  );
}

