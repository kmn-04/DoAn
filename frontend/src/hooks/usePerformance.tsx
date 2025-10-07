import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';

/**
 * Custom hook for debouncing values
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for throttling functions
 */
export const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastCall = useRef<number>(0);

  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

/**
 * Custom hook for memoizing expensive calculations
 */
export const useExpensiveMemo = <T,>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(() => {
    const start = performance.now();
    const result = factory();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development' && end - start > 16) {
      console.warn(`Expensive computation took ${(end - start).toFixed(2)}ms`, { deps });
    }
    
    return result;
  }, deps);
};

/**
 * Custom hook for lazy initialization of expensive values
 */
export const useLazyRef = <T,>(initializer: () => T) => {
  const ref = useRef<T>();
  
  if (ref.current === undefined) {
    ref.current = initializer();
  }
  
  return ref.current;
};

/**
 * Custom hook for intersection observer (lazy loading images, infinite scroll)
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { elementRef, isIntersecting };
};

/**
 * Custom hook for measuring render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
  });

  useEffect(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      // Performance logging removed
    }
  });

  return renderCount.current;
};

/**
 * Custom hook for virtual scrolling (for large lists)
 */
export const useVirtualScroll = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll,
  };
};

/**
 * Custom hook for image lazy loading
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { elementRef, isIntersecting } = useIntersectionObserver();

  useEffect(() => {
    if (isIntersecting && src && !isLoaded) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        setIsError(false);
      };
      
      img.onerror = () => {
        setIsError(true);
        setIsLoaded(false);
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, isLoaded]);

  return {
    elementRef,
    imageSrc,
    isLoaded,
    isError,
  };
};

/**
 * Custom hook for preloading resources
 */
export const usePreload = (resources: string[]) => {
  useEffect(() => {
    const preloadPromises = resources.map((resource) => {
      if (resource.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // Preload images
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = resource;
        });
      } else {
        // Preload other resources
        return fetch(resource, { method: 'HEAD' });
      }
    });

    Promise.allSettled(preloadPromises).then((results) => {
      if (process.env.NODE_ENV === 'development') {
        const successful = results.filter(r => r.status === 'fulfilled').length;
      }
    });
  }, [resources]);
};

