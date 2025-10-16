package backend.service;

/**
 * Service for sending booking reminder emails
 */
public interface BookingReminderService {
    
    /**
     * Send reminder emails for upcoming tours
     * Called by scheduled job
     */
    void sendUpcomingTourReminders();
    
    /**
     * Send reminder email for a specific booking
     * @param bookingId Booking ID
     */
    void sendReminderForBooking(Long bookingId);
}

