import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon,
  Description as FileIcon,
  Storage as StorageIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAlert } from './AlertSystem';
import { generateChartImage, prepareChartDataForPDF } from '../utils/chartGenerator';
import { shouldCompress, estimateCompressionRatio } from '../utils/compression';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Invoice {
  id: string;
  authorization_code: string;
  name: string;
  nit: string;
  nit_ci_cex: string;
  number_receipt: string;
  purchase_date: string;
  total_amount: number;
  vendor: string;
}

interface PdfData {
  invoices: Invoice[];
  summary: {
    totalInvoices: number;
    totalAmount: string;
    totalWithoutIVA: string;
    totalIVA: string;
    period: string;
    exportDate: string;
  };
  filters: {
    startDate: string;
    endDate: string;
    vendor?: string;
    nit?: string;
  };
}

export default function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { showSuccess, showError, showWarning } = useAlert();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [vendor, setVendor] = useState('');
  const [nit, setNit] = useState('');
  const [includeIVA, setIncludeIVA] = useState(true);
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [estimatedFileSize, setEstimatedFileSize] = useState<string>('');
  const [error, setError] = useState('');
  const [filenameError, setFilenameError] = useState<string>('');
  const [enableCompression, setEnableCompression] = useState(false);
  const [compressedFileSize, setCompressedFileSize] = useState<string>('');

  // Calculate estimated file size based on date range and format
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Rough estimation: ~500 bytes per invoice for CSV, ~2KB per invoice for PDF
      const estimatedInvoices = Math.max(1, daysDiff * 2); // Assume 2 invoices per day on average
      const sizePerInvoice = format === 'csv' ? 500 : 2000;
      const estimatedSize = estimatedInvoices * sizePerInvoice;
      
      let sizeText = '';
      if (estimatedSize < 1024) {
        sizeText = `${estimatedSize} bytes`;
      } else if (estimatedSize < 1024 * 1024) {
        sizeText = `${(estimatedSize / 1024).toFixed(1)} KB`;
      } else {
        sizeText = `${(estimatedSize / (1024 * 1024)).toFixed(1)} MB`;
      }
      
      setEstimatedFileSize(sizeText);
      
      // Calculate compressed size if compression is enabled
      if (enableCompression && shouldCompress(estimatedSize, format)) {
        const compressionRatio = estimateCompressionRatio(format);
        const compressedSize = estimatedSize * compressionRatio;
        
        if (compressedSize < 1024) {
          setCompressedFileSize(`${compressedSize.toFixed(0)} bytes`);
        } else if (compressedSize < 1024 * 1024) {
          setCompressedFileSize(`${(compressedSize / 1024).toFixed(1)} KB`);
        } else {
          setCompressedFileSize(`${(compressedSize / (1024 * 1024)).toFixed(1)} MB`);
        }
      } else {
        setCompressedFileSize('');
      }
    } else {
      setEstimatedFileSize('');
      setCompressedFileSize('');
    }
  }, [startDate, endDate, format, enableCompression]);

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

  const generatePDF = async (data: PdfData) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Reporte de Facturas - SimpleFactura', 20, 20);
    
    // Subtitle with period
    doc.setFontSize(12);
    doc.text(`Período: ${data.summary.period}`, 20, 30);
    doc.text(`Fecha de exportación: ${data.summary.exportDate}`, 20, 37);
    
    // Filters applied
    let filterText = 'Filtros aplicados:';
    if (data.filters.vendor) filterText += ` Vendedor: ${data.filters.vendor}`;
    if (data.filters.nit) filterText += ` NIT: ${data.filters.nit}`;
    if (!data.filters.vendor && !data.filters.nit) filterText += ' Ninguno';
    
    doc.text(filterText, 20, 44);
    
    // Summary section
    doc.setFontSize(14);
    doc.text('Resumen', 20, 55);
    
    doc.setFontSize(10);
    doc.text(`Total de facturas: ${data.summary.totalInvoices}`, 20, 65);
    doc.text(`Monto total: Bs. ${data.summary.totalAmount}`, 20, 72);
    
    if (includeIVA) {
      doc.text(`Monto sin IVA: Bs. ${data.summary.totalWithoutIVA}`, 20, 79);
      doc.text(`IVA (13%): Bs. ${data.summary.totalIVA}`, 20, 86);
    }

    // Generate charts if we have enough data
    let yPosition = includeIVA ? 95 : 85;
    
    if (data.invoices.length > 0) {
      try {
        // Generate vendor distribution chart
        const vendorStats = data.invoices.reduce((acc: any, inv) => {
          acc[inv.vendor] = (acc[inv.vendor] || 0) + inv.total_amount;
          return acc;
        }, {});
        
        const topVendors = Object.entries(vendorStats)
          .map(([name, amount]) => ({ name, amount: amount as number }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        if (topVendors.length > 1) {
          const vendorChartData = prepareChartDataForPDF(topVendors, 'vendors');
          const vendorChartImage = await generateChartImage(vendorChartData, {
            type: 'bar',
            title: 'Distribución por Proveedor (Top 5)',
            width: 500,
            height: 300
          });

          // Add chart to PDF
          doc.addPage();
          doc.setFontSize(16);
          doc.text('Análisis Visual', 20, 20);
          
          doc.setFontSize(12);
          doc.text('Distribución de Gastos por Proveedor', 20, 35);
          
          doc.addImage(vendorChartImage, 'PNG', 20, 45, 170, 100);
          
          yPosition = 160;
        }

        // Generate monthly trend chart if we have data across multiple months
        const monthlyStats = data.invoices.reduce((acc: any, inv) => {
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
            title: 'Tendencia Mensual',
            width: 500,
            height: 300
          });

          // Add monthly chart to PDF
          if (yPosition > 120) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text('Tendencia de Gastos por Mes', 20, yPosition);
          yPosition += 15;
          
          doc.addImage(monthlyChartImage, 'PNG', 20, yPosition, 170, 100);
          yPosition += 120;
        }

      } catch (error) {
        console.warn('Error generating charts:', error);
        // Continue without charts if there's an error
      }
    }

    // Add detailed table on a new page
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Detalle de Facturas', 20, 20);
    
    // Table headers
    const headers = includeIVA 
      ? [
          'Fecha',
          'Vendedor', 
          'NIT',
          'Número Recibo',
          'Monto (Bs.)',
          'Sin IVA (Bs.)',
          'IVA (Bs.)'
        ]
      : [
          'Fecha',
          'Vendedor', 
          'NIT',
          'Número Recibo',
          'Monto (Bs.)'
        ];
    
    // Table data
    const tableData = data.invoices.map(inv => {
      if (includeIVA) {
        return [
          new Date(inv.purchase_date).toLocaleDateString('es-BO'),
          inv.vendor,
          inv.nit || '-',
          inv.number_receipt || '-',
          inv.total_amount.toFixed(2),
          (inv.total_amount / 1.13).toFixed(2),
          (inv.total_amount - inv.total_amount / 1.13).toFixed(2)
        ];
      } else {
        return [
          new Date(inv.purchase_date).toLocaleDateString('es-BO'),
          inv.vendor,
          inv.nit || '-',
          inv.number_receipt || '-',
          inv.total_amount.toFixed(2)
        ];
      }
    });
    
    // Add table to PDF
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: includeIVA 
        ? {
            0: { cellWidth: 20 }, // Date
            1: { cellWidth: 35 }, // Vendor
            2: { cellWidth: 25 }, // NIT
            3: { cellWidth: 25 }, // Receipt number
            4: { cellWidth: 20 }, // Total amount
            5: { cellWidth: 20 }, // Without IVA
            6: { cellWidth: 20 }, // IVA
          }
        : {
            0: { cellWidth: 25 }, // Date
            1: { cellWidth: 40 }, // Vendor
            2: { cellWidth: 30 }, // NIT
            3: { cellWidth: 30 }, // Receipt number
            4: { cellWidth: 25 }, // Total amount
          },
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por SimpleFactura`,
        20,
        doc.internal.pageSize.height - 10
      );
    }
    
    return doc;
  };

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

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Por favor selecciona un rango de fechas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio no puede ser mayor a la fecha de fin');
      return;
    }

    setIsExporting(true);
    setError('');
    setExportProgress(0);

    try {
      await retryExport(async () => {
        const response = await fetch('/api/invoices/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            format,
            vendor: vendor.trim() || undefined,
            nit: nit.trim() || undefined,
            includeIVA,
          }),
        });

        if (!response.ok) {
          let errorMsg = 'Error al exportar';
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }

        // Generate default filename if none provided
        const defaultFilename = `facturas_${startDate}_${endDate}`;
        const finalFilename = filename.trim() || defaultFilename;
        const fileExtension = format === 'csv' ? '.csv' : '.pdf';

        if (format === 'csv') {
          // Download CSV file with real progress
          const contentLength = response.headers.get('Content-Length');
          const total = contentLength ? parseInt(contentLength, 10) : undefined;
          const reader = response.body?.getReader();
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
          // Generate and download PDF
          const pdfData: PdfData = await response.json();
          const doc = await generatePDF(pdfData);
          doc.save(`${finalFilename}${fileExtension}`);
        }
      });

      setExportProgress(100);
      showSuccess(
        `Archivo exportado exitosamente como "${(filename.trim() || `facturas_${startDate}_${endDate}`)}.${format}"`,
        'Exportación Completada'
      );
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al exportar';
      setError(msg);
      showError(
        msg,
        'Error de Exportación'
      );
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const clearFilters = () => {
    setVendor('');
    setNit('');
  };

  const hasFilters = vendor.trim() || nit.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Exportar Facturas
          </Typography>
          <IconButton onClick={onClose} size="small" disabled={isExporting}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          {/* Date Range */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon sx={{ mr: 1 }} />
                Rango de Fechas
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  label="Fecha de inicio"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled={isExporting}
                />
                <TextField
                  label="Fecha de fin"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled={isExporting}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filtros Opcionales
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  label="Vendedor"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  fullWidth
                  placeholder="Filtrar por vendedor"
                  disabled={isExporting}
                />
                <TextField
                  label="NIT"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  fullWidth
                  placeholder="Filtrar por NIT"
                  disabled={isExporting}
                />
              </Box>
              {hasFilters && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                    startIcon={<CloseIcon />}
                    disabled={isExporting}
                  >
                    Limpiar Filtros
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Formato de Exportación
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Formato</InputLabel>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')}
                  label="Formato"
                  disabled={isExporting}
                >
                  <MenuItem value="csv">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CsvIcon sx={{ mr: 1 }} />
                      CSV (.csv) - Para análisis y contabilidad
                    </Box>
                  </MenuItem>
                  <MenuItem value="pdf">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PdfIcon sx={{ mr: 1 }} />
                      PDF - Para presentación y archivo
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {/* PDF Features Info */}
              {format === 'pdf' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BarChartIcon sx={{ mr: 1, fontSize: 20 }} />
                    PDF Incluye Gráficos Automáticos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Gráfico de distribución por proveedor (barras)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Gráfico de tendencia mensual (líneas)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Resumen ejecutivo con tablas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Detalle completo de facturas
                  </Typography>
                </Box>
              )}
              
              {/* Compression Options */}
              {estimatedFileSize && (
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableCompression}
                        onChange={(e) => setEnableCompression(e.target.checked)}
                        disabled={isExporting}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArchiveIcon sx={{ mr: 1, fontSize: 16 }} />
                        Comprimir archivo (recomendado para archivos grandes)
                      </Box>
                    }
                  />
                  {enableCompression && compressedFileSize && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
                      Tamaño estimado comprimido: {compressedFileSize}
                    </Typography>
                  )}
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeIVA}
                      onChange={(e) => setIncludeIVA(e.target.checked)}
                      disabled={isExporting}
                    />
                  }
                  label="Incluir cálculos de IVA (13%) en el reporte"
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>CSV:</strong> {includeIVA ? 'Incluye cálculos de IVA (13%), resumen y datos detallados para SIN.' : 'Incluye datos básicos sin cálculos de IVA.'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>PDF:</strong> {includeIVA ? 'Reporte profesional con gráficos, tabla de datos, resumen ejecutivo y cálculos de IVA.' : 'Reporte simplificado con gráficos y datos básicos sin cálculos de IVA.'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Filename */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FileIcon sx={{ mr: 1 }} />
                Nombre del Archivo
              </Typography>
              <TextField
                label="Nombre del archivo (opcional)"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                fullWidth
                placeholder={`facturas_${startDate}_${endDate}`}
                helperText={filenameError ? filenameError : `Si no especificas un nombre, se usará: facturas_${startDate}_${endDate}.${format}`}
                error={!!filenameError}
                InputProps={{
                  endAdornment: (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      .{format}
                    </Typography>
                  ),
                }}
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
                  Basado en el rango de fechas seleccionado y el formato elegido
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
                  const threshold = format === 'csv' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
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

          {/* Progress Indicator */}
          {isExporting && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Exportando...
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={exportProgress} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {exportProgress}% completado
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* Export Preview */}
          {startDate && endDate && !isExporting && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vista Previa de Exportación
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Desde: ${startDate}`} size="small" />
                  <Chip label={`Hasta: ${endDate}`} size="small" />
                  {vendor && <Chip label={`Vendedor: ${vendor}`} size="small" />}
                  {nit && <Chip label={`NIT: ${nit}`} size="small" />}
                  <Chip label={`Formato: ${format.toUpperCase()}`} size="small" color="primary" />
                  <Chip 
                    label={`IVA: ${includeIVA ? 'Incluido' : 'Excluido'}`} 
                    size="small" 
                    color={includeIVA ? 'success' : 'default'}
                  />
                  {enableCompression && <Chip label="Comprimido" size="small" color="secondary" />}
                </Stack>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Archivo:</strong> {(filename.trim() || `facturas_${startDate}_${endDate}`) + '.' + (enableCompression ? 'zip' : format)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isExporting || !startDate || !endDate || !!filenameError}
          startIcon={isExporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          sx={{ px: 3 }}
        >
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}