package backend.service;

import backend.entity.User;

/**
 * Service for OAuth2 authentication
 */
public interface OAuth2Service {
    
    /**
     * Process Google OAuth login and return user
     * Creates new user if not exists, or returns existing user
     */
    User processGoogleOAuthLogin(String email, String name, String picture);
    
    /**
     * Find or create user from Google OAuth info
     */
    User findOrCreateGoogleUser(String email, String name, String picture);
}

