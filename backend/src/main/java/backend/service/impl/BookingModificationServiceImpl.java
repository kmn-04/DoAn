package backend.service.impl;

import backend.dto.request.BookingModificationRequest;
import backend.dto.response.BookingModificationResponse;
import backend.entity.Booking;
import backend.entity.BookingModification;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.BookingModificationRepository;
import backend.repository.BookingRepository;
import backend.repository.UserRepository;
import backend.service.BookingModificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingModificationServiceImpl implements BookingModificationService {

    private final BookingModificationRepository modificationRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    public BookingModificationResponse requestModification(Long userId, BookingModificationRequest request) {
        log.info("Processing modification request for booking {} by user {}", request.getBookingId(), userId);

        // Validate request
        ValidationResult validation = validateModificationRequest(request.getBookingId(), request);
        if (!validation.isValid()) {
            throw new BadRequestException(validation.getErrorMessage());
        }

        // Get booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        // Check authorization
        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("User is not authorized to modify this booking.");
        }

        // Check for existing pending modifications
        if (modificationRepository.hasActivePendingModification(booking.getId())) {
            throw new BadRequestException("There is already a pending modification request for this booking.");
        }

        User requestedBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Create modification entity
        BookingModification modification = new BookingModification();
        modification.setBooking(booking);
        modification.setRequestedBy(requestedBy);
        modification.setModificationType(mapToEntityModificationType(request.getModificationType()));
        modification.setStatus(BookingModification.Status.REQUESTED);

        // Set original values
        modification.setOriginalStartDate(booking.getStartDate());
        modification.setOriginalEndDate(booking.getStartDate()); // Tours typically are single day, use same date
        modification.setOriginalParticipants(booking.getTotalPeople());
        modification.setOriginalAmount(booking.getTotalPrice());

        // Set new values
        modification.setNewStartDate(request.getNewStartDate());
        modification.setNewEndDate(request.getNewEndDate());
        modification.setNewParticipants(request.getNewParticipants());

        // Calculate pricing
        BigDecimal priceDifference = calculatePriceDifference(booking.getId(), request);
        BigDecimal processingFee = calculateProcessingFee(booking.getId(), request);
        BigDecimal newAmount = booking.getTotalPrice().add(priceDifference);

        modification.setNewAmount(newAmount);
        modification.setPriceDifference(priceDifference);
        modification.setProcessingFee(processingFee);

        // Set reason and notes
        modification.setReason(request.getReason());
        modification.setCustomerNotes(request.getCustomerNotes());

        BookingModification savedModification = modificationRepository.save(modification);
        log.info("Modification request {} created for booking {}", savedModification.getId(), booking.getId());

        return mapToResponse(savedModification);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingModificationResponse getModificationByIdAndUser(Long modificationId, Long userId) {
        BookingModification modification = modificationRepository.findByIdAndRequestedById(modificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking modification not found or not authorized for user: " + modificationId));
        return mapToResponse(modification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingModificationResponse> getModificationsByUser(Long userId, Pageable pageable) {
        return modificationRepository.findByRequestedByIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public BookingModificationResponse cancelModification(Long modificationId, Long userId) {
        BookingModification modification = modificationRepository.findByIdAndRequestedById(modificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking modification not found or not authorized for user: " + modificationId));

        if (modification.getStatus() != BookingModification.Status.REQUESTED && 
            modification.getStatus() != BookingModification.Status.UNDER_REVIEW) {
            throw new BadRequestException("Cannot cancel modification in current status: " + modification.getStatus());
        }

        modification.setStatus(BookingModification.Status.CANCELLED);
        modification.setAdminNotes(modification.getAdminNotes() + "\nCancelled by customer.");

        BookingModification savedModification = modificationRepository.save(modification);
        log.info("Modification {} cancelled by user {}", modificationId, userId);

        return mapToResponse(savedModification);
    }

    @Override
    public BookingModificationResponse acceptAdditionalCharges(Long modificationId, Long userId) {
        BookingModification modification = modificationRepository.findByIdAndRequestedById(modificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking modification not found or not authorized for user: " + modificationId));

        if (modification.getStatus() != BookingModification.Status.APPROVED) {
            throw new BadRequestException("Modification is not in approved status.");
        }

        if (!modification.requiresAdditionalPayment()) {
            throw new BadRequestException("This modification does not require additional payment.");
        }

        modification.setStatus(BookingModification.Status.PROCESSING);
        modification.setCustomerNotes(modification.getCustomerNotes() + "\nCustomer accepted additional charges.");

        BookingModification savedModification = modificationRepository.save(modification);
        log.info("User {} accepted additional charges for modification {}", userId, modificationId);

        return mapToResponse(savedModification);
    }

    // Admin operations
    @Override
    @Transactional(readOnly = true)
    public BookingModificationResponse getModificationById(Long modificationId) {
        BookingModification modification = modificationRepository.findById(modificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking modification", "id", modificationId));
        return mapToResponse(modification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingModificationResponse> getAllModifications(Pageable pageable) {
        return modificationRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingModificationResponse> getModificationsByStatus(BookingModification.Status status, Pageable pageable) {
        return modificationRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingModificationResponse> getModificationsByBookingId(Long bookingId) {
        return modificationRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingModificationResponse> getPendingModifications() {
        return modificationRepository.findPendingModifications()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingModificationResponse updateModificationStatus(Long modificationId, BookingModification.Status newStatus, String adminNotes, Long adminId) {
        BookingModification modification = modificationRepository.findById(modificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking modification", "id", modificationId));

        User processedBy = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        modification.setStatus(newStatus);
        modification.setAdminNotes((modification.getAdminNotes() != null ? modification.getAdminNotes() : "") + 
                                   "\nAdmin update: " + adminNotes);
        modification.setProcessedBy(processedBy.getId());
        modification.setProcessedAt(LocalDateTime.now());

        if (newStatus == BookingModification.Status.APPROVED) {
            modification.setApprovedBy(adminId);
            modification.setApprovedAt(LocalDateTime.now());
        } else if (newStatus == BookingModification.Status.COMPLETED) {
            modification.setCompletedAt(LocalDateTime.now());
            // Apply changes to original booking
            applyModificationToBooking(modification);
        }

        BookingModification savedModification = modificationRepository.save(modification);
        log.info("Modification {} status updated to {} by admin {}", modificationId, newStatus, adminId);

        return mapToResponse(savedModification);
    }

    @Override
    public BookingModificationResponse approveModification(Long modificationId, Long adminId) {
        return updateModificationStatus(modificationId, BookingModification.Status.APPROVED, "Approved by admin.", adminId);
    }

    @Override
    public BookingModificationResponse rejectModification(Long modificationId, String reason, Long adminId) {
        return updateModificationStatus(modificationId, BookingModification.Status.REJECTED, "Rejected: " + reason, adminId);
    }

    @Override
    public BookingModificationResponse processModification(Long modificationId, Long adminId) {
        return updateModificationStatus(modificationId, BookingModification.Status.PROCESSING, "Processing modification.", adminId);
    }

    @Override
    public BookingModificationResponse completeModification(Long modificationId, Long adminId) {
        return updateModificationStatus(modificationId, BookingModification.Status.COMPLETED, "Modification completed.", adminId);
    }

    @Override
    public BookingModificationResponse updateModificationDetails(Long modificationId, BookingModificationRequest request, Long adminId) {
        BookingModification modification = modificationRepository.findById(modificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking modification", "id", modificationId));

        if (modification.getStatus() != BookingModification.Status.REQUESTED && 
            modification.getStatus() != BookingModification.Status.UNDER_REVIEW) {
            throw new BadRequestException("Cannot update modification details in current status: " + modification.getStatus());
        }

        // Update details
        modification.setNewStartDate(request.getNewStartDate());
        modification.setNewEndDate(request.getNewEndDate());
        modification.setNewParticipants(request.getNewParticipants());
        modification.setReason(request.getReason());
        modification.setCustomerNotes(request.getCustomerNotes());

        // Recalculate pricing
        BigDecimal priceDifference = calculatePriceDifference(modification.getBooking().getId(), request);
        BigDecimal processingFee = calculateProcessingFee(modification.getBooking().getId(), request);
        BigDecimal newAmount = modification.getOriginalAmount().add(priceDifference);

        modification.setNewAmount(newAmount);
        modification.setPriceDifference(priceDifference);
        modification.setProcessingFee(processingFee);

        modification.setAdminNotes((modification.getAdminNotes() != null ? modification.getAdminNotes() : "") + 
                                   "\nAdmin updated modification details.");
        modification.setProcessedBy(adminId);
        modification.setProcessedAt(LocalDateTime.now());

        BookingModification savedModification = modificationRepository.save(modification);
        log.info("Modification {} details updated by admin {}", modificationId, adminId);

        return mapToResponse(savedModification);
    }

    // Pricing operations
    @Override
    public BigDecimal calculatePriceDifference(Long bookingId, BookingModificationRequest request) {
        // Simplified pricing calculation
        // In real implementation, this would involve complex business logic
        BigDecimal difference = BigDecimal.ZERO;
        
        if (request.getNewParticipants() != null) {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
            
            int participantDifference = request.getNewParticipants() - booking.getTotalPeople();
            if (participantDifference > 0) {
                // Additional participants - assume $100 per person
                difference = difference.add(BigDecimal.valueOf(participantDifference * 100));
            } else if (participantDifference < 0) {
                // Fewer participants - refund $80 per person (20% handling fee)
                difference = difference.add(BigDecimal.valueOf(participantDifference * 80));
            }
        }
        
        return difference;
    }

    @Override
    public BigDecimal calculateProcessingFee(Long bookingId, BookingModificationRequest request) {
        // Fixed processing fee of $25
        return new BigDecimal("25.00");
    }

    @Override
    public BookingModificationResponse.PricingDetails getPriceQuote(Long bookingId, BookingModificationRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        BigDecimal priceDifference = calculatePriceDifference(bookingId, request);
        BigDecimal processingFee = calculateProcessingFee(bookingId, request);
        BigDecimal newAmount = booking.getTotalPrice().add(priceDifference);
        BigDecimal totalAdditional = priceDifference.add(processingFee);

        return new BookingModificationResponse.PricingDetails(
                booking.getTotalPrice(),
                newAmount,
                priceDifference,
                processingFee,
                totalAdditional,
                priceDifference.compareTo(BigDecimal.ZERO) > 0,
                priceDifference.compareTo(BigDecimal.ZERO) < 0
        );
    }

    // Validation operations
    @Override
    public ValidationResult validateModificationRequest(Long bookingId, BookingModificationRequest request) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

            // Check booking status
            if (booking.getConfirmationStatus() != Booking.ConfirmationStatus.CONFIRMED) {
                return new ValidationResult(false, "Only confirmed bookings can be modified.");
            }

            // Check modification timing (at least 48 hours before start date)
            if (booking.getStartDate().isBefore(LocalDateTime.now().plusDays(2).toLocalDate())) {
                return new ValidationResult(false, "Modifications must be requested at least 48 hours before the tour start date.");
            }

            // Validate date range
            if (!request.isValidDateRange()) {
                return new ValidationResult(false, "Invalid date range: end date cannot be before start date.");
            }

            // Check for existing pending modifications
            if (modificationRepository.hasActivePendingModification(bookingId)) {
                return new ValidationResult(false, "There is already a pending modification request for this booking.");
            }

            return new ValidationResult(true, null);
        } catch (Exception e) {
            return new ValidationResult(false, "Error validating modification request: " + e.getMessage());
        }
    }

    @Override
    public boolean canBookingBeModified(Long bookingId) {
        try {
            ValidationResult result = validateModificationRequest(bookingId, new BookingModificationRequest());
            return result.isValid();
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean checkAvailability(Long tourId, LocalDateTime newStartDate, Integer participants) {
        // Simplified availability check
        // In real implementation, this would check tour availability, capacity, etc.
        return true;
    }

    // Statistics and reporting
    @Override
    @Transactional(readOnly = true)
    public ModificationStatistics getModificationStatistics() {
        Object[] stats = modificationRepository.getModificationStatistics();
        
        if (stats != null && stats.length >= 4) {
            long total = ((Number) stats[0]).longValue();
            long completed = ((Number) stats[1]).longValue();
            long rejected = ((Number) stats[2]).longValue();
            double avgHours = stats[3] != null ? ((Number) stats[3]).doubleValue() : 0.0;
            
            ModificationStatistics result = new ModificationStatistics(total, completed, rejected, avgHours);
            
            // Add pending count
            long pending = modificationRepository.findPendingModifications().size();
            result.setPendingModifications(pending);
            
            return result;
        }
        
        return new ModificationStatistics(0, 0, 0, 0.0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingModificationResponse> getModificationsRequiringProcessing() {
        return modificationRepository.findModificationsRequiringProcessing()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingModificationResponse> getRecentModificationsByUser(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return modificationRepository.findRecentByUser(userId, since)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private void applyModificationToBooking(BookingModification modification) {
        Booking booking = modification.getBooking();
        
        if (modification.getNewStartDate() != null) {
            booking.setStartDate(modification.getNewStartDate());
        }
        // Note: For tours, we typically don't change end date as they're usually single day
        // If needed, this logic can be enhanced to handle multi-day tours
        
        if (modification.getNewParticipants() != null) {
            // Assuming new participants are all adults for simplicity
            // In real implementation, you'd need more sophisticated logic
            booking.setNumAdults(modification.getNewParticipants());
            booking.setNumChildren(0);
        }
        if (modification.getNewAmount() != null) {
            booking.setTotalPrice(modification.getNewAmount());
        }
        
        bookingRepository.save(booking);
        log.info("Applied modification {} to booking {}", modification.getId(), booking.getId());
    }

    private BookingModification.ModificationType mapToEntityModificationType(BookingModificationRequest.ModificationType requestType) {
        switch (requestType) {
            case DATE_CHANGE: return BookingModification.ModificationType.DATE_CHANGE;
            case PARTICIPANT_CHANGE: return BookingModification.ModificationType.PARTICIPANT_CHANGE;
            case DATE_AND_PARTICIPANT_CHANGE: return BookingModification.ModificationType.DATE_AND_PARTICIPANT_CHANGE;
            case UPGRADE_TOUR_PACKAGE: return BookingModification.ModificationType.UPGRADE_TOUR_PACKAGE;
            case ACCOMMODATION_CHANGE: return BookingModification.ModificationType.ACCOMMODATION_CHANGE;
            case OTHER: return BookingModification.ModificationType.OTHER;
            default: throw new IllegalArgumentException("Unknown modification type: " + requestType);
        }
    }

    private BookingModificationResponse mapToResponse(BookingModification modification) {
        BookingModificationResponse response = new BookingModificationResponse();
        
        response.setId(modification.getId());
        response.setBookingId(modification.getBooking().getId());
        response.setBookingCode(modification.getBooking().getBookingCode());
        response.setRequestedByUserId(modification.getRequestedBy().getId());
        response.setRequestedByUserName(modification.getRequestedBy().getName());
        response.setModificationType(mapToResponseModificationType(modification.getModificationType()));
        response.setStatus(mapToResponseStatus(modification.getStatus()));
        
        // Original values
        response.setOriginalValues(new BookingModificationResponse.OriginalValues(
                modification.getOriginalStartDate(),
                modification.getOriginalEndDate(),
                modification.getOriginalParticipants(),
                modification.getOriginalAmount()
        ));
        
        // New values
        response.setNewValues(new BookingModificationResponse.NewValues(
                modification.getNewStartDate(),
                modification.getNewEndDate(),
                modification.getNewParticipants(),
                modification.getNewAmount()
        ));
        
        // Pricing details
        response.setPricingDetails(new BookingModificationResponse.PricingDetails(
                modification.getOriginalAmount(),
                modification.getNewAmount(),
                modification.getPriceDifference(),
                modification.getProcessingFee(),
                modification.getTotalAdditionalAmount(),
                modification.requiresAdditionalPayment(),
                modification.offersRefund()
        ));
        
        // Status tracking
        BookingModificationResponse.StatusTracking statusTracking = new BookingModificationResponse.StatusTracking();
        statusTracking.setCurrentStatus(mapToResponseStatus(modification.getStatus()));
        statusTracking.setApprovedBy(modification.getApprovedBy());
        statusTracking.setApprovedAt(modification.getApprovedAt());
        statusTracking.setProcessedBy(modification.getProcessedBy());
        statusTracking.setProcessedAt(modification.getProcessedAt());
        statusTracking.setCompletedAt(modification.getCompletedAt());
        statusTracking.setCanBeCancelled(modification.getStatus() == BookingModification.Status.REQUESTED || 
                                        modification.getStatus() == BookingModification.Status.UNDER_REVIEW);
        statusTracking.setRequiresCustomerAction(modification.getStatus() == BookingModification.Status.APPROVED && 
                                                 modification.requiresAdditionalPayment());
        response.setStatusTracking(statusTracking);
        
        response.setReason(modification.getReason());
        response.setCustomerNotes(modification.getCustomerNotes());
        response.setAdminNotes(modification.getAdminNotes());
        response.setCreatedAt(modification.getCreatedAt());
        response.setUpdatedAt(modification.getUpdatedAt());
        
        return response;
    }

    private BookingModificationResponse.ModificationType mapToResponseModificationType(BookingModification.ModificationType entityType) {
        switch (entityType) {
            case DATE_CHANGE: return BookingModificationResponse.ModificationType.DATE_CHANGE;
            case PARTICIPANT_CHANGE: return BookingModificationResponse.ModificationType.PARTICIPANT_CHANGE;
            case DATE_AND_PARTICIPANT_CHANGE: return BookingModificationResponse.ModificationType.DATE_AND_PARTICIPANT_CHANGE;
            case UPGRADE_TOUR_PACKAGE: return BookingModificationResponse.ModificationType.UPGRADE_TOUR_PACKAGE;
            case ACCOMMODATION_CHANGE: return BookingModificationResponse.ModificationType.ACCOMMODATION_CHANGE;
            case OTHER: return BookingModificationResponse.ModificationType.OTHER;
            default: throw new IllegalArgumentException("Unknown modification type: " + entityType);
        }
    }

    private BookingModificationResponse.Status mapToResponseStatus(BookingModification.Status entityStatus) {
        switch (entityStatus) {
            case REQUESTED: return BookingModificationResponse.Status.REQUESTED;
            case UNDER_REVIEW: return BookingModificationResponse.Status.UNDER_REVIEW;
            case APPROVED: return BookingModificationResponse.Status.APPROVED;
            case REJECTED: return BookingModificationResponse.Status.REJECTED;
            case PROCESSING: return BookingModificationResponse.Status.PROCESSING;
            case COMPLETED: return BookingModificationResponse.Status.COMPLETED;
            case CANCELLED: return BookingModificationResponse.Status.CANCELLED;
            default: throw new IllegalArgumentException("Unknown status: " + entityStatus);
        }
    }
}
