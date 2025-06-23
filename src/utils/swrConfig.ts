import { SWRConfiguration } from 'swr';

// Configuración global de SWR para cache inteligente
export const swrConfig: SWRConfiguration = {
  // Tiempo de revalidación automática (5 minutos)
  refreshInterval: 5 * 60 * 1000,
  
  // Revalidar al enfocar la ventana
  revalidateOnFocus: true,
  
  // Revalidar al reconectar
  revalidateOnReconnect: true,
  
  // Tiempo de deduplicación de requests (2 segundos)
  dedupingInterval: 2000,
  
  // Tiempo de cache por defecto (10 minutos)
  revalidateIfStale: true,
  
  // Mantener datos en cache mientras se revalida
  keepPreviousData: true,
  
  // Configuración de reintentos
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  
  // Función de comparación para detectar cambios
  compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  
  // Callback de error global
  onError: (error, key) => {
    console.error(`SWR Error for key "${key}":`, error);
  },
  
  // Callback de éxito global
  onSuccess: (data, key) => {
    console.log(`SWR Success for key "${key}":`, data);
  }
};

// Configuraciones específicas por tipo de dato
export const swrConfigs = {
  // Para datos que cambian frecuentemente (facturas, estadísticas)
  frequent: {
    ...swrConfig,
    refreshInterval: 2 * 60 * 1000, // 2 minutos
    revalidateOnFocus: true,
  },
  
  // Para datos que cambian poco (categorías, configuración)
  static: {
    ...swrConfig,
    refreshInterval: 30 * 60 * 1000, // 30 minutos
    revalidateOnFocus: false,
  },
  
  // Para datos críticos que necesitan estar siempre actualizados
  critical: {
    ...swrConfig,
    refreshInterval: 30 * 1000, // 30 segundos
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  }
};

// Keys de cache para diferentes tipos de datos
export const cacheKeys = {
  invoices: '/api/invoices',
  invoice: (id: string) => `/api/invoices/${id}`,
  categories: '/api/categories',
  category: (id: string) => `/api/categories/${id}`,
  stats: '/api/stats',
  user: '/api/user',
} as const;

// Función para invalidar cache específico
export const invalidateCache = {
  invoices: () => {
    // Esta función se usará con mutate de SWR
    return ['/api/invoices'];
  },
  categories: () => {
    return ['/api/categories'];
  },
  stats: () => {
    return ['/api/stats'];
  },
  all: () => {
    return ['/api/invoices', '/api/categories', '/api/stats'];
  }
}; 