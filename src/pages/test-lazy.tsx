import { useState } from 'react';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { 
  CameraAlt, 
  BarChart, 
  PieChart, 
  ShowChart,
  FileDownload,
  Receipt
} from '@mui/icons-material';
import { Suspense, lazy } from 'react';
import { LazyLoadingFallback } from '../components/LazyComponents';
import Layout from '../components/Layout';

// Lazy loading de componentes pesados
const LazyWebcamCapture = lazy(() => import('../components/WebcamCapture'));
const LazyExportDialog = lazy(() => import('../components/ExportDialog'));
const LazyInvoiceForm = lazy(() => import('../components/InvoiceForm'));

// Lazy loading de gráficos
const LazyLineChart = lazy(() => import('../components/charts/LineChart'));
const LazyBarChart = lazy(() => import('../components/charts/BarChart'));
const LazyPieChart = lazy(() => import('../components/charts/PieChart'));

export default function TestLazyPage() {
  const [showWebcam, setShowWebcam] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const handleWebcamCapture = (file: File) => {
    console.log('Imagen capturada:', file.name);
    setShowWebcam(false);
  };

  // Datos de ejemplo para gráficos
  const sampleData = [
    { week: 'Sem 1', amount: 1200, count: 5 },
    { week: 'Sem 2', amount: 1800, count: 8 },
    { week: 'Sem 3', amount: 1500, count: 6 },
    { week: 'Sem 4', amount: 2200, count: 10 }
  ];

  // Transform data to match LineChart expected format
  const transformedSampleData = sampleData.map(item => ({
    date: item.week,
    amount: item.amount,
    count: item.count
  }));

  const sampleCategories = [
    { name: 'Alimentación', amount: 2500, count: 12 },
    { name: 'Transporte', amount: 1800, count: 8 },
    { name: 'Servicios', amount: 1200, count: 6 },
    { name: 'Entretenimiento', amount: 800, count: 4 }
  ];

  // Transform category data to match PieChart expected format
  const transformedSampleCategories = sampleCategories.map(item => ({
    name: item.name,
    value: item.amount,
    color: undefined
  }));

  return (
    <Layout title="Prueba de Lazy Loading">
      <Box sx={{ py: 4, px: 2 }}>
        <Paper sx={{ p: 4, borderRadius: 0 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Lazy Loading - Pruebas de Rendimiento
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Esta página demuestra cómo el lazy loading mejora el rendimiento de la aplicación
            cargando componentes solo cuando son necesarios.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Componentes de UI */}
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Componentes de UI
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<CameraAlt />}
                  onClick={() => setShowWebcam(true)}
                  sx={{ borderRadius: 0 }}
                >
                  Cargar Webcam (Lazy)
                </Button>

                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={() => setShowExport(true)}
                  sx={{ borderRadius: 0 }}
                >
                  Cargar Export Dialog (Lazy)
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Receipt />}
                  onClick={() => setShowForm(true)}
                  sx={{ borderRadius: 0 }}
                >
                  Cargar Formulario (Lazy)
                </Button>
              </Stack>
            </Box>

            {/* Gráficos */}
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Componentes de Gráficos
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<BarChart />}
                onClick={() => setShowCharts(!showCharts)}
                sx={{ borderRadius: 0 }}
              >
                {showCharts ? 'Ocultar' : 'Mostrar'} Gráficos (Lazy)
              </Button>
            </Box>
          </Box>

          {/* Área de demostración de gráficos */}
          {showCharts && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Gráficos Cargados con Lazy Loading
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                  <Paper sx={{ p: 3, borderRadius: 0, height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Gráfico de Líneas
                    </Typography>
                    <Suspense fallback={<LazyLoadingFallback message="Cargando gráfico de líneas..." />}>
                      <LazyLineChart data={transformedSampleData} />
                    </Suspense>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                  <Paper sx={{ p: 3, borderRadius: 0, height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Gráfico de Barras
                    </Typography>
                    <Suspense fallback={<LazyLoadingFallback message="Cargando gráfico de barras..." />}>
                      <LazyBarChart data={sampleCategories} />
                    </Suspense>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                  <Paper sx={{ p: 3, borderRadius: 0, height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Gráfico Circular
                    </Typography>
                    <Suspense fallback={<LazyLoadingFallback message="Cargando gráfico circular..." />}>
                      <LazyPieChart data={transformedSampleCategories} />
                    </Suspense>
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}

          {/* Información sobre lazy loading */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Beneficios del Lazy Loading
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>• Tiempo de carga inicial más rápido:</strong> Solo se cargan los componentes necesarios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>• Mejor experiencia de usuario:</strong> La aplicación responde más rápido
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>• Optimización de recursos:</strong> Menor uso de memoria y ancho de banda
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>• Carga bajo demanda:</strong> Los componentes se cargan cuando se necesitan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>• Mejor SEO:</strong> Páginas más ligeras para los motores de búsqueda
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>• Escalabilidad:</strong> Fácil agregar nuevos componentes sin afectar el rendimiento
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Lazy loaded components */}
        {showWebcam && (
          <Suspense fallback={<LazyLoadingFallback message="Cargando cámara..." />}>
            <LazyWebcamCapture
              onImageCapture={handleWebcamCapture}
              onClose={() => setShowWebcam(false)}
            />
          </Suspense>
        )}

        {showExport && (
          <Suspense fallback={<LazyLoadingFallback message="Cargando exportación..." />}>
            <LazyExportDialog
              open={showExport}
              onClose={() => setShowExport(false)}
            />
          </Suspense>
        )}

        {showForm && (
          <Suspense fallback={<LazyLoadingFallback message="Cargando formulario..." />}>
            <LazyInvoiceForm
              onSaved={(data) => {
                console.log('Factura guardada:', data);
                setShowForm(false);
              }}
            />
          </Suspense>
        )}
      </Box>
    </Layout>
  );
} 