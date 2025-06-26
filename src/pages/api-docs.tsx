import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Alert,
  Grid,
  Link as MuiLink
} from '@mui/material';
import { 
  ExpandMore, 
  ContentCopy, 
  Check, 
  Code, 
  Security,
  RequestPage
} from '@mui/icons-material';

interface SwaggerSpec {
  info: Record<string, unknown>;
  servers: Record<string, unknown>[];
  components: Record<string, unknown>;
  paths: Record<string, unknown>;
  tags: Record<string, unknown>[];
}

export default function ApiDocs() {
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedTags, setExpandedTags] = useState<string[]>([]);

  useEffect(() => {
    const loadSwaggerSpec = async () => {
      try {
        const response = await fetch('/api/docs');
        const spec = await response.json();
        setSwaggerSpec(spec);
        // Expand first tag by default
        if (spec.tags && spec.tags.length > 0) {
          setExpandedTags([spec.tags[0].name]);
        }
      } catch (error) {
        console.error('Error loading Swagger spec:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSwaggerSpec();
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setExpandedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return '#61affe';
      case 'post': return '#49cc90';
      case 'put': return '#fca130';
      case 'delete': return '#f93e3e';
      case 'patch': return '#50e3c2';
      default: return '#6c757d';
    }
  };

  const renderSchema = (schema: any, schemaName: string) => {
    if (!schema.properties) return null;

    return (
      <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Property</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Required</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(schema.properties).map(([propName, prop]: [string, any]) => (
              <TableRow key={propName} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {propName}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={prop.type || 'any'} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                  />
                  {prop.format && (
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                      ({prop.format})
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {schema.required?.includes(propName) ? (
                    <Chip label="Yes" size="small" color="error" />
                  ) : (
                    <Chip label="No" size="small" color="default" />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{prop.description || '-'}</Typography>
                  {prop.pattern && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: 'monospace' }}>
                      Pattern: {prop.pattern}
                    </Typography>
                  )}
                  {prop.enum && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                      Values: {prop.enum.join(', ')}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderEndpoint = (path: string, methods: any) => {
    return Object.entries(methods).map(([method, details]: [string, any]) => (
      <Card key={`${method}-${path}`} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Method Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <Chip 
              label={method.toUpperCase()} 
              sx={{ 
                backgroundColor: getMethodColor(method),
                color: 'white',
                fontWeight: 'bold',
                mr: 2
              }}
            />
            <Typography variant="h6" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
              {path}
            </Typography>
            <Chip 
              label={details.summary} 
              variant="outlined" 
              size="small"
            />
          </Box>

          <Box sx={{ p: 2 }}>
            {/* Description */}
            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
              {details.description}
            </Typography>

            {/* Security */}
            {details.security && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                Requires Authentication
              </Alert>
            )}

            {/* Parameters */}
            {details.parameters && details.parameters.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <RequestPage sx={{ mr: 1 }} />
                  Parameters
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Required</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.parameters.map((param: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {param.name}
                          </TableCell>
                          <TableCell>
                            <Chip label={param.in} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            {param.required ? (
                              <Chip label="Yes" size="small" color="error" />
                            ) : (
                              <Chip label="No" size="small" color="default" />
                            )}
                          </TableCell>
                          <TableCell>{param.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Request Body */}
            {details.requestBody && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <Code sx={{ mr: 1 }} />
                  Request Body
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {details.requestBody.description || 'JSON payload required'}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Responses */}
            <Box>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <RequestPage sx={{ mr: 1 }} />
                Responses
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(details.responses).map(([code, response]: [string, any]) => (
                  <Grid item xs={12} sm={6} key={code}>
                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={code} 
                          size="small" 
                          color={
                            code.startsWith('2') ? 'success' :
                            code.startsWith('4') ? 'error' :
                            code.startsWith('5') ? 'error' : 'default'
                          }
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {response.description}
                        </Typography>
                      </Box>
                      {response.content && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Content-Type: {Object.keys(response.content).join(', ')}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>
    ));
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Typography variant="h6">Loading API Documentation...</Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>API Documentation - SimpleFactura</title>
        <meta name="description" content="Complete API documentation for SimpleFactura invoice management system" />
      </Head>

      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
          px: 3
        }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Documentación de la API - SimpleFactura
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Referencia completa de la API para gestión de facturas con análisis estadístico avanzado
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`Version ${swaggerSpec?.info?.version}`} color="primary" variant="outlined" />
              <Chip label="OpenAPI 3.0.0" color="primary" variant="outlined" />
              <Chip label="RESTful API" color="primary" variant="outlined" />
            </Box>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          {/* API Info */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Información de la API
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>URL Base</Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', fontFamily: 'monospace' }}>
                    {swaggerSpec?.servers?.[0]?.url || 'http://localhost:3000/api'}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Autenticación</Typography>
                  <Alert severity="info">
                    Autenticación basada en sesiones usando cookies de NextAuth.js
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Endpoints by Tag */}
          {swaggerSpec?.tags && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Endpoints de la API
              </Typography>
              
              {swaggerSpec.tags.map((tag: any) => (
                <Accordion 
                  key={tag.name}
                  expanded={expandedTags.includes(tag.name)}
                  onChange={() => handleTagToggle(tag.name)}
                  sx={{ mb: 2, border: '1px solid #e0e0e0' }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                        {tag.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {tag.description}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <Box sx={{ p: 2 }}>
                      {Object.entries(swaggerSpec.paths)
                        .filter(([path, methods]: [string, any]) => 
                          Object.values(methods).some((method: any) => 
                            method.tags?.includes(tag.name)
                          )
                        )
                        .map(([path, methods]: [string, any]) => 
                          renderEndpoint(path, methods)
                        )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* Data Models */}
          {swaggerSpec?.components?.schemas && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Data Models
                </Typography>
                
                {Object.entries(swaggerSpec.components.schemas)
                  .filter(([name, schema]: [string, any]) => 
                    !['Error', 'InvoiceFilters', 'ExportRequest', 'UserRegistration', 'UserLogin'].includes(name)
                  )
                  .map(([name, schema]: [string, any]) => (
                    <Accordion key={name} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {name}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                          {schema.description}
                        </Typography>
                        {renderSchema(schema, name)}
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Try it out section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Try the API
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                You can test the API endpoints using tools like Postman, curl, or any HTTP client.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Example cURL Request:</Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', position: 'relative' }}>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(
                      `curl -X GET "http://localhost:3000/api/invoices" \\\n  -H "Cookie: next-auth.session-token=your-session-token"`,
                      'curl-example'
                    )}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    {copied === 'curl-example' ? <Check /> : <ContentCopy />}
                  </IconButton>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`curl -X GET "http://localhost:3000/api/invoices" \\
  -H "Cookie: next-auth.session-token=your-session-token"`}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Interactive Testing:</Typography>
                <MuiLink href="/api-test" variant="body1" sx={{ textDecoration: 'none' }}>
                  <Button variant="contained" color="primary">
                    Open API Testing Console
                  </Button>
                </MuiLink>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Layout>
  );
} 