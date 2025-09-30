package backend;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswordHash {
    
    @Test
    public void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "password";
        String hash = encoder.encode(password);
        
        System.out.println("========================================");
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("========================================");
        
        // Test matching
        boolean matches = encoder.matches(password, hash);
        System.out.println("Matches: " + matches);
        
        // Test với hash hiện tại trong DB
        String currentHash = "$2a$10$eImiTXuWVxfm37uY4JANjQ1xjToMZFLmAiLhGOXjqb6Fn6r/LqDOK";
        boolean matchesDB = encoder.matches(password, currentHash);
        System.out.println("Matches DB hash: " + matchesDB);
    }
}
