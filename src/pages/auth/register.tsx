import { useState } from 'react';
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
  useMediaQuery
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility, 
  VisibilityOff,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Basic validation
    if (!name || !email || !password) {
      setErrorMsg("Por favor, complete todos los campos");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar");
      }
      // Registro exitoso - redirigir a login
      router.push("/auth/login?registered=true");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
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
              Únete a nosotros y comienza a gestionar tus facturas
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ 
          p: { xs: 3, sm: 4 }, 
          width: '100%', 
          borderRadius: 0 
        }}>
          <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Crear Cuenta
          </Typography>
          
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMsg}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
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
                disabled={isLoading || !name || !email || !password}
                startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
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
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </Stack>
          </form>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes cuenta?{' '}
              <Link 
                href="/landing" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Inicia sesión aquí
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