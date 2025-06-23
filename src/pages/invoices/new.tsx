import useSWR from 'swr';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Paper, Skeleton, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import InvoiceForm from '../../components/InvoiceForm';

export default function NewInvoicePage() {
  const { data: categories, error } = useSWR('/api/categories', url=>fetch(url).then(r=>r.json()));
  const router = useRouter();
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error al cargar las categorías. Por favor, inténtalo de nuevo.
        </Alert>
      </Container>
    );
  }
  
  if (!categories) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="40%" height={60} />
        <Skeleton variant="rectangular" height={600} sx={{ mt: 2 }} />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ArrowBackIcon 
            sx={{ mr: 1, cursor: 'pointer' }} 
            onClick={() => router.back()}
          />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Nueva Factura
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Agrega una nueva factura a tu sistema de gestión
        </Typography>
      </Box>

      {/* Form */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <InvoiceForm 
          onSaved={() => router.push('/')} 
        />
      </Paper>
    </Container>
  );
}
