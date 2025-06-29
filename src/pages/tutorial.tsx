// @ts-nocheck
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab
} from '@mui/material';
import {
  Dashboard,
  Add,
  Category,
  Business,
  BarChart,
  Analytics,
  Help,
  CheckCircle,
  PlayArrow,
  ExpandMore,
  Receipt,
  FileDownload,
  FilterList,
  Search,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  Warning,
  Info,
  School,
  Lightbulb,
  Star,
  ArrowForward,
  ArrowBack,
  Close,
  AccountTree,
  History,
  Security,
  Assessment
} from '@mui/icons-material';
import Layout from '../components/Layout';
import Link from 'next/link';

interface TutorialStep {
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export default function TutorialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('panel1');
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  // Redirect to landing page if not authenticated
  if (status === 'loading') {
    return (
      <Layout title="Tutorial">
        <Box sx={{ py: 4 }}>
          <Typography>Cargando...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!session) {
    router.push('/landing');
    return null;
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const tutorialSteps: TutorialStep[] = [
    {
      title: 'Dashboard Principal',
      description: 'Centro de control de tu sistema de facturas',
      color: 'primary',
      icon: <Dashboard />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            🏠 Tu Centro de Control
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Métricas Principales
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Receipt />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total de Facturas" 
                        secondary="Vista general de todas tus facturas registradas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <TrendingUp />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total de Gastos" 
                        secondary="Suma total de todos los montos de facturas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <BarChart />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Promedio por Factura" 
                        secondary="Promedio de gastos por factura individual"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Acciones Rápidas
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Add />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Nueva Factura" 
                        secondary="Registrar una nueva factura en el sistema"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <FilterList />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Filtros Avanzados" 
                        secondary="Buscar y filtrar facturas específicas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <FileDownload />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Exportar Datos" 
                        secondary="Descargar reportes en formato CSV"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>💡 Consejo:</strong> El Dashboard se actualiza automáticamente cada vez que agregas o modificas facturas. 
              Las métricas te ayudan a tener una visión clara de tus gastos empresariales.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/"
              variant="contained"
              startIcon={<Dashboard />}
              sx={{ borderRadius: 2 }}
            >
              Ir al Dashboard
            </Button>
            <Button
              component={Link}
              href="/invoices/new"
              variant="outlined"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
            >
              Crear Primera Factura
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Gestión de Facturas',
      description: 'Cómo registrar, editar y gestionar tus facturas',
      color: 'success',
      icon: <Receipt />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="success.main">
            📄 Gestión Completa de Facturas
          </Typography>

          <Box container spacing={3} sx={{ mb: 3 }}>
            <Box item xs={12} md={4}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 'success.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Registrar Factura
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Proceso paso a paso:</strong>
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Haz clic en 'Nueva Factura'" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Completa los datos básicos" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Selecciona una categoría" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Asigna un rubro (opcional)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Agrega items de la factura" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Guarda la factura" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={4}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 'info.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="info.main">
                    <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Editar Facturas
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Funcionalidades disponibles:</strong>
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Visibility color="info" />
                      </ListItemIcon>
                      <ListItemText primary="Ver detalles completos" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Edit color="info" />
                      </ListItemIcon>
                      <ListItemText primary="Modificar información" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Delete color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Eliminar factura" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FileDownload color="info" />
                      </ListItemIcon>
                      <ListItemText primary="Exportar individual" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={4}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Buscar y Filtrar
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Opciones de búsqueda:</strong>
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <FilterList color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Por rango de fechas" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Business color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Por proveedor" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Category color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Por categoría" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccountTree color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Por rubro" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Por monto" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>🎯 Caso de Uso:</strong> Una PYME de Cochabamba puede registrar facturas de servicios públicos, 
              compras de suministros, y gastos de mantenimiento. El sistema calcula automáticamente totales y 
              organiza todo por categorías y rubros para facilitar la contabilidad y el análisis detallado.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/invoices/new"
              variant="contained"
              color="success"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
            >
              Crear Factura
            </Button>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              startIcon={<Receipt />}
              sx={{ borderRadius: 2 }}
            >
              Ver Todas las Facturas
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Gestión de Categorías',
      description: 'Organiza tus facturas por categorías para mejor control',
      color: 'secondary',
      icon: <Category />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="secondary.main">
            📂 Organización por Categorías
          </Typography>

          <Box container spacing={3} sx={{ mb: 3 }}>
            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    ¿Por qué usar categorías?
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Organización" 
                        secondary="Agrupa gastos similares"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Análisis" 
                        secondary="Identifica patrones de gasto"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reportes" 
                        secondary="Genera informes por categoría"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Contabilidad" 
                        secondary="Facilita la gestión contable"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Categorías Sugeridas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="Servicios Públicos" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    <Chip label="Suministros" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    <Chip label="Mantenimiento" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    <Chip label="Marketing" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    <Chip label="Transporte" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    <Chip label="Tecnología" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    <Chip label="Alquiler" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    <Chip label="Otros" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>💡 Consejo:</strong> Crea categorías específicas para tu negocio. 
                    Por ejemplo, una panadería podría tener categorías como "Harina", "Hornos", "Empleados", etc.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>📊 Caso de Uso:</strong> Una ferretería en Cochabamba puede crear categorías como "Herramientas", 
              "Materiales de Construcción", "Equipos de Seguridad", y "Gastos Operativos". Esto le permite 
              analizar qué productos generan más gastos y optimizar sus compras.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/categories"
              variant="contained"
              color="secondary"
              startIcon={<Category />}
              sx={{ borderRadius: 2 }}
            >
              Gestionar Categorías
            </Button>
            <Button
              component={Link}
              href="/invoices/new"
              variant="outlined"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
            >
              Crear Factura con Categoría
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Gestión de Proveedores',
      description: 'Administra la información de tus proveedores',
      color: 'info',
      icon: <Business />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="info.main">
            🏢 Gestión de Proveedores
          </Typography>

          <Box container spacing={3} sx={{ mb: 3 }}>
            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 'info.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="info.main">
                    Información del Proveedor
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Business color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Nombre/Razón Social" 
                        secondary="Nombre completo de la empresa"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Receipt color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="NIT" 
                        secondary="Número de Identificación Tributaria"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary="Correo electrónico de contacto"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Teléfono" 
                        secondary="Número de contacto"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dirección" 
                        secondary="Dirección física del proveedor"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Beneficios de Registrar Proveedores
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Selección Rápida" 
                        secondary="Elige proveedores de una lista"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Historial" 
                        secondary="Ve todas las facturas por proveedor"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Contacto" 
                        secondary="Acceso rápido a información de contacto"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Análisis" 
                        secondary="Analiza gastos por proveedor"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>📈 Caso de Uso:</strong> Una clínica dental puede registrar proveedores como "Distribuidora Dental ABC", 
              "Laboratorio de Prótesis XYZ", y "Proveedor de Equipos Médicos". Esto le permite analizar 
              qué proveedores le generan más gastos y negociar mejores precios.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/vendors"
              variant="contained"
              color="info"
              startIcon={<Business />}
              sx={{ borderRadius: 2 }}
            >
              Gestionar Proveedores
            </Button>
            <Button
              component={Link}
              href="/invoices/new"
              variant="outlined"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
            >
              Crear Factura con Proveedor
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Gestión de Rubros',
      description: 'Organiza tus facturas por rubros para mejor control contable',
      color: 'info',
      icon: <AccountTree />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="info.main">
            🌳 Organización por Rubros
          </Typography>

          <Box container spacing={3} sx={{ mb: 3 }}>
            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    ¿Qué son los Rubros?
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Los rubros son categorías contables que te permiten clasificar tus gastos de manera más específica 
                    que las categorías generales. Son especialmente útiles para la contabilidad empresarial.
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Clasificación Contable" 
                        secondary="Organiza gastos por rubros específicos"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Análisis Detallado" 
                        secondary="Identifica patrones de gasto por rubro"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reportes Especializados" 
                        secondary="Genera informes por rubro"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Control Presupuestario" 
                        secondary="Monitorea gastos por área específica"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Tipos de Rubros
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      🏢 Rubros Empresariales
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip label="Gastos Operativos" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                      <Chip label="Gastos Administrativos" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                      <Chip label="Gastos de Ventas" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                      <Chip label="Gastos Financieros" color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      👤 Rubros Personales
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label="Gastos Personales" color="secondary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                      <Chip label="Gastos Familiares" color="secondary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                      <Chip label="Gastos de Ocio" color="secondary" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>💡 Consejo:</strong> Crea rubros específicos para tu negocio. 
                    Por ejemplo, una empresa de construcción podría tener rubros como "Materiales", "Mano de Obra", "Equipos", etc.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>📊 Caso de Uso:</strong> Una empresa de servicios en Cochabamba puede crear rubros como "Gastos de Personal", 
              "Gastos de Equipos", "Gastos de Marketing", y "Gastos de Oficina". Esto le permite 
              analizar qué áreas generan más gastos y optimizar su presupuesto.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/rubros"
              variant="contained"
              color="info"
              startIcon={<AccountTree />}
              sx={{ borderRadius: 2 }}
            >
              Gestionar Rubros
            </Button>
            <Button
              component={Link}
              href="/invoices/new"
              variant="outlined"
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
            >
              Crear Factura con Rubro
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Registro de Actividad',
      description: 'Monitorea todas las acciones realizadas en el sistema',
      color: 'secondary',
      icon: <History />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="secondary.main">
            📋 Registro de Actividad del Sistema
          </Typography>

          <Box container spacing={3} sx={{ mb: 3 }}>
            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    ¿Qué registra el sistema?
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Add />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Creación de Registros" 
                        secondary="Facturas, categorías, rubros creados"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Edit />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Modificaciones" 
                        secondary="Cambios en facturas y configuraciones"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Delete />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Eliminaciones" 
                        secondary="Registros eliminados del sistema"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <FileDownload />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Exportaciones" 
                        secondary="Reportes y datos exportados"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Security />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Acceso al Sistema" 
                        secondary="Inicios y cierres de sesión"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Beneficios del Registro
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Security />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Seguridad" 
                        secondary="Monitorea accesos al sistema"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Assessment />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Auditoría" 
                        secondary="Rastrea cambios en los datos"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <TrendingUp />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Análisis de Uso" 
                        secondary="Identifica patrones de uso"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Warning />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Detección de Problemas" 
                        secondary="Identifica errores o actividades sospechosas"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>🔍 Caso de Uso:</strong> Un administrador puede revisar los logs para ver quién creó una factura específica, 
              cuándo se modificó una categoría, o qué reportes se han exportado. Esto es especialmente útil 
              para auditorías y control de calidad.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/logs"
              variant="contained"
              color="secondary"
              startIcon={<History />}
              sx={{ borderRadius: 2 }}
            >
              Ver Registro de Actividad
            </Button>
            <Button
              component={Link}
              href="/reports"
              variant="outlined"
              startIcon={<Assessment />}
              sx={{ borderRadius: 2 }}
            >
              Generar Reportes
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Estadísticas y Reportes',
      description: 'Analiza tus datos con gráficos y estadísticas',
      color: 'warning',
      icon: <BarChart />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="warning.main">
            📊 Análisis de Datos
          </Typography>

          <Box container spacing={3} sx={{ mb: 3 }}>
            <Box item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Gráficos Interactivos
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Gráfico de Líneas" 
                        secondary="Evolución de gastos en el tiempo"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BarChart />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Gráfico de Barras" 
                        secondary="Comparación por categorías y rubros"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Analytics />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Gráfico Circular" 
                        secondary="Distribución de gastos"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Métricas Clave
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Gasto Total" 
                        secondary="Suma de todas las facturas"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingDown color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Gasto Promedio" 
                        secondary="Promedio por factura"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BarChart color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Categoría Principal" 
                        secondary="Categoría con más gastos"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccountTree color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Rubro Principal" 
                        secondary="Rubro con más gastos"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Business color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Proveedor Principal" 
                        secondary="Proveedor con más facturas"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Exportación de Datos
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <FileDownload color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Formato CSV" 
                        secondary="Compatible con Excel"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FileDownload color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reportes Personalizados" 
                        secondary="Por fecha, categoría, rubro, proveedor"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FileDownload color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Datos Filtrados" 
                        secondary="Solo los datos que necesitas"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>📈 Caso de Uso:</strong> Una empresa de construcción puede usar las estadísticas para identificar 
              que el 40% de sus gastos son en materiales (rubro: Gastos Operativos), 30% en equipos (rubro: Gastos de Equipos), 
              y 30% en mano de obra (rubro: Gastos de Personal). Esto le ayuda a optimizar costos y mejorar la rentabilidad.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/stats"
              variant="contained"
              color="warning"
              startIcon={<BarChart />}
              sx={{ borderRadius: 2 }}
            >
              Ver Estadísticas
            </Button>
            <Button
              component={Link}
              href="/analytics"
              variant="outlined"
              startIcon={<Analytics />}
              sx={{ borderRadius: 2 }}
            >
              Análisis Avanzado
            </Button>
          </Box>
        </Box>
      )
    },
    {
      title: 'Análisis Estadístico Avanzado',
      description: 'Herramientas avanzadas para análisis predictivo',
      color: 'error',
      icon: <Analytics />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="error.main">
            🔮 Análisis Predictivo
          </Typography>

          <Box container spacing={3} sx={{ mb: 3 }}>
            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Funciones Avanzadas
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <TrendingUp />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tendencias de Gastos" 
                        secondary="Identifica patrones temporales"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Analytics />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Proyecciones" 
                        secondary="Predice gastos futuros"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Warning />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Alertas" 
                        secondary="Notificaciones de gastos altos"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <BarChart />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Comparaciones" 
                        secondary="Compara períodos diferentes"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box item xs={12} md={6}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Beneficios del Análisis
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Lightbulb />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Toma de Decisiones" 
                        secondary="Basada en datos reales"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <TrendingDown />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reducción de Costos" 
                        secondary="Identifica áreas de optimización"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <Star />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Mejora Continua" 
                        secondary="Monitorea el progreso"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ color: 'white' }}>
                        <School />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Aprendizaje" 
                        secondary="Comprende patrones de negocio"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>🎯 Caso de Uso:</strong> Una tienda de ropa puede usar el análisis predictivo para identificar 
              que los gastos en inventario aumentan un 25% en diciembre. Esto le permite planificar mejor 
              sus compras y evitar quedarse sin stock durante la temporada alta.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/analytics"
              variant="contained"
              color="error"
              startIcon={<Analytics />}
              sx={{ borderRadius: 2 }}
            >
              Ir al Análisis
            </Button>
            <Button
              component={Link}
              href="/stats"
              variant="outlined"
              startIcon={<BarChart />}
              sx={{ borderRadius: 2 }}
            >
              Ver Estadísticas Básicas
            </Button>
          </Box>
        </Box>
      )
    }
  ];

  // Nueva introducción
  const intro = (
    <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
      <Typography variant="h5" gutterBottom>
        Bienvenido al Sistema de Gestión de Facturas Multiplataforma
      </Typography>
      <Typography variant="body1">
        El sistema está diseñado tanto para <b>usuarios individuales</b> (personas que desean organizar sus facturas personales o familiares) como para <b>PYMES</b> (pequeñas y medianas empresas que requieren control y análisis de sus gastos y proveedores).
      </Typography>
    </Paper>
  );

  // Sección para Usuarios Individuales
  const individualSection = (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6" color="primary">Para Usuarios Individuales</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          <ListItem><ListItemIcon><Add color="primary" /></ListItemIcon><ListItemText primary="¿Cómo registrar y digitalizar facturas personales?" secondary="Utiliza el formulario de Nueva Factura y la función de OCR para capturar datos automáticamente desde una foto o archivo." /></ListItem>
          <ListItem><ListItemIcon><Receipt color="primary" /></ListItemIcon><ListItemText primary="Uso del OCR para capturar datos automáticamente" secondary="Ahorra tiempo y reduce errores al extraer los datos clave de tus facturas con un solo clic." /></ListItem>
          <ListItem><ListItemIcon><Category color="primary" /></ListItemIcon><ListItemText primary="Organización por categorías" secondary="Clasifica tus facturas en categorías como hogar, salud, educación, etc. para un mejor control personal." /></ListItem>
          <ListItem><ListItemIcon><Search color="primary" /></ListItemIcon><ListItemText primary="Búsqueda y filtrado rápido" secondary="Encuentra cualquier factura usando filtros por fecha, monto, proveedor o categoría." /></ListItem>
          <ListItem><ListItemIcon><FileDownload color="primary" /></ListItemIcon><ListItemText primary="Exportación de reportes" secondary="Descarga tus facturas en formato CSV para llevar un control personal o compartir con tu contador." /></ListItem>
          <ListItem><ListItemIcon><Info color="primary" /></ListItemIcon><ListItemText primary="Consejos para evitar la pérdida de comprobantes" secondary="Digitaliza tus facturas apenas las recibas y realiza copias de seguridad periódicas." /></ListItem>
        </List>
        <Alert severity="info" sx={{ mt: 2 }}>
          Ejemplo: Juan, un profesional independiente, usa el sistema para organizar sus gastos personales y familiares, digitalizando todas sus facturas y generando reportes mensuales para su control financiero.
        </Alert>
      </AccordionDetails>
    </Accordion>
  );

  // Sección para PYMES
  const pymesSection = (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6" color="secondary">Para PYMES</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          <ListItem><ListItemIcon><Business color="secondary" /></ListItemIcon><ListItemText primary="Gestión de múltiples proveedores y categorías empresariales" secondary="Administra todos tus proveedores y clasifica tus facturas por áreas de la empresa." /></ListItem>
          <ListItem><ListItemIcon><Add color="secondary" /></ListItemIcon><ListItemText primary="Registro de facturas de compras, servicios y ventas" secondary="Registra fácilmente cualquier tipo de factura y asocia cada una a su proveedor y categoría." /></ListItem>
          <ListItem><ListItemIcon><BarChart color="secondary" /></ListItemIcon><ListItemText primary="Análisis estadístico de gastos y tendencias" secondary="Visualiza gráficos y reportes para tomar mejores decisiones financieras." /></ListItem>
          <ListItem><ListItemIcon><FileDownload color="secondary" /></ListItemIcon><ListItemText primary="Exportación de datos para contabilidad y auditoría" secondary="Exporta toda la información necesaria para tu contador o para auditorías externas." /></ListItem>
          <ListItem><ListItemIcon><Analytics color="secondary" /></ListItemIcon><ListItemText primary="Uso de reportes para toma de decisiones empresariales" secondary="Utiliza los reportes para identificar oportunidades de ahorro y optimización de gastos." /></ListItem>
        </List>
        <Alert severity="success" sx={{ mt: 2 }}>
          Ejemplo: La empresa "Ferretería Cochabamba SRL" utiliza el sistema para registrar todas sus compras y ventas, analizar tendencias de gasto, y exportar reportes mensuales para su contador.
        </Alert>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Layout title="Tutorial">
      {intro}
      {individualSection}
      {pymesSection}
      {/* El resto del tutorial original puede ir debajo si se desea */}
    </Layout>
  );
} 