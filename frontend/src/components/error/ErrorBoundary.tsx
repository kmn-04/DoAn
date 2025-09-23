import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (optional)
    // Example: Sentry.captureException(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Có lỗi xảy ra
            </h1>
            <p className="text-gray-600 mb-6">
              Đã xảy ra lỗi không mong muốn. Chúng tôi đã ghi nhận và sẽ sửa chữa sớm nhất có thể.
            </p>
            
            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Chi tiết lỗi (Development)
                </summary>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} className="w-full sm:w-auto">
                Thử lại
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full sm:w-auto"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized Error Boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể tải trang
          </h1>
          <p className="text-gray-600 mb-6">
            Trang này gặp lỗi khi tải. Vui lòng thử lại hoặc quay về trang chủ.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
              Tải lại trang
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full sm:w-auto"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    }
    onError={(error, errorInfo) => {
      console.error('Page Error:', error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  componentName?: string;
}> = ({ children, componentName = 'Component' }) => (
  <ErrorBoundary
    fallback={
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-center space-x-2">
          <div className="text-red-500">⚠️</div>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Lỗi {componentName}
            </h3>
            <p className="text-sm text-red-600 mt-1">
              Component này gặp lỗi khi hiển thị. Vui lòng tải lại trang.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tải lại trang
        </button>
      </div>
    }
    onError={(error, errorInfo) => {
      console.error(`${componentName} Error:`, error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

export const FormErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-yellow-500">⚠️</div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Lỗi Form
            </h3>
            <p className="text-sm text-yellow-600 mt-1">
              Form này gặp lỗi. Vui lòng tải lại trang và thử lại.
            </p>
          </div>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ApiErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-blue-500">🔌</div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Lỗi kết nối
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng và thử lại.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Thử lại
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
