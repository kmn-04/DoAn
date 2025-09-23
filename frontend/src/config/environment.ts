// Environment Configuration
// Centralized environment variable management

export const ENV = {
  // App Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // Feature Flags
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS !== 'false',
  ENABLE_DEBUG_LOGGING: import.meta.env.VITE_ENABLE_DEBUG_LOGGING !== 'false',
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  
  // External Services
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TourBooking',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || 'http://localhost:5173',
  
  // Security
  ENABLE_CSP: import.meta.env.VITE_ENABLE_CSP === 'true',
  ENABLE_HTTPS_ONLY: import.meta.env.VITE_ENABLE_HTTPS_ONLY === 'true',
  
  // Performance
  ENABLE_SERVICE_WORKER: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
} as const;

// Environment Helpers
export const isDevelopment = () => ENV.NODE_ENV === 'development';
export const isProduction = () => ENV.NODE_ENV === 'production';
export const isTest = () => ENV.NODE_ENV === 'test';

// Feature Flag Helpers
export const shouldShowDevTools = () => isDevelopment() && ENV.ENABLE_DEV_TOOLS;
export const shouldEnableDebugLogging = () => isDevelopment() && ENV.ENABLE_DEBUG_LOGGING;
export const shouldEnablePerformanceMonitoring = () => ENV.ENABLE_PERFORMANCE_MONITORING;

// API Configuration
export const getApiUrl = (endpoint: string) => {
  const baseUrl = ENV.API_BASE_URL.endsWith('/') ? ENV.API_BASE_URL.slice(0, -1) : ENV.API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Validation
export const validateEnvironment = () => {
  const errors: string[] = [];
  
  if (isProduction()) {
    if (!ENV.API_BASE_URL.startsWith('https://')) {
      errors.push('Production API_BASE_URL must use HTTPS');
    }
    
    if (ENV.ENABLE_DEV_TOOLS) {
      errors.push('Dev tools should be disabled in production');
    }
    
    if (ENV.ENABLE_DEBUG_LOGGING) {
      errors.push('Debug logging should be disabled in production');
    }
  }
  
  if (errors.length > 0) {
    console.error('Environment validation errors:', errors);
    if (isProduction()) {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }
  
  return errors.length === 0;
};

// Initialize environment validation
validateEnvironment();
