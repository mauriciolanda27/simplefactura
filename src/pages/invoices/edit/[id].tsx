import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Container, Typography } from '@mui/material';
import InvoiceForm from '../../../components/InvoiceForm';

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: invoice } = useSWR(id ? `/api/invoices/${id}` : null, url=>fetch(url).then(r=>r.json()));
  
  if (!invoice) return <div>Cargando...</div>;
  
  return (
    <Container maxWidth="sm">
      <Typography variant="h6" gutterBottom>Editar Factura</Typography>
      <InvoiceForm initialData={invoice} onSaved={() => router.push('/')} />
    </Container>
  );
}
