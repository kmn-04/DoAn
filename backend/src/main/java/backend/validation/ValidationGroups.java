package backend.validation;

/**
 * Marker interfaces for validation groups.
 * Used to apply different validation rules for create vs update operations.
 */
public class ValidationGroups {
    
    /**
     * Validation group for create operations
     */
    public interface Create {}
    
    /**
     * Validation group for update operations
     */
    public interface Update {}
    
    /**
     * Validation group for partial updates (PATCH)
     */
    public interface PartialUpdate {}
}

