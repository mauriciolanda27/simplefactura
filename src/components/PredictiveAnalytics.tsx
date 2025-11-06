import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Warning,
  Info
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StatisticalAnalytics() {
  const [tabValue, setTabValue] = useState(0);
  const { data, error, isLoading } = useSWR('/api/analytics/predictions', fetcher);

  // Debug logs
  useEffect(() => {
    console.log('🔍 PredictiveAnalytics - Status:', { isLoading, error, hasData: !!data });
    if (data) {
      console.log('📊 PredictiveAnalytics - Data received:', {
        cashFlow: data.cashFlowPredictions?.length || 0,
        payments: data.paymentPredictions?.length || 0,
        seasonal: data.seasonalAnalysis?.length || 0,
        insights: data.spendingInsights?.length || 0,
        rubros: data.rubroAnalysis?.length || 0,
        mockData: data.mockData
      });
    }
  }, [data, error, isLoading]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error al cargar el análisis estadístico: {error.message}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hay datos disponibles. Agrega más facturas para obtener análisis estadístico.
      </Alert>
    );
  }

  // Show partial data if some analyses are available
  const hasAnyData = data.cashFlowPredictions?.length > 0 || 
                     data.spendingInsights?.length > 0 || 
                     data.rubroAnalysis?.length > 0 ||
                     data.paymentPredictions?.length > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp color="success" />;
      case 'decreasing':
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="action" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Análisis Estadístico Avanzado
      </Typography>

      {!hasAnyData && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Se requieren más facturas distribuidas en diferentes fechas para generar análisis completo. 
          Actualmente: {data.dataPoints || 0} facturas. 
          Ve a <strong>/test-predictive-data</strong> para generar datos de prueba.
        </Alert>
      )}

      {/* Risk Assessment Card */}
      {data.riskAssessment && (
        <Card sx={{ mb: 3, border: `2px solid ${
          data.riskAssessment.riskLevel === 'high' ? '#f44336' :
          data.riskAssessment.riskLevel === 'medium' ? '#ff9800' : '#4caf50'
        }` }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Warning color={getRiskColor(data.riskAssessment.riskLevel)} sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Evaluación de Riesgo: {data.riskAssessment.riskLevel.toUpperCase()}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Factores de Riesgo:
              </Typography>
              {data.riskAssessment.riskFactors.map((factor: string, index: number) => (
                <Chip
                  key={index}
                  label={factor}
                  color="error"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recomendaciones:
              </Typography>
              {data.riskAssessment.recommendations.map((rec: string, index: number) => (
                <Chip
                  key={index}
                  label={rec}
                  color="primary"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
      )}

      {/* Tabs for different analytics */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Flujo de Caja" />
          <Tab label="Patrones de Pagos" />
          <Tab label="Análisis Estacional" />
          <Tab label="Insights de Gastos" />
          <Tab label="Análisis por Rubro" />
        </Tabs>
      </Box>

      {/* Cash Flow Predictions */}
      <TabPanel value={tabValue} index={0}>
        {data.cashFlowPredictions?.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Proyección de Flujo de Caja (Próximos 30 días)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.cashFlowPredictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Proyección']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-BO')}
                />
                <Line 
                  type="monotone" 
                  dataKey="predictedAmount" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Proyección</TableCell>
                    <TableCell>Confianza</TableCell>
                    <TableCell>Tendencia</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.cashFlowPredictions.slice(0, 10).map((prediction: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(prediction.date).toLocaleDateString('es-BO')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(prediction.predictedAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LinearProgress 
                            variant="determinate" 
                            value={prediction.confidence * 100} 
                            sx={{ width: 60, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {Math.round(prediction.confidence * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getTrendIcon(prediction.trend)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {prediction.trend === 'increasing' ? 'Aumentando' :
                             prediction.trend === 'decreasing' ? 'Disminuyendo' : 'Estable'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        ) : (
          <Alert severity="info">
            No hay suficientes datos para proyección de flujo de caja. 
            Se requieren facturas en al menos 3 fechas diferentes.
          </Alert>
        )}
      </TabPanel>

      {/* Payment Predictions */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Análisis de Patrones de Pagos por Proveedor
        </Typography>
        {data.paymentPredictions?.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proveedor</TableCell>
                <TableCell>Próximo Pago Estimado</TableCell>
                <TableCell>Monto Estimado</TableCell>
                <TableCell>Confianza</TableCell>
                <TableCell>Patrón</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.paymentPredictions.map((prediction: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {prediction.vendor}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(prediction.nextPaymentDate).toLocaleDateString('es-BO')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(prediction.predictedAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <LinearProgress 
                        variant="determinate" 
                        value={prediction.confidence * 100} 
                        sx={{ width: 60, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {Math.round(prediction.confidence * 100)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prediction.paymentPattern === 'regular' ? 'Regular' :
                             prediction.paymentPattern === 'seasonal' ? 'Estacional' : 'Irregular'}
                      color={prediction.paymentPattern === 'regular' ? 'success' :
                             prediction.paymentPattern === 'seasonal' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        ) : (
          <Alert severity="info">
            No hay suficientes datos para análisis de patrones de pago. 
            Se requieren al menos 3 facturas del mismo proveedor.
          </Alert>
        )}
      </TabPanel>

      {/* Seasonal Analysis */}
      <TabPanel value={tabValue} index={2}>
        {data.seasonalAnalysis?.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Typography variant="h6" gutterBottom>
              Análisis de Gastos por Mes
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.seasonalAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Gasto Promedio']} />
                <Bar dataKey="averageSpending" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Typography variant="h6" gutterBottom>
              Recomendaciones por Mes
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {data.seasonalAnalysis.map((analysis: any, index: number) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {new Date(2024, analysis.month - 1).toLocaleDateString('es-BO', { month: 'long' })}
                    </Typography>
                    <Chip
                      label={analysis.trend === 'peak' ? 'Pico' :
                             analysis.trend === 'low' ? 'Bajo' : 'Normal'}
                      color={analysis.trend === 'peak' ? 'error' :
                             analysis.trend === 'low' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Gasto promedio: {formatCurrency(analysis.averageSpending)}
                  </Typography>
                  <Typography variant="body2">
                    {analysis.recommendation}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
        ) : (
          <Alert severity="info">
            No hay suficientes datos para análisis estacional.
          </Alert>
        )}
      </TabPanel>

      {/* Spending Insights */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Insights de Gastos por Categoría
        </Typography>
        {data.spendingInsights?.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {data.spendingInsights.map((insight: any, index: number) => (
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                      {insight.category}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {insight.trend > 0 ? <TrendingUp color="error" /> : <TrendingDown color="success" />}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {insight.trend > 0 ? '+' : ''}{insight.trend}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }} mb={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mes Actual
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(insight.currentMonth)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mes Anterior
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(insight.previousMonth)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Proyección próximo mes: {formatCurrency(insight.prediction)}
                  </Typography>
                  
                  <Alert severity={insight.trend > 10 ? 'warning' : 'info'} sx={{ mt: 1 }}>
                    {insight.recommendation}
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
        ) : (
          <Alert severity="info">
            No hay suficientes datos para insights de gastos por categoría.
          </Alert>
        )}
      </TabPanel>

      {/* Rubro Analysis */}
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Análisis de Gastos por Rubro
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {data.rubroAnalysis?.map((rubro: any, index: number) => (
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                      {rubro.name}
                    </Typography>
                    <Chip
                      label={`${rubro.count} facturas`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }} mb={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Monto Total
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(rubro.amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Porcentaje
                      </Typography>
                      <Typography variant="h6">
                        {rubro.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Promedio por factura: {formatCurrency(rubro.amount / rubro.count)}
                  </Typography>
                  
                  <Alert severity={rubro.percentage > 30 ? 'warning' : 'info'} sx={{ mt: 1 }}>
                    {rubro.percentage > 30 
                      ? 'Este rubro representa una porción significativa de tus gastos. Considera revisar si es necesario.'
                      : 'Gasto moderado en este rubro.'}
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          )) || (
            <Alert severity="info">
              No hay datos de rubros disponibles para análisis.
            </Alert>
          )}
        </Box>
      </TabPanel>

      {/* Data Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
          Análisis basado en {data.dataPoints} facturas. Última actualización: {new Date(data.lastUpdated).toLocaleString('es-BO')}
        </Typography>
        {data.mockData && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
            Datos de demostración generados automáticamente para visualización
          </Typography>
        )}
      </Box>
    </Box>
  );
} 