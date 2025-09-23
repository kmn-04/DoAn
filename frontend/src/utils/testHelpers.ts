import { ValidationRules } from './validation';

// Edge case testing utilities
export const EdgeCaseTests = {
  // Network simulation
  simulateNetworkError: () => {
    // Mock fetch to simulate network failure
    const originalFetch = window.fetch;
    window.fetch = () => Promise.reject(new Error('Network error'));
    return () => { window.fetch = originalFetch; };
  },

  simulateSlowNetwork: (delay: number = 5000) => {
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      return new Promise(resolve => {
        setTimeout(() => resolve(originalFetch(...args)), delay);
      });
    };
    return () => { window.fetch = originalFetch; };
  },

  simulate404Error: () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ error: 'Not found' })
    } as Response);
    return () => { window.fetch = originalFetch; };
  },

  simulate500Error: () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ error: 'Server error' })
    } as Response);
    return () => { window.fetch = originalFetch; };
  },

  // Data validation tests - IMPROVED
  testInvalidInputs: {
    // Email validation
    invalidEmails: [
      '',
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      'user..name@domain.com',
      'user@domain..com',
      '.user@domain.com',
      'user@domain.com.',
      'user@.domain.com',
      'user@domain.com@',
      'a'.repeat(255) + '@domain.com' // Too long
    ],

    validEmails: [
      'user@domain.com',
      'test.email@example.org',
      'user+tag@domain.co.uk',
      'firstname.lastname@company.com'
    ],

    // Phone validation  
    invalidPhones: [
      '',
      '123',
      'abc123',
      '123-456-789',
      '+84-abc-def-ghi',
      '12345678901234567890',
      '0123456', // Too short
      '+84', // Incomplete
      '84123456789012345' // Too long
    ],

    validPhones: [
      '+84901234567',
      '0901234567',
      '84901234567',
      '+1234567890123'
    ],

    // Password validation - IMPROVED
    weakPasswords: [
      '',
      '123',
      'password',
      '12345678',
      'Password',
      'password123',
      'PASSWORD123',
      'admin123',
      'letmein',
      'qwerty123'
    ],

    strongPasswords: [
      'MyStr0ng!Pass',
      'C0mplex@Password',
      'Secure#123Pass',
      'Valid$Password1'
    ],

    // Search queries - IMPROVED
    problematicSearches: [
      '',
      '   ',
      '<script>alert("xss")</script>',
      'SELECT * FROM users',
      '../../etc/passwd',
      'a'.repeat(1000),
      '🚀🎉💯', // Emoji only
      'UNION SELECT password FROM users',
      'DROP TABLE users',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      'OR 1=1--'
    ],

    validSearches: [
      'Ha Long Bay',
      'tour du lịch',
      'beach vacation',
      'mountain hiking'
    ],

    // Dates
    invalidDates: [
      '',
      '2023-13-01', // Invalid month
      '2023-02-30', // Invalid day
      '2020-02-30', // Invalid leap year
      '1800-01-01', // Too old
      '2200-01-01', // Too far future
      'invalid-date',
      '32/12/2023',
      '2023/13/01'
    ],

    validDates: [
      '2024-01-15',
      '2024-12-31',
      '2025-06-15',
      '2024-02-29' // Valid leap year
    ],

    // Numbers
    invalidNumbers: [
      '',
      'abc',
      'NaN',
      'Infinity',
      '-Infinity',
      '1.234.567',
      '1,234,567'
    ],

    validNumbers: [
      '123',
      '123.45',
      '-123',
      '0',
      '999999'
    ]
  },

  // UI stress tests
  stressTests: {
    // Long text content
    longText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100),
    
    // Large arrays
    generateLargeArray: (size: number) => Array.from({ length: size }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`.repeat(10)
    })),

    // Special characters
    specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\/',
    
    // Unicode characters
    unicodeText: '你好世界 🌍 مرحبا بالعالم Здравствуй мир',

    // HTML injection attempts
    htmlInjection: '<img src="x" onerror="alert(1)">'
  },

  // Performance tests
  performanceTests: {
    measureRenderTime: (componentName: string) => {
      const start = performance.now();
      return () => {
        const end = performance.now();
        console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
      };
    },

    measureMemoryUsage: () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };
      }
      return null;
    }
  },

  // Accessibility tests
  accessibilityTests: {
    checkKeyboardNavigation: () => {
      // Test Tab navigation
      const focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      return focusableElements.length > 0;
    },

    checkAriaLabels: () => {
      const elementsNeedingLabels = document.querySelectorAll(
        'button:not([aria-label]):not([aria-labelledby]):not([title]), input:not([aria-label]):not([aria-labelledby]):not([placeholder])'
      );
      return elementsNeedingLabels;
    },

    checkColorContrast: () => {
      // Enhanced color contrast check
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button');
      const lowContrastElements = [];
      
      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        // Simple contrast ratio calculation (simplified)
        const colorRgb = color.match(/\d+/g);
        const bgRgb = bgColor.match(/\d+/g);
        
        if (colorRgb && bgRgb) {
          const colorLuminance = getLuminance(parseInt(colorRgb[0]), parseInt(colorRgb[1]), parseInt(colorRgb[2]));
          const bgLuminance = getLuminance(parseInt(bgRgb[0]), parseInt(bgRgb[1]), parseInt(bgRgb[2]));
          
          const contrastRatio = (Math.max(colorLuminance, bgLuminance) + 0.05) / (Math.min(colorLuminance, bgLuminance) + 0.05);
          
          // WCAG AA standard requires 4.5:1 for normal text
          if (contrastRatio < 4.5) {
            lowContrastElements.push(el);
          }
        }
      });
      
      return lowContrastElements;
    }
  },

  // Browser compatibility tests
  browserTests: {
    checkLocalStorageSupport: () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    },

    checkFetchSupport: () => {
      return typeof fetch !== 'undefined';
    },

    checkES6Support: () => {
      try {
        eval('const test = () => {};');
        return true;
      } catch (e) {
        return false;
      }
    }
  }
};

// Helper function for luminance calculation
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Test runner utility - IMPROVED
export class EdgeCaseTestRunner {
  private results: Array<{
    test: string;
    passed: boolean;
    error?: string;
    duration: number;
  }> = [];

  async runTest(testName: string, testFn: () => Promise<boolean> | boolean) {
    const start = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - start;
      
      this.results.push({
        test: testName,
        passed: result,
        duration
      });
      
      console.log(`${result ? '✅' : '❌'} ${testName}: ${result ? 'PASSED' : 'FAILED'} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - start;
      
      this.results.push({
        test: testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      });
      
      console.error(`❌ ${testName}: ERROR - ${error} (${duration.toFixed(2)}ms)`);
    }
  }

  getResults() {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      results: this.results
    };
  }

  generateReport() {
    const summary = this.getResults();
    
    console.group('🧪 Edge Case Test Report');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
    
    if (summary.failed > 0) {
      console.group('❌ Failed Tests:');
      summary.results.filter(r => !r.passed).forEach(result => {
        console.log(`- ${result.test}: ${result.error || 'Test returned false'}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return summary;
  }
}