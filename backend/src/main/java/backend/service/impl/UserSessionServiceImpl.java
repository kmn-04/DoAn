package backend.service.impl;

import backend.entity.User;
import backend.entity.UserSession;
import backend.repository.UserRepository;
import backend.repository.UserSessionRepository;
import backend.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserSessionServiceImpl implements UserSessionService {
    
    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;
    
    @Override
    public UserSession createSession(Long userId, String sessionId, String ipAddress, String userAgent,
                                   String deviceType, String browser, String os, String country, String city) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                log.warn("User not found with ID: {}", userId);
                return null;
            }
            
            User user = userOpt.get();
            
            UserSession session = new UserSession();
            session.setUser(user);
            session.setSessionId(sessionId);
            session.setIpAddress(ipAddress);
            session.setUserAgent(userAgent);
            session.setDeviceType(deviceType);
            session.setBrowser(browser);
            session.setOs(os);
            session.setCountry(country);
            session.setCity(city);
            session.setLoginAt(LocalDateTime.now());
            session.setLastActivity(LocalDateTime.now());
            session.setIsActive(true);
            
            UserSession saved = userSessionRepository.save(session);
            
            // Update user login statistics
            user.incrementLoginCount();
            user.setLastLoginAt(LocalDateTime.now());
            user.updateLastActivity();
            userRepository.save(user);
            
            log.info("Created session: {} for user: {}", sessionId, userId);
            return saved;
            
        } catch (Exception e) {
            log.error("Error creating session for user {}: {}", userId, e.getMessage(), e);
            return null;
        }
    }
    
    @Override
    public UserSession updateSessionActivity(String sessionId) {
        Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isEmpty()) {
            log.warn("Session not found: {}", sessionId);
            return null;
        }
        
        UserSession session = sessionOpt.get();
        session.setLastActivity(LocalDateTime.now());
        
        UserSession saved = userSessionRepository.save(session);
        
        // Update user's last activity
        User user = session.getUser();
        user.updateLastActivity();
        userRepository.save(user);
        
        return saved;
    }
    
    @Override
    public UserSession endSession(String sessionId, String logoutReason) {
        Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isEmpty()) {
            log.warn("Session not found: {}", sessionId);
            return null;
        }
        
        UserSession session = sessionOpt.get();
        session.setIsActive(false);
        session.setLoggedOutAt(LocalDateTime.now());
        session.setLogoutReason(logoutReason);
        
        UserSession saved = userSessionRepository.save(session);
        log.info("Ended session: {} with reason: {}", sessionId, logoutReason);
        return saved;
    }
    
    @Override
    public int forceLogoutUser(Long userId, String reason) {
        log.info("Force logging out all sessions for user: {} with reason: {}", userId, reason);
        return userSessionRepository.forceLogoutUserSessions(userId, reason, LocalDateTime.now());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserSession> getSessionById(Long id) {
        return userSessionRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<UserSession> getSessionBySessionId(String sessionId) {
        return userSessionRepository.findBySessionId(sessionId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getSessionsByUserId(Long userId) {
        return userSessionRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserSession> getSessionsByUserId(Long userId, Pageable pageable) {
        return userSessionRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getActiveSessionsByUserId(Long userId) {
        return userSessionRepository.findByUser_IdAndIsActiveOrderByLastActivityDesc(userId, true);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getActiveSessions() {
        return userSessionRepository.findByIsActiveOrderByLastActivityDesc(true);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserSession> getActiveSessions(Pageable pageable) {
        return userSessionRepository.findByIsActiveOrderByLastActivityDesc(true, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getSessionsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return userSessionRepository.findByLoginAtBetweenOrderByLoginAtDesc(startDate, endDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserSession> getSessionsWithSpec(Specification<UserSession> spec, Pageable pageable) {
        return userSessionRepository.findAll(spec, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long countActiveSessions() {
        return userSessionRepository.countByIsActive(true);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long countSessionsByUser(Long userId) {
        return userSessionRepository.countByUser_Id(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long countActiveSessionsByUser(Long userId) {
        return userSessionRepository.countByUser_IdAndIsActive(userId, true);
    }
    
    @Override
    @Transactional(readOnly = true)
    public SessionStatistics getSessionStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);
        
        Long totalSessions = userSessionRepository.count();
        Long activeSessions = userSessionRepository.countByIsActive(true);
        Long todaySessions = userSessionRepository.countByLoginAtGreaterThanEqual(startOfDay);
        Long weekSessions = userSessionRepository.countByLoginAtGreaterThanEqual(startOfWeek);
        Long monthSessions = userSessionRepository.countByLoginAtGreaterThanEqual(startOfMonth);
        
        Long uniqueUsers = userSessionRepository.countDistinctUsersByLoginAtGreaterThanEqual(startOfMonth);
        Long desktopSessions = userSessionRepository.countByDeviceType("Desktop");
        Long mobileSessions = userSessionRepository.countByDeviceType("Mobile");
        Long tabletSessions = userSessionRepository.countByDeviceType("Tablet");
        
        Double averageSessionDuration = userSessionRepository.calculateAverageSessionDuration();
        
        return new SessionStatistics(totalSessions, activeSessions, todaySessions, weekSessions, monthSessions,
                                   uniqueUsers, desktopSessions, mobileSessions, tabletSessions, averageSessionDuration);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserSessionStatistics getUserSessionStatistics(Long userId) {
        Long totalSessions = userSessionRepository.countByUser_Id(userId);
        Long activeSessions = userSessionRepository.countByUser_IdAndIsActive(userId, true);
        
        LocalDateTime firstSession = userSessionRepository.findFirstSessionDateByUserId(userId);
        LocalDateTime lastSession = userSessionRepository.findLastSessionDateByUserId(userId);
        
        Double averageSessionDuration = userSessionRepository.calculateAverageSessionDurationByUserId(userId);
        String mostUsedDevice = userSessionRepository.findMostUsedDeviceByUserId(userId);
        String mostUsedBrowser = userSessionRepository.findMostUsedBrowserByUserId(userId);
        List<String> loginLocations = userSessionRepository.findLoginLocationsByUserId(userId);
        
        return new UserSessionStatistics(totalSessions, activeSessions, firstSession, lastSession,
                                       averageSessionDuration, mostUsedDevice, mostUsedBrowser, loginLocations);
    }
    
    @Override
    public int cleanupExpiredSessions(LocalDateTime cutoffDate) {
        log.info("Cleaning up sessions older than: {}", cutoffDate);
        int deletedCount = userSessionRepository.deleteByLastActivityBeforeAndIsActive(cutoffDate, false);
        log.info("Cleaned up {} expired sessions", deletedCount);
        return deletedCount;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getSessionsByIpAddress(String ipAddress) {
        return userSessionRepository.findByIpAddressOrderByLoginAtDesc(ipAddress);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getSessionsByDeviceType(String deviceType) {
        return userSessionRepository.findByDeviceTypeOrderByLoginAtDesc(deviceType);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserSession> getSessionsByCountry(String country) {
        return userSessionRepository.findByCountryOrderByLoginAtDesc(country);
    }
}
