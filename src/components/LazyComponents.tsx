import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import SkeletonLoader from './SkeletonLoader';

// Componente de carga para lazy loading
export function LazyLoadingFallback({ message = "Cargando..." }: { message?: string }) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '200px',
        p: 3
      }}
    >
      <CircularProgress 
        size={40} 
        thickness={4}
        sx={{ mb: 2 }}
        className="loading-spinner"
      />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

// Componente de carga con skeleton
export function LazySkeletonFallback() {
  return <SkeletonLoader />;
}

// Lazy loading de páginas principales
export const LazyDashboard = lazy(() => import('../pages/index'));
export const LazyInvoices = lazy(() => import('../pages/invoices/new'));
export const LazyEditInvoice = lazy(() => import('../pages/invoices/edit/[id]'));
export const LazyCategories = lazy(() => import('../pages/categories'));
export const LazyStats = lazy(() => import('../pages/stats'));
export const LazyLogin = lazy(() => import('../pages/auth/login'));
export const LazyRegister = lazy(() => import('../pages/auth/register'));
export const LazyTestAlerts = lazy(() => import('../pages/test-alerts'));

// Lazy loading de componentes pesados
export const LazyExportDialog = lazy(() => import('./ExportDialog'));
export const LazyWebcamCapture = lazy(() => import('./WebcamCapture'));
export const LazyInvoiceForm = lazy(() => import('./InvoiceForm'));

// Lazy loading de módulos de terceros (solo cuando se necesiten)
export const LazyChartComponents = lazy(() => 
  import('recharts').then(module => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    LineChart: module.LineChart,
    Line: module.Line,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
    CartesianGrid: module.CartesianGrid,
    Tooltip: module.Tooltip,
    ResponsiveContainer: module.ResponsiveContainer,
    BarChart: module.BarChart,
    Bar: module.Bar,
    PieChart: module.PieChart,
    Pie: module.Pie,
    Cell: module.Cell
  }))
);

// Wrapper para componentes lazy con Suspense
export function withLazyLoading<T extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<T>>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <LazyLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Hook para carga diferida de datos
export function useLazyData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  React.useEffect(() => {
    loadData();
  }, deps);

  return { data, loading, error, refetch: loadData };
}

// Componente para carga diferida de imágenes
export function LazyImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23f0f0f0'/%3E%3C/svg%3E"
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
}) {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    let observer: IntersectionObserver;
    let didCancel = false;

    if (imageRef && imageSrc === placeholder) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setImageSrc(src);
                if (imageRef) {
                  observer.unobserve(imageRef);
                }
              }
            });
          },
          {
            threshold: 0.01,
            rootMargin: '75%',
          }
        );
        observer.observe(imageRef);
      } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        setImageSrc(src);
      }
    }
    return () => {
      didCancel = true;
      if (observer && observer.unobserve && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageSrc, imageRef]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        opacity: imageSrc === placeholder ? 0.5 : 1,
        transition: 'opacity 0.3s ease-in-out',
      }}
      onLoad={() => {
        if (imageSrc === placeholder) {
          setImageSrc(src);
        }
      }}
    />
  );
}

// Componente para carga diferida de módulos
export function LazyModule<T extends object>(
  moduleLoader: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyModuleComponent = lazy(moduleLoader);
  
  return function LazyModuleWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <LazyLoadingFallback />}>
        <LazyModuleComponent {...props} />
      </Suspense>
    );
  };
} 