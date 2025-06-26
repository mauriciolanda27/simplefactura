/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Alert,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import { PlayArrow, ContentCopy, Check } from '@mui/icons-material';

interface ApiResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

export default function ApiTest() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/categories',
      description: 'Get all categories',
      requiresAuth: true,
      bodyRequired: false
    },
    {
      method: 'POST',
      path: '/api/categories',
      description: 'Create a new category',
      requiresAuth: true,
      bodyRequired: true,
      sampleBody: JSON.stringify({
        name: 'Nueva Categoría',
        description: 'Descripción de la categoría'
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/invoices',
      description: 'Get all invoices',
      requiresAuth: true,
      bodyRequired: false
    },
    {
      method: 'POST',
      path: '/api/invoices',
      description: 'Create a new invoice',
      requiresAuth: true,
      bodyRequired: true,
      sampleBody: JSON.stringify({
        authorization_code: '123456789',
        name: 'Compra de suministros',
        nit: '12345678',
        nit_ci_cex: '12345678',
        number_receipt: 'F001-001',
        purchase_date: '2024-01-15',
        total_amount: '150.00',
        vendor: 'Proveedor ABC',
        rubro: 'Suministros',
        categoryId: 'category-id-here'
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/stats',
      description: 'Get basic statistics',
      requiresAuth: true,
      bodyRequired: false
    },
    {
      method: 'GET',
      path: '/api/analytics/predictions',
      description: 'Get statistical analysis',
      requiresAuth: true,
      bodyRequired: false
    }
  ];

  const handleEndpointSelect = (endpoint: typeof endpoints[0]) => {
    setSelectedEndpoint(endpoint.path);
    setRequestBody(endpoint.sampleBody || '');
    setResponse(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testEndpoint = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    setResponse(null);

    try {
      const endpoint = endpoints.find(e => e.path === selectedEndpoint);
      if (!endpoint) return;

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.bodyRequired && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(selectedEndpoint, options);
      const data = await response.json();

      setResponse({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      setResponse({
        status: 0,
        data: { error: 'Network error or CORS issue' },
        headers: {}
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="API Testing">
      <Head>
        <title>API Testing - SimpleFactura</title>
        <meta name="description" content="Test SimpleFactura API endpoints" />
      </Head>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          API Testing Console
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Test the SimpleFactura API endpoints directly from your browser. Make sure you're logged in to test authenticated endpoints.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 3 }}>
          {/* Endpoint Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Endpoint
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Endpoint</InputLabel>
                <Select
                  value={selectedEndpoint}
                  onChange={(e) => {
                    const endpoint = endpoints.find(ep => ep.path === e.target.value);
                    if (endpoint) handleEndpointSelect(endpoint);
                  }}
                  label="Endpoint"
                >
                  {endpoints.map((endpoint) => (
                    <MenuItem key={endpoint.path} value={endpoint.path}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={endpoint.method} 
                          size="small" 
                          color={
                            endpoint.method === 'GET' ? 'success' :
                            endpoint.method === 'POST' ? 'primary' :
                            endpoint.method === 'PUT' ? 'warning' : 'error'
                          }
                        />
                        <Typography variant="body2">{endpoint.path}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedEndpoint && (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {endpoints.find(e => e.path === selectedEndpoint)?.description}
                    {endpoints.find(e => e.path === selectedEndpoint)?.requiresAuth && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Note:</strong> This endpoint requires authentication
                      </Typography>
                    )}
                  </Alert>

                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Request Body (JSON)"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    disabled={!endpoints.find(e => e.path === selectedEndpoint)?.bodyRequired}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    startIcon={loading ? <div className="animate-spin">⏳</div> : <PlayArrow />}
                    onClick={testEndpoint}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Testing...' : 'Test Endpoint'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Response Display */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Response
              </Typography>
              
              {response ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`Status: ${response.status}`} 
                      color={
                        response.status >= 200 && response.status < 300 ? 'success' :
                        response.status >= 400 ? 'error' : 'warning'
                      }
                    />
                    <Button
                      size="small"
                      startIcon={copied ? <Check /> : <ContentCopy />}
                      onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </Box>

                  <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {JSON.stringify(response.data, null, 2)}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select an endpoint and click &quot;Test Endpoint&quot; to see the response here. If you&apos;re not authenticated, you may get a 401 error.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Quick Examples */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Examples
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Create Category
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`POST /api/categories
{
  "name": "Suministros",
  "description": "Categoría para suministros de oficina"
}`}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Create Invoice
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`POST /api/invoices
{
  "number_receipt": "F001-001",
  "purchase_date": "2024-01-15",
  "total_amount": "150.00",
  "vendor": "Proveedor ABC",
  "rubro": "Suministros",
  "categoryId": "category-id"
}`}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
} 