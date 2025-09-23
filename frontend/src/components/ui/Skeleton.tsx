import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
  lines?: number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  circle = false,
  lines = 1,
  animate = true
}) => {
  const baseClasses = cn(
    'bg-gray-200',
    animate && 'animate-pulse',
    rounded && 'rounded-md',
    circle && 'rounded-full',
    className
  );

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines === 1) {
    return <div className={baseClasses} style={style} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            baseClasses,
            index === lines - 1 && 'w-3/4' // Last line is shorter
          )}
          style={{
            ...style,
            width: index === lines - 1 ? '75%' : style.width
          }}
        />
      ))}
    </div>
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('p-4 border border-gray-200 rounded-lg space-y-4', className)}>
    <Skeleton height={48} rounded />
    <div className="space-y-2">
      <Skeleton height={20} />
      <Skeleton height={20} width="80%" />
      <Skeleton height={20} width="60%" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton height={24} width={80} rounded />
      <Skeleton height={32} width={100} rounded />
    </div>
  </div>
);

export const SkeletonTourCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
    {/* Image skeleton */}
    <Skeleton height={200} className="rounded-none" />
    
    <div className="p-4 space-y-3">
      {/* Title */}
      <Skeleton height={24} />
      
      {/* Location and duration */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Skeleton width={16} height={16} />
          <Skeleton width={80} height={16} />
        </div>
        <div className="flex items-center space-x-1">
          <Skeleton width={16} height={16} />
          <Skeleton width={60} height={16} />
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex items-center space-x-2">
        <Skeleton width={16} height={16} />
        <Skeleton width={40} height={16} />
        <Skeleton width={80} height={16} />
      </div>
      
      {/* Price */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton width={100} height={20} />
        </div>
        <Skeleton width={80} height={32} rounded />
      </div>
    </div>
  </div>
);

export const SkeletonBookingCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2 flex-1">
        <Skeleton height={24} width="70%" />
        <Skeleton height={16} width="40%" />
      </div>
      <Skeleton width={80} height={24} rounded />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="space-y-1">
        <Skeleton height={14} width={60} />
        <Skeleton height={20} width={80} />
      </div>
      <div className="space-y-1">
        <Skeleton height={14} width={80} />
        <Skeleton height={20} width={100} />
      </div>
      <div className="space-y-1">
        <Skeleton height={14} width={70} />
        <Skeleton height={20} width={90} />
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Skeleton height={16} width={120} />
      </div>
      <div className="flex space-x-2">
        <Skeleton width={100} height={36} rounded />
        <Skeleton width={80} height={36} rounded />
      </div>
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={cn('space-y-4', className)}>
    {/* Table header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} height={20} width="60%" />
      ))}
    </div>
    
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={16} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ 
  items?: number; 
  className?: string 
}> = ({ 
  items = 3, 
  className = '' 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
        <Skeleton width={48} height={48} circle />
        <div className="flex-1 space-y-2">
          <Skeleton height={20} />
          <Skeleton height={16} width="70%" />
        </div>
        <Skeleton width={80} height={32} rounded />
      </div>
    ))}
  </div>
);
