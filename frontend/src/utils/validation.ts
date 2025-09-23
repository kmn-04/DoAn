// Comprehensive input validation utilities

export const ValidationRules = {
  // Email validation - RFC 5322 compliant
  email: {
    pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    maxLength: 254,
    validate: (email: string): boolean => {
      if (!email || email.length === 0) return false;
      if (email.length > 254) return false;
      if (email.includes('..')) return false; // No consecutive dots
      if (email.startsWith('.') || email.endsWith('.')) return false;
      if (email.includes('@.') || email.includes('.@')) return false;
      return ValidationRules.email.pattern.test(email);
    },
    sanitize: (email: string): string => {
      return email.trim().toLowerCase();
    }
  },

  // Phone validation - International format
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/, // E.164 format
    vietnamPattern: /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/,
    validate: (phone: string): boolean => {
      if (!phone || phone.length === 0) return false;
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      
      // Check Vietnam phone format first
      if (ValidationRules.phone.vietnamPattern.test(cleaned)) return true;
      
      // Check international format
      return ValidationRules.phone.pattern.test(cleaned);
    },
    sanitize: (phone: string): string => {
      return phone.replace(/[\s\-\(\)]/g, '');
    }
  },

  // Password validation - Strong password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    patterns: {
      lowercase: /[a-z]/,
      uppercase: /[A-Z]/,
      digit: /\d/,
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    },
    validate: (password: string): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (!password || password.length === 0) {
        errors.push('Password is required');
        return { isValid: false, errors };
      }
      
      if (password.length < ValidationRules.password.minLength) {
        errors.push(`Password must be at least ${ValidationRules.password.minLength} characters`);
      }
      
      if (password.length > ValidationRules.password.maxLength) {
        errors.push(`Password must be no more than ${ValidationRules.password.maxLength} characters`);
      }
      
      if (!ValidationRules.password.patterns.lowercase.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      
      if (!ValidationRules.password.patterns.uppercase.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      
      if (!ValidationRules.password.patterns.digit.test(password)) {
        errors.push('Password must contain at least one number');
      }
      
      if (!ValidationRules.password.patterns.special.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      
      // Check for common weak patterns
      const commonPatterns = [
        /^password/i,
        /^123456/,
        /^qwerty/i,
        /^admin/i,
        /^letmein/i
      ];
      
      if (commonPatterns.some(pattern => pattern.test(password))) {
        errors.push('Password is too common');
      }
      
      return { isValid: errors.length === 0, errors };
    }
  },

  // Text input validation - XSS prevention
  text: {
    maxLength: 1000,
    validate: (text: string): boolean => {
      if (text.length > ValidationRules.text.maxLength) return false;
      return !ValidationRules.text.containsXSS(text);
    },
    containsXSS: (text: string): boolean => {
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi,
        /data:text\/html/gi,
        /vbscript:/gi
      ];
      
      return xssPatterns.some(pattern => pattern.test(text));
    },
    sanitize: (text: string): string => {
      return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
    }
  },

  // Search query validation
  search: {
    minLength: 1,
    maxLength: 100,
    validate: (query: string): boolean => {
      if (!query || query.trim().length === 0) return false;
      if (query.length > ValidationRules.search.maxLength) return false;
      if (query.length < ValidationRules.search.minLength) return false;
      
      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
        /(\bUNION\b|\bJOIN\b)/gi,
        /(--|\/\*|\*\/)/g,
        /(\bOR\b|\bAND\b)\s+\w+\s*=\s*\w+/gi
      ];
      
      if (sqlPatterns.some(pattern => pattern.test(query))) return false;
      
      // Check for XSS
      return !ValidationRules.text.containsXSS(query);
    },
    sanitize: (query: string): string => {
      return ValidationRules.text.sanitize(query);
    }
  },

  // Date validation
  date: {
    validate: (dateString: string): boolean => {
      if (!dateString) return false;
      
      const date = new Date(dateString);
      
      // Check if valid date
      if (isNaN(date.getTime())) return false;
      
      // Check reasonable date range (1900 - 2100)
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) return false;
      
      return true;
    },
    isFuture: (dateString: string): boolean => {
      const date = new Date(dateString);
      return date > new Date();
    },
    isPast: (dateString: string): boolean => {
      const date = new Date(dateString);
      return date < new Date();
    }
  },

  // Number validation
  number: {
    validate: (value: string | number): boolean => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(num) && isFinite(num);
    },
    isPositive: (value: string | number): boolean => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return ValidationRules.number.validate(num) && num > 0;
    },
    isInteger: (value: string | number): boolean => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return ValidationRules.number.validate(num) && Number.isInteger(num);
    },
    inRange: (value: string | number, min: number, max: number): boolean => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return ValidationRules.number.validate(num) && num >= min && num <= max;
    }
  }
};

// Form validation helper
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => boolean | { isValid: boolean; errors: string[] }>
): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  Object.entries(rules).forEach(([field, validator]) => {
    const value = data[field];
    const result = validator(value);
    
    if (typeof result === 'boolean') {
      if (!result) {
        errors[field] = ['Invalid value'];
        isValid = false;
      }
    } else {
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Sanitize object data
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (key.includes('email')) {
        sanitized[key] = ValidationRules.email.sanitize(value);
      } else if (key.includes('phone')) {
        sanitized[key] = ValidationRules.phone.sanitize(value);
      } else {
        sanitized[key] = ValidationRules.text.sanitize(value);
      }
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};
