import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Paper,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Business,
  Email,
  Phone,
  LocationOn,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import { Vendor } from '@prisma/client';

interface VendorListProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: string) => void;
}

export default function VendorList({ vendors, onEdit, onDelete }: VendorListProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedVendor(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1); // Reset to first page when changing items per page
  };

  // Calculate pagination
  const totalPages = Math.ceil(vendors.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendors = vendors.slice(startIndex, endIndex);

  if (vendors.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'grey.300' }}>
          <Business sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay proveedores registrados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comienza agregando tu primer proveedor para gestionar tus facturas de manera más eficiente
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* Vendors Grid */}
      <Grid container spacing={3}>
        {currentVendors.map((vendor) => (
          <Grid item xs={12} sm={6} md={4} key={vendor.id}>
            <Card 
              elevation={2}
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 8,
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Business />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" component="h3" noWrap>
                      {vendor.name}
                    </Typography>
                    <Chip 
                      label={`NIT: ${vendor.nit}`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Information */}
                <Box sx={{ mb: 2 }}>
                  {vendor.email && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {vendor.email}
                      </Typography>
                    </Box>
                  )}
                  
                  {vendor.phone && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {vendor.phone}
                      </Typography>
                    </Box>
                  )}
                  
                  {vendor.address && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {vendor.address}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Actions */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => handleViewVendor(vendor)}
                        sx={{ color: 'info.main' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(vendor)}
                        sx={{ color: 'primary.main', mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(vendor.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination Controls */}
      {vendors.length > itemsPerPage && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {startIndex + 1}-{Math.min(endIndex, vendors.length)} de {vendors.length} proveedores
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                displayEmpty
              >
                <MenuItem value={6}>6 por página</MenuItem>
                <MenuItem value={9}>9 por página</MenuItem>
                <MenuItem value={12}>12 por página</MenuItem>
                <MenuItem value={18}>18 por página</MenuItem>
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

      {/* View Vendor Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Business sx={{ mr: 1 }} />
            Detalles del Proveedor
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVendor && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                      <Business sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" component="h2">
                        {selectedVendor.name}
                      </Typography>
                      <Chip 
                        label={`NIT: ${selectedVendor.nit}`} 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  {selectedVendor.email && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {selectedVendor.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {selectedVendor.phone && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Teléfono
                        </Typography>
                        <Typography variant="body1">
                          {selectedVendor.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {selectedVendor.address && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Dirección
                        </Typography>
                        <Typography variant="body1">
                          {selectedVendor.address}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>
            Cerrar
          </Button>
          {selectedVendor && (
            <Button 
              onClick={() => {
                onEdit(selectedVendor);
                handleCloseViewDialog();
              }}
              variant="contained"
              startIcon={<Edit />}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
} 