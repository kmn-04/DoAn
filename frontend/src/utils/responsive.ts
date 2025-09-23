// Mobile breakpoints based on Tailwind CSS
export const breakpoints = {
  xs: 0,     // 0px and up
  sm: 640,   // 640px and up
  md: 768,   // 768px and up
  lg: 1024,  // 1024px and up
  xl: 1280,  // 1280px and up
  '2xl': 1536 // 1536px and up
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Common device sizes for testing
export const deviceSizes = {
  // Mobile devices
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12/13/14': { width: 390, height: 844 },
  'iPhone 12/13/14 Pro Max': { width: 428, height: 926 },
  'Samsung Galaxy S20': { width: 360, height: 800 },
  'Samsung Galaxy A51': { width: 412, height: 914 },
  
  // Tablets
  'iPad Mini': { width: 768, height: 1024 },
  'iPad Air': { width: 820, height: 1180 },
  'iPad Pro 11"': { width: 834, height: 1194 },
  'iPad Pro 12.9"': { width: 1024, height: 1366 },
  
  // Desktop
  'Small Desktop': { width: 1280, height: 720 },
  'Large Desktop': { width: 1920, height: 1080 },
  'Ultra Wide': { width: 2560, height: 1440 }
} as const;

// Utility functions for responsive design
export const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

export const isMobile = (width: number): boolean => {
  return width < breakpoints.md;
};

export const isTablet = (width: number): boolean => {
  return width >= breakpoints.md && width < breakpoints.lg;
};

export const isDesktop = (width: number): boolean => {
  return width >= breakpoints.lg;
};

// Hook for responsive behavior
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoint = getBreakpoint(windowSize.width);

  return {
    ...windowSize,
    breakpoint,
    isMobile: isMobile(windowSize.width),
    isTablet: isTablet(windowSize.width),
    isDesktop: isDesktop(windowSize.width)
  };
};

// CSS class helpers for responsive design
export const responsiveClasses = {
  // Grid layouts
  gridCols: {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3',
    responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  },
  
  // Spacing
  padding: {
    mobile: 'p-4',
    tablet: 'p-6',
    desktop: 'p-8',
    responsive: 'p-4 md:p-6 lg:p-8'
  },
  
  // Text sizes
  heading: {
    mobile: 'text-2xl',
    tablet: 'text-3xl',
    desktop: 'text-4xl',
    responsive: 'text-2xl md:text-3xl lg:text-4xl'
  },
  
  // Container widths
  container: {
    mobile: 'max-w-full',
    tablet: 'max-w-2xl',
    desktop: 'max-w-6xl',
    responsive: 'max-w-full md:max-w-2xl lg:max-w-6xl'
  }
};

// Mobile-first responsive design patterns
export const mobilePatterns = {
  // Stack on mobile, side-by-side on desktop
  stackToSide: 'flex flex-col md:flex-row',
  
  // Hide on mobile, show on desktop
  hideOnMobile: 'hidden md:block',
  
  // Show on mobile, hide on desktop
  showOnMobile: 'block md:hidden',
  
  // Full width on mobile, auto on desktop
  fullWidthMobile: 'w-full md:w-auto',
  
  // Center on mobile, left align on desktop
  centerMobile: 'text-center md:text-left',
  
  // Smaller gaps on mobile
  gapResponsive: 'gap-2 md:gap-4 lg:gap-6'
};

// Touch-friendly sizes (minimum 44px touch targets)
export const touchTargets = {
  button: 'min-h-[44px] min-w-[44px]',
  link: 'min-h-[44px] inline-flex items-center',
  input: 'min-h-[44px]'
};
