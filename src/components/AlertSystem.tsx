import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert, Snackbar, AlertColor, Box } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

// Tipos de alerta
export type AlertType = 'success' | 'error' | 'warning' | 'info';

// Interfaz para una alerta
export interface AlertMessage {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  action?: ReactNode;
}

// Contexto para el sistema de alertas
interface AlertContextType {
  showAlert: (type: AlertType, message: string, title?: string, duration?: number, action?: ReactNode) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  clearAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Hook para usar el sistema de alertas
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de AlertProvider');
  }
  return context;
};

// Props para el provider
interface AlertProviderProps {
  children: ReactNode;
  maxAlerts?: number;
}

// Componente principal del sistema de alertas
export function AlertProvider({ children, maxAlerts = 3 }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  // Función para mostrar una alerta
  const showAlert = useCallback((
    type: AlertType, 
    message: string, 
    title?: string, 
    duration = 6000,
    action?: ReactNode
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newAlert: AlertMessage = {
      id,
      type,
      title,
      message,
      duration,
      action
    };

    setAlerts(prev => {
      const updated = [...prev, newAlert];
      // Mantener solo el número máximo de alertas
      if (updated.length > maxAlerts) {
        return updated.slice(-maxAlerts);
      }
      return updated;
    });

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        clearAlert(id);
      }, duration);
    }
  }, [maxAlerts]);

  // Funciones de conveniencia para cada tipo de alerta
  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert('success', message, title, 4000);
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert('error', message, title, 8000);
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert('warning', message, title, 6000);
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert('info', message, title, 5000);
  }, [showAlert]);

  // Función para limpiar una alerta específica
  const clearAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Función para limpiar todas las alertas
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Obtener el ícono correspondiente al tipo de alerta
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return null;
    }
  };

  // Obtener el color correspondiente al tipo de alerta
  const getAlertColor = (type: AlertType): AlertColor => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const contextValue: AlertContextType = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAlert,
    clearAllAlerts
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      
      {/* Contenedor de alertas */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 400,
          width: '100%'
        }}
      >
        {alerts.map((alert, index) => (
          <Snackbar
            key={alert.id}
            open={true}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{
              position: 'static',
              transform: 'none',
              '& .MuiSnackbarContent-root': {
                borderRadius: 0,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                animation: 'slideInRight 0.3s ease-out'
              }
            }}
          >
            <Alert
              severity={getAlertColor(alert.type)}
              icon={getAlertIcon(alert.type)}
              onClose={() => clearAlert(alert.id)}
              action={alert.action}
              sx={{
                width: '100%',
                borderRadius: 0,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              {alert.title && (
                <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {alert.title}
                </Box>
              )}
              <Box>
                {alert.message}
              </Box>
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </AlertContext.Provider>
  );
}

// Componente de alerta individual (para uso directo)
interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

export function AppAlert({ type, title, message, onClose, action, className }: AlertProps) {
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return null;
    }
  };

  const getAlertColor = (type: AlertType): AlertColor => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Alert
      severity={getAlertColor(type)}
      icon={getAlertIcon(type)}
      onClose={onClose}
      action={action}
      className={className}
      sx={{
        borderRadius: 0,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      {title && (
        <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {title}
        </Box>
      )}
      <Box>
        {message}
      </Box>
    </Alert>
  );
} 