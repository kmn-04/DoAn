package backend.security;

import backend.model.User;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        User user = null;
        
        // Tìm theo email trước
        if (emailOrPhone.contains("@")) {
            user = userRepository.findByEmail(emailOrPhone).orElse(null);
        } else {
            // Nếu không phải email, tìm theo phone
            user = userRepository.findByPhone(emailOrPhone).orElse(null);
        }
        
        // Nếu không tìm thấy, thử tìm theo username (fallback)
        if (user == null) {
            user = userRepository.findByUsername(emailOrPhone).orElse(null);
        }
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email or phone: " + emailOrPhone);
        }
        
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User account is disabled: " + emailOrPhone);
        }
        
        return UserPrincipal.create(user);
    }
    
    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id : " + id));
        
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("User account is disabled with id : " + id);
        }
        
        return UserPrincipal.create(user);
    }
}
