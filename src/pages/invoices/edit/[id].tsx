import { useRouter } from 'next/router';
import useSWR from 'swr';
import { 
  Container, 
  Typography, 
  Box, 
  Breadcrumbs, 
  Link, 
  Paper, 
  Skeleton,
  Alert,
  Button,
  Stack,
  Divider
} from '@mui/material';
import { 
  ArrowBack, 
  Edit, 
  Receipt, 
  Home,
  List
} from '@mui/icons-material';
import InvoiceForm from '../../../components/InvoiceForm';

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: invoice, error, isLoading } = useSWR(
    id ? `/api/invoices/${id}` : null, 
    url => fetch(url).then(r => {
      if (!r.ok) throw new Error('Error loading invoice');
      return r.json();
    })
  );

  const handleSaved = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 1 }} />
        </Box>
        
        <Paper sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={200} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link 
              color="inherit" 
              href="/" 
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" />
              Inicio
            </Link>
            <Link 
              color="inherit" 
              href="/invoices" 
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <List sx={{ mr: 0.5 }} fontSize="small" />
              Facturas
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <Edit sx={{ mr: 0.5 }} fontSize="small" />
              Editar
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Editar Factura
          </Typography>
        </Box>

        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error al cargar la factura
          </Typography>
          <Typography variant="body2">
            No se pudo cargar la información de la factura. Verifica que la factura existe y tienes permisos para editarla.
          </Typography>
        </Alert>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleCancel}
          >
            Volver
          </Button>
          <Button
            variant="contained"
            startIcon={<List />}
            onClick={() => router.push('/invoices')}
          >
            Ver Todas las Facturas
          </Button>
        </Stack>
      </Container>
    );
  }

  // Success state
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="small" />
            Inicio
          </Link>
          <Link 
            color="inherit" 
            href="/invoices" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <List sx={{ mr: 0.5 }} fontSize="small" />
            Facturas
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Edit sx={{ mr: 0.5 }} fontSize="small" />
            Editar Factura #{invoice?.number_receipt || id}
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            borderRadius: 2, 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Receipt sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Editar Factura
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Modifica la información de la factura según sea necesario
            </Typography>
          </Box>
        </Box>

        {/* Invoice Summary Card */}
        {invoice && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Resumen de la Factura
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Número de Factura
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {invoice.number_receipt || 'No especificado'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Proveedor
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {invoice.vendor || 'No especificado'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Monto Total
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  Bs. {parseFloat(invoice.total_amount || '0').toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Compra
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {invoice.purchase_date ? new Date(invoice.purchase_date).toLocaleDateString('es-BO') : 'No especificada'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Form Section */}
      <Paper sx={{ p: 4, boxShadow: 3 }}>
        <InvoiceForm 
          initialData={invoice} 
          onSaved={handleSaved} 
        />
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleCancel}
          size="large"
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<List />}
          onClick={() => router.push('/invoices')}
          size="large"
        >
          Ver Todas las Facturas
        </Button>
      </Box>
    </Container>
  );
}
