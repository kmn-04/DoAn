import { useCallback } from 'react';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalInfo?: Record<string, any>;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, context?: ErrorContext) => {
    // Log error to console
    console.error('Error caught by useErrorHandler:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // Show user-friendly toast notification
    const errorEvent = new CustomEvent('show-toast', {
      detail: {
        type: 'error',
        title: 'Có lỗi xảy ra',
        message: getErrorMessage(error, context),
      }
    });
    window.dispatchEvent(errorEvent);

    // Send to monitoring service (optional)
    // Example: Sentry.captureException(error, { contexts: { custom: context } });
    
    // Send to analytics (optional)
    // Example: analytics.track('Error Occurred', { ...context, error: error.message });
  }, []);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: ErrorContext
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      throw error; // Re-throw to allow caller to handle if needed
    }
  }, [handleError]);

  const handleApiError = useCallback((error: any, context?: ErrorContext) => {
    let errorMessage = 'Có lỗi kết nối xảy ra';
    
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          errorMessage = 'Yêu cầu không hợp lệ';
          break;
        case 401:
          errorMessage = 'Bạn cần đăng nhập để thực hiện hành động này';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền thực hiện hành động này';
          break;
        case 404:
          errorMessage = 'Không tìm thấy dữ liệu yêu cầu';
          break;
        case 500:
          errorMessage = 'Lỗi server. Vui lòng thử lại sau';
          break;
        default:
          errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    const apiError = new Error(errorMessage);
    handleError(apiError, { ...context, apiStatus: error?.response?.status });
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    handleApiError,
  };
};

// Helper function to get user-friendly error messages
function getErrorMessage(error: Error, context?: ErrorContext): string {
  // Network errors
  if (error.message.includes('fetch')) {
    return 'Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.';
  }

  // Chunk loading errors (common with lazy loading)
  if (error.message.includes('Loading chunk')) {
    return 'Không thể tải trang. Vui lòng tải lại trang.';
  }

  // Component-specific errors
  if (context?.component) {
    return `Có lỗi xảy ra trong ${context.component}. Vui lòng thử lại.`;
  }

  // Generic fallback
  return 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.';
}

// Global error event listener (for unhandled errors)
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const errorEvent = new CustomEvent('show-toast', {
      detail: {
        type: 'error',
        title: 'Lỗi hệ thống',
        message: 'Có lỗi không mong muốn xảy ra. Vui lòng tải lại trang.',
      }
    });
    window.dispatchEvent(errorEvent);
    
    // Prevent the default browser error handling
    event.preventDefault();
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error);
    
    // Don't show toast for chunk loading errors (these are handled by ErrorBoundary)
    if (event.error?.message?.includes('Loading chunk')) {
      return;
    }
    
    const errorEvent = new CustomEvent('show-toast', {
      detail: {
        type: 'error',
        title: 'Lỗi JavaScript',
        message: 'Có lỗi kỹ thuật xảy ra. Vui lòng tải lại trang.',
      }
    });
    window.dispatchEvent(errorEvent);
  });
};
