package backend.util;

import java.util.regex.Pattern;

/**
 * Utility class to validate password strength
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
    
    /**
     * Validate password strength
     */
    public static boolean isValid(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            return false;
        }
        
        return UPPERCASE.matcher(password).find()
            && LOWERCASE.matcher(password).find()
            && DIGIT.matcher(password).find()
            && SPECIAL.matcher(password).find();
    }
    
    /**
     * Get password requirements message
     */
    public static String getRequirements() {
        return "Password must be at least " + MIN_LENGTH + " characters long and contain: " +
               "uppercase letter, lowercase letter, digit, and special character (!@#$%^&*(),.?\":{}|<>)";
    }
    
    /**
     * Get detailed validation result
     */
    public static ValidationResult validate(String password) {
        ValidationResult result = new ValidationResult();
        
        if (password == null) {
            result.addError("Password cannot be null");
            return result;
        }
        
        if (password.length() < MIN_LENGTH) {
            result.addError("Password must be at least " + MIN_LENGTH + " characters long");
        }
        
        if (!UPPERCASE.matcher(password).find()) {
            result.addError("Password must contain at least one uppercase letter");
        }
        
        if (!LOWERCASE.matcher(password).find()) {
            result.addError("Password must contain at least one lowercase letter");
        }
        
        if (!DIGIT.matcher(password).find()) {
            result.addError("Password must contain at least one digit");
        }
        
        if (!SPECIAL.matcher(password).find()) {
            result.addError("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
        }
        
        return result;
    }
    
    /**
     * Result of password validation
     */
    public static class ValidationResult {
        private final java.util.List<String> errors = new java.util.ArrayList<>();
        
        public void addError(String error) {
            errors.add(error);
        }
        
        public boolean isValid() {
            return errors.isEmpty();
        }
        
        public java.util.List<String> getErrors() {
            return errors;
        }
        
        public String getErrorMessage() {
            return String.join("; ", errors);
        }
    }
}

