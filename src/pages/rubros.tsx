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
  Business as BusinessIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';

interface Rubro {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function RubrosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRubro, setEditingRubro] = useState<Rubro | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', type: 'business' });
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, rubro: Rubro | null}>({open: false, rubro: null});
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(rubros.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRubros = rubros.slice(startIndex, endIndex);

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

  // Load rubros
  useEffect(() => {
    if (session) {
      loadRubros();
    }
  }, [session]);

  const loadRubros = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rubros');
      if (res.ok) {
        const data = await res.json();
        setRubros(data);
      } else {
        setError('Error al cargar rubros');
      }
    } catch (error) {
      setError('Error al cargar rubros');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre del rubro es obligatorio');
      return;
    }

    try {
      const url = editingRubro ? `/api/rubros/${editingRubro.id}` : '/api/rubros';
      const method = editingRubro ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setDialogOpen(false);
        setEditingRubro(null);
        setFormData({ name: '', description: '', type: 'business' });
        loadRubros();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error al guardar rubro');
      }
    } catch (error) {
      setError('Error al guardar rubro');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.rubro) return;
    try {
      const res = await fetch(`/api/rubros/${deleteDialog.rubro.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeleteDialog({open: false, rubro: null});
        loadRubros();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error al eliminar rubro');
      }
    } catch (error) {
      setError('Error al eliminar rubro');
    }
  };

  const openEditDialog = (rubro: Rubro) => {
    setEditingRubro(rubro);
    setFormData({
      name: rubro.name,
      description: rubro.description || '',
      type: rubro.type || 'business'
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRubro(null);
    setFormData({ name: '', description: '', type: 'business' });
    setDialogOpen(true);
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Layout title="Rubros">
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
    <Layout title="Rubros">
      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total de Rubros
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {rubros.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Rubros Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Rubros
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Nuevo Rubro
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Skeleton variant="rectangular" height={40} />
                </TableCell>
              </TableRow>
            ) : currentRubros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay rubros registrados.
                </TableCell>
              </TableRow>
            ) : (
              currentRubros.map((rubro) => (
                <TableRow key={rubro.id}>
                  <TableCell>{rubro.name}</TableCell>
                  <TableCell>{rubro.description}</TableCell>
                  <TableCell>
                    <Chip label={rubro.type === 'personal' ? 'Personal' : 'Empresa'} color={rubro.type === 'personal' ? 'info' : 'primary'} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => openEditDialog(rubro)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => setDeleteDialog({open: true, rubro})}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
          <FormControl size="small" sx={{ mr: 2, minWidth: 80 }}>
            <Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingRubro ? 'Editar Rubro' : 'Nuevo Rubro'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del Rubro"
              fullWidth
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Descripción"
              fullWidth
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <Select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                label="Tipo"
              >
                <MenuItem value="business">Empresa</MenuItem>
                <MenuItem value="personal">Personal</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingRubro ? 'Guardar Cambios' : 'Crear Rubro'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({open: false, rubro: null})}>
        <DialogTitle>Eliminar Rubro</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este rubro?</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {deleteDialog.rubro?.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({open: false, rubro: null})}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
} 