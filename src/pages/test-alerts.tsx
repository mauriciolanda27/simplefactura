import { useState } from 'react';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';
import { useAlert } from '../components/AlertSystem';
import Layout from '../components/Layout';

export default function TestAlertsPage() {
  const { showSuccess, showError, showWarning, showInfo, showAlert } = useAlert();
  const [customMessage, setCustomMessage] = useState('');

  const handleShowSuccess = () => {
    showSuccess('¡Operación completada exitosamente!');
  };

  const handleShowError = () => {
    showError('Ha ocurrido un error inesperado');
  };

  const handleShowWarning = () => {
    showWarning('Advertencia: Este es un mensaje de precaución');
  };

  const handleShowInfo = () => {
    showInfo('Información importante para el usuario');
  };

  const handleShowCustom = () => {
    if (customMessage.trim()) {
      showAlert('info', customMessage, 'Mensaje Personalizado', 10000);
    }
  };

  return (
    <Layout title="Prueba de Alertas">
      <Box sx={{ py: 4, px: 2 }}>
        <Paper sx={{ p: 4, borderRadius: 0 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Sistema de Alertas - Pruebas
          </Typography>

          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Tipos de Alertas Básicas
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleShowSuccess}
                sx={{ borderRadius: 0 }}
              >
                Mostrar Éxito
              </Button>

              <Button
                variant="contained"
                color="error"
                startIcon={<Error />}
                onClick={handleShowError}
                sx={{ borderRadius: 0 }}
              >
                Mostrar Error
              </Button>

              <Button
                variant="contained"
                color="warning"
                startIcon={<Warning />}
                onClick={handleShowWarning}
                sx={{ borderRadius: 0 }}
              >
                Mostrar Advertencia
              </Button>

              <Button
                variant="contained"
                color="info"
                startIcon={<Info />}
                onClick={handleShowInfo}
                sx={{ borderRadius: 0 }}
              >
                Mostrar Información
              </Button>
            </Stack>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Alerta Personalizada
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje personalizado..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #ccc',
                    borderRadius: '0',
                    fontSize: '16px',
                    minWidth: '300px'
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleShowCustom}
                  disabled={!customMessage.trim()}
                  sx={{ borderRadius: 0 }}
                >
                  Mostrar Personalizada
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Características del Sistema:</strong>
              </Typography>
              <ul style={{ marginTop: '8px', color: '#666' }}>
                <li>Múltiples alertas simultáneas (máximo 3)</li>
                <li>Auto-cierre con temporizador configurable</li>
                <li>Animaciones suaves de entrada y salida</li>
                <li>Posicionamiento fijo en la esquina superior derecha</li>
                <li>Diferentes duraciones según el tipo de alerta</li>
                <li>Soporte para títulos y mensajes</li>
                <li>Acciones personalizables</li>
              </ul>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Layout>
  );
} 