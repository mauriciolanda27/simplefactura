import { useState, useEffect, useCallback } from 'react';

interface LazyLoadingState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  loaded: boolean;
}

interface LazyLoadingOptions {
  immediate?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export function useLazyLoading<T>(
  loader: () => Promise<T>,
  options: LazyLoadingOptions = {}
): LazyLoadingState<T> & {
  load: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = false, retryCount = 3, retryDelay = 1000 } = options;
  
  const [state, setState] = useState<LazyLoadingState<T>>({
    data: null,
    loading: false,
    error: null,
    loaded: false
  });

  const [retryAttempts, setRetryAttempts] = useState(0);

  const load = useCallback(async () => {
    if (state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await loader();
      setState({
        data,
        loading: false,
        error: null,
        loaded: true
      });
      setRetryAttempts(0);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
        loaded: false
      }));
    }
  }, [loader, state.loading]);

  const retry = useCallback(async () => {
    if (retryAttempts >= retryCount) {
      setState(prev => ({
        ...prev,
        error: new Error(`Máximo de reintentos (${retryCount}) alcanzado`)
      }));
      return;
    }

    setRetryAttempts(prev => prev + 1);
    
    // Esperar antes de reintentar
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    await load();
  }, [load, retryAttempts, retryCount, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      loaded: false
    });
    setRetryAttempts(0);
  }, []);

  useEffect(() => {
    if (immediate) {
      load();
    }
  }, [immediate, load]);

  return {
    ...state,
    load,
    retry,
    reset
  };
}

// Hook para lazy loading de imágenes
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);

  return {
    src: imageSrc,
    loading,
    error
  };
}

// Hook para lazy loading con Intersection Observer
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
    };
  }, [ref, options]);

  return [setRef, isIntersecting] as const;
}

// Hook para lazy loading de módulos
export function useLazyModule<T>(
  moduleLoader: () => Promise<T>,
  options: LazyLoadingOptions = {}
) {
  return useLazyLoading(moduleLoader, options);
}

// Hook para lazy loading de datos con cache
export function useLazyDataWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: LazyLoadingOptions & { cacheTime?: number } = {}
) {
  const { cacheTime = 5 * 60 * 1000, ...lazyOptions } = options; // 5 minutos por defecto
  
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());

  const loadWithCache = useCallback(async () => {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cacheTime) {
      return cached.data;
    }

    const data = await fetcher();
    setCache(prev => new Map(prev).set(key, { data, timestamp: now }));
    return data;
  }, [key, fetcher, cache, cacheTime]);

  const lazyState = useLazyLoading(loadWithCache, lazyOptions);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const clearCacheItem = useCallback((cacheKey: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(cacheKey);
      return newCache;
    });
  }, []);

  return {
    ...lazyState,
    clearCache,
    clearCacheItem,
    isCached: cache.has(key)
  };
} 