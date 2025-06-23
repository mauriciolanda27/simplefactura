import { useState } from 'react';
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
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [vendor, setVendor] = useState('');
  const [nit, setNit] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const generatePDF = (data: PdfData) => {
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
    doc.text(`Monto sin IVA: Bs. ${data.summary.totalWithoutIVA}`, 20, 79);
    doc.text(`IVA (13%): Bs. ${data.summary.totalIVA}`, 20, 86);
    
    // Table headers
    const headers = [
      'Fecha',
      'Vendedor', 
      'NIT',
      'Número Recibo',
      'Monto (Bs.)',
      'Sin IVA (Bs.)',
      'IVA (Bs.)'
    ];
    
    // Table data
    const tableData = data.invoices.map(inv => [
      new Date(inv.purchase_date).toLocaleDateString('es-BO'),
      inv.vendor,
      inv.nit || '-',
      inv.number_receipt || '-',
      inv.total_amount.toFixed(2),
      (inv.total_amount / 1.13).toFixed(2),
      (inv.total_amount - inv.total_amount / 1.13).toFixed(2)
    ]);
    
    // Add table to PDF
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 95,
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
      columnStyles: {
        0: { cellWidth: 20 }, // Date
        1: { cellWidth: 35 }, // Vendor
        2: { cellWidth: 25 }, // NIT
        3: { cellWidth: 25 }, // Receipt number
        4: { cellWidth: 20 }, // Total amount
        5: { cellWidth: 20 }, // Without IVA
        6: { cellWidth: 20 }, // IVA
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

    try {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al exportar');
      }

      if (format === 'csv') {
        // Download CSV file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facturas_${startDate}_${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === 'pdf') {
        // Generate and download PDF
        const pdfData: PdfData = await response.json();
        const doc = generatePDF(pdfData);
        doc.save(`facturas_${startDate}_${endDate}.pdf`);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsExporting(false);
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
          <IconButton onClick={onClose} size="small">
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
                />
                <TextField
                  label="Fecha de fin"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
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
                />
                <TextField
                  label="NIT"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  fullWidth
                  placeholder="Filtrar por NIT"
                />
              </Box>
              {hasFilters && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                    startIcon={<CloseIcon />}
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
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>CSV:</strong> Incluye cálculos de IVA (13%), resumen y datos detallados para SIN.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>PDF:</strong> Reporte profesional con tabla de datos, resumen ejecutivo y cálculos de IVA.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* Export Preview */}
          {startDate && endDate && (
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
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isExporting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isExporting || !startDate || !endDate}
          startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
          sx={{ px: 3 }}
        >
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 