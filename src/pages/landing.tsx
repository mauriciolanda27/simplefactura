import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper,
  Stack,
  useMediaQuery,
  Card,
  CardContent,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import { 
  Receipt as ReceiptIcon,
  CameraAlt as CameraIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push('/');
    }
  }, [session, status, router]);

  const features = [
    {
      icon: <CameraIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "OCR Inteligente",
      description: "Extrae automáticamente datos de facturas usando IA avanzada con precisión del 95%",
      color: "#667eea"
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Análisis Predictivo",
      description: "Predicciones de gastos y patrones de pago con algoritmos de machine learning",
      color: "#764ba2"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Seguridad Total",
      description: "Datos protegidos con encriptación AES-256 y autenticación de dos factores",
      color: "#f093fb"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Gestión Rápida",
      description: "Organiza y gestiona facturas en segundos con interfaz optimizada",
      color: "#4facfe"
    }
  ];

  const benefits = [
    "Reconocimiento automático de facturas con IA",
    "Cálculos automáticos de IVA (13%) y totales",
    "Exportación profesional a CSV y PDF",
    "Dashboard con métricas en tiempo real",
    "Gestión completa de proveedores y categorías",
    "Análisis estadístico y predicciones avanzadas"
  ];

  const stats = [
    { number: "10,000+", label: "Facturas Procesadas", icon: <ReceiptIcon /> },
    { number: "95%", label: "Precisión OCR", icon: <StarIcon /> },
    { number: "50%", label: "Ahorro de Tiempo", icon: <TrendingUpIcon /> },
    { number: "100%", label: "Seguro", icon: <ShieldIcon /> }
  ];

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                '100%': { transform: 'scale(1)', opacity: 1 }
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        animation: 'float 6s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        animation: 'float 8s ease-in-out infinite reverse',
      }} />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 12 } }}>
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', color: 'white', mb: { xs: 6, md: 10 } }}>
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 3, 
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                background: 'linear-gradient(45deg, #fff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Gestiona tus facturas de manera
              <Box component="span" sx={{ 
                display: 'block', 
                background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                simple y eficiente
              </Box>
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.95, 
                mb: 4, 
                lineHeight: 1.6, 
                maxWidth: 800,
                mx: 'auto',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Automatiza el procesamiento de facturas con IA, organiza tus gastos y obtén insights valiosos para tu negocio.
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 6 }}>
              <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ReceiptIcon />}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    py: 2, 
                    px: 6, 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    borderRadius: 3, 
                    background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                    color: '#333',
                    boxShadow: '0 8px 32px rgba(255,215,0,0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(45deg, #ffed4e, #ffd700)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(255,215,0,0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Comenzar Ahora
                </Button>
              </Link>
              <Link href="/auth/register" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    py: 2, 
                    px: 6, 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    borderRadius: 3, 
                    borderColor: 'white',
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { 
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Crear Cuenta Gratis
                </Button>
              </Link>
            </Stack>
          </Box>
        </Fade>

        {/* Benefits Section */}
        <Grow in timeout={1500}>
          <Paper elevation={12} sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 4, 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(102,126,234,0.2)',
            mb: { xs: 6, md: 8 }
          }}>
            <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main', 
              mb: 4 
            }}>
              ¿Por qué elegir SimpleFactura?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <CheckIcon sx={{ 
                    color: 'primary.main', 
                    mr: 2, 
                    fontSize: 24,
                    background: 'rgba(102,126,234,0.1)',
                    borderRadius: '50%',
                    p: 0.5
                  }} />
                  <Typography variant="body1" sx={{ 
                    color: 'text.primary',
                    fontWeight: 500
                  }}>
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grow>

        {/* Stats Section */}
        <Zoom in timeout={2000}>
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 3, justifyContent: 'center' }}>
              {stats.map((stat, index) => (
                <Box key={index}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    borderRadius: 3, 
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(102,126,234,0.15)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 40px rgba(102,126,234,0.25)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" component="div" sx={{ 
                        fontWeight: 'bold', 
                        color: 'primary.main',
                        mb: 1
                      }}>
                        {stat.number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Zoom>
      </Container>

      {/* Features Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 }, 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main', 
            mb: 8 
          }}>
            Características Principales
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 4, justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Box key={index}>
                <Grow in timeout={1000 + index * 200}>
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    borderRadius: 4, 
                    background: 'white', 
                    boxShadow: '0 8px 32px rgba(102,126,234,0.12)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(102,126,234,0.25)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${feature.color}, ${feature.color}88)`
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: 'primary.main',
                        mb: 2
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: { xs: 6, md: 8 }, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ 
            fontWeight: 'bold', 
            mb: 3 
          }}>
            ¿Listo para transformar tu gestión de facturas?
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9, 
            mb: 4,
            lineHeight: 1.6
          }}>
            Únete a miles de empresas que ya confían en SimpleFactura
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ReceiptIcon />}
                sx={{ 
                  py: 2, 
                  px: 6, 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  borderRadius: 3, 
                  background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                  color: '#333',
                  boxShadow: '0 8px 32px rgba(255,215,0,0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #ffed4e, #ffd700)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(255,215,0,0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/auth/register" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  py: 2, 
                  px: 6, 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  borderRadius: 3, 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Crear Cuenta
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        py: 4, 
        textAlign: 'center', 
        color: 'white',
        background: 'rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          © 2024 SimpleFactura. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
} 