package backend.service.impl;

import backend.entity.Booking;
import backend.entity.Booking.ConfirmationStatus;
import backend.entity.Booking.PaymentStatus;
import backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job to auto-complete bookings after tour end date
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingCompletionScheduler {
    
    private final BookingRepository bookingRepository;
    
    /**
     * Auto-complete confirmed bookings after tour end date
     * Runs every day at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void autoCompleteBookings() {
        log.info("🔄 Starting auto-complete bookings job...");
        
        try {
            LocalDate today = LocalDate.now();
            
            // Find all CONFIRMED bookings that should be completed
            List<Booking> bookings = bookingRepository.findAll();
            
            int completedCount = 0;
            
            for (Booking booking : bookings) {
                // Only process CONFIRMED and PAID bookings
                if (booking.getConfirmationStatus() != ConfirmationStatus.CONFIRMED
                        || booking.getPaymentStatus() != PaymentStatus.PAID) {
                    continue;
                }
                
                // Calculate tour end date (startDate + duration days)
                LocalDate startDate = booking.getStartDate();
                Integer duration = booking.getTour() != null ? booking.getTour().getDuration() : 1;
                LocalDate tourEndDate = startDate.plusDays(duration);
                
                // If tour has ended, mark as COMPLETED
                if (tourEndDate.isBefore(today)) {
                    booking.setConfirmationStatus(ConfirmationStatus.COMPLETED);
                    booking.setUpdatedAt(LocalDateTime.now());
                    bookingRepository.save(booking);
                    completedCount++;
                    
                    log.info("✅ Auto-completed booking {} (Tour ended on: {})", 
                            booking.getBookingCode(), tourEndDate);
                }
            }
            
            log.info("✅ Auto-complete bookings job finished. Completed: {}", completedCount);
            
        } catch (Exception e) {
            log.error("❌ Error in auto-complete bookings job: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Manual trigger for testing
     */
    public int manualTrigger() {
        log.info("🔧 Manual trigger: auto-completing bookings...");
        
        LocalDate today = LocalDate.now();
        List<Booking> bookings = bookingRepository.findAll();
        
        int completedCount = 0;
        
        for (Booking booking : bookings) {
            if (booking.getConfirmationStatus() != ConfirmationStatus.CONFIRMED
                    || booking.getPaymentStatus() != PaymentStatus.PAID) {
                continue;
            }
            
            LocalDate startDate = booking.getStartDate();
            Integer duration = booking.getTour() != null ? booking.getTour().getDuration() : 1;
            LocalDate tourEndDate = startDate.plusDays(duration);
            
            if (tourEndDate.isBefore(today)) {
                booking.setConfirmationStatus(ConfirmationStatus.COMPLETED);
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepository.save(booking);
                completedCount++;
            }
        }
        
        log.info("✅ Manual trigger completed. Completed {} bookings", completedCount);
        return completedCount;
    }
}

