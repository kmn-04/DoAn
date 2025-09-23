import React, { memo, useState, useCallback } from 'react';
import { useLazyImage } from '../../hooks/usePerformance';
import { cn } from '../../utils/cn';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const { elementRef, imageSrc, isLoaded, isError } = useLazyImage(src, placeholder);
  const [hasTransitioned, setHasTransitioned] = useState(false);

  const handleLoad = useCallback(() => {
    setHasTransitioned(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  const displaySrc = isError ? fallback : imageSrc;

  return (
    <div 
      ref={elementRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded && hasTransitioned ? 'opacity-100' : 'opacity-75',
          isError && 'bg-gray-100'
        )}
        decoding="async"
      />
      
      {/* Loading overlay */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {/* Error overlay */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">⚠️ Error loading image</div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Specialized components for different use cases
export const TourImage: React.FC<Omit<OptimizedImageProps, 'className'> & { className?: string }> = memo((props) => (
  <OptimizedImage
    {...props}
    className={cn('rounded-lg', props.className)}
    loading="lazy"
  />
));

TourImage.displayName = 'TourImage';

export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'className'> & { 
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = memo(({ size = 'md', ...props }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <OptimizedImage
      {...props}
      className={cn('rounded-full', sizeClasses[size], props.className)}
      loading="lazy"
    />
  );
});

AvatarImage.displayName = 'AvatarImage';

export const HeroImage: React.FC<Omit<OptimizedImageProps, 'loading'> & { className?: string }> = memo((props) => (
  <OptimizedImage
    {...props}
    className={cn('w-full h-full object-cover', props.className)}
    loading="eager" // Hero images should load immediately
  />
));

HeroImage.displayName = 'HeroImage';
