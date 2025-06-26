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
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { 
  FileDownload,
  FilterList,
  TrendingUp,
  Business,
  AttachMoney,
  Receipt
} from '@mui/icons-material';
import Layout from '../components/Layout';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedContainer from '../components/AnimatedContainer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  summary: {
    totalInvoices: number;
    totalAmount: number;
    averageAmount: number;
    totalTax: number;
    periodStart: string;
    periodEnd: string;
  };
  topPerformers: {
    categories: Array<{ name: string; amount: number; count: number }>;
    vendors: Array<{ name: string; amount: number; count: number }>;
  };
  analysis: {
    growthRate: number;
    peakDay: string;
    peakAmount: number;
    averageDailySpending: number;
    mostExpensiveInvoice: number;
    cheapestInvoice: number;
  };
  invoices: Array<{
    id: string;
    invoice_number: string;
    vendor: string;
    category: string;
    rubro: string;
    total_amount: number;
    purchase_date: string;
    description: string;
  }>;
}

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  category: string;
  vendor: string;
  rubro: string;
  minAmount: number;
  maxAmount: number;
  reportType: 'summary' | 'detailed' | 'trends' | 'breakdown';
}

export default function Reports() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: '',
    dateTo: '',
    category: '',
    vendor: '',
    rubro: '',
    minAmount: 0,
    maxAmount: 0,
    reportType: 'summary'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/landing');
    }
  }, [session, status, router]);

  // Load report data
  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.category) params.append('category', filters.category);
        if (filters.vendor) params.append('vendor', filters.vendor);
        if (filters.rubro) params.append('rubro', filters.rubro);
        if (filters.minAmount > 0) params.append('minAmount', filters.minAmount.toString());
        if (filters.maxAmount > 0) params.append('maxAmount', filters.maxAmount.toString());
        params.append('reportType', filters.reportType);

        const res = await fetch(`/api/reports?${params}`);
        if (!res.ok) throw new Error('Error al cargar reporte');
        const data = await res.json();
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadReport();
    }
  }, [session, filters]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.category) params.append('category', filters.category);
      if (filters.vendor) params.append('vendor', filters.vendor);
      if (filters.rubro) params.append('rubro', filters.rubro);
      if (filters.minAmount > 0) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount > 0) params.append('maxAmount', filters.maxAmount.toString());
      params.append('reportType', filters.reportType);
      params.append('format', format);

      const res = await fetch(`/api/reports/export?${params}`);
      if (!res.ok) throw new Error('Error al exportar reporte');
      
      if (format === 'csv') {
        // Download CSV file
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${filters.reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === 'pdf') {
        // Generate PDF on frontend
        const pdfData = await res.json();
        generatePDF(pdfData, filters.reportType);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar');
    }
  };

  const generatePDF = (data: any, reportType: string) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('SimpleFactura - Reporte de Negocio', 20, 20);
    
    // Subtitle with period
    doc.setFontSize(12);
    const periodText = data.summary.periodStart && data.summary.periodEnd 
      ? `${data.summary.periodStart} - ${data.summary.periodEnd}`
      : 'Todo el período';
    doc.text(`Período: ${periodText}`, 20, 30);
    doc.text(`Fecha de exportación: ${data.exportDate}`, 20, 37);
    doc.text(`Tipo de reporte: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 20, 44);
    
    let yPosition = 55;

    if (reportType === 'summary') {
      // Summary section
      doc.setFontSize(16);
      doc.text('Resumen Ejecutivo', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total Facturas', data.summary.totalInvoices.toString()],
        ['Monto Total', `$${data.summary.totalAmount}`],
        ['IVA Total (13%)', `$${data.summary.totalTax}`],
        ['Promedio por Factura', `$${data.summary.averageAmount}`]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      // Top categories
      if (data.topPerformers.categories.length > 0) {
        doc.setFontSize(16);
        doc.text('Top Categorías', 20, yPosition);
        yPosition += 15;

        const categoryData = [['Categoría', 'Monto', 'Cantidad']];
        data.topPerformers.categories.forEach((cat: any) => {
          categoryData.push([cat.name, `$${cat.amount.toFixed(2)}`, cat.count.toString()]);
        });

        autoTable(doc, {
          startY: yPosition,
          head: [categoryData[0]],
          body: categoryData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [66, 139, 202] }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Top vendors
      if (data.topPerformers.vendors.length > 0) {
        doc.setFontSize(16);
        doc.text('Top Proveedores', 20, yPosition);
        yPosition += 15;

        const vendorData = [['Proveedor', 'Monto', 'Cantidad']];
        data.topPerformers.vendors.forEach((vendor: any) => {
          vendorData.push([vendor.name, `$${vendor.amount.toFixed(2)}`, vendor.count.toString()]);
        });

        autoTable(doc, {
          startY: yPosition,
          head: [vendorData[0]],
          body: vendorData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [66, 139, 202] }
        });
      }

    } else if (reportType === 'detailed') {
      // Detailed invoices table
      doc.setFontSize(16);
      doc.text('Detalle de Facturas', 20, yPosition);
      yPosition += 15;

      const tableData = data.invoices.map((inv: any) => [
        inv.number_receipt || '',
        inv.vendor || 'Sin proveedor',
        inv.category || 'Sin categoría',
        inv.rubro || 'Sin rubro',
        `$${inv.total_amount.toFixed(2)}`,
        new Date(inv.purchase_date).toLocaleDateString()
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Número', 'Proveedor', 'Categoría', 'Rubro', 'Monto', 'Fecha']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
    }

    // Save PDF
    doc.save(`reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Layout title="Reportes">
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
      <Layout title="Reportes">
        <Box sx={{ py: 4, px: 2 }}>
          <SkeletonLoader />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Reportes">
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Box>
      </Layout>
    );
  }

  if (!reportData) {
    return (
      <Layout title="Reportes">
        <Box sx={{ py: 4, px: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No hay datos disponibles para el período seleccionado
          </Typography>
        </Box>
      </Layout>
    );
  }

  const { summary, topPerformers, analysis, invoices } = reportData;

  return (
    <Layout title="Reportes">
      <Box sx={{ py: 4, px: 2 }}>

        {/* Header */}
        <AnimatedContainer animation="fade-in" delay={200}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 0 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Reportes de Negocio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Análisis detallado de facturas y gastos
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtros
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={() => handleExport('pdf')}
                >
                  Exportar PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={() => handleExport('csv')}
                >
                  Exportar CSV
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </AnimatedContainer>

        {/* Filters */}
        {showFilters && (
          <AnimatedContainer animation="fade-in" delay={300}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 0 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Filtros de Reporte
              </Typography>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Fecha Desde"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                  />
                  <TextField
                    label="Fecha Hasta"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                  />
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }} size="small">
                    <InputLabel>Tipo de Reporte</InputLabel>
                    <Select
                      value={filters.reportType}
                      onChange={(e) => setFilters({ ...filters, reportType: e.target.value as 'summary' | 'detailed' | 'trends' | 'breakdown' })}
                      label="Tipo de Reporte"
                    >
                      <MenuItem value="summary">Resumen</MenuItem>
                      <MenuItem value="detailed">Detallado</MenuItem>
                      <MenuItem value="trends">Tendencias</MenuItem>
                      <MenuItem value="breakdown">Desglose</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Monto Mínimo"
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({ ...filters, minAmount: parseFloat(e.target.value) || 0 })}
                    sx={{ minWidth: { xs: '100%', sm: 120 } }}
                    size="small"
                  />
                </Stack>
              </Stack>
            </Paper>
          </AnimatedContainer>
        )}

        {/* Summary Cards */}
        <AnimatedContainer animation="fade-in" delay={400}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
            <Card sx={{ borderRadius: 0, flex: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Receipt color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {summary.totalInvoices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Facturas
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 0, flex: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AttachMoney color="success" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${summary.totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monto Total
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 0, flex: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${summary.averageAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Promedio por Factura
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 0, flex: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Business color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${summary.totalTax.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      IVA Total (13%)
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </AnimatedContainer>

        {/* Analysis Insights */}
        <AnimatedContainer animation="fade-in" delay={500}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 0 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Análisis de Rendimiento
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 0, flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Tendencias de Crecimiento
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tasa de Crecimiento
                      </Typography>
                      <Typography variant="h5" color={analysis.growthRate >= 0 ? 'success.main' : 'error.main'}>
                        {analysis.growthRate >= 0 ? '+' : ''}{analysis.growthRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Día de Mayor Gasto
                      </Typography>
                      <Typography variant="h6">
                        {analysis.peakDay} (${analysis.peakAmount.toLocaleString()})
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ borderRadius: 0, flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Métricas Clave
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Gasto Promedio Diario
                      </Typography>
                      <Typography variant="h5">
                        ${analysis.averageDailySpending.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Factura Más Costosa
                      </Typography>
                      <Typography variant="h6">
                        ${analysis.mostExpensiveInvoice.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Paper>
        </AnimatedContainer>

        {/* Top Performers */}
        <AnimatedContainer animation="fade-in" delay={700}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mb: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 0, flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Top Categorías
              </Typography>
              <Stack spacing={2}>
                {topPerformers.categories.map((cat, index) => (
                  <Box key={cat.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={`#${index + 1}`} size="small" color="primary" />
                      <Typography variant="body1">{cat.name}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ${cat.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 0, flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Top Proveedores
              </Typography>
              <Stack spacing={2}>
                {topPerformers.vendors.map((vendor, index) => (
                  <Box key={vendor.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={`#${index + 1}`} size="small" color="secondary" />
                      <Typography variant="body1">{vendor.name}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ${vendor.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </AnimatedContainer>

        {/* Detailed Invoices Table */}
        {filters.reportType === 'detailed' && (
          <AnimatedContainer animation="fade-in" delay={800}>
            <Paper sx={{ p: 3, borderRadius: 0 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Detalle de Facturas
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Proveedor</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Rubro</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.vendor}</TableCell>
                        <TableCell>{invoice.category}</TableCell>
                        <TableCell>{invoice.rubro}</TableCell>
                        <TableCell>${invoice.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(invoice.purchase_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </AnimatedContainer>
        )}

      </Box>
    </Layout>
  );
} 