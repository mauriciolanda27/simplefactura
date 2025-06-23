// pages/index.tsx
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton,
  Paper,
  Box,
  Chip,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Link from 'next/link';
import ExportDialog from '../components/ExportDialog';
import CategoryIcon from '@mui/icons-material/Category';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatCurrency } from '../theme';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AnimatedContainer from '../components/AnimatedContainer';
import { useHoverAnimation } from '../utils/useScrollAnimation';
import { useAlert } from '../components/AlertSystem';
import { swrConfigs, cacheKeys } from '../utils/swrConfig';

// Fetcher mejorado con manejo de errores
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Error en la petición');
    error.message = await res.text();
    throw error;
  }
  return res.json();
};

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Invoice {
  id: string;
  authorization_code: string;
  name: string;
  nit: string;
  nit_ci_cex: string;
  number_receipt: string;
  purchase_date: string;
  total_amount: string;
  vendor: string;
  rubro: string;
  category: Category;
  categoryId: string;
}

export default function InvoicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filters, setFilters] = useState({ 
    start: "", 
    end: "", 
    vendor: "", 
    nit: "", 
    categoryId: "", 
    minAmount: "", 
    maxAmount: "" 
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, id: string | null}>({open: false, id: null});
  const [exportDialog, setExportDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const query = new URLSearchParams();
  if (filters.start) query.append("start", filters.start);
  if (filters.end) query.append("end", filters.end);
  if (filters.vendor) query.append("vendor", filters.vendor);
  if (filters.nit) query.append("nit", filters.nit);
  if (filters.categoryId) query.append("categoryId", filters.categoryId);
  if (filters.minAmount) query.append("minAmount", filters.minAmount);
  if (filters.maxAmount) query.append("maxAmount", filters.maxAmount);
  
  // Usar SWR con configuración optimizada para datos frecuentes
  const { data: invoices, mutate, error, isLoading } = useSWR<Invoice[]>(
    session ? `${cacheKeys.invoices}?${query.toString()}` : null, 
    fetcher,
    swrConfigs.frequent
  );
  
  // Usar SWR con configuración para datos estáticos (categorías)
  const { data: categoriesData, error: categoriesError } = useSWR<Category[]>(
    session ? cacheKeys.categories : null,
    fetcher,
    swrConfigs.static
  );
  
  // Usar SWR con configuración crítica para estadísticas
  const { data: stats, isLoading: statsLoading } = useSWR(
    session ? cacheKeys.stats : null,
    fetcher,
    swrConfigs.critical
  );
  
  const { handlers: headerHover } = useHoverAnimation();
  const { showSuccess, showError, showInfo } = useAlert();
  
  // Cargar categorías desde SWR
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Layout title="Dashboard">
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

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Error al eliminar la factura');
      }
      
      // Invalidar cache específico y recargar datos
      await mutate();
      setDeleteDialog({open: false, id: null});
      showSuccess('Factura eliminada correctamente');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showError('Error al eliminar la factura');
    }
  };

  const clearFilters = () => {
    setFilters({
      start: "", 
      end: "", 
      vendor: "", 
      nit: "", 
      categoryId: "", 
      minAmount: "", 
      maxAmount: ""
    });
    showInfo('Filtros limpiados');
  };

  const hasActiveFilters = filters.start || filters.end || filters.vendor || filters.nit || 
                          filters.categoryId || filters.minAmount || filters.maxAmount;

  // Mostrar errores de carga
  if (error) {
    return (
      <Layout title="Dashboard">
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Error al cargar las facturas: {error.message}
          </Alert>
          <Button onClick={() => mutate()} variant="contained">
            Reintentar
          </Button>
        </Box>
      </Layout>
    );
  }

  if (categoriesError) {
    showError('Error al cargar las categorías');
  }

  return (
    <Layout title="Dashboard">
      <Box sx={{ py: 3, px: 2 }}>
        {/* Header compacto */}
        <AnimatedContainer animation="fade-in" delay={200}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }} {...headerHover}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tus facturas y mantén el control de tus gastos
            </Typography>
          </Box>
        </AnimatedContainer>

        {/* Métricas principales en una sola fila compacta */}
        {stats && (
          <AnimatedContainer animation="fade-in" delay={300}>
            <Paper sx={{ p: 2, mb: 3, borderRadius: 0 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, 
                gap: 2 
              }}>
                <MetricCard
                  title="Total Facturas"
                  value={stats.summary.totalInvoices}
                  icon={<ReceiptIcon sx={{ fontSize: 24 }} />}
                  color="primary"
                  loading={statsLoading}
                />
                <MetricCard
                  title="Monto Total"
                  value={stats.summary.totalAmount}
                  icon={<CategoryIcon sx={{ fontSize: 24 }} />}
                  color="success"
                  prefix="Bs. "
                  loading={statsLoading}
                />
                <MetricCard
                  title="Promedio"
                  value={stats.summary.averageAmount}
                  icon={<BarChartIcon sx={{ fontSize: 24 }} />}
                  color="info"
                  prefix="Bs. "
                  loading={statsLoading}
                />
                <MetricCard
                  title="Más Alta"
                  value={stats.summary.totalInvoices > 0 && invoices ? Math.max(...invoices.map(inv => parseFloat(inv.total_amount))) : 0}
                  icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
                  color="success"
                  prefix="Bs. "
                  loading={statsLoading}
                />
                <MetricCard
                  title="Más Baja"
                  value={stats.summary.totalInvoices > 0 && invoices ? Math.min(...invoices.map(inv => parseFloat(inv.total_amount))) : 0}
                  icon={<TrendingDownIcon sx={{ fontSize: 24 }} />}
                  color="error"
                  prefix="Bs. "
                  loading={statsLoading}
                />
              </Box>
            </Paper>
          </AnimatedContainer>
        )}

        {/* Actions Bar compacto */}
        <AnimatedContainer animation="fade-in" delay={400}>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Button
                component={Link}
                href="/invoices/new"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: 0 }}
              >
                Nueva Factura
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{ borderRadius: 0 }}
              >
                Filtros
              </Button>
              
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  sx={{ borderRadius: 0 }}
                >
                  Limpiar
                </Button>
              )}
              
              <Button
                onClick={() => setExportDialog(true)}
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                sx={{ borderRadius: 0, ml: 'auto' }}
              >
                Exportar
              </Button>
            </Box>
          </Paper>
        </AnimatedContainer>

        {/* Filtros expandibles */}
        {showFilters && (
          <AnimatedContainer animation="fade-in" delay={500}>
            <Paper sx={{ p: 2, mb: 2, borderRadius: 0 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Filtros Avanzados
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
                gap: 2 
              }}>
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  value={filters.start}
                  onChange={(e) => setFilters(prev => ({ ...prev, start: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
                <TextField
                  label="Fecha Fin"
                  type="date"
                  value={filters.end}
                  onChange={(e) => setFilters(prev => ({ ...prev, end: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
                <TextField
                  label="Vendedor"
                  value={filters.vendor}
                  onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
                <TextField
                  label="NIT"
                  value={filters.nit}
                  onChange={(e) => setFilters(prev => ({ ...prev, nit: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.categoryId}
                    onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                    label="Categoría"
                    sx={{ borderRadius: 0 }}
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Monto Mínimo"
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
                <TextField
                  label="Monto Máximo"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
              </Box>
            </Paper>
          </AnimatedContainer>
        )}

        {/* Tabla de facturas - Ahora con más espacio */}
        <AnimatedContainer animation="fade-in" delay={600}>
          <Paper sx={{ borderRadius: 0 }}>
            {isLoading ? (
              <Box sx={{ p: 3 }}>
                <SkeletonLoader />
              </Box>
            ) : invoices && invoices.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vendedor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>NIT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>{new Date(invoice.purchase_date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.vendor}</TableCell>
                      <TableCell>{invoice.nit || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={formatCurrency(parseFloat(invoice.total_amount))} 
                          color="primary" 
                          size="small"
                          sx={{ borderRadius: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={invoice.category.name} 
                          variant="outlined" 
                          size="small"
                          sx={{ borderRadius: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Editar">
                            <IconButton
                              component={Link}
                              href={`/invoices/edit/${invoice.id}`}
                              size="small"
                              sx={{ borderRadius: 0 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              onClick={() => setDeleteDialog({open: true, id: invoice.id})}
                              size="small"
                              color="error"
                              sx={{ borderRadius: 0 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay facturas registradas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Comienza agregando tu primera factura
                </Typography>
                <Button
                  component={Link}
                  href="/invoices/new"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 0 }}
                >
                  Agregar Factura
                </Button>
              </Box>
            )}
          </Paper>
        </AnimatedContainer>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({open: false, id: null})}
          PaperProps={{ sx: { borderRadius: 0 } }}
        >
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({open: false, id: null})}
              sx={{ borderRadius: 0 }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => deleteDialog.id && handleDelete(deleteDialog.id)}
              color="error"
              variant="contained"
              sx={{ borderRadius: 0 }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de exportación */}
        <ExportDialog
          open={exportDialog}
          onClose={() => setExportDialog(false)}
        />
      </Box>
    </Layout>
  );
}
