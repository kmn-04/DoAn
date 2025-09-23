// Simple debug validation for testing
export const DebugValidation = {
  // Simple email validation
  isValidEmail: (email: string): boolean => {
    if (!email) return false;
    const simple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return simple.test(email);
  },

  // Simple phone validation  
  isValidPhone: (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return cleaned.length >= 10 && /^\+?\d+$/.test(cleaned);
  },

  // Simple password validation
  isStrongPassword: (password: string): boolean => {
    if (!password || password.length < 8) return false;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    return hasLower && hasUpper && hasNumber && hasSpecial;
  },

  // Simple XSS check
  isSafeSearch: (query: string): boolean => {
    if (!query) return false;
    if (query.length > 100) return false;
    const dangerous = /<script|javascript:|SELECT|DROP|INSERT|DELETE/gi;
    return !dangerous.test(query);
  },

  // Simple date validation
  isValidDate: (dateStr: string): boolean => {
    if (!dateStr) return false;
    if (dateStr === 'invalid-date' || dateStr === 'invalid') return false;
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Check if date is valid and not NaN
    if (isNaN(date.getTime())) return false;
    
    // Check year range
    if (year < 1900 || year > 2100) return false;
    
    // Check for impossible dates like 2023-13-01 or 2023-02-30
    const reconstructed = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const originalParts = dateStr.split('-');
    
    if (originalParts.length === 3) {
      const origMonth = parseInt(originalParts[1]);
      const origDay = parseInt(originalParts[2]);
      
      // Check if month/day are out of range
      if (origMonth > 12 || origMonth < 1) return false;
      if (origDay > 31 || origDay < 1) return false;
      
      // Check if the parsed date matches original input
      if (month !== origMonth || day !== origDay) return false;
    }
    
    return true;
  }
};

// Test the validation functions immediately
console.group('🔍 Debug Validation Tests');

// Test invalid emails
const invalidEmails = ['', 'invalid', '@domain.com', 'user@', 'user@domain'];
console.log('Invalid emails test:', invalidEmails.every(email => !DebugValidation.isValidEmail(email)));

// Test valid emails  
const validEmails = ['user@domain.com', 'test@example.org'];
console.log('Valid emails test:', validEmails.every(email => DebugValidation.isValidEmail(email)));

// Test invalid phones
const invalidPhones = ['', '123', 'abc', '123-456'];
console.log('Invalid phones test:', invalidPhones.every(phone => !DebugValidation.isValidPhone(phone)));

// Test valid phones
const validPhones = ['+84901234567', '0901234567'];
console.log('Valid phones test:', validPhones.every(phone => DebugValidation.isValidPhone(phone)));

// Test weak passwords
const weakPasswords = ['', '123', 'password', 'Password'];
console.log('Weak passwords test:', weakPasswords.every(pwd => !DebugValidation.isStrongPassword(pwd)));

// Test strong passwords
const strongPasswords = ['MyStr0ng!Pass', 'Valid$Pass1'];
console.log('Strong passwords test:', strongPasswords.every(pwd => DebugValidation.isStrongPassword(pwd)));

// Test dangerous searches
const dangerousSearches = ['<script>alert(1)</script>', 'SELECT * FROM users'];
console.log('Dangerous searches test:', dangerousSearches.every(query => !DebugValidation.isSafeSearch(query)));

// Test safe searches
const safeSearches = ['Ha Long Bay', 'beach tour'];
console.log('Safe searches test:', safeSearches.every(query => DebugValidation.isSafeSearch(query)));

// Test invalid dates
const invalidDates = ['', '2023-13-01', 'invalid'];
console.log('Invalid dates test:', invalidDates.every(date => !DebugValidation.isValidDate(date)));

// Test valid dates
const validDates = ['2024-01-15', '2025-06-15'];
console.log('Valid dates test:', validDates.every(date => DebugValidation.isValidDate(date)));

console.groupEnd();
