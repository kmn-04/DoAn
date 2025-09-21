package backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("Password: 123456");
        System.out.println("Hash: " + encoder.encode("123456"));
        
        System.out.println("\nPassword: admin123");
        System.out.println("Hash: " + encoder.encode("admin123"));
        
        System.out.println("\nPassword: staff123");
        System.out.println("Hash: " + encoder.encode("staff123"));
    }
}
