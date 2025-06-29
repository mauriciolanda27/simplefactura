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
  Pagination,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh,
  FilterList,
  History,
  Visibility,
  Edit,
  Delete,
  Add,
  FileDownload,
  Analytics,
  Assessment,
  Search,
  Clear,
  Security
} from '@mui/icons-material';
import Layout from '../components/Layout';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedContainer from '../components/AnimatedContainer';
import { useAlert } from '../components/AlertSystem';
import Grid from '@mui/material/Grid';

interface LogEntry {
  id: string;
  action: string;
  actionDescription: string;
  entityType: string | null;
  entityTypeDescription: string;
  entityId: string | null;
  details: any;
  createdAt: string;
}

interface ActivitySummary {
  totalActions: number;
  actionsByType: Record<string, number>;
  recentActivity: LogEntry[];
  mostActiveDay: string;
  mostCommonAction: string;
}

interface LogsResponse {
  logs: LogEntry[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
}

export default function Logs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/landing');
    }
  }, [session, status, router]);

  // Load logs data
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', '20');
        if (filters.action) params.append('action', filters.action);
        if (filters.entityType) params.append('entityType', filters.entityType);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const res = await fetch(`/api/logs?${params}`);
        if (!res.ok) throw new Error('Error al cargar logs');
        const data: LogsResponse = await res.json();
        
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
        setTotalLogs(data.pagination.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    const loadSummary = async () => {
      try {
        const res = await fetch('/api/logs?summary=true&days=30');
        if (res.ok) {
          const summaryData: ActivitySummary = await res.json();
          setSummary(summaryData);
        }
      } catch (err) {
        console.error('Error loading summary:', err);
      }
    };

    if (session) {
      loadLogs();
      loadSummary();
    }
  }, [session, currentPage, filters]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_INVOICE':
      case 'CREATE_CATEGORY':
      case 'CREATE_RUBRO':
        return <Add color="success" />;
      case 'UPDATE_INVOICE':
      case 'UPDATE_CATEGORY':
      case 'UPDATE_RUBRO':
        return <Edit color="primary" />;
      case 'DELETE_INVOICE':
      case 'DELETE_CATEGORY':
      case 'DELETE_RUBRO':
        return <Delete color="error" />;
      case 'EXPORT_PDF':
      case 'EXPORT_CSV':
      case 'EXPORT_REPORT':
        return <FileDownload color="secondary" />;
      case 'GENERATE_PREDICTIONS':
        return <Analytics color="warning" />;
      case 'GENERATE_REPORT':
        return <Assessment color="primary" />;
      case 'LOGIN':
      case 'LOGOUT':
        return <Security color="info" />;
      default:
        return <History color="action" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'success';
    if (action.includes('UPDATE')) return 'primary';
    if (action.includes('DELETE')) return 'error';
    if (action.includes('EXPORT')) return 'secondary';
    if (action.includes('ANALYTICS') || action.includes('PREDICTIONS')) return 'warning';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'info';
    return 'default';
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Layout title="Registro de Actividad">
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
      <Layout title="Registro de Actividad">
        <Box sx={{ py: 4, px: 2 }}>
          <SkeletonLoader />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Registro de Actividad">
        <Box sx={{ py: 4, px: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Registro de Actividad">
      <Box sx={{ py: 4, px: 2 }}>

        {/* Header */}
        <AnimatedContainer animation="fade-in" delay={200}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 0 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Registro de Actividad
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Historial completo de acciones realizadas en el sistema
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
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                >
                  Actualizar
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </AnimatedContainer>

        {/* Activity Summary */}
        {summary && (
          <AnimatedContainer animation="fade-in" delay={300}>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              mb: 4,
            }}>
              <Card sx={{ borderRadius: 0, flex: '1 1 220px', minWidth: 220 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <History color="primary" />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {summary.totalActions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Acciones (30 días)
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 0, flex: '1 1 220px', minWidth: 220 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Assessment color="success" />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {Object.keys(summary.actionsByType).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tipos de Acciones
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 0, flex: '1 1 220px', minWidth: 220 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Analytics color="warning" />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {summary.mostCommonAction ? summary.actionsByType[summary.mostCommonAction] : 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Acción Más Común
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 0, flex: '1 1 220px', minWidth: 220 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Visibility color="info" />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {summary.mostActiveDay ? new Date(summary.mostActiveDay).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Día Más Activo
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </AnimatedContainer>
        )}

        {/* Filters */}
        {showFilters && (
          <AnimatedContainer animation="fade-in" delay={400}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 0 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Filtros de Actividad
              </Typography>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
                    <InputLabel>Tipo de Acción</InputLabel>
                    <Select
                      value={filters.action}
                      onChange={(e) => handleFilterChange('action', e.target.value)}
                      label="Tipo de Acción"
                    >
                      <MenuItem value="">Todas las acciones</MenuItem>
                      <MenuItem value="CREATE_INVOICE">Crear factura</MenuItem>
                      <MenuItem value="UPDATE_INVOICE">Actualizar factura</MenuItem>
                      <MenuItem value="DELETE_INVOICE">Eliminar factura</MenuItem>
                      <MenuItem value="CREATE_CATEGORY">Crear categoría</MenuItem>
                      <MenuItem value="UPDATE_CATEGORY">Actualizar categoría</MenuItem>
                      <MenuItem value="DELETE_CATEGORY">Eliminar categoría</MenuItem>
                      <MenuItem value="CREATE_RUBRO">Crear rubro</MenuItem>
                      <MenuItem value="UPDATE_RUBRO">Actualizar rubro</MenuItem>
                      <MenuItem value="DELETE_RUBRO">Eliminar rubro</MenuItem>
                      <MenuItem value="GENERATE_REPORT">Generar reporte</MenuItem>
                      <MenuItem value="EXPORT_REPORT">Exportar reporte</MenuItem>
                      <MenuItem value="EXPORT_PDF">Exportar PDF</MenuItem>
                      <MenuItem value="EXPORT_CSV">Exportar CSV</MenuItem>
                      <MenuItem value="GENERATE_PREDICTIONS">Generar predicciones</MenuItem>
                      <MenuItem value="LOGIN">Iniciar sesión</MenuItem>
                      <MenuItem value="LOGOUT">Cerrar sesión</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
                    <InputLabel>Tipo de Entidad</InputLabel>
                    <Select
                      value={filters.entityType}
                      onChange={(e) => handleFilterChange('entityType', e.target.value)}
                      label="Tipo de Entidad"
                    >
                      <MenuItem value="">Todas las entidades</MenuItem>
                      <MenuItem value="Invoice">Factura</MenuItem>
                      <MenuItem value="Category">Categoría</MenuItem>
                      <MenuItem value="Rubro">Rubro</MenuItem>
                      <MenuItem value="Report">Reporte</MenuItem>
                      <MenuItem value="Analytics">Análisis</MenuItem>
                      <MenuItem value="User">Usuario</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Fecha Desde"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                  />
                  <TextField
                    label="Fecha Hasta"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                    size="small"
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={clearFilters}
                  >
                    Limpiar Filtros
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </AnimatedContainer>
        )}

        {/* Logs Table */}
        <AnimatedContainer animation="fade-in" delay={500}>
          <Paper sx={{ p: 3, borderRadius: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Historial de Actividad ({totalLogs} registros)
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Acción</TableCell>
                    <TableCell>Entidad</TableCell>
                    <TableCell>Detalles</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {getActionIcon(log.action)}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {log.actionDescription}
                            </Typography>
                            <Chip 
                              label={log.action} 
                              size="small" 
                              color={getActionColor(log.action) as any}
                              variant="outlined"
                            />
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2">
                            {log.entityTypeDescription}
                          </Typography>
                          {log.entityId && (
                            <Chip 
                              label={log.entityId.substring(0, 8)} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <Tooltip title={JSON.stringify(log.details, null, 2)}>
                            <Typography variant="body2" sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {JSON.stringify(log.details).substring(0, 50)}...
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin detalles
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.createdAt).toLocaleString('es-BO')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Paper>
        </AnimatedContainer>

      </Box>
    </Layout>
  );
} 