import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

// Custom Toast Component
interface CustomToastProps {
  t: any; // Toast object from react-hot-toast
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

const CustomToast: React.FC<CustomToastProps> = ({ 
  t, 
  title, 
  description, 
  variant = 'default' 
}) => {
  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    error: <XCircleIcon className="h-5 w-5 text-red-500" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
    default: null,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    default: 'bg-white border-gray-200',
  };

  return (
    <div
      className={cn(
        'max-w-md w-full border rounded-lg shadow-lg p-4',
        bgColors[variant],
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
    >
      <div className="flex">
        {icons[variant] && (
          <div className="flex-shrink-0 mr-3">
            {icons[variant]}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <div className="text-sm font-medium text-gray-900 mb-1">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm text-gray-600">
              {description}
            </div>
          )}
        </div>
        
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast utility functions
export const showToast = {
  success: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} variant="success" />
    ));
  },
  
  error: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} variant="error" />
    ));
  },
  
  warning: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} variant="warning" />
    ));
  },
  
  info: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} variant="info" />
    ));
  },
  
  default: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} variant="default" />
    ));
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Toast Container Component
export const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
};

// Loading Toast Component
export const LoadingToast: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
      <span className="text-sm text-gray-700">{message}</span>
    </div>
  );
};
