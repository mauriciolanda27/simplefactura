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
  TextField,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { 
  FileDownload,
  FilterList,
  TrendingUp,
  Business,
  AttachMoney,
  Receipt,
  Description as FileIcon,
  Storage as StorageIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedContainer from '../components/AnimatedContainer';
import { useAlert } from '../components/AlertSystem';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateChartImage, prepareChartDataForPDF } from '../utils/chartGenerator';

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
    rubros: Array<{ name: string; amount: number; count: number; rubroId?: string }>;
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
    rubroId?: string;
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
  const { showSuccess, showError, showWarning } = useAlert();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'csv' | null>(null);
  const [estimatedFileSize, setEstimatedFileSize] = useState<string>('');
  const [filenameError, setFilenameError] = useState<string>('');

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

  // Calculate estimated file size based on report type and filters
  useEffect(() => {
    if (filters.dateFrom || filters.dateTo) {
      // Rough estimation based on report type
      let estimatedSize = 0;
      
      if (filters.reportType === 'summary') {
        estimatedSize = 5000; // ~5KB for summary reports
      } else if (filters.reportType === 'detailed') {
        estimatedSize = 15000; // ~15KB for detailed reports
      } else if (filters.reportType === 'trends') {
        estimatedSize = 8000; // ~8KB for trend reports
      } else {
        estimatedSize = 10000; // ~10KB for breakdown reports
      }
      
      // Adjust based on date range
      if (filters.dateFrom && filters.dateTo) {
        const start = new Date(filters.dateFrom);
        const end = new Date(filters.dateTo);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        estimatedSize = Math.max(estimatedSize, daysDiff * 100); // At least 100 bytes per day
      }
      
      if (estimatedSize < 1024) {
        setEstimatedFileSize(`${estimatedSize} bytes`);
      } else if (estimatedSize < 1024 * 1024) {
        setEstimatedFileSize(`${(estimatedSize / 1024).toFixed(1)} KB`);
      } else {
        setEstimatedFileSize(`${(estimatedSize / (1024 * 1024)).toFixed(1)} MB`);
      }
    } else {
      setEstimatedFileSize('');
    }
  }, [filters.dateFrom, filters.dateTo, filters.reportType]);

  // Simulate export progress
  useEffect(() => {
    if (isExporting) {
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else {
      setExportProgress(0);
      setExportingFormat(null);
    }
  }, [isExporting]);

  // Real-time filename validation
  useEffect(() => {
    if (!filename) {
      setFilenameError('');
      return;
    }
    if (filename.length < 3) {
      setFilenameError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (filename.length > 50) {
      setFilenameError('El nombre no puede exceder 50 caracteres.');
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      setFilenameError('Solo se permiten letras, números, guiones, guiones bajos y puntos.');
      return;
    }
    setFilenameError('');
  }, [filename]);

  // Helper for auto-retry with exponential backoff
  async function retryExport(fn: () => Promise<any>, maxRetries = 3) {
    let attempt = 0;
    let lastError = null;
    const delays = [500, 1000, 2000];
    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        attempt++;
        if (attempt < maxRetries) {
          showWarning(
            `Reintentando exportación... (Intento ${attempt + 1} de ${maxRetries})`,
            'Reintentando'
          );
          await new Promise(res => setTimeout(res, delays[attempt - 1] || 2000));
        }
      }
    }
    throw lastError;
  }

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      setIsExporting(true);
      setExportingFormat(format);
      setExportProgress(0);
      setError('');

      await retryExport(async () => {
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
        if (!res.ok) {
          let errorMsg = 'Error al exportar reporte';
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }
        // Generate default filename if none provided
        const defaultFilename = `reporte_${filters.reportType}_${new Date().toISOString().split('T')[0]}`;
        const finalFilename = filename.trim() || defaultFilename;
        const fileExtension = format === 'csv' ? '.csv' : '.pdf';
        if (format === 'csv') {
          // Download CSV file with real progress
          const contentLength = res.headers.get('Content-Length');
          const total = contentLength ? parseInt(contentLength, 10) : undefined;
          const reader = res.body?.getReader();
          const chunks = [];
          let received = 0;
          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.length;
              if (total) {
                setExportProgress(Math.min(99, Math.round((received / total) * 100)));
              }
            }
          }
          const blob = new Blob(chunks, { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${finalFilename}${fileExtension}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else if (format === 'pdf') {
          // Generate PDF on frontend
          const pdfData = await res.json();
          await generatePDF(pdfData, filters.reportType, finalFilename);
        }
      });

      setExportProgress(100);
      showSuccess(
        `Reporte exportado exitosamente como "${(filename.trim() || `reporte_${filters.reportType}_${new Date().toISOString().split('T')[0]}`)}.${format}"`,
        'Exportación Completada'
      );

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al exportar';
      setError(msg);
      showError(
        msg,
        'Error de Exportación'
      );
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportingFormat(null);
    }
  };

  const generatePDF = async (data: any, reportType: string, filename: string) => {
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

      // Generate charts for summary report
      try {
        // Categories chart
        if (data.topPerformers.categories.length > 0) {
          const categoryChartData = prepareChartDataForPDF(data.topPerformers.categories, 'categories');
          const categoryChartImage = await generateChartImage(categoryChartData, {
            type: 'pie',
            title: 'Distribución por Categorías',
            width: 500,
            height: 300
          });

          // Add chart to PDF
          doc.addPage();
          doc.setFontSize(16);
          doc.text('Análisis Visual', 20, 20);
          
          doc.setFontSize(12);
          doc.text('Distribución de Gastos por Categoría', 20, 35);
          
          doc.addImage(categoryChartImage, 'PNG', 20, 45, 170, 100);
          
          yPosition = 160;
        }

        // Vendors chart
        if (data.topPerformers.vendors.length > 0) {
          const vendorChartData = prepareChartDataForPDF(data.topPerformers.vendors, 'vendors');
          const vendorChartImage = await generateChartImage(vendorChartData, {
            type: 'bar',
            title: 'Top Proveedores por Monto',
            width: 500,
            height: 300
          });

          // Add vendor chart to PDF
          if (yPosition > 120) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text('Top Proveedores por Monto', 20, yPosition);
          yPosition += 15;
          
          doc.addImage(vendorChartImage, 'PNG', 20, yPosition, 170, 100);
          yPosition += 120;
        }

      } catch (error) {
        console.warn('Error generating charts:', error);
        // Continue without charts if there's an error
      }

      // Add detailed tables on a new page
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Detalles por Categoría y Proveedor', 20, 20);
      yPosition = 35;

      // Top categories table
      if (data.topPerformers.categories.length > 0) {
        doc.setFontSize(14);
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

      // Top vendors table
      if (data.topPerformers.vendors.length > 0) {
        doc.setFontSize(14);
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
      // Generate trend chart for detailed report if we have invoice data
      if (data.invoices && data.invoices.length > 0) {
        try {
          // Create monthly trend data
          const monthlyStats = data.invoices.reduce((acc: any, inv: any) => {
            const month = new Date(inv.purchase_date).toLocaleDateString('es-BO', { 
              year: 'numeric', 
              month: 'short' 
            });
            if (!acc[month]) {
              acc[month] = { amount: 0, count: 0 };
            }
            acc[month].amount += inv.total_amount;
            acc[month].count += 1;
            return acc;
          }, {});

          const monthlyData = Object.entries(monthlyStats)
            .map(([month, stats]: [string, any]) => ({
              month,
              amount: stats.amount,
              count: stats.count
            }))
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

          if (monthlyData.length > 1) {
            const monthlyChartData = prepareChartDataForPDF(monthlyData, 'monthly');
            const monthlyChartImage = await generateChartImage(monthlyChartData, {
              type: 'line',
              title: 'Tendencia Mensual de Gastos',
              width: 500,
              height: 300
            });

            // Add chart to PDF
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Análisis de Tendencia', 20, 20);
            
            doc.setFontSize(12);
            doc.text('Tendencia Mensual de Gastos', 20, 35);
            
            doc.addImage(monthlyChartImage, 'PNG', 20, 45, 170, 100);
            
            yPosition = 160;
          }
        } catch (error) {
          console.warn('Error generating trend chart:', error);
        }
      }

      // Add detailed invoices table on a new page
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Detalle de Facturas', 20, 20);
      yPosition = 35;

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

    // Save PDF with custom filename
    doc.save(`${filename}.pdf`);
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
                  disabled={isExporting}
                >
                  Filtros
                </Button>
                <Button
                  variant="contained"
                  startIcon={isExporting && exportingFormat === 'pdf' ? <CircularProgress size={20} /> : <FileDownload />}
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting || !!filenameError}
                >
                  {isExporting && exportingFormat === 'pdf' ? 'Exportando PDF...' : 'Exportar PDF'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={isExporting && exportingFormat === 'csv' ? <CircularProgress size={20} /> : <FileDownload />}
                  onClick={() => handleExport('csv')}
                  disabled={isExporting || !!filenameError}
                >
                  {isExporting && exportingFormat === 'csv' ? 'Exportando CSV...' : 'Exportar CSV'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </AnimatedContainer>

        {/* Export Progress Indicator */}
        {isExporting && (
          <AnimatedContainer animation="fade-in" delay={100}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 0 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FileDownload sx={{ mr: 1 }} />
                Exportando Reporte {exportingFormat?.toUpperCase()}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={exportProgress} 
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {exportProgress}% completado - Generando archivo...
              </Typography>
            </Paper>
          </AnimatedContainer>
        )}

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
                    disabled={isExporting}
                  />
                  <TextField
                    label="Fecha Hasta"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                    disabled={isExporting}
                  />
                  <TextField
                    label="Categoría"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                    disabled={isExporting}
                  />
                  <TextField
                    label="Proveedor"
                    value={filters.vendor}
                    onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                    disabled={isExporting}
                  />
                  <TextField
                    label="Rubro"
                    value={filters.rubro}
                    onChange={(e) => setFilters({ ...filters, rubro: e.target.value })}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                    disabled={isExporting}
                  />
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }} size="small">
                    <InputLabel>Tipo de Reporte</InputLabel>
                    <Select
                      value={filters.reportType}
                      onChange={(e) => setFilters({ ...filters, reportType: e.target.value as 'summary' | 'detailed' | 'trends' | 'breakdown' })}
                      label="Tipo de Reporte"
                      disabled={isExporting}
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
                    disabled={isExporting}
                  />
                  <TextField
                    label="Monto Máximo"
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({ ...filters, maxAmount: parseFloat(e.target.value) || 0 })}
                    sx={{ minWidth: { xs: '100%', sm: 120 } }}
                    size="small"
                    disabled={isExporting}
                  />
                </Stack>
                
                {/* Filename Input */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <FileIcon sx={{ mr: 1 }} />
                      Nombre del Archivo de Exportación
                    </Typography>
                    <TextField
                      label="Nombre del archivo (opcional)"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      fullWidth
                      placeholder={`reporte_${filters.reportType}_${new Date().toISOString().split('T')[0]}`}
                      helperText={filenameError ? filenameError : `Si no especificas un nombre, se usará: reporte_${filters.reportType}_${new Date().toISOString().split('T')[0]}.{formato}`}
                      error={!!filenameError}
                      size="small"
                      disabled={isExporting}
                    />
                  </CardContent>
                </Card>

                {/* File Size Estimation */}
                {estimatedFileSize && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <StorageIcon sx={{ mr: 1 }} />
                        Estimación de Tamaño
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tamaño estimado del archivo: <strong>{estimatedFileSize}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Basado en el tipo de reporte y filtros seleccionados
                      </Typography>
                      {/* File size warning */}
                      {(() => {
                        // Parse estimated size in bytes
                        let sizeBytes = 0;
                        if (estimatedFileSize.endsWith('MB')) {
                          sizeBytes = parseFloat(estimatedFileSize) * 1024 * 1024;
                        } else if (estimatedFileSize.endsWith('KB')) {
                          sizeBytes = parseFloat(estimatedFileSize) * 1024;
                        } else if (estimatedFileSize.endsWith('bytes')) {
                          sizeBytes = parseFloat(estimatedFileSize);
                        }
                        const threshold = exportingFormat === 'csv' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
                        if (sizeBytes > threshold) {
                          return (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              El archivo estimado es muy grande y puede demorar en generarse o descargarse. Considera acotar el rango de fechas o aplicar más filtros.
                            </Alert>
                          );
                        }
                        return null;
                      })()}
                    </CardContent>
                  </Card>
                )}
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
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} sx={{ mb: 4 }}>
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
            <Paper sx={{ p: 3, borderRadius: 0, flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Top Rubros
              </Typography>
              <Stack spacing={2}>
                {topPerformers.rubros?.map((rubro, index) => (
                  <Box key={rubro.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={`#${index + 1}`} size="small" color="success" />
                      <Typography variant="body1">{rubro.name}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ${rubro.amount.toLocaleString()}
                    </Typography>
                  </Box>
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No hay datos de rubros disponibles
                  </Typography>
                )}
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

        {/* PDF Features Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <BarChartIcon sx={{ mr: 1, fontSize: 20 }} />
            PDF Incluye Gráficos Automáticos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Gráfico de distribución por categorías (circular)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Gráfico de top proveedores (barras)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Gráfico de tendencia mensual (líneas)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Resumen ejecutivo con tablas detalladas
          </Typography>
        </Box>

      </Box>
    </Layout>
  );
} 