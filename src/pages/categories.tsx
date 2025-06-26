// pages/categories.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Box,
  Stack,
  Tooltip,
  Skeleton,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { formatNumber } from '../theme';

interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: {
    invoices: number;
  };
}

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, category: Category | null}>({open: false, category: null});
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1); // Reset to first page when changing items per page
  };

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/landing');
    }
  }, [session, status, router]);

  // Load categories
  useEffect(() => {
    if (session) {
      loadCategories();
    }
  }, [session]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        setError('Error al cargar categorías');
      }
    } catch (error) {
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        loadCategories();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error al guardar categoría');
      }
    } catch (error) {
      setError('Error al guardar categoría');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.category) return;

    try {
      const res = await fetch(`/api/categories/${deleteDialog.category.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setDeleteDialog({open: false, category: null});
        loadCategories();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error al eliminar categoría');
      }
    } catch (error) {
      setError('Error al eliminar categoría');
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setDialogOpen(true);
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Layout title="Categorías">
        <Box sx={{ py: 4 }}>
          <Skeleton variant="text" width="60%" height={60} />
          <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
        </Box>
      </Layout>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <Layout title="Categorías">
      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Categorías
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(categories.length)}
                  </Typography>
                </Box>
                <CategoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Facturas
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(categories.reduce((sum, cat) => sum + (cat._count?.invoices || 0), 0))}
                  </Typography>
                </Box>
                <CategoryIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Promedio por Categoría
                  </Typography>
                  <Typography variant="h4" component="div">
                    {categories.length > 0 
                      ? formatNumber(Math.round(categories.reduce((sum, cat) => sum + (cat._count?.invoices || 0), 0) / categories.length))
                      : '0'
                    }
                  </Typography>
                </Box>
                <CategoryIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Lista de Categorías
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Nueva Categoría
        </Button>
      </Box>

      {/* Categories Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={400} />
          </Box>
        )}

        {!loading && categories.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CategoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No hay categorías
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primera categoría para organizar tus facturas
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Crear Primera Categoría
            </Button>
          </Box>
        )}

        {!loading && categories.length > 0 && (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Facturas</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${category._count?.invoices || 0} factura(s)`}
                        size="small"
                        color={category._count?.invoices ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEditDialog(category)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({open: true, category})}
                            disabled={(category._count?.invoices || 0) > 0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {categories.length > itemsPerPage && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, categories.length)} de {categories.length} categorías
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      displayEmpty
                    >
                      <MenuItem value={5}>5 por página</MenuItem>
                      <MenuItem value={10}>10 por página</MenuItem>
                      <MenuItem value={20}>20 por página</MenuItem>
                      <MenuItem value={50}>50 por página</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: '1rem',
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Nombre de la categoría *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Descripción (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                fullWidth
                multiline
                rows={3}
                placeholder="Describe el propósito de esta categoría..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingCategory ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({open: false, category: null})}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la categoría &quot;{deleteDialog.category?.name}&quot;?
            {(deleteDialog.category?._count?.invoices || 0) > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                No se puede eliminar porque tiene {deleteDialog.category?._count?.invoices || 0} factura(s) asociada(s).
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({open: false, category: null})}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={(deleteDialog.category?._count?.invoices || 0) > 0}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
