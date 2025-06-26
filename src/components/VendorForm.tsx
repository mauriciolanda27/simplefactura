import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Business,
  Email,
  Phone,
  LocationOn,
  Save,
  Cancel,
  Clear
} from '@mui/icons-material';
import { Vendor } from '@prisma/client';

interface VendorFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nit: string;
}

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (data: VendorFormData) => void;
  onCancel: () => void;
}

export default function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    nit: ''
  });
  const [errors, setErrors] = useState<Partial<VendorFormData>>({});

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        nit: vendor.nit
      });
    }
  }, [vendor]);

  const validateForm = () => {
    const newErrors: Partial<VendorFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proveedor es requerido';
    }
    
    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es requerido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof VendorFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      nit: ''
    });
    setErrors({});
  };

  return (
    <Card elevation={3} sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Business sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {vendor ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vendor ? 'Actualiza la información del proveedor' : 'Completa la información del nuevo proveedor'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Nombre */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Proveedor *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* NIT */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NIT *"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                error={!!errors.nit}
                helperText={errors.nit}
                required
                placeholder="1234567890"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="proveedor@ejemplo.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+591 12345678"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Dirección */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Av. Principal #123, Cochabamba, Bolivia"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
            <Box>
              <Button
                type="button"
                startIcon={<Clear />}
                onClick={handleClear}
                variant="outlined"
                color="secondary"
                sx={{ mr: 1 }}
              >
                Limpiar
              </Button>
            </Box>
            
            <Box>
              <Button
                type="button"
                onClick={onCancel}
                variant="outlined"
                sx={{ mr: 2 }}
                startIcon={<Cancel />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                size="large"
              >
                {vendor ? 'Actualizar' : 'Agregar'} Proveedor
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
} 