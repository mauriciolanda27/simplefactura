import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  TextField, 
  Button, 
  Alert, 
  Container, 
  Typography, 
  Box, 
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility, 
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(router.query.error ? "Credenciales inválidas" : "");
  const [successMsg, setSuccessMsg] = useState(
    router.query.verified ? "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión." :
    router.query.registered ? "¡Registro exitoso! Ya puedes iniciar sesión." : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });
      
      if (result?.error) {
        setErrorMsg("Correo o contraseña incorrectos");
      } else {
        router.push("/");
      }
    } catch {
      setErrorMsg("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      py: { xs: 2, sm: 4, md: 8 },
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%'
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            width: '100%',
            borderRadius: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 3
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              SimpleFactura
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gestiona tus facturas de manera simple y eficiente
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ 
          p: { xs: 3, sm: 4 }, 
          width: '100%', 
          borderRadius: 0 
        }}>
          <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Iniciar Sesión
          </Typography>
          
          {successMsg && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMsg}
            </Alert>
          )}
          
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMsg}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              
              <TextField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              
              <Button
                variant="contained"
                type="submit"
                fullWidth
                size="large"
                disabled={isLoading || !email || !password}
                startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Stack>
          </form>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes cuenta?{' '}
              <Link 
                href="/auth/register" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Regístrate aquí
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <Link 
                href="/landing" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                ← Volver al inicio
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 