import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-current',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        default: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'border-gray-300 border-t-primary-600',
        primary: 'border-primary-200 border-t-primary-600',
        white: 'border-gray-200 border-t-white',
        secondary: 'border-secondary-200 border-t-secondary-600',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

// Basic Spinner Component
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    />
  )
);

Spinner.displayName = 'Spinner';

// Loading with text
export interface LoadingProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'white' | 'secondary';
  text?: string;
  className?: string;
  center?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  variant = 'default',
  text,
  className,
  center = false,
}) => {
  return (
    <div 
      className={cn(
        'flex items-center space-x-2',
        center && 'justify-center',
        className
      )}
    >
      <Spinner size={size} variant={variant} />
      {text && (
        <span className={cn(
          'text-gray-600',
          size === 'sm' && 'text-sm',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl'
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

// Page Loading Component
export const PageLoading: React.FC<{ text?: string }> = ({ 
  text = 'Đang tải...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Spinner size="xl" variant="primary" />
      <p className="text-lg text-gray-600">{text}</p>
    </div>
  );
};

// Button Loading (for inline use)
export const ButtonLoading: React.FC<{ size?: 'sm' | 'default' | 'lg' }> = ({ 
  size = 'sm' 
}) => {
  return <Spinner size={size} variant="white" />;
};

// Skeleton Loading Components
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div 
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
}> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};
