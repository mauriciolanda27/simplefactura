import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  const { data, error, isLoading } = useSWR('/api/analytics/predictions');

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

  if (!data || data.cashFlowPredictions.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        {data?.message || 'No hay suficientes datos para generar análisis estadístico. Agrega más facturas para obtener insights.'}
      </Alert>
    );
  }

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

      {/* Risk Assessment Card */}
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
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for different analytics */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Flujo de Caja" />
          <Tab label="Patrones de Pagos" />
          <Tab label="Análisis Estacional" />
          <Tab label="Insights de Gastos" />
        </Tabs>
      </Box>

      {/* Cash Flow Predictions */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
          </Grid>
          
          <Grid item xs={12}>
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
                  {data.cashFlowPredictions.slice(0, 10).map((prediction, index) => (
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
          </Grid>
        </Grid>
      </TabPanel>

      {/* Payment Predictions */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Análisis de Patrones de Pagos por Proveedor
        </Typography>
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
              {data.paymentPredictions.map((prediction, index) => (
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
      </TabPanel>

      {/* Seasonal Analysis */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
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
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Recomendaciones por Mes
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {data.seasonalAnalysis.map((analysis, index) => (
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
          </Grid>
        </Grid>
      </TabPanel>

      {/* Spending Insights */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Insights de Gastos por Categoría
        </Typography>
        <Grid container spacing={2}>
          {data.spendingInsights.map((insight, index) => (
            <Grid item xs={12} md={6} key={index}>
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
                  
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Mes Actual
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(insight.currentMonth)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Mes Anterior
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(insight.previousMonth)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Proyección próximo mes: {formatCurrency(insight.prediction)}
                  </Typography>
                  
                  <Alert severity={insight.trend > 10 ? 'warning' : 'info'} sx={{ mt: 1 }}>
                    {insight.recommendation}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Data Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
          Análisis basado en {data.dataPoints} facturas. Última actualización: {new Date(data.lastUpdated).toLocaleString('es-BO')}
        </Typography>
      </Box>
    </Box>
  );
} 